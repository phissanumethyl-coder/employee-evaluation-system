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
  probation: { label: "ทดลองงาน", cls: "badge-probation" },
  passed: { label: "ผ่านงาน", cls: "badge-passed" },
  terminated: { label: "ยุติการทำงาน", cls: "badge-terminated" },
};

// ผลรวมที่ผู้จัดการตัดสิน
export const VERDICTS = [
  { key: "pass", label: "ผ่านการประเมิน", color: "#2f6f5e" },
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

export function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function branchName(id) {
  return BRANCHES.find((b) => b.id === id)?.name || id;
}
