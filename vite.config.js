import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// สำคัญ: เปลี่ยน "employee-evaluation-system" ให้ตรงกับชื่อ repo ของคุณบน GitHub
// เช่น ถ้า repo ชื่อ my-hr-app ให้ตั้ง base: "/my-hr-app/"
export default defineConfig({
  plugins: [react()],
  base: "/employee-evaluation-system/",
});
