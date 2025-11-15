import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // 🔥 Fix _redirects file inside dist/
    {
      name: "fix-redirects",
      closeBundle() {
        const redirectsPath = "dist/_redirects";

        if (fs.existsSync(redirectsPath)) {
          let txt = fs.readFileSync(redirectsPath, "utf8");

          // Remove BOM if present
          if (txt.charCodeAt(0) === 0xFEFF) {
            txt = txt.slice(1);
          }

          // Remove CRLF → convert to LF only
          txt = txt.replace(/\r/g, "");

          // Remove any trailing newline at EOF
          txt = txt.replace(/\n$/, "");

          // Write it back as EXACT UTF-8 with no CR, no BOM, no newline
          fs.writeFileSync(redirectsPath, txt, {
            encoding: "utf8",
          });

          console.log("✅ _redirects normalized:", JSON.stringify(txt));
        } else {
          console.warn("⚠️ dist/_redirects not found after build");
        }
      }
    }
  ]
});
