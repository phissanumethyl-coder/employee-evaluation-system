# ระบบประเมินพนักงานใหม่ (รายสัปดาห์)

ระบบประเมินพนักงานใหม่ฝ่ายขาย Digital Marketing สำหรับผู้จัดการ 6 สาขา
เชื่อมกับ Firebase Firestore · ประเมินได้ทุกสัปดาห์ · ผ่าน/ไม่ผ่าน

---

## วิธี deploy ขึ้น GitHub Pages (ทำครั้งเดียว)

### 1. สร้าง repo บน GitHub
- สร้าง repository ใหม่ (เช่นชื่อ `employee-evaluation-system`)
- **สำคัญ:** ถ้าตั้งชื่อ repo อื่น ต้องแก้ `base` ใน `vite.config.js` ให้ตรงกัน
  เช่น repo ชื่อ `my-hr-app` → `base: "/my-hr-app/"`

### 2. อัปโค้ดขึ้น repo
```bash
cd eval-app
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<username>/employee-evaluation-system.git
git push -u origin main
```

### 3. เปิด GitHub Pages
ไปที่ repo บน GitHub → **Settings → Pages**
→ ที่ **Source** เลือก **GitHub Actions**

เท่านี้ทุกครั้งที่ push ขึ้น `main` ระบบจะ build และ deploy อัตโนมัติ
เว็บจะอยู่ที่: `https://<username>.github.io/employee-evaluation-system/`

---

## ตั้งค่า Firebase (ทำครั้งเดียว)

1. โปรเจกต์ Firebase: **collection-employees** (ใส่ config ไว้ให้แล้วใน `src/firebase.js`)
2. **Build → Firestore Database** → Create database → region `asia-southeast1`
3. **Build → Authentication → Sign-in method** → เปิด **Anonymous**
4. **Firestore → Rules** → วางเนื้อหาจากไฟล์ `firestore.rules` แล้วกด Publish
5. **เพิ่มโดเมนที่อนุญาต:** Authentication → Settings → Authorized domains
   → เพิ่ม `<username>.github.io` (ไม่งั้น login จะไม่ทำงานบนเว็บจริง)

---

## รันบนเครื่อง (ทดสอบก่อน deploy)
```bash
npm install
npm run dev
```

---

## รหัสผ่านแต่ละสาขา (แก้ในตัวแปร BRANCHES ใน src/App.jsx)
| สาขา | รหัสเริ่มต้น |
|---|---|
| สาขา 1 | manager01 |
| สาขา 2 | manager02 |
| สาขา 3 | manager03 |
| สาขา 4 | manager04 |
| สาขา 5 | manager05 |
| สาขา 6 | manager06 |

---

## หลักการทำงาน
- ผู้จัดการเลือกสาขา + ใส่รหัส → เห็นเฉพาะพนักงานสาขาตัวเอง
- เพิ่มพนักงานใหม่ (สถานะเริ่มต้น = ทดลองงาน)
- ประเมินได้ทุกสัปดาห์ (ระบบใช้ ISO week อัตโนมัติ)
- คะแนน 4 ด้าน ด้านละ 1–5 → เฉลี่ย **≥ 3.0 = ผ่าน**, ต่ำกว่า = ไม่ผ่าน
- **ผลไม่ผ่าน → สถานะเปลี่ยนเป็น "ยุติการทำงาน" ทันที** และล็อกไม่ให้ประเมินต่อ
- แก้เกณฑ์ผ่านได้ที่ตัวแปร `PASS_THRESHOLD` ใน `src/App.jsx`

---

## ข้อควรรู้ด้านความปลอดภัย
- Firebase apiKey ในเว็บ client ไม่ใช่ความลับ (เห็นได้จาก browser ทุกเว็บ) ความปลอดภัยจริงมาจาก Firestore Rules
- รหัสผ่านต่อสาขาในโค้ดเป็นการกันเบื้องต้นฝั่ง client เหมาะกับใช้ภายในทีม
  หากต้องการกันข้ามสาขาจริงจัง แนะนำเปลี่ยนไปใช้ Firebase Auth email/password + custom claims

## ข้อควรระวังด้านกฎหมายแรงงาน
การประเมินสัปดาห์เดียวแล้วยุติงานทันที อาจเกี่ยวข้องกับข้อกำหนดการบอกกล่าวล่วงหน้า
และค่าชดเชยช่วงทดลองงาน แนะนำตรวจสอบกับ HR หรือที่ปรึกษากฎหมายก่อนใช้จริง
