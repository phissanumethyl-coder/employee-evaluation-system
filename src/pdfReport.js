import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CRITERIA, RATINGS, branchName, fmtDateTime, weekLabel } from "./config";

const ratingInfo = (k) => RATINGS.find((r) => r.key === k) || { label: "-", color: "#555" };

function fmtThaiDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const m = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// สร้าง HTML ฟอร์มทางการ (browser จัดการ shaping ภาษาไทยถูกต้อง)
function buildFormHTML(emp, ev) {
  const verdictPass = ev.verdict === "pass";
  const verdictText = verdictPass ? "อยู่ในช่วงพิจารณาทดลองงาน" : "ไม่ผ่านการประเมิน";
  const verdictColor = verdictPass ? "#2563eb" : "#dc2626";

  const critRows = CRITERIA.map((c, i) => {
    const r = ratingInfo(ev.ratings?.[c.key]);
    const comment = (ev.comments?.[c.key] || "-").replace(/</g, "&lt;");
    return `
      <div style="padding:14px 0;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-weight:700;font-size:16px;color:#0f172a;">${i + 1}. ${c.label}</span>
          <span style="font-weight:700;font-size:15px;color:${r.color};">[ ${r.label} ]</span>
        </div>
        <div style="color:#64748b;font-size:13px;margin:4px 0 8px;">${c.hint}</div>
        <div style="font-size:14px;color:#0f172a;"><b>ความเห็น:</b> ${comment}</div>
      </div>`;
  }).join("");

  const infoRows = [
    ["ชื่อ–นามสกุล", emp.name || "-"],
    ["สาขา", branchName(emp.branchId)],
    ["วันเริ่มงาน", fmtThaiDate(emp.startDate)],
    ["สัปดาห์ที่ประเมิน", weekLabel(ev.week)],
    ["วันเวลาที่ประเมิน", fmtDateTime(ev.evaluatedAt)],
    ["ผู้ประเมิน (ผู้จัดการสาขา)", branchName(emp.branchId)],
  ].map(([k, v]) => `
    <div style="display:flex;margin-bottom:8px;">
      <div style="width:190px;font-weight:700;color:#0f172a;">${k}:</div>
      <div style="color:#334155;">${v}</div>
    </div>`).join("");

  const overall = ev.overallNote
    ? `<div style="margin-top:16px;"><b>ความเห็นเพิ่มเติมของผู้ประเมิน:</b><div style="margin-top:6px;color:#334155;">${ev.overallNote.replace(/</g, "&lt;")}</div></div>`
    : "";

  return `
    <div style="width:760px;padding:48px 56px;background:#fff;font-family:'IBM Plex Sans Thai',sans-serif;box-sizing:border-box;color:#0f172a;">
      <div style="text-align:center;border-bottom:2px solid #1e3a8a;padding-bottom:16px;margin-bottom:24px;">
        <div style="font-size:24px;font-weight:700;">แบบประเมินผลการปฏิบัติงานพนักงานทดลองงาน</div>
        <div style="font-size:16px;color:#475569;margin-top:6px;">ฝ่ายขาย Digital Marketing (ประเมินรายสัปดาห์)</div>
      </div>
      ${infoRows}
      <div style="font-size:18px;font-weight:700;margin:22px 0 8px;color:#1e3a8a;">ผลการประเมินรายหัวข้อ</div>
      ${critRows}
      <div style="margin-top:24px;padding:16px 20px;border-radius:10px;text-align:center;font-size:18px;font-weight:700;
        background:${verdictPass ? "#eff6ff" : "#fef2f2"};color:${verdictColor};border:1.5px solid ${verdictColor};">
        ผลสรุปการประเมิน: ${verdictText}
      </div>
      ${overall}
      <div style="display:flex;justify-content:space-between;margin-top:56px;gap:40px;">
        <div style="flex:1;text-align:center;">
          <div style="border-top:1px dotted #94a3b8;padding-top:8px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:6px;color:#475569;">( ผู้จัดการสาขา )</div>
        </div>
        <div style="flex:1;text-align:center;">
          <div style="border-top:1px dotted #94a3b8;padding-top:8px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:6px;color:#475569;">( ฝ่ายทรัพยากรบุคคล )</div>
        </div>
      </div>
      <div style="margin-top:28px;font-size:12px;color:#94a3b8;">วันที่ออกเอกสาร: ${fmtThaiDate(new Date().toISOString())}</div>
    </div>`;
}

export async function generateEvaluationPDF(emp, ev) {
  // สร้าง element ชั่วคราวนอกจอ
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.innerHTML = buildFormHTML(emp, ev);
  document.body.appendChild(holder);
  const node = holder.firstElementChild;

  try {
    // รอ font โหลด (กันตัวหนังสือเพี้ยนตอน render)
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297, margin = 10;
    const w = pageW - margin * 2;
    const h = (canvas.height * w) / canvas.width;

    if (h <= pageH - margin * 2) {
      pdf.addImage(img, "PNG", margin, margin, w, h);
    } else {
      // แบ่งหลายหน้า
      let remaining = h, position = margin;
      const pageContentH = pageH - margin * 2;
      let srcY = 0;
      const pxPerMm = canvas.width / w;
      while (remaining > 0) {
        const sliceH = Math.min(pageContentH, remaining);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH * pxPerMm;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH * pxPerMm, 0, 0, canvas.width, sliceH * pxPerMm);
        pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, margin, w, sliceH);
        remaining -= sliceH;
        srcY += sliceH * pxPerMm;
        if (remaining > 0) pdf.addPage();
      }
    }

    const fname = `ประเมิน_${emp.name}_${ev.week}.pdf`.replace(/\s+/g, "_");
    pdf.save(fname);
  } finally {
    document.body.removeChild(holder);
  }
}
