import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { prisma } from "./prisma";
import { BUSINESS } from "./config";
import {
  BookingError,
  cancelBookingByCode,
  createBooking,
  describeBooking,
  getAvailableSlots,
  upcomingBookingsForPhone,
} from "./booking";
import { CATEGORY_LABELS, SPECIES_LABELS, formatPrice, normalizePhone } from "./utils";

const MODEL = process.env.AI_MODEL ?? "claude-opus-5-5";

let client: Anthropic | null = null;
function anthropic() {
  client ??= new Anthropic();
  return client;
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

async function buildSystemPrompt(phone: string) {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const known = await prisma.client.findUnique({
    where: { phone },
    include: { pets: true },
  });

  const now = new Date();
  const today = new Intl.DateTimeFormat("es-PE", {
    timeZone: BUSINESS.timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const isoToday = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS.timeZone }).format(now);

  const hours = Object.entries(BUSINESS.hours)
    .map(([d, h]) => `- ${DAY_NAMES[Number(d)]}: ${h ? `${h.open} a ${h.close}` : "cerrado"}`)
    .join("\n");

  const serviceList = services
    .map(
      (s) =>
        `- id="${s.id}" · ${s.name} (${CATEGORY_LABELS[s.category]}) · ${formatPrice(s.price)} · ${s.durationMin} min · ${s.description}`,
    )
    .join("\n");

  const clientInfo = known
    ? `Este número ya es cliente: ${known.name}. Mascotas registradas: ${
        known.pets.map((p) => `${p.name} (${SPECIES_LABELS[p.species]}${p.breed ? `, ${p.breed}` : ""})`).join("; ") || "ninguna"
      }. Salúdale por su nombre y no vuelvas a pedir datos que ya tienes.`
    : "Este número todavía no es cliente; pide su nombre cuando vaya a reservar.";

  return `Eres "Felix", el asistente virtual de ${BUSINESS.name}, un servicio integral para mascotas en Miraflores, Lima cuyo lema es "${BUSINESS.tagline}". Atiendes por WhatsApp en español peruano, con un tono cálido, cercano y divertido (algún emoji 🐾 está bien, sin exagerar). Tu trabajo es resolver dudas y agendar, consultar o cancelar citas.

Cómo escribir en WhatsApp:
- Mensajes cortos y fáciles de leer en el celular. Usa *negritas* de WhatsApp solo para datos clave (fecha, hora, código). No uses markdown de títulos ni tablas.
- Haz una o dos preguntas a la vez, no un formulario completo.

Cómo agendar:
1. Identifica el servicio. Si la persona no sabe cuál, recomiéndale según su mascota.
2. Para reservar necesitas: nombre del dueño, nombre de la mascota, especie (perro/gato/otro), servicio, fecha y hora. Raza y tamaño son útiles para grooming; pregúntalos si no los sabes.
3. Antes de proponer horarios, usa consultar_disponibilidad. Nunca inventes horarios ni confirmes uno que la herramienta no haya devuelto.
4. Antes de crear la reserva, resume los datos y pide confirmación explícita ("¿Confirmo?"). Solo después llama a crear_reserva.
5. Al crear la reserva, comparte el código (FF-XXXXXX) y recuerda que la cita queda *pendiente de confirmación* por el equipo, quien la confirma pronto.
- Interpreta fechas relativas ("mañana", "el sábado") usando la fecha de hoy indicada abajo, y pásalas a las herramientas como AAAA-MM-DD.
- Para cancelar, usa mis_reservas para encontrar el código si la persona no lo tiene.
- Si piden algo que no puedes resolver (quejas, emergencias médicas, precios especiales, pagos), usa transferir_a_humano. Ante una emergencia veterinaria, recomienda acudir de inmediato a un hospital veterinario 24 h.
- Nunca inventes servicios, precios ni políticas. Si no sabes algo, dilo y ofrece que un humano les contacte.

Datos del negocio:
- Dirección: ${BUSINESS.address}
- Correo: ${BUSINESS.email}
- Horario:
${hours}

Servicios disponibles (usa el id exacto en las herramientas):
${serviceList}

Contexto de esta conversación:
- Hoy es ${today} (fecha ISO ${isoToday}), hora de Lima.
- ${clientInfo}`;
}

function buildTools(phone: string, conversationId: string, profileName?: string | null) {
  const safe = async (fn: () => Promise<string>) => {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof BookingError) return `ERROR: ${err.message}`;
      if (err instanceof z.ZodError) return `ERROR: datos inválidos: ${err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`;
      console.error("[ai-agent] fallo en herramienta", err);
      return "ERROR: hubo un problema interno. Ofrece que un humano dé seguimiento.";
    }
  };

  return [
    betaZodTool({
      name: "consultar_disponibilidad",
      description:
        "Devuelve las horas de inicio libres para un servicio en una fecha. Úsala siempre antes de ofrecer horarios.",
      inputSchema: z.object({
        fecha: z.string().describe("Fecha en formato AAAA-MM-DD"),
        servicio_id: z.string().describe("id exacto del servicio"),
      }),
      run: ({ fecha, servicio_id }) =>
        safe(async () => {
          const { service, slots, reason } = await getAvailableSlots(fecha, servicio_id);
          if (!slots.length) return `Sin disponibilidad para ${service.name} el ${fecha}: ${reason}.`;
          return `Horarios libres para ${service.name} (${service.durationMin} min) el ${fecha}: ${slots.join(", ")}`;
        }),
    }),
    betaZodTool({
      name: "crear_reserva",
      description:
        "Crea la reserva para el número de WhatsApp actual. Solo llámala después de que la persona confirme explícitamente el resumen.",
      inputSchema: z.object({
        nombre_cliente: z.string().describe("Nombre del dueño"),
        nombre_mascota: z.string(),
        especie: z.enum(["DOG", "CAT", "OTHER"]).describe("DOG=perro, CAT=gato, OTHER=otro"),
        raza: z.string().optional(),
        tamano: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
        servicio_id: z.string(),
        fecha: z.string().describe("AAAA-MM-DD"),
        hora: z.string().describe("HH:MM en formato 24 h, debe venir de consultar_disponibilidad"),
        notas: z.string().optional().describe("Alergias, comportamiento o peticiones especiales"),
      }),
      run: (input) =>
        safe(async () => {
          const booking = await createBooking(
            {
              clientName: input.nombre_cliente,
              phone,
              petName: input.nombre_mascota,
              species: input.especie,
              breed: input.raza,
              size: input.tamano,
              serviceId: input.servicio_id,
              date: input.fecha,
              time: input.hora,
              notes: input.notas,
            },
            { source: "WHATSAPP" },
          );
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { clientId: booking.clientId },
          });
          return `Reserva creada (pendiente de confirmación). ${describeBooking(booking)}. Precio: ${formatPrice(booking.price)}.`;
        }),
    }),
    betaZodTool({
      name: "mis_reservas",
      description: "Lista las próximas reservas activas del número de WhatsApp actual.",
      inputSchema: z.object({}),
      run: () =>
        safe(async () => {
          const list = await upcomingBookingsForPhone(phone);
          if (!list.length) return "Este número no tiene reservas próximas.";
          return list.map((b) => `- ${describeBooking(b)} (estado: ${b.status})`).join("\n");
        }),
    }),
    betaZodTool({
      name: "cancelar_reserva",
      description: "Cancela una reserva activa del número actual usando su código. Confirma con la persona antes.",
      inputSchema: z.object({ codigo: z.string().describe("Código tipo FF-XXXXXX") }),
      run: ({ codigo }) =>
        safe(async () => {
          const b = await cancelBookingByCode(codigo, phone);
          return `Reserva ${b.code} (${b.service.name}) cancelada.`;
        }),
    }),
    betaZodTool({
      name: "transferir_a_humano",
      description:
        "Pausa al asistente y avisa al equipo para que una persona continúe la conversación. Úsala para quejas, pagos, emergencias o peticiones fuera de tu alcance.",
      inputSchema: z.object({ motivo: z.string() }),
      run: ({ motivo }) =>
        safe(async () => {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { aiEnabled: false, unread: { increment: 1 } },
          });
          console.info(`[ai-agent] ${profileName ?? phone} transferido a humano: ${motivo}`);
          return "Listo: el equipo fue notificado y continuará la conversación. Despídete avisando que alguien del equipo responderá pronto.";
        }),
    }),
  ];
}

/**
 * Genera la respuesta del asistente para una conversación usando el historial guardado.
 * El historial incluye ya el último mensaje del usuario.
 */
export async function generateAgentReply(conversationId: string) {
  const conversation = await prisma.conversation.findUniqueOrThrow({ where: { id: conversationId } });
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  history.reverse();

  // La API espera turnos user/assistant: los mensajes del staff cuentan como del asistente
  // y se fusionan los turnos consecutivos del mismo rol.
  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  for (const m of history) {
    const role = m.role === "USER" ? "user" : "assistant";
    const last = messages.at(-1);
    if (!last && role === "assistant") continue;
    if (last && last.role === role) {
      last.content = `${last.content as string}\n\n${m.content}`;
    } else {
      messages.push({ role, content: m.content });
    }
  }
  if (!messages.length || messages.at(-1)!.role !== "user") return null;

  const phone = normalizePhone(conversation.phone);

  const finalMessage = await anthropic().beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    max_iterations: 8,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    // Si los clasificadores de seguridad rechazan una petición, la API la reintenta en el
    // modelo de respaldo recomendado en lugar de devolver el rechazo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: await buildSystemPrompt(phone),
    tools: buildTools(phone, conversationId, conversation.profileName),
    messages,
  });

  if (finalMessage.stop_reason === "refusal") {
    return "Perdón, no puedo ayudarte con eso por aquí. Si necesitas algo más sobre tu mascota o una cita, ¡con gusto te ayudo! 🐾";
  }

  const text = finalMessage.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return text || "¡Gracias por escribir a Fido&Felix! Un miembro del equipo te responderá en breve 🐾";
}
