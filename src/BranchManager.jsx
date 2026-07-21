import React, { useState } from "react";
import { addBranch, updateBranch, deleteBranch } from "./branchStore";
import ConfirmModal from "./Modal";

export default function BranchManager({ branches, employees, onBack, onNotify }) {
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [editing, setEditing] = useState(null); // {id, name, pass}
  const [showPass, setShowPass] = useState({}); // id -> bool
  const [delTarget, setDelTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const countEmp = (bid) => employees.filter((e) => e.branchId === bid).length;

  async function handleAdd() {
    if (!newName.trim() || !newPass.trim()) {
      onNotify && onNotify("กรุณากรอกชื่อสาขาและรหัสผ่าน", "error");
      return;
    }
    setBusy(true);
    try {
      await addBranch({ name: newName, pass: newPass });
      setNewName(""); setNewPass("");
      onNotify && onNotify("เพิ่มสาขาสำเร็จแล้ว");
    } catch (e) { onNotify && onNotify("เพิ่มไม่สำเร็จ: " + e.message, "error"); }
    finally { setBusy(false); }
  }

  async function handleSaveEdit() {
    if (!editing.name.trim() || !editing.pass.trim()) return;
    setBusy(true);
    try {
      await updateBranch(editing.id, { name: editing.name.trim(), pass: editing.pass.trim() });
      setEditing(null);
      onNotify && onNotify("บันทึกการแก้ไขแล้ว");
    } catch (e) { onNotify && onNotify("บันทึกไม่สำเร็จ: " + e.message, "error"); }
    finally { setBusy(false); }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteBranch(delTarget.id);
      setDelTarget(null);
      onNotify && onNotify("ลบสาขาแล้ว");
    } catch (e) { onNotify && onNotify("ลบไม่สำเร็จ: " + e.message, "error"); }
    finally { setBusy(false); }
  }

  return (
    <section className="form-panel wide-panel">
      <button className="back" onClick={onBack}>กลับหน้าภาพรวม</button>
      <h2>จัดการสาขา</h2>
      <p className="sub">เพิ่ม แก้ไข หรือลบสาขา · การเปลี่ยนแปลงมีผลทันที ไม่ต้อง deploy ใหม่</p>

      {/* เพิ่มสาขาใหม่ */}
      <div className="add-branch">
        <h3>เพิ่มสาขาใหม่</h3>
        <div className="add-branch-row">
          <input placeholder="ชื่อสาขา เช่น สาขาหนองคาย" value={newName}
            onChange={(e) => setNewName(e.target.value)} />
          <input placeholder="รหัสผ่านผู้จัดการ" value={newPass}
            onChange={(e) => setNewPass(e.target.value)} />
          <button className="btn btn-primary" disabled={busy} onClick={handleAdd}>+ เพิ่ม</button>
        </div>
      </div>

      {/* รายการสาขา */}
      <h3 className="sec-title" style={{ fontSize: 17 }}>สาขาทั้งหมด ({branches.length})</h3>
      <div className="branch-list">
        {branches.map((b) => {
          const emps = countEmp(b.id);
          const isEditing = editing?.id === b.id;
          return (
            <div key={b.id} className="branch-row">
              {isEditing ? (
                <div className="branch-edit">
                  <input value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  <input value={editing.pass}
                    onChange={(e) => setEditing({ ...editing, pass: e.target.value })} />
                  <div className="branch-edit-btns">
                    <button className="btn btn-ghost sm" onClick={() => setEditing(null)}>ยกเลิก</button>
                    <button className="btn btn-primary sm" disabled={busy} onClick={handleSaveEdit}>บันทึก</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="branch-info">
                    <strong>{b.name}</strong>
                    <div className="tiny">
                      รหัส: {showPass[b.id] ? b.pass : "••••••"}
                      <button className="link-btn" style={{ marginLeft: 8 }}
                        onClick={() => setShowPass((s) => ({ ...s, [b.id]: !s[b.id] }))}>
                        {showPass[b.id] ? "ซ่อน" : "แสดง"}
                      </button>
                      {" · "}พนักงาน {emps} คน
                    </div>
                  </div>
                  <div className="branch-actions">
                    <button className="btn btn-ghost sm"
                      onClick={() => setEditing({ id: b.id, name: b.name, pass: b.pass })}>แก้ไข</button>
                    <button className="btn btn-danger sm" disabled={emps > 0}
                      title={emps > 0 ? "ลบไม่ได้ เพราะยังมีพนักงานอยู่" : ""}
                      onClick={() => setDelTarget(b)}>ลบ</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="tiny" style={{ marginTop: 12 }}>
        * ลบสาขาได้เฉพาะสาขาที่ไม่มีพนักงาน (เพื่อกันข้อมูลประเมินหาย) — หากต้องการลบสาขาที่มีพนักงาน ให้จัดการพนักงานให้เสร็จก่อน
      </p>

      <ConfirmModal
        open={!!delTarget}
        title="ยืนยันการลบสาขา"
        message={`ต้องการลบ "${delTarget?.name}" ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ยืนยันลบ"
        confirmType="danger"
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
      />
    </section>
  );
}
