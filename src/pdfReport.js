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
      <div style="padding:9px 0;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-weight:700;font-size:15px;color:#0f172a;">${i + 1}. ${c.label}</span>
          <span style="font-weight:700;font-size:14px;color:${r.color};">[ ${r.label} ]</span>
        </div>
        <div style="color:#64748b;font-size:12px;margin:3px 0 5px;">${c.hint}</div>
        <div style="font-size:13px;color:#0f172a;"><b>ความเห็น:</b> ${comment}</div>
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
    <div style="display:flex;margin-bottom:5px;">
      <div style="width:190px;font-weight:700;color:#0f172a;">${k}:</div>
      <div style="color:#334155;">${v}</div>
    </div>`).join("");

  const overall = ev.overallNote
    ? `<div style="margin-top:12px;font-size:13px;"><b>ความเห็นเพิ่มเติมของผู้ประเมิน:</b><div style="margin-top:4px;color:#334155;">${ev.overallNote.replace(/</g, "&lt;")}</div></div>`
    : "";

  return `
    <div style="width:760px;padding:36px 48px;background:#fff;font-family:'IBM Plex Sans Thai',sans-serif;box-sizing:border-box;color:#0f172a;">
      <div style="text-align:center;border-bottom:2px solid #1e3a8a;padding-bottom:12px;margin-bottom:18px;">
        <div style="font-size:22px;font-weight:700;">แบบประเมินผลการปฏิบัติงานพนักงานทดลองงาน</div>
        <div style="font-size:15px;color:#475569;margin-top:5px;">ฝ่ายขาย Digital Marketing (ประเมินรายสัปดาห์)</div>
      </div>
      ${infoRows}
      <div style="font-size:16px;font-weight:700;margin:16px 0 4px;color:#1e3a8a;">ผลการประเมินรายหัวข้อ</div>
      ${critRows}
      <div style="margin-top:16px;padding:12px 18px;border-radius:10px;text-align:center;font-size:16px;font-weight:700;
        background:${verdictPass ? "#eff6ff" : "#fef2f2"};color:${verdictColor};border:1.5px solid ${verdictColor};">
        ผลสรุปการประเมิน: ${verdictText}
      </div>
      ${overall}
      <div style="display:flex;justify-content:space-between;margin-top:40px;gap:40px;">
        <div style="flex:1;text-align:center;font-size:13px;">
          <div style="border-top:1px dotted #94a3b8;padding-top:7px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:5px;color:#475569;">( ผู้จัดการสาขา )</div>
        </div>
        <div style="flex:1;text-align:center;font-size:13px;">
          <div style="border-top:1px dotted #94a3b8;padding-top:7px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:5px;color:#475569;">( ฝ่ายทรัพยากรบุคคล )</div>
        </div>
      </div>
      <div style="margin-top:20px;font-size:11px;color:#94a3b8;">วันที่ออกเอกสาร: ${fmtThaiDate(new Date().toISOString())}</div>
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
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    // คำนวณให้พอดี 1 หน้าเสมอ: ย่อตามด้านที่ชนขอบก่อน
    let w = maxW;
    let h = (canvas.height * w) / canvas.width;
    if (h > maxH) {
      h = maxH;
      w = (canvas.width * h) / canvas.height;
    }
    // จัดกึ่งกลางแนวนอน
    const x = (pageW - w) / 2;
    pdf.addImage(img, "PNG", x, margin, w, h);

    const fname = `ประเมิน_${emp.name}_${ev.week}.pdf`.replace(/\s+/g, "_");
    pdf.save(fname);
  } finally {
    document.body.removeChild(holder);
  }
}
