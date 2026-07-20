import { jsPDF } from "jspdf";
import { SarabunRegular, SarabunBold } from "./fonts/sarabun";
import { CRITERIA, RATINGS, branchName } from "./config";

const ratingLabel = (k) => RATINGS.find((r) => r.key === k)?.label || "-";

function setupThaiFont(doc) {
  doc.addFileToVFS("Sarabun-Regular.ttf", SarabunRegular);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.addFileToVFS("Sarabun-Bold.ttf", SarabunBold);
  doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
  doc.setFont("Sarabun", "normal");
}

function fmtThaiDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const m = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/**
 * สร้างแบบฟอร์มประเมินทางการเป็น PDF
 * @param {object} emp    ข้อมูลพนักงาน
 * @param {object} ev     ผลประเมิน 1 รายการ
 */
export function generateEvaluationPDF(emp, ev) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  setupThaiFont(doc);

  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ---------- หัวกระดาษ ----------
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(16);
  doc.text("แบบประเมินผลการปฏิบัติงานพนักงานทดลองงาน", pageW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(12);
  doc.setFont("Sarabun", "normal");
  doc.text("ฝ่ายขาย Digital Marketing (ประเมินรายสัปดาห์)", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setDrawColor(180);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ---------- ข้อมูลพนักงาน ----------
  doc.setFontSize(11);
  const info = [
    ["ชื่อ–นามสกุล", emp.name || "-"],
    ["สาขา", branchName(emp.branchId)],
    ["วันเริ่มงาน", fmtThaiDate(emp.startDate)],
    ["สัปดาห์ที่ประเมิน", ev.week || "-"],
    ["ผู้ประเมิน (ผู้จัดการสาขา)", ev.evaluatorName || branchName(emp.branchId)],
  ];
  info.forEach(([k, v]) => {
    doc.setFont("Sarabun", "bold");
    doc.text(`${k}:`, margin, y);
    doc.setFont("Sarabun", "normal");
    doc.text(String(v), margin + 55, y);
    y += 7;
  });
  y += 3;

  // ---------- ตารางหัวข้อประเมิน ----------
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(12);
  doc.text("ผลการประเมินรายหัวข้อ", margin, y);
  y += 6;

  CRITERIA.forEach((c, i) => {
    const r = ev.ratings?.[c.key] || "-";
    const comment = ev.comments?.[c.key] || "-";

    doc.setDrawColor(210);
    doc.setFillColor(245, 243, 238);

    // กล่องหัวข้อ
    doc.setFont("Sarabun", "bold");
    doc.setFontSize(11);
    doc.text(`${i + 1}. ${c.label}`, margin, y);
    // ผล
    const rLabel = ratingLabel(r);
    const col =
      r === "pass" ? [47, 111, 94] : r === "improve" ? [138, 109, 31] : [178, 58, 58];
    doc.setTextColor(...col);
    doc.text(`[ ${rLabel} ]`, pageW - margin, y, { align: "right" });
    doc.setTextColor(0);
    y += 5;

    // คำอธิบายหัวข้อ
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(c.hint, margin + 3, y);
    doc.setTextColor(0);
    y += 5;

    // ความเห็น
    doc.setFontSize(10);
    doc.setFont("Sarabun", "bold");
    doc.text("ความเห็น:", margin + 3, y);
    doc.setFont("Sarabun", "normal");
    const lines = doc.splitTextToSize(comment, contentW - 25);
    doc.text(lines, margin + 25, y);
    y += lines.length * 5 + 4;

    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    if (y > 250 && i < CRITERIA.length - 1) {
      doc.addPage();
      y = margin;
    }
  });

  // ---------- ผลสรุป ----------
  y += 2;
  const verdictPass = ev.verdict === "pass";
  doc.setFillColor(verdictPass ? 232 : 250, verdictPass ? 243 : 235, verdictPass ? 239 : 235);
  doc.setDrawColor(verdictPass ? 47 : 178, verdictPass ? 111 : 58, verdictPass ? 94 : 58);
  doc.roundedRect(margin, y, contentW, 16, 2, 2, "FD");
  doc.setFont("Sarabun", "bold");
  doc.setFontSize(13);
  doc.setTextColor(verdictPass ? 47 : 178, verdictPass ? 111 : 58, verdictPass ? 94 : 58);
  doc.text(
    `ผลสรุปการประเมิน: ${verdictPass ? "ผ่านการประเมิน" : "ไม่ผ่านการประเมิน"}`,
    pageW / 2,
    y + 10,
    { align: "center" }
  );
  doc.setTextColor(0);
  y += 22;

  // ความเห็นรวม
  if (ev.overallNote) {
    doc.setFont("Sarabun", "bold");
    doc.setFontSize(11);
    doc.text("ความเห็นเพิ่มเติมของผู้ประเมิน:", margin, y);
    y += 6;
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(10);
    const on = doc.splitTextToSize(ev.overallNote, contentW);
    doc.text(on, margin, y);
    y += on.length * 5 + 6;
  }

  // ---------- ช่องลงนาม ----------
  if (y > 240) {
    doc.addPage();
    y = margin;
  }
  y = Math.max(y, 250);
  const colW = contentW / 2;
  doc.setFont("Sarabun", "normal");
  doc.setFontSize(10);
  doc.text("ลงชื่อ ...............................................", margin, y);
  doc.text("ลงชื่อ ...............................................", margin + colW, y);
  y += 6;
  doc.text("( ผู้จัดการสาขา )", margin + 8, y);
  doc.text("( ฝ่ายทรัพยากรบุคคล )", margin + colW + 8, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`วันที่ออกเอกสาร: ${fmtThaiDate(new Date().toISOString())}`, margin, y + 6);

  const fname = `ประเมิน_${emp.name}_${ev.week}.pdf`.replace(/\s+/g, "_");
  doc.save(fname);
}
