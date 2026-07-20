import React, { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, doc, query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { CRITERIA, RATINGS, STATUS, VERDICTS, getISOWeek } from "./config";
import { generateEvaluationPDF } from "./pdfReport";
import { Style } from "./styles";

export default function ManagerView({ branch, ready, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [view, setView] = useState("list");
  const [activeEmp, setActiveEmp] = useState(null);

  useEffect(() => {
    if (!ready) return;
    const qEmp = query(collection(db, "employees"), where("branchId", "==", branch.id));
    const u1 = onSnapshot(qEmp, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (a.name || "").localeCompare(b.name || "", "th"));
      setEmployees(rows);
    });
    const qEval = query(collection(db, "evaluations"), where("branchId", "==", branch.id));
    const u2 = onSnapshot(qEval, (snap) =>
      setEvals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); };
  }, [branch, ready]);

  return (
    <div className="wrap">
      <Style />
      <header className="topbar">
        <div><span className="brand-mark sm">◆</span><strong>{branch.name}</strong></div>
        <div className="topbar-right">
          <span className="week-pill">สัปดาห์นี้ · {getISOWeek()}</span>
          <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </header>

      <main className="main">
        {view === "list" && (
          <EmployeeList
            employees={employees} evals={evals}
            onAdd={() => setView("add")}
            onEvaluate={(emp) => { setActiveEmp(emp); setView("evaluate"); }}
          />
        )}
        {view === "add" && (
          <AddEmployee branch={branch} onDone={() => setView("list")} onCancel={() => setView("list")} />
        )}
        {view === "evaluate" && activeEmp && (
          <EvaluateForm
            branch={branch} employee={activeEmp}
            evals={evals.filter((e) => e.employeeId === activeEmp.id)}
            onDone={() => setView("list")} onCancel={() => setView("list")}
          />
        )}
      </main>
    </div>
  );
}

function EmployeeList({ employees, evals, onAdd, onEvaluate }) {
  const thisWeek = getISOWeek();
  const latestEval = (id) =>
    evals.filter((e) => e.employeeId === id).sort((a, b) => (b.week || "").localeCompare(a.week || ""))[0] || null;
  const doneThisWeek = (id) => evals.some((e) => e.employeeId === id && e.week === thisWeek);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>พนักงานใหม่ในสาขา</h2>
          <p className="sub">{employees.length} คน · แตะเพื่อประเมินสัปดาห์นี้</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ เพิ่มพนักงาน</button>
      </div>

      {employees.length === 0 && (
        <div className="empty">
          <p>ยังไม่มีพนักงานใหม่ในสาขานี้</p>
          <button className="btn btn-primary" onClick={onAdd}>เพิ่มพนักงานคนแรก</button>
        </div>
      )}

      <div className="grid">
        {employees.map((emp) => {
          const st = STATUS[emp.status] || STATUS.probation;
          const last = latestEval(emp.id);
          const done = doneThisWeek(emp.id);
          return (
            <div key={emp.id} className="emp-card">
              <div className="emp-top">
                <div>
                  <h3>{emp.name}</h3>
                  <p className="tiny">เริ่มงาน {emp.startDate || "-"}</p>
                </div>
                <span className={`badge ${st.cls}`}>{st.label}</span>
              </div>
              <div className="emp-meta">
                {last ? (
                  <>
                    <span>ล่าสุด {last.week}</span>
                    <span className={last.verdict === "pass" ? "ok" : "no"}>
                      {last.verdict === "pass" ? "ผ่าน" : "ไม่ผ่าน"}
                    </span>
                  </>
                ) : <span className="tiny">ยังไม่เคยประเมิน</span>}
              </div>
              <button
                className={`btn full ${done ? "btn-ghost" : "btn-primary"}`}
                onClick={() => onEvaluate(emp)}
              >
                {done ? "ประเมินซ้ำสัปดาห์นี้" : "ประเมินสัปดาห์นี้"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AddEmployee({ branch, onDone, onCancel }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "employees"), {
        name: name.trim(), branchId: branch.id, branchName: branch.name,
        startDate, status: "probation", createdAt: serverTimestamp(),
      });
      onDone();
    } catch (e) { alert("บันทึกไม่สำเร็จ: " + e.message); }
    finally { setSaving(false); }
  }

  return (
    <section className="form-panel">
      <button className="back" onClick={onCancel}>← กลับ</button>
      <h2>เพิ่มพนักงานใหม่</h2>
      <label className="fld"><span>ชื่อ–นามสกุล</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมชาย ใจดี" />
      </label>
      <label className="fld"><span>วันเริ่มงาน</span>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <div className="row-btns">
        <button className="btn btn-ghost" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </section>
  );
}

function EvaluateForm({ branch, employee, evals, onDone, onCancel }) {
  const week = getISOWeek();
  const [ratings, setRatings] = useState(
    CRITERIA.reduce((a, c) => ({ ...a, [c.key]: "pass" }), {})
  );
  const [comments, setComments] = useState(
    CRITERIA.reduce((a, c) => ({ ...a, [c.key]: "" }), {})
  );
  const [verdict, setVerdict] = useState("pass");
  const [overallNote, setOverallNote] = useState("");
  const [saving, setSaving] = useState(false);

  const history = [...evals].sort((a, b) => (b.week || "").localeCompare(a.week || ""));
  const anyFail = Object.values(ratings).some((r) => r === "fail");

  async function submit() {
    setSaving(true);
    try {
      await addDoc(collection(db, "evaluations"), {
        employeeId: employee.id, employeeName: employee.name,
        branchId: branch.id, week,
        ratings, comments, verdict, overallNote: overallNote.trim(),
        hrFlag: verdict === "fail",       // flag เตือน HR
        hrHandled: false,                 // HR ยังไม่จัดการ
        evaluatedAt: serverTimestamp(),
      });
      // อัปเดตพนักงาน: บันทึกผลล่าสุด แต่ไม่เปลี่ยนเป็นยุติงานอัตโนมัติ
      await updateDoc(doc(db, "employees", employee.id), {
        lastEvalWeek: week, lastVerdict: verdict,
      });
      onDone();
    } catch (e) { alert("บันทึกไม่สำเร็จ: " + e.message); }
    finally { setSaving(false); }
  }

  return (
    <section className="form-panel">
      <button className="back" onClick={onCancel}>← กลับ</button>
      <div className="eval-head">
        <h2>ประเมิน · {employee.name}</h2>
        <p className="sub">สัปดาห์ {week} · เริ่มงาน {employee.startDate}</p>
      </div>

      {CRITERIA.map((c, i) => (
        <div key={c.key} className="crit">
          <div className="crit-label"><span>{i + 1}. {c.label}</span></div>
          <p className="tiny">{c.hint}</p>
          <div className="rating-row">
            {RATINGS.map((r) => (
              <button key={r.key}
                className={`rate ${ratings[c.key] === r.key ? "on" : ""}`}
                style={ratings[c.key] === r.key ? { background: r.color, borderColor: r.color, color: "#fff" } : {}}
                onClick={() => setRatings((s) => ({ ...s, [c.key]: r.key }))}
              >{r.label}</button>
            ))}
          </div>
          <textarea className="comment" rows={2}
            placeholder="ความเห็นสำหรับหัวข้อนี้..."
            value={comments[c.key]}
            onChange={(e) => setComments((s) => ({ ...s, [c.key]: e.target.value }))}
          />
        </div>
      ))}

      <label className="fld"><span>ความเห็นเพิ่มเติมโดยรวม (ไม่บังคับ)</span>
        <textarea rows={3} value={overallNote}
          onChange={(e) => setOverallNote(e.target.value)}
          placeholder="สรุปภาพรวม จุดเด่น จุดที่ต้องพัฒนา..." />
      </label>

      <div className="verdict-pick">
        <span className="vp-label">ผลสรุปการประเมิน (ผู้จัดการตัดสิน)</span>
        <div className="rating-row">
          {VERDICTS.map((v) => (
            <button key={v.key}
              className={`rate big ${verdict === v.key ? "on" : ""}`}
              style={verdict === v.key ? { background: v.color, borderColor: v.color, color: "#fff" } : {}}
              onClick={() => setVerdict(v.key)}
            >{v.label}</button>
          ))}
        </div>
      </div>

      {anyFail && verdict === "pass" && (
        <div className="warn">มีบางหัวข้อได้ "ไม่ผ่าน" แต่ผลสรุปเป็นผ่าน — ตรวจสอบอีกครั้งก่อนบันทึก</div>
      )}
      {verdict === "fail" && (
        <div className="warn">ผลสรุป "ไม่ผ่าน" จะถูก flag แจ้งเตือนฝ่าย HR ให้ติดต่อพนักงาน</div>
      )}

      <div className="row-btns">
        <button className="btn btn-ghost" onClick={onCancel}>ยกเลิก</button>
        <button className={`btn ${verdict === "pass" ? "btn-primary" : "btn-danger"}`}
          disabled={saving} onClick={submit}>
          {saving ? "กำลังบันทึก..." : "ยืนยันผลประเมิน"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h3>ประวัติการประเมิน</h3>
          {history.map((h) => (
            <div key={h.id} className="hist-row">
              <span>{h.week}</span>
              <span className={h.verdict === "pass" ? "ok" : "no"}>
                {h.verdict === "pass" ? "ผ่าน" : "ไม่ผ่าน"}
              </span>
              <button className="link-btn" onClick={() => generateEvaluationPDF(employee, h)}>
                ดาวน์โหลด PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
