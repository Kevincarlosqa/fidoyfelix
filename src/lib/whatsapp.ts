import "server-only";
import crypto from "node:crypto";

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v23.0";

function endpoint() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) throw new Error("Falta WHATSAPP_PHONE_NUMBER_ID");
  return `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;
}

async function callGraph(body: unknown) {
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`WhatsApp API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<{ messages?: { id: string }[] }>;
}

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Envía un mensaje de texto. WhatsApp limita el cuerpo a 4096 caracteres. */
export async function sendWhatsAppText(to: string, body: string) {
  const chunks = body.match(/[\s\S]{1,4000}/g) ?? [body];
  let lastId: string | undefined;
  for (const chunk of chunks) {
    const data = await callGraph({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: chunk },
    });
    lastId = data.messages?.[0]?.id;
  }
  return lastId;
}

/** Marca como leído y muestra el indicador "escribiendo…". */
export async function markAsReadWithTyping(messageId: string) {
  try {
    await callGraph({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: { type: "text" },
    });
  } catch (err) {
    console.warn("[whatsapp] no se pudo marcar como leído", err);
  }
}

/** Valida la cabecera X-Hub-Signature-256 que firma Meta con el App Secret. */
export function verifyWhatsAppSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    console.warn("[whatsapp] WHATSAPP_APP_SECRET no configurado: se omite la verificación de firma");
    return process.env.NODE_ENV !== "production";
  }
  if (!signature?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.slice("sha256=".length);
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}

export type IncomingWhatsAppMessage = {
  id: string;
  from: string;
  profileName?: string;
  text: string;
};

type WebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: {
          id: string;
          from: string;
          type: string;
          text?: { body: string };
          button?: { text: string };
          interactive?: { button_reply?: { title: string }; list_reply?: { title: string } };
        }[];
      };
    }[];
  }[];
};

/** Extrae los mensajes entrantes de un webhook (ignora estados de entrega). */
export function parseWebhook(payload: WebhookPayload): IncomingWhatsAppMessage[] {
  const result: IncomingWhatsAppMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      for (const msg of value?.messages ?? []) {
        const profileName = value?.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name;
        const text =
          msg.text?.body ??
          msg.button?.text ??
          msg.interactive?.button_reply?.title ??
          msg.interactive?.list_reply?.title ??
          `[El cliente envió un mensaje de tipo "${msg.type}" que no es texto]`;
        result.push({ id: msg.id, from: msg.from, profileName, text });
      }
    }
  }
  return result;
}
