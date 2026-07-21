import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/" สำหรับ Vercel/Netlify (โดเมนของตัวเอง ไม่มี subfolder)
export default defineConfig({
  plugins: [react()],
  base: "/",
});
