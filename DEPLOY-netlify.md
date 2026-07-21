# วิธี deploy ขึ้น Netlify (ได้ URL สวยกว่า GitHub Pages)

## วิธีที่ 1 — เชื่อมกับ GitHub (แนะนำ: push แล้ว deploy อัตโนมัติ)

1. เข้า https://app.netlify.com → Sign up / Log in (ล็อกอินด้วย GitHub ได้เลย ง่ายสุด)
2. กด **Add new site** → **Import an existing project**
3. เลือก **Deploy with GitHub** → อนุญาตสิทธิ์ → เลือก repo `employee-evaluation-system`
4. Netlify จะอ่านค่าจากไฟล์ `netlify.toml` ให้อัตโนมัติ (build command + publish dir)
   - ถ้าถาม ให้ตั้ง: Build command = `npm run build`, Publish directory = `dist`
5. กด **Deploy site**

รอ build เสร็จ (~1-2 นาที) จะได้ URL เช่น `https://random-name-12345.netlify.app`

## เปลี่ยนชื่อ subdomain ให้สวย

1. ในหน้า site → **Site configuration** → **Change site name**
2. ตั้งชื่อใหม่ เช่น `meidea-hr` หรือ `meidea-eval`
3. URL จะกลายเป็น `https://meidea-hr.netlify.app`

## วิธีที่ 2 — ลากไฟล์ขึ้นตรงๆ (ไม่ต้องเชื่อม GitHub)

1. รันบนเครื่อง: `npm install` แล้ว `npm run build` → ได้โฟลเดอร์ `dist`
2. เข้า https://app.netlify.com → ลากโฟลเดอร์ `dist` ไปวางในหน้า **Sites**
3. ได้ URL ทันที (แต่ต้อง build + ลากใหม่ทุกครั้งที่แก้โค้ด — ไม่อัตโนมัติ)

> แนะนำวิธีที่ 1 เพราะแก้โค้ด push ขึ้น GitHub แล้ว Netlify build ให้เอง

## อย่าลืม! เพิ่มโดเมนใน Firebase
หลังได้ URL ใหม่ (เช่น `meidea-hr.netlify.app`):
- Firebase Console → Authentication → Settings → Authorized domains
- กด Add domain → ใส่ `meidea-hr.netlify.app`
- ไม่งั้นล็อกอินบนเว็บใหม่จะไม่ทำงาน
