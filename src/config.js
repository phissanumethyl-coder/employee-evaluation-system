// ===== สาขาเริ่มต้น 8 สาขา (ใช้ seed ลง Firestore ครั้งแรกเท่านั้น) =====
// หลัง seed แล้ว ระบบจะอ่านสาขาจาก Firestore collection "branches"
// การเพิ่ม/แก้/ลบสาขา ทำผ่านหน้า "จัดการสาขา" ฝั่ง HR
export const DEFAULT_BRANCHES = [
  { id: "roiet", name: "สาขาร้อยเอ็ด", pass: "roiet01" },
  { id: "ubon", name: "สาขาอุบลราชธานี", pass: "ubon01" },
  { id: "kalasin", name: "สาขากาฬสินธุ์", pass: "kalasin01" },
  { id: "khonkaen", name: "สาขาขอนแก่น", pass: "khonkaen01" },
  { id: "mahasarakham", name: "สาขามหาสารคาม", pass: "mahasarakham01" },
  { id: "udon", name: "สาขาอุดรธานี", pass: "udon01" },
  { id: "sakon", name: "สาขาสกลนคร", pass: "sakon01" },
  { id: "mukdahan", name: "สาขามุกดาหาร", pass: "mukdahan01" },
];

// รหัสสำหรับ HR (ดูได้ทุกสาขา)
export const HR_PASS = "hrmeidea101";

// ===== หัวข้อประเมิน 4 ด้าน (ประเมินรายหัวข้อย่อย 12 หัวข้อ) =====
export const CRITERIA = [
  {
    key: "sales",
    label: "1. ผลสัมฤทธิ์ของงานขาย (Sales Performance)",
    items: [
      { key: "sales_target", title: "เป้าหมายยอดขาย (Sales Target)", desc: "ทำยอดขายได้บรรลุตามเป้าหมายที่ได้รับมอบหมาย (รายสัปดาห์ / รายเดือน)" },
      { key: "sales_closing", title: "อัตราการปิดการขาย (Closing Rate)", desc: "ความสามารถในการเปลี่ยนลูกค้าที่ทักแชท/สอบถาม ให้กลายเป็นออเดอร์" },
      { key: "sales_upsell", title: "การเพิ่มมูลค่าต่อออเดอร์ (Up-selling / Cross-selling)", desc: "ความสามารถในการเสนอขายสินค้าเพิ่มเติม เพื่อเพิ่มยอดขายต่อหัว" },
    ],
  },
  {
    key: "skill",
    label: "2. ทักษะการขายและการดูแลลูกค้า (Digital Marketing & Customer Service)",
    items: [
      { key: "skill_response", title: "ความเร็วในการตอบแชท (Response Time)", desc: "ตอบกลับข้อความลูกค้าได้รวดเร็ว ทันใจ ไม่ปล่อยให้ลูกค้ารอนาน" },
      { key: "skill_communicate", title: "ศิลปะการสื่อสารและการแก้ไขปัญหา", desc: "มีทักษะการโน้มน้าวใจ ภาษาที่ใช้เหมาะสม และรับมือกับปัญหา/ข้อร้องเรียนของลูกค้าได้ดี" },
      { key: "skill_followup", title: "การติดตามลูกค้า (Customer Follow-up)", desc: "มีการทักติดตามออเดอร์ที่ค้างไว้ หรือลูกค้าที่เคยสนใจอย่างสม่ำเสมอและเหมาะสม" },
    ],
  },
  {
    key: "learning",
    label: "3. การเรียนรู้และการพัฒนาตนเอง (Learning & Adaptability)",
    items: [
      { key: "learn_product", title: "ความแม่นยำในสินค้าและโปรโมชั่น (Product Knowledge)", desc: "เข้าใจรายละเอียดสินค้า จุดขาย และโปรโมชั่นปัจจุบันอย่างถูกต้อง" },
      { key: "learn_agility", title: "ความรวดเร็วในการเรียนรู้งาน (Learning Agility)", desc: "ปรับตัวเข้ากับระบบการทำงานใหม่ๆ หรือเครื่องมือใหม่ๆ ได้เร็ว" },
      { key: "learn_seek", title: "การแสวงหาความรู้เพิ่มเติม", desc: "ขวนขวายหาเทคนิคการขายใหม่ๆ หรือศึกษาแนวโน้มตลาด/คู่แข่งเพื่อนำมาปรับใช้" },
    ],
  },
  {
    key: "attitude",
    label: "4. พฤติกรรมและทัศนคติในการทำงาน (Work Attitude & Professionalism)",
    items: [
      { key: "att_discipline", title: "วินัยและการตรงต่อเวลา", desc: "เข้างานตรงเวลา ส่งรายงานสรุปยอด/งานที่ได้รับมอบหมายทันตามกำหนด" },
      { key: "att_teamwork", title: "การทำงานเป็นทีมและความร่วมมือ", desc: "ให้ความร่วมมือกับเพื่อนร่วมทีม สื่อสารกับฝ่ายที่เกี่ยวข้อง (เช่น คลังสินค้า/Ads manager) ได้อย่างราบรื่น" },
      { key: "att_mindset", title: "ทัศนคติและแรงจูงใจ (Positive Mindset)", desc: "มีทัศนคติเชิงบวก พยายามแก้ปัญหามากกว่าการบ่น และพร้อมรับคำติชมเพื่อปรับปรุง" },
    ],
  },
];

// รายการหัวข้อย่อยทั้งหมดแบบ flat (สำหรับ init/loop)
export const SUB_ITEMS = CRITERIA.flatMap((c) => c.items.map((it) => ({ ...it, groupKey: c.key })));

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

// registry สาขาปัจจุบัน (อัปเดตโดย App เมื่อโหลดจาก Firestore)
// ทำให้ branchName() ใช้ได้ทุกที่โดยไม่ต้องส่ง list ไปทุกฟังก์ชัน
let _branchRegistry = [...DEFAULT_BRANCHES];
export function setBranchRegistry(list) {
  _branchRegistry = Array.isArray(list) && list.length ? list : DEFAULT_BRANCHES;
}
export function getBranches() {
  return _branchRegistry;
}
export function branchName(id) {
  return _branchRegistry.find((b) => b.id === id)?.name || id;
}
