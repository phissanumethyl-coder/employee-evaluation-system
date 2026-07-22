import React, { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";
import { HR_PASS, DEFAULT_BRANCHES, setBranchRegistry } from "./config";
import { seedBranchesIfEmpty, subscribeBranches } from "./branchStore";
import { LOGO_DATA_URL } from "./logo";
import { Style } from "./styles";
import ManagerView from "./ManagerView";
import HRDashboard from "./HRDashboard";

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem("eval_session");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [mode, setMode] = useState("manager");
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [pickBranch, setPickBranch] = useState(DEFAULT_BRANCHES[0].id);
  const [passInput, setPassInput] = useState("");
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    signInAnonymously(auth)
      .then(async () => {
        try { await seedBranchesIfEmpty(); } catch (e) { console.error("seed", e); }
        // ฟังสาขาแบบ realtime
        unsub = subscribeBranches((rows) => {
          const list = rows.length ? rows : DEFAULT_BRANCHES;
          setBranches(list);
          setBranchRegistry(list); // อัปเดต registry ให้ branchName() ใช้
          setPickBranch((cur) => (list.find((b) => b.id === cur) ? cur : list[0]?.id));
        });
        setReady(true);
      })
      .catch((e) => { console.error(e); setReady(true); });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      if (session) sessionStorage.setItem("eval_session", JSON.stringify(session));
      else sessionStorage.removeItem("eval_session");
    } catch {}
  }, [session]);

  function logout() {
    setSession(null);
    try { sessionStorage.removeItem("eval_session"); } catch {}
  }

  function login() {
    setErr("");
    if (mode === "hr") {
      if (passInput.trim() === HR_PASS) {
        setSession({ role: "hr" });
        setPassInput("");
      } else setErr("รหัส HR ไม่ถูกต้อง");
      return;
    }
    const b = branches.find((x) => x.id === pickBranch);
    if (b && passInput.trim() === b.pass) {
      setSession({ role: "manager", branchId: b.id });
      setPassInput("");
    } else setErr("รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง");
  }

  if (!session) {
    return (
      <div className="wrap">
        <Style />
        <div className="login-card">
          <div className="brand login-brand">
            <img src={LOGO_DATA_URL} className="login-logo" alt="logo" />
            <div>
              <h1>ระบบประเมินพนักงานใหม่ IT</h1>
              <p className="sub">บริษัท มีไอเดีย เซ็นเตอร์ แอนด์ ซัพพลาย จำกัด</p>
            </div>
          </div>

          <div className="tabs">
            <button className={mode === "manager" ? "tab on" : "tab"}
              onClick={() => { setMode("manager"); setErr(""); }}>
              ผู้จัดการสาขา
            </button>
            <button className={mode === "hr" ? "tab on" : "tab"}
              onClick={() => { setMode("hr"); setErr(""); }}>
              ฝ่าย HR
            </button>
          </div>

          {mode === "manager" && (
            <label className="fld">
              <span>เลือกสาขาของคุณ</span>
              <select value={pickBranch} onChange={(e) => setPickBranch(e.target.value)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="fld">
            <span>{mode === "hr" ? "รหัสผ่าน HR" : "รหัสผ่านผู้จัดการสาขา"}</span>
            <input type="password" value={passInput} placeholder="กรอกรหัสผ่าน"
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()} />
          </label>

          {err && <div className="err">{err}</div>}

          <button className="btn btn-primary full" onClick={login}>เข้าสู่ระบบ</button>
        </div>
      </div>
    );
  }

  if (session.role === "hr") {
    return <HRDashboard ready={ready} branches={branches} onLogout={logout} />;
  }
  const activeBranch = branches.find((b) => b.id === session.branchId);
  if (!activeBranch) {
    // สาขาถูกลบ หรือยังโหลดไม่เสร็จ
    if (ready && branches.length) { logout(); return null; }
    return <div className="wrap"><Style /><div style={{padding:40,textAlign:"center"}}>กำลังโหลด...</div></div>;
  }
  return <ManagerView branch={activeBranch} ready={ready} onLogout={logout} />;
}
