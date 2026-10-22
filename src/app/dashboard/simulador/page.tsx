import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/ui";
import { Simulator } from "./Simulator";

const DEFAULT_PHONE = "51900000001";

export default async function SimuladorPage() {
  await requireUser();
  const conv = await prisma.conversation.findUnique({
    where: { phone: `000${DEFAULT_PHONE.slice(-10)}` },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Simulador IA"
        subtitle="Prueba al asistente de WhatsApp sin enviar mensajes reales. Las reservas que haga sí se guardan (canal WhatsApp)."
      />
      <Simulator
        phone={DEFAULT_PHONE}
        aiConfigured={Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)}
        initial={(conv?.messages ?? []).map((m) => ({ role: m.role, content: m.content }))}
      />
    </div>
  );
}
