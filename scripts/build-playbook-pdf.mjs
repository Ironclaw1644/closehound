// Builds the gated lead-magnet PDF from the playbook content.
//   node scripts/build-playbook-pdf.mjs  ->  public/section8-playbook.pdf
import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = JSON.parse(readFileSync(path.join(ROOT, "src/lib/guide/content.generated.json"), "utf8"));
const ORDER = [
  "how-section-8-pays",
  "hqs-inspection-checklist",
  "section-8-financing",
  "finding-voucher-tenants",
  "managing-section-8-rentals",
];

const INK = "#1a1a16";
const GOLD = "#8a6d2e";
const MUTED = "#5c5a52";
const RULE = "#e0dccf";

const doc = new PDFDocument({ size: "LETTER", margins: { top: 64, bottom: 64, left: 64, right: 64 }, bufferPages: true });
doc.pipe(createWriteStream(path.join(ROOT, "public/section8-playbook.pdf")));
const W = doc.page.width - 128; // content width

const para = (text, opts = {}) => {
  doc.font(opts.font || "Helvetica").fontSize(opts.size || 10.5).fillColor(opts.color || INK)
    .text(text, { width: W, align: "left", lineGap: opts.lineGap ?? 3, paragraphGap: opts.gap ?? 7 });
};
const space = (n = 1) => doc.moveDown(n);

// ── Cover ────────────────────────────────────────────────────────────────────
doc.font("Helvetica-Bold").fontSize(13).fillColor(GOLD).text("CLOSEHOUND", { characterSpacing: 2 });
doc.moveDown(4);
doc.font("Helvetica-Bold").fontSize(34).fillColor(INK).text("The Section 8\nInvestor's Playbook", { lineGap: 6 });
doc.moveDown(1);
doc.font("Helvetica").fontSize(12.5).fillColor(MUTED).text(
  "How the HUD Housing Choice Voucher program actually works for landlords — from getting paid and passing inspection to financing, finding tenants, and managing the rental.",
  { width: W - 80, lineGap: 4 }
);
doc.moveDown(3);
doc.strokeColor(RULE).lineWidth(1).moveTo(64, doc.y).lineTo(64 + 70, doc.y).stroke();
doc.moveDown(1);
doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("closehound.com  ·  Find Section 8 rentals where the voucher beats the mortgage.");

// ── Chapters ─────────────────────────────────────────────────────────────────
ORDER.forEach((slug, i) => {
  const c = content[slug];
  if (!c) return;
  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD).text(`CHAPTER ${String(i + 1).padStart(2, "0")}`, { characterSpacing: 1.5 });
  space(0.4);
  doc.font("Helvetica-Bold").fontSize(21).fillColor(INK).text(c.title, { width: W, lineGap: 3 });
  space(0.8);
  (c.intro || []).forEach((p) => para(p, { color: MUTED, size: 11 }));
  space(0.4);

  (c.sections || []).forEach((s) => {
    space(0.5);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text(s.heading, { width: W });
    space(0.3);
    (s.body || []).forEach((p) => para(p));
  });

  if (Array.isArray(c.checklist) && c.checklist.length) {
    space(0.6);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text("Checklist", { width: W });
    space(0.3);
    c.checklist.forEach((it) => {
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(GOLD).text("✓  ", { continued: true })
        .fillColor(INK).text(it.item, { width: W });
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text(it.detail, { width: W, indent: 14, lineGap: 2, paragraphGap: 6 });
    });
  }

  if (Array.isArray(c.faqs) && c.faqs.length) {
    space(0.6);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text("FAQ", { width: W });
    space(0.3);
    c.faqs.forEach((f) => {
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK).text(f.q, { width: W });
      para(f.a, { color: MUTED, size: 10 });
    });
  }
});

// ── Disclaimer page ──────────────────────────────────────────────────────────
doc.addPage();
doc.font("Helvetica-Bold").fontSize(13).fillColor(INK).text("A note on this guide");
space(0.6);
para(
  "This playbook is general educational guidance, not legal, tax, or financial advice. The Section 8 / Housing Choice Voucher program is administered locally by Public Housing Authorities (PHAs), and specifics — payment standards, timelines, inspection details, and source-of-income rules — vary by jurisdiction. Verify anything that affects a real decision with your local PHA and a qualified professional.",
  { color: MUTED }
);
space(1);
para("Ready to find a deal that cash-flows on the voucher? Screen live listings against HUD voucher rents at closehound.com — free to start.", { font: "Helvetica-Bold", color: INK });

// ── Footers (page numbers) ───────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.font("Helvetica").fontSize(8).fillColor(MUTED)
    .text(`CloseHound · The Section 8 Investor's Playbook`, 64, doc.page.height - 42, { width: W, align: "left", lineBreak: false });
  if (i > range.start) {
    doc.text(`${i}`, 64, doc.page.height - 42, { width: W, align: "right", lineBreak: false });
  }
}

doc.end();
console.log(`wrote public/section8-playbook.pdf (${range.count} pages)`);
