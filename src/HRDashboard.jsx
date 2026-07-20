import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  BRANCHES, getISOWeek, getMonthKey, branchName, fmtDateTime, tsToMillis, canEvaluate,
} from "./config";
import { generateEvaluationPDF } from "./pdfReport";
import { Style } from "./styles";

export default function HRDashboard({ ready, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [period, setPeriod] = useState("week");
  const [selWeek, setSelWeek] = useState(getISOWeek());
  const [selMonth, setSelMonth] = useState(getMonthKey());
  const [fBranch, setFBranch] = useState("all");   // filter สาขา
  const [fVerdict, setFVerdict] = useState("all");  // filter ผล

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

  // กรองตามช่วงเวลา (ใช้กับ stat + card สาขา)
  const periodEvals = useMemo(() => {
    if (period === "week") return evals.filter((e) => e.week === selWeek);
    return evals.filter(
      (e) => e.evaluatedAt?.seconds &&
        getMonthKey(new Date(e.evaluatedAt.seconds * 1000)) === selMonth
    );
  }, [evals, period, selWeek, selMonth]);

  const totals = useMemo(() => ({
    total: periodEvals.length,
    pass: periodEvals.filter((e) => e.verdict === "pass").length,
    fail: periodEvals.filter((e) => e.verdict === "fail").length,
  }), [periodEvals]);

  const byBranch = useMemo(() =>
    BRANCHES.map((b) => {
      const rows = periodEvals.filter((e) => e.branchId === b.id);
      return {
        ...b, total: rows.length,
        pass: rows.filter((e) => e.verdict === "pass").length,
        fail: rows.filter((e) => e.verdict === "fail").length,
      };
    }), [periodEvals]);

  // ===== รายการ "ต้องจัดการ" — ผูกกับตัวพนักงาน (ยังประเมินอยู่ = HR ยังไม่จัดการ) =====
  const pending = useMemo(() => {
    return employees
      .filter((emp) => canEvaluate(emp) && emp.lastVerdict) // ยังไม่ถูกจัดการ + เคยประเมินแล้ว
      .map((emp) => ({ emp, latest: latestEvalOf(emp.id) }))
      .filter((x) => x.latest)
      .sort((a, b) => tsToMillis(b.latest.evaluatedAt) - tsToMillis(a.latest.evaluatedAt));
    function latestEvalOf(id) {
      return evals.filter((e) => e.employeeId === id)
        .sort((a, b) => tsToMillis(b.evaluatedAt) - tsToMillis(a.evaluatedAt))[0] || null;
    }
  }, [employees, evals]);

  // ===== ตารางรายการประเมินทั้งหมด — เรียงเวลาล่าสุดบนสุด + filter =====
  const tableRows = useMemo(() => {
    let rows = [...periodEvals];
    if (fBranch !== "all") rows = rows.filter((e) => e.branchId === fBranch);
    if (fVerdict !== "all") rows = rows.filter((e) => e.verdict === fVerdict);
    return rows.sort((a, b) => tsToMillis(b.evaluatedAt) - tsToMillis(a.evaluatedAt));
  }, [periodEvals, fBranch, fVerdict]);

  // อัปเดตสถานะพนักงาน: ยุติงาน / บรรจุ
  async function setEmpStatus(emp, status) {
    const msg = status === "terminated"
      ? `ยืนยันว่าติดต่อ "${emp.name}" เพื่อยุติการทำงานแล้ว?\nหลังจากนี้ผู้จัดการจะประเมินคนนี้ไม่ได้อีก`
      : `ยืนยันบรรจุ "${emp.name}" เป็นพนักงาน?\nหลังจากนี้ผู้จัดการจะประเมินคนนี้ไม่ได้อีก`;
    if (!window.confirm(msg)) return;
    try {
      await updateDoc(doc(db, "employees", emp.id), {
        status, hrHandledAt: new Date().toISOString(),
      });
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

        <div className="stat-row">
          <div className="stat"><span className="stat-n">{totals.total}</span><span className="stat-l">ประเมินทั้งหมด</span></div>
          <div className="stat pass"><span className="stat-n">{totals.pass}</span><span className="stat-l">ผ่าน</span></div>
          <div className="stat fail"><span className="stat-n">{totals.fail}</span><span className="stat-l">ไม่ผ่าน</span></div>
        </div>

        {/* พนักงานที่ HR ต้องจัดการ (ยังไม่บรรจุ/ยุติงาน) */}
        <section className="flag-panel">
          <h2>รอ HR จัดการ ({pending.length})</h2>
          <p className="sub">พนักงานที่ยังอยู่ระหว่างประเมิน — กดจัดการเมื่อผลชัดเจนแล้ว (จะสิ้นสุดการประเมิน)</p>
          {pending.length === 0 && <div className="empty sm">ไม่มีพนักงานที่รอจัดการ</div>}
          {pending.map(({ emp, latest }) => {
            const failed = latest.verdict === "fail";
            return (
              <div key={emp.id} className={`flag-row ${failed ? "" : "pass-row"}`}>
                <div>
                  <strong>{emp.name}</strong>
                  <span className="tiny"> · {branchName(emp.branchId)} · ล่าสุด {latest.week}</span>
                  <div className="tiny">
                    ผล<span className={failed ? "no" : "ok"}> {failed ? "ไม่ผ่าน" : "ผ่าน"}</span>
                    {" · "}{fmtDateTime(latest.evaluatedAt)}
                  </div>
                </div>
                <div className="flag-actions">
                  <button className="link-btn" onClick={() => generateEvaluationPDF(emp, latest)}>PDF</button>
                  {failed ? (
                    <button className="btn btn-danger sm" onClick={() => setEmpStatus(emp, "terminated")}>
                      ติดต่อแล้ว (ยุติงาน)
                    </button>
                  ) : (
                    <button className="btn btn-primary sm" onClick={() => setEmpStatus(emp, "hired")}>
                      บรรจุเป็นพนักงานแล้ว
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

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

        {/* ตารางรายการประเมินทั้งหมด + filter */}
        <div className="section-head" style={{ marginTop: 28, marginBottom: 14 }}>
          <h2 className="sec-title" style={{ margin: 0 }}>รายการประเมินทั้งหมด ({tableRows.length})</h2>
          <div className="filters">
            <select value={fBranch} onChange={(e) => setFBranch(e.target.value)}>
              <option value="all">ทุกสาขา</option>
              {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={fVerdict} onChange={(e) => setFVerdict(e.target.value)}>
              <option value="all">ทุกผล</option>
              <option value="pass">ผ่าน</option>
              <option value="fail">ไม่ผ่าน</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>วันเวลาที่ประเมิน</th><th>พนักงาน</th><th>สาขา</th><th>สัปดาห์</th><th>ผล</th><th>PDF</th></tr>
            </thead>
            <tbody>
              {tableRows.map((ev) => {
                const emp = empMap[ev.employeeId] || { name: ev.employeeName, branchId: ev.branchId };
                return (
                  <tr key={ev.id}>
                    <td className="nowrap">{fmtDateTime(ev.evaluatedAt)}</td>
                    <td>{ev.employeeName}</td>
                    <td>{branchName(ev.branchId)}</td>
                    <td>{ev.week}</td>
                    <td><span className={ev.verdict === "pass" ? "ok" : "no"}>
                      {ev.verdict === "pass" ? "ผ่าน" : "ไม่ผ่าน"}</span></td>
                    <td><button className="link-btn" onClick={() => generateEvaluationPDF(emp, ev)}>ดาวน์โหลด</button></td>
                  </tr>
                );
              })}
              {tableRows.length === 0 && (
                <tr><td colSpan={6} className="tiny" style={{ textAlign: "center", padding: 20 }}>ไม่มีข้อมูลตามเงื่อนไข</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
