import { getGymWhatsAppCredentials } from "@/lib/data/gym-whatsapp";

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v23.0";

interface WhatsAppSendResult {
  messageId: string | null;
}

export async function sendWhatsAppTextMessage(input: {
  gymId: string;
  to: string;
  body: string;
}): Promise<WhatsAppSendResult> {
  const config = await getGymWhatsAppCredentials(input.gymId);

  if (!config?.enabled) {
    throw new Error("WhatsApp is not enabled for this gym");
  }

  if (!config.phoneNumberId || !config.accessToken) {
    throw new Error("WhatsApp credentials are not configured for this gym");
  }

  const to = input.to.replace(/\D/g, "");
  if (!to) throw new Error("A valid WhatsApp recipient number is required");
  if (!input.body.trim()) throw new Error("WhatsApp message cannot be empty");

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: input.body.trim(),
        },
      }),
    },
  );

  const data = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string; error_user_msg?: string };
  };

  if (!response.ok) {
    throw new Error(
      data.error?.error_user_msg ??
        data.error?.message ??
        "WhatsApp message could not be sent",
    );
  }

  return { messageId: data.messages?.[0]?.id ?? null };
}
