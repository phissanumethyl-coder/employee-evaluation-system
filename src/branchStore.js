import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_BRANCHES } from "./config";

const COL = "branches";

// seed สาขาเริ่มต้นลง Firestore ถ้ายังไม่มีสาขาเลย (ทำครั้งเดียว)
export async function seedBranchesIfEmpty() {
  const snap = await getDocs(collection(db, COL));
  if (!snap.empty) return; // มีสาขาแล้ว ไม่ต้อง seed
  await Promise.all(
    DEFAULT_BRANCHES.map((b, i) =>
      setDoc(doc(db, COL, b.id), { name: b.name, pass: b.pass, order: i })
    )
  );
}

// ฟังการเปลี่ยนแปลงสาขาแบบ realtime
export function subscribeBranches(cb) {
  return onSnapshot(collection(db, COL), (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (a.name || "").localeCompare(b.name || "", "th"));
    cb(rows);
  });
}

// สร้าง id จากชื่อสาขา (รองรับไทย: ใช้ timestamp + สุ่ม กันซ้ำ)
export function makeBranchId() {
  return "br_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function addBranch({ name, pass }) {
  const id = makeBranchId();
  await setDoc(doc(db, COL, id), { name: name.trim(), pass: pass.trim(), order: Date.now() });
  return id;
}

export async function updateBranch(id, data) {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteBranch(id) {
  await deleteDoc(doc(db, COL, id));
}
