import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { jsonError, jsonOk } from "@/lib/api";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { importMembers, type MemberImportRow } from "@/lib/data/member-import";
import { GENDER } from "@/lib/constants";
import { memberSchema } from "@/lib/validation/member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 1000;

const REQUIRED_HEADERS = [
  "Name",
  "Phone",
  "Email",
  "Gender",
  "Date of Birth",
  "Address",
  "Emergency Contact",
  "Joining Date",
] as const;

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function excelDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  const raw = text(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 10);
}

function rowValue(row: Record<string, unknown>, header: string): unknown {
  if (header in row) return row[header];
  const key = Object.keys(row).find((candidate) => candidate.trim().toLowerCase() === header.toLowerCase());
  return key ? row[key] : "";
}

export async function POST(request: NextRequest) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return jsonError("Please upload an Excel file.", 400);
  if (file.size > MAX_FILE_SIZE) return jsonError("File is too large. Maximum size is 5 MB.", 413);

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
    return jsonError("Only .xlsx and .xls files are supported.", 415);
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return jsonError("The workbook does not contain a worksheet.", 422);

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
    if (rows.length === 0) return jsonError("The worksheet is empty.", 422);
    if (rows.length > MAX_ROWS) return jsonError(`You can import up to ${MAX_ROWS} members at a time.`, 422);

    const headers = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true })[0];
    const normalizedHeaders = new Set((headers ?? []).map((header) => text(header).toLowerCase()));
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !normalizedHeaders.has(header.toLowerCase()));
    if (missingHeaders.length > 0) return jsonError(`Missing columns: ${missingHeaders.join(", ")}`, 422);

    const validRows: MemberImportRow[] = [];
    const issues: Array<{ rowNumber: number; field: string; message: string }> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const raw = {
        name: text(rowValue(row, "Name")),
        phone: text(rowValue(row, "Phone")),
        email: text(rowValue(row, "Email")),
        gender: text(rowValue(row, "Gender")).toUpperCase(),
        dateOfBirth: excelDate(rowValue(row, "Date of Birth")),
        address: text(rowValue(row, "Address")),
        emergencyContact: text(rowValue(row, "Emergency Contact")),
        joiningDate: excelDate(rowValue(row, "Joining Date")) ?? "",
      };

      const parsed = memberSchema.safeParse({
        ...raw,
        gender: raw.gender || GENDER.MALE,
        dateOfBirth: raw.dateOfBirth,
      });

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          issues.push({ rowNumber, field: issue.path.join(".") || "row", message: issue.message });
        });
        return;
      }
      validRows.push({ ...parsed.data, rowNumber });
    });

    const result = await importMembers(auth.user.gymId as string, validRows);
    return jsonOk({
      importedCount: result.imported.length,
      skippedCount: result.skipped.length,
      invalidCount: issues.length,
      issues: [...issues, ...result.skipped].slice(0, 100),
    });
  } catch (error) {
    console.error("Member import failed", error);
    return jsonError("Unable to process this Excel file. Please check the template and try again.", 422);
  }
}

export async function GET() {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  const workbook = XLSX.utils.book_new();
  const template = [
    {
      Name: "Rahul Sharma",
      Phone: "9876543210",
      Email: "rahul@example.com",
      Gender: "MALE",
      "Date of Birth": "1998-05-14",
      Address: "Delhi",
      "Emergency Contact": "9876500000",
      "Joining Date": "2026-08-16",
    },
  ];
  const worksheet = XLSX.utils.json_to_sheet(template, { header: [...REQUIRED_HEADERS] });
  worksheet["!cols"] = REQUIRED_HEADERS.map((header) => ({ wch: Math.max(16, header.length + 4) }));
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=Fitaah-Members-Template.xlsx",
      "Cache-Control": "no-store",
    },
  });
}
