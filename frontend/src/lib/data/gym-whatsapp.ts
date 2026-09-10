import { connectToDatabase } from "@/lib/db";
import { GymWhatsAppConfigModel } from "@/models/gym-whatsapp-config.model";

export interface GymWhatsAppConfigView {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  hasAccessToken: boolean;
}

export interface GymWhatsAppCredentials {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
}

export async function getGymWhatsAppConfig(
  gymId: string,
): Promise<GymWhatsAppConfigView> {
  await connectToDatabase();

  const config = await GymWhatsAppConfigModel.findOne({ gymId })
    .select("enabled phoneNumberId businessAccountId accessToken")
    .lean();

  return {
    enabled: Boolean(config?.enabled),
    phoneNumberId: config?.phoneNumberId ?? "",
    businessAccountId: config?.businessAccountId ?? "",
    hasAccessToken: Boolean(config?.accessToken),
  };
}

export async function getGymWhatsAppCredentials(
  gymId: string,
): Promise<GymWhatsAppCredentials | null> {
  await connectToDatabase();

  const config = await GymWhatsAppConfigModel.findOne({ gymId })
    .select("enabled phoneNumberId businessAccountId accessToken")
    .lean();

  if (!config) return null;

  return {
    enabled: Boolean(config.enabled),
    phoneNumberId: config.phoneNumberId,
    businessAccountId: config.businessAccountId,
    accessToken: config.accessToken,
  };
}

export async function saveGymWhatsAppConfig(input: {
  gymId: string;
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken?: string;
}): Promise<GymWhatsAppConfigView> {
  await connectToDatabase();

  const update: {
    enabled: boolean;
    phoneNumberId: string;
    businessAccountId: string;
    accessToken?: string;
  } = {
    enabled: input.enabled,
    phoneNumberId: input.phoneNumberId.trim(),
    businessAccountId: input.businessAccountId.trim(),
  };

  if (input.accessToken?.trim()) {
    update.accessToken = input.accessToken.trim();
  }

  if (input.enabled) {
    const existing = await GymWhatsAppConfigModel.findOne({ gymId: input.gymId })
      .select("accessToken")
      .lean();

    if (!update.accessToken && !existing?.accessToken) {
      throw new Error("Access Token is required to enable WhatsApp");
    }
  }

  const config = await GymWhatsAppConfigModel.findOneAndUpdate(
    { gymId: input.gymId },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
    .select("enabled phoneNumberId businessAccountId accessToken")
    .lean();

  return {
    enabled: Boolean(config?.enabled),
    phoneNumberId: config?.phoneNumberId ?? "",
    businessAccountId: config?.businessAccountId ?? "",
    hasAccessToken: Boolean(config?.accessToken),
  };
}
