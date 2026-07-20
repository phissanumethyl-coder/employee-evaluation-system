import React from "react";

export function Style() {
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

      .login-card{max-width:440px;margin:7vh auto;padding:36px 32px;background:var(--card);
        border:1px solid var(--line);border-radius:16px;box-shadow:0 20px 50px -30px rgba(0,0,0,.3)}
      .brand{display:flex;gap:14px;align-items:center;margin-bottom:22px}
      .brand-mark{font-size:26px;color:var(--accent)}
      .brand-mark.sm{font-size:18px;margin-right:8px}
      .login-card h1{font-size:21px}

      .tabs{display:flex;gap:8px;margin:8px 0 4px;background:#0000000a;padding:4px;border-radius:10px}
      .tab{flex:1;padding:10px;border:none;background:transparent;border-radius:8px;cursor:pointer;
        font-family:inherit;font-weight:600;font-size:14px;color:var(--muted)}
      .tab.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.1)}

      .fld{display:block;margin:16px 0}
      .fld>span{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
      .fld input,.fld select,.fld textarea{width:100%;padding:12px 14px;border:1px solid var(--line);
        border-radius:10px;font-size:15px;font-family:inherit;background:#fff}
      .fld textarea{resize:vertical}
      .fld input:focus,.fld select:focus,.fld textarea:focus{outline:2px solid var(--accent);border-color:transparent}
      .err{color:var(--danger);font-size:13px;margin:8px 0}

      .btn{padding:12px 18px;border:none;border-radius:10px;font-size:15px;font-weight:600;
        cursor:pointer;font-family:inherit;transition:.15s}
      .btn:disabled{opacity:.6;cursor:default}
      .btn.sm{padding:7px 12px;font-size:13px}
      .btn-primary{background:var(--accent);color:#fff}
      .btn-primary:hover:not(:disabled){background:var(--accent-d)}
      .btn-danger{background:var(--danger);color:#fff}
      .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
      .btn-ghost:hover{background:#0000000a}
      .full{width:100%}
      .link-btn{background:none;border:none;color:var(--accent);cursor:pointer;font-family:inherit;
        font-size:13px;font-weight:600;text-decoration:underline;padding:0}

      .topbar{display:flex;justify-content:space-between;align-items:center;
        padding:16px 24px;background:var(--card);border-bottom:1px solid var(--line);flex-wrap:wrap;gap:10px}
      .topbar-right{display:flex;gap:12px;align-items:center}
      .week-pill{font-size:12px;background:#2f6f5e14;color:var(--accent-d);
        padding:6px 12px;border-radius:20px;font-weight:600}

      .main{max-width:960px;margin:0 auto;padding:28px 20px}
      .main.wide{max-width:1100px}
      .section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px;gap:12px;flex-wrap:wrap}
      .section-head h2{font-size:22px}
      .sec-title{font-size:19px;margin:28px 0 14px}

      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
      .emp-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px}
      .emp-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
      .emp-top h3{font-size:17px}
      .emp-meta{display:flex;justify-content:space-between;font-size:13px;color:#444;border-top:1px dashed var(--line);padding-top:10px}
      .ok{color:var(--pass);font-weight:700}
      .no{color:var(--term);font-weight:700}

      .badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap}
      .badge-probation{background:#8a6d1f1a;color:var(--prob)}
      .badge-passed{background:#2f6f5e1a;color:var(--pass)}
      .badge-terminated{background:#b23a3a1a;color:var(--term)}

      .empty{text-align:center;padding:48px;background:var(--card);border:1px dashed var(--line);border-radius:14px;display:flex;flex-direction:column;gap:16px;align-items:center}
      .empty.sm{padding:20px}

      .form-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;max-width:660px;margin:0 auto}
      .back{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;margin-bottom:14px;font-family:inherit}
      .eval-head{margin-bottom:8px}
      .row-btns{display:flex;justify-content:flex-end;gap:12px;margin-top:20px}

      .crit{padding:16px 0;border-bottom:1px solid var(--line)}
      .crit-label{display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px}
      .rating-row{display:flex;gap:8px;margin:10px 0}
      .rate{flex:1;padding:10px 8px;border:1px solid var(--line);background:#fff;border-radius:8px;
        font-weight:600;cursor:pointer;color:var(--muted);font-family:inherit;font-size:14px;transition:.12s}
      .rate.big{padding:14px}
      .comment{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;
        font-family:inherit;font-size:14px;resize:vertical;margin-top:4px}

      .verdict-pick{margin-top:20px;padding:16px;background:#0000000a;border-radius:12px}
      .vp-label{font-weight:700;font-size:14px}
      .warn{margin-top:12px;background:#8a6d1f14;color:var(--warn);padding:12px;border-radius:10px;font-size:13px}

      .history{margin-top:28px;border-top:1px solid var(--line);padding-top:16px}
      .history h3{font-size:15px;margin-bottom:10px}
      .hist-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;font-size:14px;border-bottom:1px dashed var(--line)}

      /* ===== HR Dashboard ===== */
      .period-bar{display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
      .seg{display:flex;background:#0000000a;border-radius:10px;padding:4px}
      .seg button{border:none;background:transparent;padding:8px 18px;border-radius:8px;cursor:pointer;
        font-family:inherit;font-weight:600;color:var(--muted);font-size:14px}
      .seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.1)}
      .period-bar select{padding:9px 14px;border:1px solid var(--line);border-radius:8px;font-family:inherit;background:#fff}

      .stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px}
      .stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;text-align:center}
      .stat-n{display:block;font-family:'Space Grotesk';font-size:34px;font-weight:700}
      .stat-l{font-size:13px;color:var(--muted)}
      .stat.pass .stat-n{color:var(--pass)} .stat.fail .stat-n{color:var(--term)}

      .flag-panel{background:#b23a3a08;border:1px solid #b23a3a30;border-radius:14px;padding:20px;margin-bottom:8px}
      .flag-panel h2{font-size:18px;color:var(--term)}
      .flag-row{display:flex;justify-content:space-between;align-items:center;gap:12px;
        padding:12px;background:#fff;border:1px solid var(--line);border-radius:10px;margin-top:10px;flex-wrap:wrap}
      .flag-row.handled{opacity:.55}
      .flag-actions{display:flex;gap:12px;align-items:center}

      .branch-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
      .branch-card h3{font-size:16px;margin-bottom:12px}
      .bc-stats{display:flex;justify-content:space-between;text-align:center}
      .bc-stats .n{display:block;font-family:'Space Grotesk';font-size:22px;font-weight:700}
      .bc-stats .l{font-size:11px;color:var(--muted)}
      .bc-stats .pass .n{color:var(--pass)} .bc-stats .fail .n{color:var(--term)}
      .bc-alert{margin-top:12px;background:#b23a3a14;color:var(--term);padding:6px 10px;border-radius:8px;font-size:12px;text-align:center;font-weight:600}

      .table-wrap{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:auto}
      table{width:100%;border-collapse:collapse;font-size:14px}
      th,td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--line)}
      th{background:#0000000a;font-weight:600;font-size:13px;white-space:nowrap}
      tr:last-child td{border-bottom:none}

      .flag-row.pass-row{border-left:3px solid var(--accent)}
      .filters{display:flex;gap:10px}
      .filters select{padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-family:inherit;background:#fff;font-size:13px}
      .eval-time{margin-top:-4px}
      .hist-main{display:flex;flex-direction:column;gap:2px}
      .nowrap{white-space:nowrap}
      .locked-note{text-align:center;color:var(--term);font-weight:600;font-size:13px;padding:8px;background:#b23a3a0d;border-radius:8px}
      .emp-card.locked{opacity:.7}

      @media(max-width:640px){
        .main{padding:18px 12px}
        .stat-row{grid-template-columns:1fr 1fr 1fr}
        .rating-row{flex-direction:column}
      }
    `}</style>
  );
}
