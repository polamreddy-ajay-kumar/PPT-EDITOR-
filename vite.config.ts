import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repository name exactly for GitHub Pages.
  base: "/A4MP-PPT-FILE-EDITOR-/",
});
