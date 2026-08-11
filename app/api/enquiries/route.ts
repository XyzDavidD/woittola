import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EnquiryPayload = {
  kind?: unknown;
  name?: unknown;
  organisation?: unknown;
  email?: unknown;
  phone?: unknown;
  enquiryType?: unknown;
  message?: unknown;
  consent?: unknown;
  product?: unknown;
  quantity?: unknown;
  website?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detailRow(label: string, value: string) {
  if (!value) return "";

  return `<tr>
    <td style="padding:8px 16px 8px 0;color:#687386;font-size:14px;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#17263a;font-size:14px;vertical-align:top">${escapeHtml(value).replaceAll("\n", "<br>")}</td>
  </tr>`;
}

export async function POST(request: Request) {
  let payload: EnquiryPayload;

  try {
    payload = (await request.json()) as EnquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // A hidden field catches basic automated form submissions without affecting visitors.
  if (clean(payload.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const kind = payload.kind === "quote" ? "quote" : payload.kind === "contact" ? "contact" : "";
  const name = clean(payload.name, 120);
  const organisation = clean(payload.organisation, 160);
  const email = clean(payload.email, 254).toLowerCase();
  const phone = clean(payload.phone, 80);
  const enquiryType = clean(payload.enquiryType, 120);
  const message = clean(payload.message, 5000);
  const product = clean(payload.product, 200);
  const quantity = clean(payload.quantity, 20);

  const contactIsValid = kind === "contact" && enquiryType && message && payload.consent === true;
  const quoteIsValid = kind === "quote" && product;

  if (!kind || !name || !EMAIL_PATTERN.test(email) || (!contactIsValid && !quoteIsValid)) {
    return NextResponse.json({ error: "Please check the required fields." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || CONTACT_EMAIL;
  const from = process.env.EMAIL_FROM || "Woittola Website <website@woittola.fi>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const isQuote = kind === "quote";
  const subject = isQuote
    ? `Quote request: ${product}`
    : `Website enquiry: ${enquiryType}`;
  const heading = isQuote ? "New product quote request" : "New website enquiry";
  const rows = [
    detailRow("Name", name),
    detailRow("Organisation", organisation),
    detailRow("Email", email),
    detailRow("Phone", phone),
    detailRow("Enquiry type", enquiryType),
    detailRow("Product", product),
    detailRow("Quantity", quantity),
    detailRow("Message", message || "No additional details provided."),
  ].join("");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      html: `<!doctype html>
        <html>
          <body style="margin:0;background:#f4f7fa;font-family:Arial,sans-serif;color:#17263a">
            <div style="max-width:640px;margin:0 auto;padding:32px 18px">
              <div style="background:#ffffff;border:1px solid #dfe6ed;border-radius:10px;padding:28px">
                <div style="color:#0b5da8;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">Woittola website</div>
                <h1 style="margin:8px 0 20px;font-size:24px;line-height:1.25">${heading}</h1>
                <table style="width:100%;border-collapse:collapse">${rows}</table>
              </div>
            </div>
          </body>
        </html>`,
    }),
  });

  if (!response.ok) {
    const resendError = await response.text();
    console.error("Resend email failed:", response.status, resendError);
    return NextResponse.json({ error: "Email could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
