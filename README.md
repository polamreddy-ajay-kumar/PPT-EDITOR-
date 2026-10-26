# A4MP PPT File Editor

A browser-based starter app for editing text content in PowerPoint `.pptx` files and editing `.txt`, `.csv`, and `.md` files.

## Features
- Upload a `.pptx` and inspect text areas extracted from slide XML.
- Edit extracted text and export an updated `.pptx` copy.
- Edit and download TXT, CSV, and Markdown files.
- Responsive interface.
- GitHub Pages deployment workflow included and configured for this repository: `A4MP-PPT-FILE-EDITOR-`.

## Fix / publish in your existing GitHub repository

**Important: extract this ZIP first. Upload the files and folders inside it to the root of your repository, not the ZIP file itself and not an extra enclosing folder.**

1. Download and extract this ZIP on your computer.
2. Open your repository: https://github.com/polamreddy-ajay-kumar/A4MP-PPT-FILE-EDITOR-
3. Remove/replace the old project files with the files and folders from the extracted ZIP. The repository root should show `package.json`, `index.html`, `vite.config.ts`, `src/`, and `.github/workflows/deploy.yml`.
4. Commit the changes to the `main` branch.
5. Open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
6. Open **Actions** and wait for “Deploy A4MP File Editor to GitHub Pages” to finish with a green check.
7. Visit: https://polamreddy-ajay-kumar.github.io/A4MP-PPT-FILE-EDITOR-/

If you prefer Git commands, from the extracted project folder use `git add .`, `git commit -m "Fix GitHub Pages deployment"`, and `git push`. Do not run `git init` if you already cloned your existing repository.

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Important limitations
This is a starter editor, not a full Microsoft PowerPoint replacement. It edits text found in many basic PPTX slide XML shapes, but may alter text-run formatting and does not render full slide layouts, edit images/charts/animations, or guarantee compatibility with every PPTX. DOCX/PDF/XLSX editing is not implemented. Files are processed in the browser; no backend or account system is included.
