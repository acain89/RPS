import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],   // helps avoid duplicate React copies
  },

  optimizeDeps: {
    include: ["react-router", "react-router-dom"],
    exclude: ["@emotion/is-prop-valid"]  // stops require() emission
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ["@emotion/is-prop-valid"]
    }
  }
});
