import React, { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";
import { BRANCHES, HR_PASS } from "./config";
import { Style } from "./styles";
import ManagerView from "./ManagerView";
import HRDashboard from "./HRDashboard";

export default function App() {
  const [session, setSession] = useState(null); // {role:'manager', branch} | {role:'hr'}
  const [mode, setMode] = useState("manager"); // manager | hr (แท็บใน login)
  const [pickBranch, setPickBranch] = useState(BRANCHES[0].id);
  const [passInput, setPassInput] = useState("");
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => setReady(true))
      .catch((e) => {
        console.error(e);
        setReady(true);
      });
  }, []);

  function login() {
    setErr("");
    if (mode === "hr") {
      if (passInput.trim() === HR_PASS) {
        setSession({ role: "hr" });
        setPassInput("");
      } else setErr("รหัส HR ไม่ถูกต้อง");
      return;
    }
    const b = BRANCHES.find((x) => x.id === pickBranch);
    if (b && passInput.trim() === b.pass) {
      setSession({ role: "manager", branch: b });
      setPassInput("");
    } else setErr("รหัสผ่านไม่ถูกต้อง ลองอีกครั้ง");
  }

  if (!session) {
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

          <div className="tabs">
            <button
              className={mode === "manager" ? "tab on" : "tab"}
              onClick={() => { setMode("manager"); setErr(""); }}
            >
              ผู้จัดการสาขา
            </button>
            <button
              className={mode === "hr" ? "tab on" : "tab"}
              onClick={() => { setMode("hr"); setErr(""); }}
            >
              ฝ่าย HR ส่วนกลาง
            </button>
          </div>

          {mode === "manager" && (
            <label className="fld">
              <span>เลือกสาขาของคุณ</span>
              <select value={pickBranch} onChange={(e) => setPickBranch(e.target.value)}>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="fld">
            <span>{mode === "hr" ? "รหัสผ่าน HR" : "รหัสผ่านผู้จัดการสาขา"}</span>
            <input
              type="password"
              value={passInput}
              placeholder="กรอกรหัสผ่าน"
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </label>

          {err && <div className="err">{err}</div>}

          <button className="btn btn-primary full" onClick={login}>
            เข้าสู่ระบบ
          </button>
          <p className="tiny">
            {mode === "hr"
              ? "HR เห็นภาพรวมทุกสาขา · ดึงรายงาน PDF ได้"
              : "ผู้จัดการเห็นเฉพาะพนักงานสาขาตัวเอง"}
          </p>
        </div>
      </div>
    );
  }

  if (session.role === "hr") {
    return <HRDashboard ready={ready} onLogout={() => setSession(null)} />;
  }
  return (
    <ManagerView
      branch={session.branch}
      ready={ready}
      onLogout={() => setSession(null)}
    />
  );
}
