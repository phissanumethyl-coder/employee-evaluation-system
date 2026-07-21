import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  getISOWeek, getMonthKey, branchName, fmtDateTime, tsToMillis,
  canEvaluate, isFinished, weekLabel, STATUS,
} from "./config";
import { generateEvaluationPDF } from "./pdfReport";
import { Style } from "./styles";
import EmployeeHistory from "./EmployeeHistory";
import ConfirmModal from "./Modal";
import BranchManager from "./BranchManager";
import Toast from "./Toast";

export default function HRDashboard({ ready, branches, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [period, setPeriod] = useState("week");
  const [selWeek, setSelWeek] = useState(getISOWeek());
  const [selMonth, setSelMonth] = useState(getMonthKey());
  const [fBranch, setFBranch] = useState("all");
  const [fVerdict, setFVerdict] = useState("all");
  const [drill, setDrill] = useState(null);   // สาขาที่คลิกดู
  const [histEmp, setHistEmp] = useState(null); // พนักงานที่ดูประวัติ
  const [confirm, setConfirm] = useState(null); // {emp, status} สำหรับ modal ยืนยัน
  const [manageBranch, setManageBranch] = useState(false);
  const [toast, setToast] = useState("");

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
    const m = {}; employees.forEach((e) => (m[e.id] = e)); return m;
  }, [employees]);

  const latestEvalOf = (id) =>
    evals.filter((e) => e.employeeId === id)
      .sort((a, b) => tsToMillis(b.evaluatedAt) - tsToMillis(a.evaluatedAt))[0] || null;

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
    branches.map((b) => {
      const rows = periodEvals.filter((e) => e.branchId === b.id);
      const emps = employees.filter((e) => e.branchId === b.id);
      return {
        ...b, total: rows.length,
        pass: rows.filter((e) => e.verdict === "pass").length,
        fail: rows.filter((e) => e.verdict === "fail").length,
        headcount: emps.length,
      };
    }), [periodEvals, employees, branches]);

  // ===== 2 กลุ่มแยกกัน กันกดพลาด =====
  // กลุ่ม 1: ไม่ผ่าน → รอ HR ติดต่อยุติงาน (status = contact)
  const toContact = useMemo(() =>
    employees.filter((e) => e.status === "contact")
      .map((e) => ({ emp: e, latest: latestEvalOf(e.id) }))
      .sort((a, b) => tsToMillis(b.latest?.evaluatedAt) - tsToMillis(a.latest?.evaluatedAt)),
    [employees, evals]);

  // กลุ่ม 2: กำลังพิจารณา → HR กดบรรจุได้เมื่อพร้อม (status = evaluating + เคยประเมิน)
  const toHire = useMemo(() =>
    employees.filter((e) => canEvaluate(e) && e.lastVerdict)
      .map((e) => ({ emp: e, latest: latestEvalOf(e.id) }))
      .filter((x) => x.latest)
      .sort((a, b) => tsToMillis(b.latest.evaluatedAt) - tsToMillis(a.latest.evaluatedAt)),
    [employees, evals]);

  const tableRows = useMemo(() => {
    let rows = [...periodEvals];
    if (fBranch !== "all") rows = rows.filter((e) => e.branchId === fBranch);
    if (fVerdict !== "all") rows = rows.filter((e) => e.verdict === fVerdict);
    return rows.sort((a, b) => tsToMillis(b.evaluatedAt) - tsToMillis(a.evaluatedAt));
  }, [periodEvals, fBranch, fVerdict]);

  async function doSetStatus(emp, status) {
    try {
      await updateDoc(doc(db, "employees", emp.id), {
        status, hrHandledAt: new Date().toISOString(),
      });
      setConfirm(null);
    } catch (e) { alert("อัปเดตไม่สำเร็จ: " + e.message); }
  }

  // ===== หน้าดูประวัติพนักงาน 1 คน =====
  // ===== หน้าจัดการสาขา =====
  if (manageBranch) {
    return (
      <div className="wrap">
        <Style />
        <header className="topbar">
          <div><span className="brand-mark sm">◆</span><strong>HR · จัดการสาขา</strong></div>
          <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
        </header>
        <main className="main">
          <BranchManager
            branches={branches} employees={employees}
            onBack={() => setManageBranch(false)}
            onNotify={(msg) => setToast(msg)}
          />
        </main>
        <Toast message={toast} onClose={() => setToast("")} />
      </div>
    );
  }

  if (histEmp) {
    return (
      <div className="wrap">
        <Style />
        <header className="topbar">
          <div><span className="brand-mark sm">◆</span><strong>HR · ประวัติพนักงาน</strong></div>
          <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
        </header>
        <main className="main">
          <EmployeeHistory
            employee={histEmp}
            evals={evals.filter((e) => e.employeeId === histEmp.id)}
            onBack={() => setHistEmp(null)}
          />
        </main>
      </div>
    );
  }

  // ===== หน้าดูรายชื่อพนักงานของสาขา (drill-down) =====
  if (drill) {
    const emps = employees.filter((e) => e.branchId === drill.id);
    const grp = {
      evaluating: emps.filter((e) => canEvaluate(e)),
      contact: emps.filter((e) => e.status === "contact"),
      hired: emps.filter((e) => e.status === "hired"),
      terminated: emps.filter((e) => e.status === "terminated"),
    };
    const sortOld = (arr) => arr.sort((a, b) => tsToMillis(a.createdAt) - tsToMillis(b.createdAt));
    const Section = ({ title, list, cls }) => list.length === 0 ? null : (
      <>
        <h3 className={`grp-title ${cls}`}>{title} ({list.length})</h3>
        <div className="grid">
          {sortOld(list).map((emp) => {
            const last = latestEvalOf(emp.id);
            const st = STATUS[emp.status] || STATUS.evaluating;
            return (
              <div key={emp.id} className="emp-card">
                <div className="emp-top">
                  <div><h3>{emp.name}{emp.nickname ? ` (${emp.nickname})` : ""}</h3><p className="tiny">เริ่มงาน {emp.startDate || "-"}</p></div>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                </div>
                <div className="emp-meta">
                  {last ? (
                    <>
                      <span className={last.verdict === "pass" ? "review" : "no"}>
                        {last.verdict === "pass" ? "อยู่ระหว่างพิจารณา" : "ไม่ผ่าน"}
                      </span>
                      <span className="tiny">{weekLabel(last.week)}</span>
                    </>
                  ) : <span className="tiny">ยังไม่เคยประเมิน</span>}
                </div>
                {last && <p className="tiny eval-time">ประเมินล่าสุด {fmtDateTime(last.evaluatedAt)}</p>}
                <button className="btn btn-ghost full sm" onClick={() => setHistEmp(emp)}>ดูประวัติการประเมิน</button>
              </div>
            );
          })}
        </div>
      </>
    );
    return (
      <div className="wrap">
        <Style />
        <header className="topbar">
          <div><span className="brand-mark sm">◆</span><strong>HR · {drill.name}</strong></div>
          <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
        </header>
        <main className="main">
          <button className="back" onClick={() => setDrill(null)}>กลับหน้าภาพรวม</button>
          <h2 className="sec-title" style={{ marginTop: 8 }}>พนักงานทั้งหมด · {drill.name} ({emps.length} คน)</h2>
          {emps.length === 0 && <div className="empty sm">สาขานี้ยังไม่มีพนักงาน</div>}
          <Section title="อยู่ในช่วงพิจารณาทดลองงาน" list={grp.evaluating} cls="c-eval" />
          <Section title="รอ HR ติดต่อ (ไม่ผ่าน)" list={grp.contact} cls="c-contact" />
          <Section title="บรรจุเป็นพนักงานแล้ว" list={grp.hired} cls="c-hired" />
          <Section title="ยุติการทำงาน" list={grp.terminated} cls="c-term" />
        </main>
      </div>
    );
  }

  // ===== หน้าหลัก Dashboard =====
  return (
    <div className="wrap">
      <Style />
      <header className="topbar">
        <div><span className="brand-mark sm">◆</span><strong>HR ส่วนกลาง · ภาพรวมทุกสาขา</strong></div>
        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={() => setManageBranch(true)}>จัดการสาขา</button>
          <button className="btn btn-ghost" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </header>

      <main className="main wide">
        <div className="period-bar">
          <div className="seg">
            <button className={period === "week" ? "on" : ""} onClick={() => setPeriod("week")}>รายสัปดาห์</button>
            <button className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>รายเดือน</button>
          </div>
          {period === "week" ? (
            <select value={selWeek} onChange={(e) => setSelWeek(e.target.value)}>
              {weekOptions.map((w) => <option key={w} value={w}>{weekLabel(w)}</option>)}
            </select>
          ) : (
            <select value={selMonth} onChange={(e) => setSelMonth(e.target.value)}>
              {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>

        <div className="stat-row">
          <div className="stat"><span className="stat-n">{totals.total}</span><span className="stat-l">ประเมินทั้งหมด</span></div>
          <div className="stat review"><span className="stat-n">{totals.pass}</span><span className="stat-l">อยู่ระหว่างพิจารณา</span></div>
          <div className="stat fail"><span className="stat-n">{totals.fail}</span><span className="stat-l">ไม่ผ่าน</span></div>
        </div>

        {/* โซน 1: ไม่ผ่าน — ต้องติดต่อยุติงาน (สีแดง) */}
        <section className="flag-panel danger-zone">
          <h2>ต้องติดต่อยุติงาน ({toContact.length})</h2>
          <p className="sub">พนักงานที่ผลออกมา "ไม่ผ่าน" — โทรแจ้งแล้วกดยืนยันเพื่อยุติการทำงาน</p>
          {toContact.length === 0 && <div className="empty sm">ไม่มีพนักงานที่ต้องติดต่อยุติงาน</div>}
          {toContact.map(({ emp, latest }) => (
            <div key={emp.id} className="flag-row">
              <div>
                <strong>{emp.name}{emp.nickname ? ` (${emp.nickname})` : ""}</strong>
                <span className="tiny"> · {branchName(emp.branchId)}</span>
                <div className="tiny">
                  ไม่ผ่าน · สัปดาห์ที่ประเมิน {latest ? weekLabel(latest.week) : "-"} · เวลาประเมิน {latest ? fmtDateTime(latest.evaluatedAt) : ""}
                </div>
              </div>
              <div className="flag-actions">
                <button className="link-btn" onClick={() => setHistEmp(emp)}>ประวัติ</button>
                {latest && <button className="link-btn" onClick={() => generateEvaluationPDF(emp, latest)}>PDF</button>}
                <button className="btn btn-danger sm" onClick={() => setConfirm({ emp, status: "terminated" })}>
                  ยืนยันติดต่อแล้ว (ยุติงาน)
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* โซน 2: กำลังพิจารณา — กดบรรจุได้ (สีเขียว) แยกห่างกันชัดเจน */}
        <section className="flag-panel success-zone">
          <h2>กำลังพิจารณา — บรรจุได้เมื่อพร้อม ({toHire.length})</h2>
          <p className="sub">พนักงานที่ยังพิจารณาอยู่ · กดบรรจุเมื่อพร้อมรับเข้าทำงาน (จะสิ้นสุดการประเมิน)</p>
          {toHire.length === 0 && <div className="empty sm">ไม่มีพนักงานในกลุ่มนี้</div>}
          {toHire.map(({ emp, latest }) => (
            <div key={emp.id} className="flag-row pass-row">
              <div>
                <strong>{emp.name}{emp.nickname ? ` (${emp.nickname})` : ""}</strong>
                <span className="tiny"> · {branchName(emp.branchId)}</span>
                <div className="tiny">
                  อยู่ระหว่างพิจารณา · สัปดาห์ที่ประเมิน {weekLabel(latest.week)} · เวลาประเมิน {fmtDateTime(latest.evaluatedAt)}
                </div>
              </div>
              <div className="flag-actions">
                <button className="link-btn" onClick={() => setHistEmp(emp)}>ประวัติ</button>
                <button className="link-btn" onClick={() => generateEvaluationPDF(emp, latest)}>PDF</button>
                <button className="btn btn-primary sm" onClick={() => setConfirm({ emp, status: "hired" })}>
                  บรรจุเป็นพนักงานแล้ว
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* card สาขา — คลิกได้ */}
        <h2 className="sec-title">ภาพรวมแต่ละสาขา <span className="tiny">(คลิกเพื่อดูรายชื่อ)</span></h2>
        <div className="grid">
          {byBranch.map((b) => (
            <button key={b.id} className="branch-card clickable" onClick={() => setDrill(b)}>
              <h3>{b.name}</h3>
              <p className="tiny bc-head">พนักงานทั้งหมด {b.headcount} คน</p>
              <div className="bc-stats">
                <div><span className="n">{b.total}</span><span className="l">ประเมิน</span></div>
                <div className="review"><span className="n">{b.pass}</span><span className="l">พิจารณา</span></div>
                <div className="fail"><span className="n">{b.fail}</span><span className="l">ไม่ผ่าน</span></div>
              </div>
              {b.fail > 0 && <div className="bc-alert">มี {b.fail} คนไม่ผ่าน</div>}
              <span className="bc-link">ดูรายชื่อ →</span>
            </button>
          ))}
        </div>

        {/* ตารางรายการทั้งหมด + filter */}
        <div className="section-head" style={{ marginTop: 28, marginBottom: 14 }}>
          <h2 className="sec-title" style={{ margin: 0 }}>รายการประเมินทั้งหมด ({tableRows.length})</h2>
          <div className="filters">
            <select value={fBranch} onChange={(e) => setFBranch(e.target.value)}>
              <option value="all">ทุกสาขา</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={fVerdict} onChange={(e) => setFVerdict(e.target.value)}>
              <option value="all">ทุกผล</option>
              <option value="pass">อยู่ระหว่างพิจารณา</option>
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
                    <td className="nowrap">{weekLabel(ev.week)}</td>
                    <td><span className={ev.verdict === "pass" ? "review" : "no"}>
                      {ev.verdict === "pass" ? "พิจารณา" : "ไม่ผ่าน"}</span></td>
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

      <ConfirmModal
        open={!!confirm}
        title={confirm?.status === "terminated" ? "ยืนยันการยุติการทำงาน" : "ยืนยันการบรรจุพนักงาน"}
        message={confirm?.status === "terminated"
          ? `ยืนยันว่าได้ติดต่อ "${confirm?.emp.name}" เพื่อแจ้งยุติการทำงานแล้ว? พนักงานคนนี้จะย้ายไปกลุ่มประวัติและสิ้นสุดการประเมิน`
          : `ยืนยันบรรจุ "${confirm?.emp.name}" เป็นพนักงานประจำ? พนักงานคนนี้จะสิ้นสุดการประเมินและย้ายไปกลุ่มประวัติ`}
        confirmText={confirm?.status === "terminated" ? "ยืนยันยุติงาน" : "ยืนยันบรรจุ"}
        confirmType={confirm?.status === "terminated" ? "danger" : "primary"}
        onConfirm={() => doSetStatus(confirm.emp, confirm.status)}
        onCancel={() => setConfirm(null)}
      />
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
