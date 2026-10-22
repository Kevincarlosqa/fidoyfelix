import "server-only";
import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma/client";
import { generateAgentReply } from "./ai-agent";
import { sendWhatsAppText, whatsappConfigured } from "./whatsapp";
import { normalizePhone } from "./utils";

type Incoming = {
  phone: string;
  text: string;
  waMessageId?: string;
  profileName?: string;
  /** false en el simulador: no envía nada a WhatsApp */
  deliver?: boolean;
};

/**
 * Guarda el mensaje entrante y, si el asistente está activo, genera y envía la respuesta.
 * Devuelve la respuesta del asistente (o null si no respondió).
 */
export async function handleIncomingMessage({ phone, text, waMessageId, profileName, deliver = true }: Incoming) {
  const normalized = normalizePhone(phone);

  const existingClient = await prisma.client.findUnique({ where: { phone: normalized } });
  let conversation = await prisma.conversation.upsert({
    where: { phone: normalized },
    update: profileName ? { profileName } : {},
    create: { phone: normalized, profileName, clientId: existingClient?.id },
  });

  // Meta reintenta los webhooks (a veces en paralelo): el índice único de waMessageId
  // garantiza que cada mensaje se procese una sola vez.
  try {
    await prisma.message.create({
      data: { conversationId: conversation.id, role: "USER", content: text, waMessageId },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return null;
    throw err;
  }

  conversation = await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date(), unread: { increment: 1 } },
  });

  if (!conversation.aiEnabled) return null;

  let reply: string | null;
  try {
    reply = await generateAgentReply(conversation.id);
  } catch (err) {
    console.error("[conversations] error generando respuesta IA", err);
    reply =
      "¡Uy! Tuve un problema técnico 🙈. Un miembro del equipo Fido&Felix te responderá en breve.";
  }
  if (!reply) return null;

  await saveAndSendOutgoing(conversation.id, normalized, reply, "ASSISTANT", deliver);
  return reply;
}

export async function saveAndSendOutgoing(
  conversationId: string,
  phone: string,
  content: string,
  role: "ASSISTANT" | "STAFF",
  deliver = true,
) {
  let waMessageId: string | undefined;
  if (deliver && whatsappConfigured()) {
    try {
      waMessageId = await sendWhatsAppText(phone, content);
    } catch (err) {
      console.error("[conversations] error enviando a WhatsApp", err);
    }
  }
  await prisma.message.create({
    data: { conversationId, role, content, waMessageId },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });
}
