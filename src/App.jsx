import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "./firebase";

/* ============================================================
   6 สาขา + รหัสผ่านต่อสาขา (แก้รหัสได้ตามต้องการ)
   หมายเหตุ: รหัสผ่านฝั่ง client เหมาะกับใช้งานภายในเท่านั้น
   ============================================================ */
const BRANCHES = [
  { id: "br01", name: "สาขา 1 — สำนักงานใหญ่", pass: "manager01" },
  { id: "br02", name: "สาขา 2", pass: "manager02" },
  { id: "br03", name: "สาขา 3", pass: "manager03" },
  { id: "br04", name: "สาขา 4", pass: "manager04" },
  { id: "br05", name: "สาขา 5", pass: "manager05" },
  { id: "br06", name: "สาขา 6", pass: "manager06" },
];

/* เกณฑ์การประเมิน 4 ด้าน (คะแนน 1–5 ต่อด้าน) */
const CRITERIA = [
  { key: "sales", label: "ยอดขาย / เป้าหมาย", hint: "ทำได้ตามเป้ายอดขายที่ตั้งไว้หรือไม่" },
  { key: "skill", label: "ทักษะ Digital Marketing", hint: "ความเข้าใจ ads, content, analytics" },
  { key: "learning", label: "การเรียนรู้ / พัฒนา", hint: "เปิดรับสิ่งใหม่ ปรับปรุงตัวเร็ว" },
  { key: "attitude", label: "ทัศนคติ / ความรับผิดชอบ", hint: "ตรงต่อเวลา ทำงานเป็นทีม" },
];

const PASS_THRESHOLD = 3.0; // เฉลี่ย >= 3.0 = ผ่าน (ปรับได้)

function getISOWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const STATUS = {
  probation: { label: "ทดลองงาน", cls: "badge-probation" },
  passed: { label: "ผ่านงาน", cls: "badge-passed" },
  terminated: { label: "ยุติการทำงาน", cls: "badge-terminated" },
};

export default function App() {
  const [branch, setBranch] = useState(null);
  const [passInput, setPassInput] = useState("");
  const [pickBranch, setPickBranch] = useState(BRANCHES[0].id);
  const [loginErr, setLoginErr] = useState("");
  const [ready, setReady] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [evals, setEvals] = useState([]);
  const [view, setView] = useState("list");
  const [activeEmp, setActiveEmp] = useState(null);

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => setReady(true))
      .catch((e) => {
        console.error(e);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!branch || !ready) return;
    const qEmp = query(
      collection(db, "employees"),
      where("branchId", "==", branch.id)
    );
    const unsubEmp = onSnapshot(qEmp, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (a.name || "").localeCompare(b.name || "", "th"));
      setEmployees(rows);
    });

    const qEval = query(
      collection(db, "evaluations"),
      where("branchId", "==", branch.id)
    );
    const unsubEval = onSnapshot(qEval, (snap) => {
      setEvals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubEmp();
      unsubEval();
    };
  }, [branch, ready]);

  function handleLogin() {
    const b = BRANCHES.find((x) => x.id === pickBranch);
    if (!b) return;
    if (passInput.trim() === b.pass) {
      setBranch(b);
      setLoginErr("");
      setPassInput("");
    } else {
      setLoginErr("รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง");
    }
  }

  if (!branch) {
    return (
      <div className="wrap">
        <Style />
        <div className="login-card">
          <div className="brand">
            <span className="brand-mark">◆</span>
            <div>
              <h1>ระบบประเมินพนักงานใหม่</h1>
              <p className="sub">ฝ่ายขาย Digital Marketing · ประเมินรายสัปดาห์</p>
            </div>
          </div>

          <label className="fld">
            <span>เลือกสาขาของคุณ</span>
            <select value={pickBranch} onChange={(e) => setPickBranch(e.target.value)}>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="fld">
            <span>รหัสผ่านผู้จัดการสาขา</span>
            <input
              type="password"
              value={passInput}
              placeholder="กรอกรหัสผ่าน"
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </label>

          {loginErr && <div className="err">{loginErr}</div>}

          <button className="btn btn-primary full" onClick={handleLogin}>
            เข้าสู่ระบบ
          </button>
          <p className="tiny">
            เข้าได้เฉพาะพนักงานของสาขาตัวเอง · ผู้จัดการประเมินได้ทุกสัปดาห์
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Style />
      <header className="topbar">
        <div>
          <span className="brand-mark sm">◆</span>
          <strong>{branch.name}</strong>
        </div>
        <div className="topbar-right">
          <span className="week-pill">สัปดาห์นี้ · {getISOWeek()}</span>
          <button className="btn btn-ghost" onClick={() => setBranch(null)}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="main">
        {view === "list" && (
          <EmployeeList
            employees={employees}
            evals={evals}
            onAdd={() => setView("add")}
            onEvaluate={(emp) => {
              setActiveEmp(emp);
              setView("evaluate");
            }}
          />
        )}
        {view === "add" && (
          <AddEmployee
            branch={branch}
            onDone={() => setView("list")}
            onCancel={() => setView("list")}
          />
        )}
        {view === "evaluate" && activeEmp && (
          <EvaluateForm
            branch={branch}
            employee={activeEmp}
            evals={evals.filter((e) => e.employeeId === activeEmp.id)}
            onDone={() => setView("list")}
            onCancel={() => setView("list")}
          />
        )}
      </main>
    </div>
  );
}

function EmployeeList({ employees, evals, onAdd, onEvaluate }) {
  const thisWeek = getISOWeek();

  function latestEval(empId) {
    const list = evals
      .filter((e) => e.employeeId === empId)
      .sort((a, b) => (b.week || "").localeCompare(a.week || ""));
    return list[0] || null;
  }
  function evaluatedThisWeek(empId) {
    return evals.some((e) => e.employeeId === empId && e.week === thisWeek);
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>พนักงานใหม่ในสาขา</h2>
          <p className="sub">{employees.length} คน · แตะเพื่อประเมินสัปดาห์นี้</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          + เพิ่มพนักงาน
        </button>
      </div>

      {employees.length === 0 && (
        <div className="empty">
          <p>ยังไม่มีพนักงานใหม่ในสาขานี้</p>
          <button className="btn btn-primary" onClick={onAdd}>
            เพิ่มพนักงานคนแรก
          </button>
        </div>
      )}

      <div className="grid">
        {employees.map((emp) => {
          const st = STATUS[emp.status] || STATUS.probation;
          const last = latestEval(emp.id);
          const doneWeek = evaluatedThisWeek(emp.id);
          const locked = emp.status === "terminated";
          return (
            <div key={emp.id} className={`emp-card ${locked ? "locked" : ""}`}>
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
                    <span>
                      ล่าสุด {last.week} · เฉลี่ย{" "}
                      <b>{Number(last.avg).toFixed(2)}</b>
                    </span>
                    <span className={last.result === "pass" ? "ok" : "no"}>
                      {last.result === "pass" ? "ผ่าน" : "ไม่ผ่าน"}
                    </span>
                  </>
                ) : (
                  <span className="tiny">ยังไม่เคยประเมิน</span>
                )}
              </div>

              {locked ? (
                <div className="locked-note">ยุติการทำงานแล้ว</div>
              ) : (
                <button
                  className={`btn full ${doneWeek ? "btn-ghost" : "btn-primary"}`}
                  onClick={() => onEvaluate(emp)}
                >
                  {doneWeek ? "ประเมินซ้ำสัปดาห์นี้" : "ประเมินสัปดาห์นี้"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AddEmployee({ branch, onDone, onCancel }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "employees"), {
        name: name.trim(),
        branchId: branch.id,
        branchName: branch.name,
        startDate,
        status: "probation",
        createdAt: serverTimestamp(),
      });
      onDone();
    } catch (e) {
      alert("บันทึกไม่สำเร็จ: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-panel">
      <button className="back" onClick={onCancel}>
        ← กลับ
      </button>
      <h2>เพิ่มพนักงานใหม่</h2>
      <label className="fld">
        <span>ชื่อ–นามสกุล</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมชาย ใจดี" />
      </label>
      <label className="fld">
        <span>วันเริ่มงาน</span>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <div className="row-btns">
        <button className="btn btn-ghost" onClick={onCancel}>
          ยกเลิก
        </button>
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </section>
  );
}

function EvaluateForm({ branch, employee, evals, onDone, onCancel }) {
  const [scores, setScores] = useState(
    CRITERIA.reduce((a, c) => ({ ...a, [c.key]: 3 }), {})
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const week = getISOWeek();

  const avg = useMemo(() => {
    const vals = CRITERIA.map((c) => Number(scores[c.key]));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  const result = avg >= PASS_THRESHOLD ? "pass" : "fail";

  const history = [...evals].sort((a, b) =>
    (b.week || "").localeCompare(a.week || "")
  );

  async function submit() {
    setSaving(true);
    try {
      await addDoc(collection(db, "evaluations"), {
        employeeId: employee.id,
        employeeName: employee.name,
        branchId: branch.id,
        week,
        scores,
        avg,
        result,
        note: note.trim(),
        evaluatedAt: serverTimestamp(),
      });

      const newStatus = result === "pass" ? "passed" : "terminated";
      await updateDoc(doc(db, "employees", employee.id), {
        status: newStatus,
        lastEvalWeek: week,
        lastEvalResult: result,
      });

      onDone();
    } catch (e) {
      alert("บันทึกไม่สำเร็จ: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-panel">
      <button className="back" onClick={onCancel}>
        ← กลับ
      </button>
      <div className="eval-head">
        <div>
          <h2>ประเมิน · {employee.name}</h2>
          <p className="sub">สัปดาห์ {week} · เริ่มงาน {employee.startDate}</p>
        </div>
      </div>

      {CRITERIA.map((c) => (
        <div key={c.key} className="crit">
          <div className="crit-label">
            <span>{c.label}</span>
            <b className="crit-val">{scores[c.key]}</b>
          </div>
          <p className="tiny">{c.hint}</p>
          <div className="dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`dot ${scores[c.key] >= n ? "on" : ""}`}
                onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <label className="fld">
        <span>หมายเหตุ / เหตุผล (ไม่บังคับ)</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ข้อสังเกต จุดเด่น จุดที่ต้องพัฒนา..."
        />
      </label>

      <div className={`verdict ${result}`}>
        <div>
          <span className="tiny">คะแนนเฉลี่ย</span>
          <div className="verdict-avg">{avg.toFixed(2)} / 5</div>
        </div>
        <div className={`verdict-tag ${result}`}>
          {result === "pass" ? "ผ่านงาน" : "ไม่ผ่าน → ยุติการทำงาน"}
        </div>
      </div>

      {result === "fail" && (
        <div className="warn">
          ⚠ ผลไม่ผ่านจะเปลี่ยนสถานะพนักงานเป็น "ยุติการทำงาน" ทันทีเมื่อบันทึก
        </div>
      )}

      <div className="row-btns">
        <button className="btn btn-ghost" onClick={onCancel}>
          ยกเลิก
        </button>
        <button
          className={`btn ${result === "pass" ? "btn-primary" : "btn-danger"}`}
          disabled={saving}
          onClick={submit}
        >
          {saving ? "กำลังบันทึก..." : "ยืนยันผลประเมิน"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h3>ประวัติการประเมิน</h3>
          {history.map((h) => (
            <div key={h.id} className="hist-row">
              <span>{h.week}</span>
              <span>เฉลี่ย {Number(h.avg).toFixed(2)}</span>
              <span className={h.result === "pass" ? "ok" : "no"}>
                {h.result === "pass" ? "ผ่าน" : "ไม่ผ่าน"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      :root{
        --ink:#12161f; --paper:#f5f3ee; --card:#ffffff;
        --line:#e2ddd2; --muted:#7c8494;
        --accent:#2f6f5e; --accent-d:#245445;
        --danger:#b23a3a; --warn:#8a6d1f;
        --pass:#2f6f5e; --term:#b23a3a; --prob:#8a6d1f;
      }
      .wrap{min-height:100vh;background:var(--paper);color:var(--ink);
        font-family:'IBM Plex Sans Thai',system-ui,sans-serif}
      h1,h2,h3{font-family:'Space Grotesk','IBM Plex Sans Thai',sans-serif;letter-spacing:-.01em}
      .sub{color:var(--muted);font-size:14px}
      .tiny{color:var(--muted);font-size:12px}

      .login-card{max-width:440px;margin:8vh auto;padding:36px 32px;background:var(--card);
        border:1px solid var(--line);border-radius:16px;box-shadow:0 20px 50px -30px rgba(0,0,0,.3)}
      .brand{display:flex;gap:14px;align-items:center;margin-bottom:28px}
      .brand-mark{font-size:26px;color:var(--accent)}
      .brand-mark.sm{font-size:18px;margin-right:8px}
      .login-card h1{font-size:21px}

      .fld{display:block;margin:16px 0}
      .fld>span{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
      .fld input,.fld select,.fld textarea{width:100%;padding:12px 14px;border:1px solid var(--line);
        border-radius:10px;font-size:15px;font-family:inherit;background:#fff}
      .fld input:focus,.fld select:focus,.fld textarea:focus{outline:2px solid var(--accent);border-color:transparent}
      .err{color:var(--danger);font-size:13px;margin:8px 0}

      .btn{padding:12px 18px;border:none;border-radius:10px;font-size:15px;font-weight:600;
        cursor:pointer;font-family:inherit;transition:.15s}
      .btn:disabled{opacity:.6;cursor:default}
      .btn-primary{background:var(--accent);color:#fff}
      .btn-primary:hover:not(:disabled){background:var(--accent-d)}
      .btn-danger{background:var(--danger);color:#fff}
      .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
      .btn-ghost:hover{background:#0000000a}
      .full{width:100%}

      .topbar{display:flex;justify-content:space-between;align-items:center;
        padding:16px 24px;background:var(--card);border-bottom:1px solid var(--line)}
      .topbar-right{display:flex;gap:12px;align-items:center}
      .week-pill{font-size:12px;background:#2f6f5e14;color:var(--accent-d);
        padding:6px 12px;border-radius:20px;font-weight:600}

      .main{max-width:960px;margin:0 auto;padding:28px 20px}
      .section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px;gap:12px;flex-wrap:wrap}
      .section-head h2{font-size:22px}

      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
      .emp-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px}
      .emp-card.locked{opacity:.6}
      .emp-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
      .emp-top h3{font-size:17px}
      .emp-meta{display:flex;justify-content:space-between;font-size:13px;color:#444;border-top:1px dashed var(--line);padding-top:10px}
      .ok{color:var(--pass);font-weight:700}
      .no{color:var(--term);font-weight:700}
      .locked-note{text-align:center;color:var(--term);font-weight:600;font-size:14px;padding:8px}

      .badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap}
      .badge-probation{background:#8a6d1f1a;color:var(--prob)}
      .badge-passed{background:#2f6f5e1a;color:var(--pass)}
      .badge-terminated{background:#b23a3a1a;color:var(--term)}

      .empty{text-align:center;padding:48px;background:var(--card);border:1px dashed var(--line);border-radius:14px;display:flex;flex-direction:column;gap:16px;align-items:center}

      .form-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;max-width:640px;margin:0 auto}
      .back{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;margin-bottom:14px;font-family:inherit}
      .eval-head{margin-bottom:8px}
      .row-btns{display:flex;justify-content:flex-end;gap:12px;margin-top:20px}

      .crit{padding:16px 0;border-bottom:1px solid var(--line)}
      .crit-label{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px}
      .crit-val{font-family:'Space Grotesk';color:var(--accent);font-size:18px}
      .dots{display:flex;gap:8px;margin-top:10px}
      .dot{flex:1;padding:10px 0;border:1px solid var(--line);background:#fff;border-radius:8px;
        font-weight:700;cursor:pointer;color:var(--muted);font-family:'Space Grotesk';transition:.12s}
      .dot.on{background:var(--accent);color:#fff;border-color:var(--accent)}

      .verdict{display:flex;justify-content:space-between;align-items:center;
        margin-top:20px;padding:18px;border-radius:12px;border:1px solid var(--line)}
      .verdict.pass{background:#2f6f5e0d;border-color:#2f6f5e40}
      .verdict.fail{background:#b23a3a0d;border-color:#b23a3a40}
      .verdict-avg{font-family:'Space Grotesk';font-size:28px;font-weight:700}
      .verdict-tag{font-weight:700;padding:8px 16px;border-radius:20px}
      .verdict-tag.pass{background:var(--pass);color:#fff}
      .verdict-tag.fail{background:var(--danger);color:#fff}
      .warn{margin-top:12px;background:#8a6d1f14;color:var(--warn);padding:12px;border-radius:10px;font-size:13px}

      .history{margin-top:28px;border-top:1px solid var(--line);padding-top:16px}
      .history h3{font-size:15px;margin-bottom:10px}
      .hist-row{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;padding:8px 0;font-size:14px;border-bottom:1px dashed var(--line)}

      @media(max-width:520px){
        .main{padding:18px 12px}
        .verdict{flex-direction:column;gap:12px;text-align:center}
      }
    `}</style>
  );
}
