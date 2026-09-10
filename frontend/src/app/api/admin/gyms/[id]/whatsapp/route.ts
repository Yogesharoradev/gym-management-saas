import { type NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireApiSuperAdmin } from "@/lib/auth/api-guard";
import {
  getGymWhatsAppConfig,
  saveGymWhatsAppConfig,
} from "@/lib/data/gym-whatsapp";
import { getGymById } from "@/lib/data/gyms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configSchema = z.object({
  enabled: z.boolean(),
  phoneNumberId: z.string().trim().max(120).default(""),
  businessAccountId: z.string().trim().max(120).default(""),
  accessToken: z.string().trim().max(4096).default(""),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const gym = await getGymById(params.id);
    if (!gym) return jsonError("Gym not found", 404);

    const config = await getGymWhatsAppConfig(params.id);
    return jsonOk({ config });
  } catch (error) {
    console.error("GET admin WhatsApp config failed", error);
    return jsonError("Unable to load WhatsApp configuration", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireApiSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const gym = await getGymById(params.id);
    if (!gym) return jsonError("Gym not found", 404);

    const body = configSchema.parse(await request.json());

    if (body.enabled && (!body.phoneNumberId || !body.businessAccountId)) {
      return jsonError(
        "Phone Number ID and WhatsApp Business Account ID are required to enable WhatsApp",
        400,
      );
    }

    const config = await saveGymWhatsAppConfig({
      gymId: params.id,
      enabled: body.enabled,
      phoneNumberId: body.phoneNumberId,
      businessAccountId: body.businessAccountId,
      accessToken: body.accessToken,
    });

    return jsonOk({ config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid WhatsApp configuration", 400);
    }

    console.error("PUT admin WhatsApp config failed", error);
    return jsonError(
      error instanceof Error ? error.message : "Unable to save WhatsApp configuration",
      500,
    );
  }
}
