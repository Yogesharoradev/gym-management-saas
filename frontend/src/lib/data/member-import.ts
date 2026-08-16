import "server-only";
import { connectToDatabase } from "@/lib/db";
import { tenant } from "@/lib/data/tenant";
import { MemberModel, type IMember } from "@/models/member.model";
import { MEMBER_STATUS, type Gender } from "@/lib/constants";
import type { MemberInput } from "@/lib/validation/member";
import { serializeMember, type SerializedMember } from "@/lib/data/members";

export interface MemberImportRow extends MemberInput {
  rowNumber: number;
}

export interface MemberImportIssue {
  rowNumber: number;
  field: string;
  message: string;
}

export interface MemberImportResult {
  imported: SerializedMember[];
  skipped: MemberImportIssue[];
}

export async function importMembers(
  gymId: string,
  rows: MemberImportRow[],
): Promise<MemberImportResult> {
  await connectToDatabase();

  if (rows.length === 0) return { imported: [], skipped: [] };

  const phones = rows.map((row) => row.phone.trim());
  const existing = await MemberModel.find(
    tenant(gymId).filter({ phone: { $in: phones } }),
  )
    .select({ phone: 1 })
    .lean<Pick<IMember, "phone">[]>();

  const existingPhones = new Set(existing.map((member) => member.phone.trim()));
  const seenPhones = new Set<string>();
  const skipped: MemberImportIssue[] = [];
  const validRows: MemberImportRow[] = [];

  for (const row of rows) {
    const phone = row.phone.trim();
    if (existingPhones.has(phone)) {
      skipped.push({ rowNumber: row.rowNumber, field: "phone", message: "A member with this phone number already exists." });
      continue;
    }
    if (seenPhones.has(phone)) {
      skipped.push({ rowNumber: row.rowNumber, field: "phone", message: "Duplicate phone number in this file." });
      continue;
    }
    seenPhones.add(phone);
    validRows.push(row);
  }

  const documents = validRows.map((row) => ({
    gymId: tenant(gymId).gymId,
    name: row.name.trim(),
    phone: row.phone.trim(),
    email: row.email.trim().toLowerCase(),
    gender: row.gender as Gender,
    dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
    address: row.address.trim(),
    emergencyContact: row.emergencyContact.trim(),
    photo: null,
    joiningDate: new Date(row.joiningDate),
    status: MEMBER_STATUS.ACTIVE,
  }));

  if (documents.length === 0) return { imported: [], skipped };

  const created = await MemberModel.insertMany(documents, { ordered: true });
  const imported = created.map((member) => serializeMember(member));
  return { imported, skipped };
}
