import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CRITERIA, RATINGS, branchName, fmtDateTime, weekLabel } from "./config";
import { LOGO_DATA_URL } from "./logo";

const COMPANY = "บริษัท มีไอเดีย เซ็นเตอร์ แอนด์ ซัพพลาย จำกัด";
const ratingInfo = (k) => RATINGS.find((r) => r.key === k) || { label: "-", color: "#555" };

function fmtThaiDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const m = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function empDisplayName(emp) {
  if (emp.nickname && emp.nickname.trim()) return `${emp.name} (${emp.nickname})`;
  return emp.name || "-";
}

function buildFormHTML(emp, ev) {
  const verdictPass = ev.verdict === "pass";
  const verdictText = verdictPass ? "อยู่ในช่วงพิจารณาทดลองงาน" : "ไม่ผ่านการประเมิน";
  const verdictColor = verdictPass ? "#2563eb" : "#dc2626";

  const critRows = CRITERIA.map((c) => {
    const items = (c.items || []).map((it) => {
      const r = ratingInfo(ev.ratings?.[it.key]);
      return `
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:3px 0 3px 14px;">
          <span style="font-size:11.5px;color:#0f172a;"><b>${it.title}</b> <span style="color:#64748b;">— ${it.desc}</span></span>
          <span style="font-weight:700;font-size:11.5px;color:${r.color};white-space:nowrap;">[ ${r.label} ]</span>
        </div>`;
    }).join("");
    return `
      <div style="padding:6px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:700;font-size:13.5px;color:#1e3a8a;">${c.label}</div>
        ${items}
      </div>`;
  }).join("");

  const infoRows = [
    ["ชื่อ–นามสกุล", empDisplayName(emp)],
    ["สาขา", branchName(emp.branchId)],
    ["วันเริ่มงาน", fmtThaiDate(emp.startDate)],
    ["สัปดาห์ที่ประเมิน", weekLabel(ev.week)],
    ["วันเวลาที่ประเมิน", fmtDateTime(ev.evaluatedAt)],
    ["ผู้ประเมิน (ผู้จัดการสาขา)", branchName(emp.branchId)],
  ].map(([k, v]) => `
    <div style="display:flex;margin-bottom:4px;">
      <div style="width:180px;font-weight:700;color:#0f172a;">${k}:</div>
      <div style="color:#334155;">${v}</div>
    </div>`).join("");

  const overall = `<div style="margin-top:10px;font-size:12.5px;"><b>ความเห็นเพิ่มเติมของผู้ประเมิน:</b>
    <div style="margin-top:3px;color:#334155;">${(ev.overallNote || "-").replace(/</g, "&lt;")}</div></div>`;

  return `
    <div style="width:760px;padding:32px 44px;background:#fff;font-family:'IBM Plex Sans Thai',sans-serif;box-sizing:border-box;color:#0f172a;">
      <div style="display:flex;align-items:center;gap:16px;border-bottom:2px solid #1e3a8a;padding-bottom:12px;margin-bottom:14px;">
        <img src="${LOGO_DATA_URL}" style="width:66px;height:66px;object-fit:contain;" />
        <div style="flex:1;">
          <div style="font-size:17px;font-weight:700;color:#1e3a8a;">${COMPANY}</div>
          <div style="font-size:19px;font-weight:700;margin-top:2px;">แบบประเมินผลการปฏิบัติงานพนักงานทดลองงาน</div>
          <div style="font-size:13px;color:#475569;">ฝ่ายขาย Digital Marketing (ประเมินรายสัปดาห์)</div>
        </div>
      </div>
      ${infoRows}
      <div style="font-size:15px;font-weight:700;margin:12px 0 3px;color:#1e3a8a;">ผลการประเมินรายด้าน</div>
      ${critRows}
      <div style="margin-top:12px;padding:11px 18px;border-radius:10px;text-align:center;font-size:15px;font-weight:700;
        background:${verdictPass ? "#eff6ff" : "#fef2f2"};color:${verdictColor};border:1.5px solid ${verdictColor};">
        ผลสรุปการประเมิน: ${verdictText}
      </div>
      ${overall}
      <div style="display:flex;justify-content:space-between;margin-top:32px;gap:40px;">
        <div style="flex:1;text-align:center;font-size:12.5px;">
          <div style="border-top:1px dotted #94a3b8;padding-top:6px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:4px;color:#475569;">( ผู้จัดการสาขา )</div>
        </div>
        <div style="flex:1;text-align:center;font-size:12.5px;">
          <div style="border-top:1px dotted #94a3b8;padding-top:6px;">ลงชื่อ ..............................................</div>
          <div style="margin-top:4px;color:#475569;">( ฝ่ายทรัพยากรบุคคล )</div>
        </div>
      </div>
      <div style="margin-top:16px;font-size:11px;color:#94a3b8;">วันที่ออกเอกสาร: ${fmtThaiDate(new Date().toISOString())}</div>
    </div>`;
}

export async function generateEvaluationPDF(emp, ev) {
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-10000px";
  holder.style.top = "0";
  holder.innerHTML = buildFormHTML(emp, ev);
  document.body.appendChild(holder);
  const node = holder.firstElementChild;

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297, margin = 10;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    // บีบให้พอดี 1 หน้าเสมอ
    let w = maxW;
    let h = (canvas.height * w) / canvas.width;
    if (h > maxH) { h = maxH; w = (canvas.width * h) / canvas.height; }
    const x = (pageW - w) / 2;
    pdf.addImage(img, "PNG", x, margin, w, h);

    const fname = `ประเมิน_${emp.name}_${ev.week}.pdf`.replace(/\s+/g, "_");
    pdf.save(fname);
  } finally {
    document.body.removeChild(holder);
  }
}
