import { after, NextResponse, type NextRequest } from "next/server";
import { handleIncomingMessage } from "@/lib/conversations";
import { markAsReadWithTyping, parseWebhook, verifyWhatsAppSignature, whatsappConfigured } from "@/lib/whatsapp";

// La IA puede tardar varios segundos con varias llamadas a herramientas.
export const maxDuration = 60;

/** Verificación del webhook que hace Meta al configurarlo. */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Mensajes entrantes. Respondemos 200 de inmediato y procesamos con after(). */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!verifyWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  const messages = parseWebhook(payload as Parameters<typeof parseWebhook>[0]);

  after(async () => {
    for (const msg of messages) {
      if (whatsappConfigured()) await markAsReadWithTyping(msg.id);
      try {
        await handleIncomingMessage({
          phone: msg.from,
          text: msg.text,
          waMessageId: msg.id,
          profileName: msg.profileName,
        });
      } catch (err) {
        console.error("[webhook] error procesando mensaje", msg.id, err);
      }
    }
  });

  return NextResponse.json({ received: true });
}
