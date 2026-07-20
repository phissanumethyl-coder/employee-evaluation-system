// ===== 8 สาขา (ภาคอีสาน) + รหัสผ่านผู้จัดการต่อสาขา =====
export const BRANCHES = [
  { id: "roiet", name: "สาขาร้อยเอ็ด", pass: "roiet01" },
  { id: "ubon", name: "สาขาอุบลราชธานี", pass: "ubon01" },
  { id: "kalasin", name: "สาขากาฬสินธุ์", pass: "kalasin01" },
  { id: "khonkaen", name: "สาขาขอนแก่น", pass: "khonkaen01" },
  { id: "mahasarakham", name: "สาขามหาสารคาม", pass: "mahasarakham01" },
  { id: "udon", name: "สาขาอุดรธานี", pass: "udon01" },
  { id: "sakon", name: "สาขาสกลนคร", pass: "sakon01" },
  { id: "mukdahan", name: "สาขามุกดาหาร", pass: "mukdahan01" },
];

// รหัสสำหรับ HR ส่วนกลาง (ดูได้ทุกสาขา)
export const HR_PASS = "hr-central-2026";

// ===== หัวข้อประเมิน 4 ด้าน =====
export const CRITERIA = [
  {
    key: "sales",
    label: "ยอดขาย / เป้าหมาย",
    hint: "ทำได้ตามเป้ายอดขายที่ตั้งไว้หรือไม่ (รายสัปดาห์)",
  },
  {
    key: "skill",
    label: "ทักษะ Digital Marketing",
    hint: "สกิลการตอบแชทลูกค้า, การคิดวิเคราะห์แก้ไขปัญหา",
  },
  {
    key: "learning",
    label: "การเรียนรู้ / พัฒนา",
    hint: "ความเข้าใจในเนื้องาน ปรับปรุงตัวเร็ว",
  },
  {
    key: "attitude",
    label: "ทัศนคติ / ความรับผิดชอบ",
    hint: "การวางตัวและแนวคิด ตรงต่อเวลา ทำงานเป็นทีม",
  },
];

// ===== ระดับผลแต่ละหัวข้อ (ไม่ใช่คะแนน) =====
export const RATINGS = [
  { key: "pass", label: "ผ่าน", color: "#2f6f5e" },
  { key: "improve", label: "ควรปรับปรุง", color: "#8a6d1f" },
  { key: "fail", label: "ไม่ผ่าน", color: "#b23a3a" },
];

export const STATUS = {
  evaluating: { label: "อยู่ในช่วงพิจารณาทดลองงาน", cls: "badge-probation" },
  contact: { label: "รอ HR ติดต่อ (ไม่ผ่าน)", cls: "badge-terminated" },
  hired: { label: "บรรจุเป็นพนักงานแล้ว", cls: "badge-passed" },
  terminated: { label: "ยุติการทำงาน", cls: "badge-terminated" },
};

// พนักงานที่ยังประเมินได้ = อยู่ในช่วงพิจารณา (evaluating) เท่านั้น
// contact/hired/terminated = สิ้นสุดการประเมิน
export function canEvaluate(emp) {
  const s = emp?.status || "evaluating";
  return s === "evaluating" || s === "probation"; // probation = ข้อมูลเก่า
}
export function isFinished(emp) {
  const s = emp?.status || "evaluating";
  return s === "hired" || s === "terminated";
}

// ผลรวมที่ผู้จัดการตัดสินแต่ละสัปดาห์
export const VERDICTS = [
  { key: "pass", label: "อยู่ในช่วงพิจารณาทดลองงาน", color: "#2f6f5e" },
  { key: "fail", label: "ไม่ผ่านการประเมิน", color: "#b23a3a" },
];

// ===== helper วันที่ =====
export function getISOWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// แปลง "2026-W30" เป็นช่วงวันที่ไทย เช่น "20–26 ก.ค. 2569"
export function weekLabel(weekKey) {
  if (!weekKey || !weekKey.includes("-W")) return weekKey || "-";
  const [yStr, wStr] = weekKey.split("-W");
  const year = +yStr, week = +wStr;
  // หาวันจันทร์ของสัปดาห์ ISO นั้น
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const monday = new Date(simple);
  if (dow <= 4) monday.setUTCDate(simple.getUTCDate() - dow + 1);
  else monday.setUTCDate(simple.getUTCDate() + 8 - dow);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const d1 = monday.getUTCDate(), d2 = sunday.getUTCDate();
  const m1 = months[monday.getUTCMonth()], m2 = months[sunday.getUTCMonth()];
  const by = sunday.getUTCFullYear() + 543;
  if (m1 === m2) return `${d1}–${d2} ${m2} ${by}`;
  return `${d1} ${m1} – ${d2} ${m2} ${by}`;
}

export function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// แปลง Firestore timestamp / วันเวลา เป็นข้อความไทยอ่านง่าย
export function fmtDateTime(ts) {
  if (!ts) return "-";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (isNaN(d)) return "-";
  const date = d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time} น.`;
}

// คืนค่า millisecond สำหรับ sort (รองรับทั้ง timestamp และ null)
export function tsToMillis(ts) {
  if (!ts) return 0;
  if (ts.seconds) return ts.seconds * 1000;
  const d = new Date(ts);
  return isNaN(d) ? 0 : d.getTime();
}

export function branchName(id) {
  return BRANCHES.find((b) => b.id === id)?.name || id;
}
