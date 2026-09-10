import { type NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { connectToDatabase } from "@/lib/db";
import { GymModel } from "@/models/gym.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configSchema = z.object({
  enabled: z.boolean(),
  phoneNumberId: z.string().trim().max(120).default(""),
  businessAccountId: z.string().trim().max(120).default(""),
  accessToken: z.string().trim().max(4096).default(""),
});

export async function GET() {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  try {
    await connectToDatabase();
    const gym = await GymModel.findById(auth.user.gymId)
      .select("whatsappEnabled whatsappPhoneNumberId whatsappBusinessAccountId whatsappAccessToken")
      .lean();

    if (!gym) return jsonError("Gym not found", 404);

    return jsonOk({
      config: {
        enabled: gym.whatsappEnabled,
        phoneNumberId: gym.whatsappPhoneNumberId,
        businessAccountId: gym.whatsappBusinessAccountId,
        hasAccessToken: Boolean(gym.whatsappAccessToken),
      },
    });
  } catch (error) {
    console.error("GET /api/whatsapp/config failed", error);
    return jsonError("Unable to load WhatsApp configuration", 500);
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = configSchema.parse(await request.json());

    if (
      body.enabled &&
      (!body.phoneNumberId || !body.businessAccountId)
    ) {
      return jsonError(
        "Phone Number ID and WhatsApp Business Account ID are required to enable WhatsApp",
        400,
      );
    }

    await connectToDatabase();

    const update: Record<string, boolean | string> = {
      whatsappEnabled: body.enabled,
      whatsappPhoneNumberId: body.phoneNumberId,
      whatsappBusinessAccountId: body.businessAccountId,
    };

    if (body.accessToken) {
      update.whatsappAccessToken = body.accessToken;
    }

    if (body.enabled && !body.accessToken) {
      const existing = await GymModel.findById(auth.user.gymId)
        .select("whatsappAccessToken")
        .lean();

      if (!existing?.whatsappAccessToken) {
        return jsonError("Access Token is required to enable WhatsApp", 400);
      }
    }

    const gym = await GymModel.findByIdAndUpdate(
      auth.user.gymId,
      { $set: update },
      { new: true },
    )
      .select("whatsappEnabled whatsappPhoneNumberId whatsappBusinessAccountId whatsappAccessToken")
      .lean();

    if (!gym) return jsonError("Gym not found", 404);

    return jsonOk({
      config: {
        enabled: gym.whatsappEnabled,
        phoneNumberId: gym.whatsappPhoneNumberId,
        businessAccountId: gym.whatsappBusinessAccountId,
        hasAccessToken: Boolean(gym.whatsappAccessToken),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid WhatsApp configuration", 400);
    }

    console.error("PUT /api/whatsapp/config failed", error);
    return jsonError("Unable to save WhatsApp configuration", 500);
  }
}
