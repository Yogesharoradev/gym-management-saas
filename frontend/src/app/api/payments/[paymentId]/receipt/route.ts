import { NextResponse } from "next/server";
import { requireApiGymAdmin } from "@/lib/auth/api-guard";
import { getReceiptData } from "@/lib/data/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "");
}

function money(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildPdf(data: NonNullable<Awaited<ReturnType<typeof getReceiptData>>>): Uint8Array {
  const commands: string[] = [];
  const text = (value: string, x: number, y: number, size = 11, bold = false) => {
    commands.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const fillRect = (x: number, y: number, width: number, height: number) => {
    commands.push(`${x} ${y} ${width} ${height} re f`);
  };

  commands.push("0.5 w");
  commands.push("0.90 0.95 0.93 rg");
  fillRect(50, 742, 495, 50);
  commands.push("0.13 0.67 0.45 rg");
  fillRect(50, 742, 7, 50);
  commands.push("0.10 0.12 0.15 rg");
  text(data.gym.name || "Fitaah", 75, 765, 21, true);
  text("PAYMENT RECEIPT", 75, 748, 9, true);
  text(`Receipt #${data.receiptNumber}`, 405, 765, 9, true);
  text(formatDate(data.paymentDate), 405, 749, 9, false);

  commands.push("0.86 0.89 0.88 RG");
  line(50, 725, 545, 725);

  commands.push("0.10 0.12 0.15 rg");
  text("MEMBER", 65, 697, 9, true);
  text(data.member.name, 65, 674, 15, true);
  text(`Mobile  ${data.member.phone || "—"}`, 65, 655, 9);
  text(`Plan  ${data.planName}`, 65, 638, 9);
  text(`Period  ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, 65, 621, 9);

  commands.push("0.86 0.89 0.88 RG");
  line(50, 600, 545, 600);

  commands.push("0.95 0.98 0.96 rg");
  fillRect(50, 470, 495, 108);
  commands.push("0.10 0.12 0.15 rg");
  text("PAYMENT SUMMARY", 65, 558, 9, true);
  text("Membership Amount", 65, 532, 10);
  text(money(data.membershipAmount), 410, 532, 10, true);
  text("Amount Paid", 65, 508, 10);
  commands.push("0.13 0.67 0.45 rg");
  text(money(data.amountPaid), 410, 508, 12, true);
  commands.push("0.10 0.12 0.15 rg");
  text("Payment Method", 65, 486, 9);
  text(data.method.replaceAll("_", " "), 410, 486, 9, true);

  text("Outstanding", 65, 444, 10, true);
  text(money(data.outstanding), 410, 444, 10, true);
  text("Total Paid To Date", 65, 423, 9);
  text(money(data.totalPaid), 410, 423, 9, true);

  if (data.transactionReference) {
    text("Transaction Reference", 65, 397, 9);
    text(data.transactionReference, 220, 397, 9, true);
  }

  commands.push("0.86 0.89 0.88 RG");
  line(50, 365, 545, 365);
  commands.push("0.10 0.12 0.15 rg");
  text("GYM DETAILS", 65, 340, 9, true);
  text(data.gym.address || "", 65, 321, 9);
  text(`Phone  ${data.gym.phone || "—"}`, 65, 303, 9);
  text(`Email  ${data.gym.email || "—"}`, 65, 285, 9);

  commands.push("0.90 0.95 0.93 rg");
  fillRect(50, 105, 495, 82);
  commands.push("0.13 0.67 0.45 rg");
  text("Thank you for your payment!", 75, 157, 13, true);
  commands.push("0.10 0.12 0.15 rg");
  text("Please keep this receipt for your records.", 75, 138, 9);
  text("Generated securely by Fitaah", 75, 119, 8);
  text("fitaah", 490, 138, 11, true);

  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export async function GET(
  _request: Request,
  { params }: { params: { paymentId: string } },
) {
  const auth = await requireApiGymAdmin();
  if (!auth.ok) return auth.response;

  const data = await getReceiptData(auth.user.gymId as string, params.paymentId);
  if (!data) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const pdf = buildPdf(data);
  const safeMemberName = data.member.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "Member";
  return new NextResponse(pdf as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeMemberName}-${data.receiptNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
