import React from "react";
import { CRITERIA, RATINGS, STATUS, fmtDateTime, tsToMillis, weekLabel } from "./config";
import { generateEvaluationPDF } from "./pdfReport";

const ratingInfo = (k) => RATINGS.find((r) => r.key === k) || { label: "-", color: "#999" };

// การ์ดประวัติการประเมิน 1 ใบ
function EvalCard({ emp, ev }) {
  return (
    <div className="eval-detail">
      <div className="ed-head">
        <div>
          <strong className={ev.verdict === "pass" ? "review" : "no"}>
            {ev.verdict === "pass" ? "อยู่ระหว่างพิจารณา" : "ไม่ผ่านการประเมิน"}
          </strong>
          <span className="tiny"> · สัปดาห์ {weekLabel(ev.week)}</span>
        </div>
        <button className="link-btn" onClick={() => generateEvaluationPDF(emp, ev)}>ดาวน์โหลด PDF</button>
      </div>
      <p className="tiny">ประเมินเมื่อ {fmtDateTime(ev.evaluatedAt)}</p>

      <div className="ed-criteria">
        {CRITERIA.map((c) => (
          <div key={c.key} className="ed-group">
            <div className="ed-group-label">{c.label}</div>
            {c.items.map((it) => {
              const r = ratingInfo(ev.ratings?.[it.key]);
              return (
                <div key={it.key} className="ed-crit">
                  <div className="ed-crit-top">
                    <span>{it.title}</span>
                    <span className="ed-rate" style={{ color: r.color }}>{r.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {ev.overallNote && (
        <div className="ed-note"><strong>ความเห็นรวม:</strong> {ev.overallNote}</div>
      )}
    </div>
  );
}

export default function EmployeeHistory({ employee, evals, onBack }) {
  const history = [...evals].sort((a, b) => tsToMillis(b.evaluatedAt) - tsToMillis(a.evaluatedAt));
  const st = STATUS[employee.status] || STATUS.evaluating;

  return (
    <section className="form-panel wide-panel">
      <button className="back" onClick={onBack}>กลับ</button>
      <div className="eval-head">
        <div className="hist-title-row">
          <h2>{employee.name}{employee.nickname ? ` (${employee.nickname})` : ""}</h2>
          <span className={`badge ${st.cls}`}>{st.label}</span>
        </div>
        <p className="sub">เริ่มงาน {employee.startDate || "-"} · ประเมินทั้งหมด {history.length} ครั้ง</p>
      </div>

      {history.length === 0 && <div className="empty sm">ยังไม่มีประวัติการประเมิน</div>}
      {history.map((ev) => <EvalCard key={ev.id} emp={employee} ev={ev} />)}
    </section>
  );
}
