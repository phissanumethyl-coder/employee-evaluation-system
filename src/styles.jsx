import React from "react";

export function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      :root{
        --ink:#0f172a; --paper:#f0f4f9; --card:#ffffff;
        --line:#e2e8f0; --muted:#64748b;
        --accent:#2563eb; --accent-d:#1d4ed8; --accent-light:#eff6ff;
        --danger:#dc2626; --warn:#d97706;
        --pass:#2563eb; --term:#dc2626; --prob:#d97706;
      }
      .wrap{min-height:100vh;background:linear-gradient(180deg,#f0f4f9 0%,#e8eef6 100%);color:var(--ink);
        font-family:'Noto Sans Thai',system-ui,sans-serif}
      h1,h2,h3{font-family:'Noto Sans Thai',sans-serif;letter-spacing:-.01em;font-weight:700}
      .sub{color:var(--muted);font-size:14px}
      .tiny{color:var(--muted);font-size:12px}

      /* animations */
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
      @keyframes overlayIn{from{opacity:0}to{opacity:1}}
      .fade-in{animation:fadeIn .35s ease both}

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
        cursor:pointer;font-family:inherit;transition:.18s;position:relative}
      .btn:disabled{opacity:.6;cursor:default}
      .btn.sm{padding:7px 12px;font-size:13px}
      .btn-primary{background:var(--accent);color:#fff;box-shadow:0 2px 8px -2px rgba(37,99,235,.5)}
      .btn-primary:hover:not(:disabled){background:var(--accent-d);transform:translateY(-1px);box-shadow:0 4px 14px -2px rgba(37,99,235,.55)}
      .btn-primary:active:not(:disabled){transform:translateY(0)}
      .btn-danger{background:var(--danger);color:#fff;box-shadow:0 2px 8px -2px rgba(220,38,38,.5)}
      .btn-danger:hover:not(:disabled){background:#b91c1c;transform:translateY(-1px)}
      .btn-ghost{background:#fff;border:1px solid var(--line);color:var(--ink)}
      .btn-ghost:hover{background:var(--accent-light);border-color:#c7d7f5}
      .full{width:100%}
      .link-btn{background:none;border:none;color:var(--accent);cursor:pointer;font-family:inherit;
        font-size:13px;font-weight:600;text-decoration:underline;padding:0;transition:.12s}
      .link-btn:hover{color:var(--accent-d)}

      .topbar{display:flex;justify-content:space-between;align-items:center;
        padding:16px 24px;background:var(--card);border-bottom:1px solid var(--line);flex-wrap:wrap;gap:10px}
      .topbar-right{display:flex;gap:12px;align-items:center}
      .week-pill{font-size:12px;background:#2563eb14;color:var(--accent-d);
        padding:6px 12px;border-radius:20px;font-weight:600}

      .main{max-width:960px;margin:0 auto;padding:28px 20px}
      .main.wide{max-width:1100px}
      .section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px;gap:12px;flex-wrap:wrap}
      .section-head h2{font-size:22px}
      .sec-title{font-size:19px;margin:28px 0 14px}

      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
      .emp-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px;transition:.2s;box-shadow:0 1px 3px rgba(15,23,42,.04)}
      .emp-card:hover{box-shadow:0 10px 30px -14px rgba(37,99,235,.25);transform:translateY(-3px);border-color:#c7d7f5}
      .emp-top{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
      .emp-top h3{font-size:17px;line-height:1.35}
      .emp-top .badge{align-self:flex-start}
      .emp-meta{display:flex;justify-content:space-between;font-size:13px;color:#444;border-top:1px dashed var(--line);padding-top:10px}
      .ok{color:var(--pass);font-weight:700}
      .review{color:#ca8a04;font-weight:700}
      .stat.review .stat-n{color:#ca8a04}
      .no{color:var(--term);font-weight:700}

      .badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap}
      .badge-probation{background:#d977061a;color:var(--prob)}
      .badge-passed{background:#2563eb1a;color:var(--pass)}
      .badge-terminated{background:#dc26261a;color:var(--term)}

      .empty{text-align:center;padding:48px;background:var(--card);border:1px dashed var(--line);border-radius:14px;display:flex;flex-direction:column;gap:16px;align-items:center}
      .empty.sm{padding:20px}

      .form-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px;max-width:660px;margin:0 auto}
      .back{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #dbe4f0;
        color:var(--accent);cursor:pointer;font-size:14.5px;font-weight:700;margin-bottom:18px;font-family:inherit;
        padding:10px 20px 10px 16px;border-radius:999px;transition:.2s;box-shadow:0 2px 8px -3px rgba(37,99,235,.3)}
      .back::before{content:"←";font-size:17px;transition:.2s;display:inline-block}
      .back:hover{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 6px 16px -4px rgba(37,99,235,.5);transform:translateY(-1px)}
      .back:hover::before{transform:translateX(-3px)}
      .back:active{transform:translateY(0)}
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
      .warn{margin-top:12px;background:#d9770614;color:var(--warn);padding:12px;border-radius:10px;font-size:13px}

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
      .stat-n{display:block;font-size:34px;font-weight:700}
      .stat-l{font-size:13px;color:var(--muted)}
      .stat.pass .stat-n{color:var(--pass)} .stat.fail .stat-n{color:var(--term)}

      .flag-panel{background:#dc262608;border:1px solid #dc262630;border-radius:14px;padding:20px;margin-bottom:8px}
      .flag-panel h2{font-size:18px;color:var(--term)}
      .flag-row{display:flex;justify-content:space-between;align-items:center;gap:12px;
        padding:12px;background:#fff;border:1px solid var(--line);border-radius:10px;margin-top:10px;flex-wrap:wrap}
      .flag-row.handled{opacity:.55}
      .flag-actions{display:flex;gap:12px;align-items:center}

      .branch-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
      .branch-card h3{font-size:16px;margin-bottom:12px}
      .bc-stats{display:flex;justify-content:space-between;text-align:center}
      .bc-stats .n{display:block;font-size:22px;font-weight:700}
      .bc-stats .l{font-size:11px;color:var(--muted)}
      .bc-stats .pass .n{color:var(--pass)} .bc-stats .fail .n{color:var(--term)} .bc-stats .review .n{color:#ca8a04}
      .bc-alert{margin-top:12px;background:#dc262614;color:var(--term);padding:6px 10px;border-radius:8px;font-size:12px;text-align:center;font-weight:600}

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
      .locked-note{text-align:center;color:var(--term);font-weight:600;font-size:13px;padding:8px;background:#dc26260d;border-radius:8px}
      .emp-card.locked{opacity:.8}
      .info-note{margin-top:12px;background:#2563eb12;color:var(--accent-d);padding:12px;border-radius:10px;font-size:13px}

      /* โซนแยกสี กันกดพลาด */
      .danger-zone{background:#dc262608;border:1px solid #dc262630}
      .danger-zone h2{color:var(--term)}
      .success-zone{background:#2563eb08;border:1px solid #2563eb30;margin-top:16px}
      .success-zone h2{color:var(--accent-d)}

      /* card สาขาคลิกได้ */
      .branch-card.clickable{cursor:pointer;text-align:left;width:100%;font-family:inherit;
        border:1px solid var(--line);background:var(--card);transition:.15s;position:relative}
      .branch-card.clickable:hover{border-color:var(--accent);box-shadow:0 6px 20px -12px rgba(0,0,0,.3);transform:translateY(-2px)}
      .bc-head{margin-bottom:10px}
      .bc-link{display:block;margin-top:12px;color:var(--accent);font-size:13px;font-weight:600}

      /* หัวข้อกลุ่มใน drill-down */
      .grp-title{font-size:15px;margin:24px 0 12px;padding-left:10px;border-left:4px solid var(--line)}
      .grp-title.c-eval{border-color:var(--prob)}
      .grp-title.c-contact{border-color:var(--term)}
      .grp-title.c-hired{border-color:var(--pass)}
      .grp-title.c-term{border-color:#999}

      /* หน้าประวัติพนักงาน */
      .wide-panel{max-width:720px}
      .hist-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
      .eval-detail{border:1px solid var(--line);border-radius:12px;padding:18px;margin-top:16px;background:#fff}
      .ed-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
      .ed-criteria{margin-top:12px;display:flex;flex-direction:column;gap:10px}
      .ed-crit{border-top:1px dashed var(--line);padding-top:10px}
      .ed-crit-top{display:flex;justify-content:space-between;font-weight:600;font-size:14px}
      .ed-rate{font-weight:700;font-size:13px}
      .ed-comment{font-size:13px;color:#444;margin-top:4px;background:#0000000a;padding:8px 10px;border-radius:6px}
      .ed-note{margin-top:12px;font-size:13px;background:#2563eb0d;padding:10px 12px;border-radius:8px}

      /* modal ยืนยัน */
      .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(3px);
        display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;animation:overlayIn .2s ease both}
      .modal-box{background:#fff;border-radius:18px;padding:28px;max-width:420px;width:100%;
        box-shadow:0 30px 70px -20px rgba(0,0,0,.4);animation:popIn .25s cubic-bezier(.16,1,.3,1) both}
      .modal-title{font-size:19px;margin-bottom:10px}
      .modal-msg{color:#475569;font-size:15px;line-height:1.6;margin-bottom:22px}
      .modal-actions{display:flex;justify-content:flex-end;gap:10px}

      /* แท็บในหน้ารายชื่อ */
      .list-tabs{max-width:360px;margin-bottom:20px}

      /* login card ทันสมัย */
      .login-card{animation:popIn .35s cubic-bezier(.16,1,.3,1) both}
      .login-brand{flex-direction:column;text-align:center;gap:10px}
      .login-logo{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(37,99,235,.25))}

      /* จัดการสาขา */
      .add-branch{background:#f8fafc;border:1px solid var(--line);border-radius:14px;padding:18px;margin:16px 0 8px}
      .add-branch h3{font-size:15px;margin-bottom:12px}
      .add-branch-row{display:flex;gap:10px;flex-wrap:wrap}
      .add-branch-row input{flex:1;min-width:160px;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font-family:inherit;font-size:14px}
      .branch-list{display:flex;flex-direction:column;gap:10px;margin-top:12px}
      .branch-row{display:flex;justify-content:space-between;align-items:center;gap:12px;
        padding:14px 16px;background:#fff;border:1px solid var(--line);border-radius:12px;flex-wrap:wrap}
      .branch-info strong{font-size:15px}
      .branch-actions{display:flex;gap:8px}
      .branch-edit{display:flex;gap:8px;width:100%;flex-wrap:wrap;align-items:center}
      .branch-edit input{flex:1;min-width:140px;padding:9px 12px;border:1px solid var(--line);border-radius:8px;font-family:inherit;font-size:14px}
      .branch-edit-btns{display:flex;gap:8px}

      /* หัวข้อย่อยในฟอร์มประเมิน */
      .crit-items{margin:8px 0 0 18px;padding:0;font-size:13px;color:#334155;line-height:1.55}
      .crit-items li{margin-bottom:3px}
      .crit-items b{color:#0f172a}

      /* กลุ่มด้านใหญ่ + หัวข้อย่อยประเมินแยก */
      .crit-group{margin-bottom:22px;padding:16px;background:#f8fafc;border:1px solid var(--line);border-radius:14px}
      .crit-group-label{font-weight:700;font-size:15.5px;color:var(--accent-d);margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #dbe4f0}
      .sub-crit{padding:12px 0;border-bottom:1px dashed var(--line)}
      .sub-crit:last-child{border-bottom:none;padding-bottom:0}
      .sub-crit-head{margin-bottom:8px}
      .sub-crit-head b{display:block;font-size:14.5px;color:#0f172a}
      .sub-crit-head .tiny{display:block;margin-top:2px}

      /* ประวัติ: กลุ่ม + หัวข้อย่อย */
      .ed-group{margin-top:12px}
      .ed-group-label{font-weight:700;font-size:13.5px;color:var(--accent-d);margin-bottom:4px}
      .ed-group .ed-crit{padding-left:12px}

      /* ช่องความเห็นจำเป็น */
      .field-required{border-color:#fca5a5 !important;background:#fef2f2 !important}
      .err-shake{animation:shake .4s ease}
      @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}

      /* toast แจ้งเตือน */
      .toast-wrap{position:fixed;top:24px;left:0;right:0;display:flex;justify-content:center;z-index:2000;pointer-events:none}
      .toast{display:flex;align-items:center;gap:10px;background:#fff;color:#0f172a;
        padding:14px 24px;border-radius:999px;box-shadow:0 12px 40px -8px rgba(0,0,0,.3);
        font-weight:600;font-size:15px;border:1.5px solid #d1fae5;
        animation:toastIn .35s cubic-bezier(.16,1,.3,1) both, toastOut .4s ease 2.2s forwards}
      .toast-check{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
        background:#22c55e;color:#fff;border-radius:50%;font-size:15px;font-weight:700}
      @keyframes toastIn{from{opacity:0;transform:translateY(-24px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes toastOut{to{opacity:0;transform:translateY(-24px) scale(.95)}}

      @media(max-width:640px){
        .main{padding:18px 12px}
        .stat-row{grid-template-columns:1fr 1fr 1fr}
        .rating-row{flex-direction:column}
      }
    `}</style>
  );
}
