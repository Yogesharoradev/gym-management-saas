import { type NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireApiSuperAdmin } from "@/lib/auth/api-guard";
import { getGymById } from "@/lib/data/gyms";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  to: z.string().trim().min(7).max(30),
  message: z.string().trim().min(1).max(4096).default(
    "This is a test message from Fitaah.",
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const gym = await getGymById(params.id);
    if (!gym) return jsonError("Gym not found", 404);

    const body = bodySchema.parse(await request.json());
    const result = await sendWhatsAppTextMessage({
      gymId: params.id,
      to: body.to,
      body: body.message,
    });

    return jsonOk({ messageId: result.messageId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid test message", 400);
    }

    console.error("POST admin WhatsApp test failed", error);
    return jsonError(
      error instanceof Error ? error.message : "Unable to send WhatsApp test message",
      500,
    );
  }
}
