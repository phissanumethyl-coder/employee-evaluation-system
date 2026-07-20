import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { BRANCHES, getISOWeek, getMonthKey, branchName } from "./config";
import { generateEvaluationPDF } from "./pdfReport";
import { Style } from "./styles";

export default function HRDashboard({ ready, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [period, setPeriod] = useState("week"); // week | month
  const [selWeek, setSelWeek] = useState(getISOWeek());
  const [selMonth, setSelMonth] = useState(getMonthKey());

  useEffect(() => {
    if (!ready) return;
    const u1 = onSnapshot(collection(db, "employees"), (snap) =>
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(collection(db, "evaluations"), (snap) =>
      setEvals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); };
  }, [ready]);

  const empMap = useMemo(() => {
    const m = {};
    employees.forEach((e) => (m[e.id] = e));
    return m;
  }, [employees]);

  // ตัวเลือกช่วงเวลาที่มีข้อมูลจริง
  const weekOptions = useMemo(() => {
    const s = new Set(evals.map((e) => e.week).filter(Boolean));
    s.add(getISOWeek());
    return [...s].sort().reverse();
  }, [evals]);
  const monthOptions = useMemo(() => {
    const s = new Set();
    evals.forEach((e) => {
      if (e.evaluatedAt?.seconds) s.add(getMonthKey(new Date(e.evaluatedAt.seconds * 1000)));
    });
    s.add(getMonthKey());
    return [...s].sort().reverse();
  }, [evals]);

  // กรองผลตามช่วงที่เลือก
  const filtered = useMemo(() => {
    if (period === "week") return evals.filter((e) => e.week === selWeek);
    return evals.filter(
      (e) => e.evaluatedAt?.seconds &&
        getMonthKey(new Date(e.evaluatedAt.seconds * 1000)) === selMonth
    );
  }, [evals, period, selWeek, selMonth]);

  // สรุปรวม
  const totals = useMemo(() => {
    const pass = filtered.filter((e) => e.verdict === "pass").length;
    const fail = filtered.filter((e) => e.verdict === "fail").length;
    return { pass, fail, total: filtered.length };
  }, [filtered]);

  // คนที่ไม่ผ่าน (flag ให้ HR โทรแจ้ง)
  const flagged = useMemo(
    () => filtered.filter((e) => e.verdict === "fail")
      .sort((a, b) => (a.hrHandled === b.hrHandled ? 0 : a.hrHandled ? 1 : -1)),
    [filtered]
  );

  // สรุปต่อสาขา
  const byBranch = useMemo(() => {
    return BRANCHES.map((b) => {
      const rows = filtered.filter((e) => e.branchId === b.id);
      return {
        ...b,
        total: rows.length,
        pass: rows.filter((e) => e.verdict === "pass").length,
        fail: rows.filter((e) => e.verdict === "fail").length,
      };
    });
  }, [filtered]);

  async function markHandled(ev) {
    try {
      await updateDoc(doc(db, "evaluations", ev.id), { hrHandled: !ev.hrHandled });
    } catch (e) { alert("อัปเดตไม่สำเร็จ: " + e.message); }
  }

  return (
    <div className="wrap">
      <Style />
      <header className="topbar">
        <div><span className="brand-mark sm">◆</span><strong>HR ส่วนกลาง · ภาพรวมทุกสาขา</strong></div>
        <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
      </header>

      <main className="main wide">
        {/* ตัวเลือกช่วงเวลา */}
        <div className="period-bar">
          <div className="seg">
            <button className={period === "week" ? "on" : ""} onClick={() => setPeriod("week")}>รายสัปดาห์</button>
            <button className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>รายเดือน</button>
          </div>
          {period === "week" ? (
            <select value={selWeek} onChange={(e) => setSelWeek(e.target.value)}>
              {weekOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          ) : (
            <select value={selMonth} onChange={(e) => setSelMonth(e.target.value)}>
              {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>

        {/* สรุปตัวเลขรวม */}
        <div className="stat-row">
          <div className="stat"><span className="stat-n">{totals.total}</span><span className="stat-l">ประเมินทั้งหมด</span></div>
          <div className="stat pass"><span className="stat-n">{totals.pass}</span><span className="stat-l">ผ่าน</span></div>
          <div className="stat fail"><span className="stat-n">{totals.fail}</span><span className="stat-l">ไม่ผ่าน</span></div>
        </div>

        {/* รายชื่อคนไม่ผ่าน — flag ให้ HR โทรแจ้ง */}
        <section className="flag-panel">
          <h2>⚠ ต้องติดต่อ ({flagged.length})</h2>
          <p className="sub">พนักงานที่ผลออกมา "ไม่ผ่าน" ในช่วงนี้ — โทรแจ้งแล้วกดทำเครื่องหมาย</p>
          {flagged.length === 0 && <div className="empty sm">ไม่มีพนักงานที่ไม่ผ่านในช่วงนี้</div>}
          {flagged.map((ev) => {
            const emp = empMap[ev.employeeId] || { name: ev.employeeName, branchId: ev.branchId };
            return (
              <div key={ev.id} className={`flag-row ${ev.hrHandled ? "handled" : ""}`}>
                <div>
                  <strong>{ev.employeeName}</strong>
                  <span className="tiny"> · {branchName(ev.branchId)} · {ev.week}</span>
                </div>
                <div className="flag-actions">
                  <button className="link-btn" onClick={() => generateEvaluationPDF(emp, ev)}>PDF</button>
                  <button
                    className={`btn ${ev.hrHandled ? "btn-ghost" : "btn-danger"} sm`}
                    onClick={() => markHandled(ev)}
                  >{ev.hrHandled ? "✓ ติดต่อแล้ว" : "ยังไม่ติดต่อ"}</button>
                </div>
              </div>
            );
          })}
        </section>

        {/* card แต่ละสาขา */}
        <h2 className="sec-title">ภาพรวมแต่ละสาขา</h2>
        <div className="grid">
          {byBranch.map((b) => (
            <div key={b.id} className="branch-card">
              <h3>{b.name}</h3>
              <div className="bc-stats">
                <div><span className="n">{b.total}</span><span className="l">ประเมิน</span></div>
                <div className="pass"><span className="n">{b.pass}</span><span className="l">ผ่าน</span></div>
                <div className="fail"><span className="n">{b.fail}</span><span className="l">ไม่ผ่าน</span></div>
              </div>
              {b.fail > 0 && <div className="bc-alert">มี {b.fail} คนไม่ผ่าน</div>}
            </div>
          ))}
        </div>

        {/* ตารางผลทั้งหมดในช่วง */}
        <h2 className="sec-title">รายการประเมินทั้งหมด ({filtered.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>พนักงาน</th><th>สาขา</th><th>สัปดาห์</th><th>ผล</th><th>PDF</th></tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => (b.week || "").localeCompare(a.week || "")).map((ev) => {
                const emp = empMap[ev.employeeId] || { name: ev.employeeName, branchId: ev.branchId };
                return (
                  <tr key={ev.id}>
                    <td>{ev.employeeName}</td>
                    <td>{branchName(ev.branchId)}</td>
                    <td>{ev.week}</td>
                    <td><span className={ev.verdict === "pass" ? "ok" : "no"}>
                      {ev.verdict === "pass" ? "ผ่าน" : "ไม่ผ่าน"}</span></td>
                    <td><button className="link-btn" onClick={() => generateEvaluationPDF(emp, ev)}>ดาวน์โหลด</button></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="tiny" style={{ textAlign: "center", padding: 20 }}>ไม่มีข้อมูลในช่วงนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
