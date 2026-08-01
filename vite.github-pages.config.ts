import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/english/",
  plugins: [react()],
  build: {
    outDir: "github-pages-dist",
  },
});
