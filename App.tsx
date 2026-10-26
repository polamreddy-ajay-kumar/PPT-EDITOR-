import { useState } from "react";
import JSZip from "jszip";
import {
  Upload, FileText, Download, Trash2, Presentation,
  Save, FileEdit, ShieldCheck
} from "lucide-react";

type SlideText = {
  id: string;
  path: string;
  shapeIndex: number;
  text: string;
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [zip, setZip] = useState<JSZip | null>(null);
  const [items, setItems] = useState<SlideText[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [plainText, setPlainText] = useState("");
  const [plainMode, setPlainMode] = useState(false);

  async function openFile(f?: File) {
    if (!f) return;
    setMessage("");
    setFile(f);

    if (f.name.toLowerCase().endsWith(".pptx")) {
      try {
        setBusy(true);
        const z = await JSZip.loadAsync(f);
        const paths = Object.keys(z.files)
          .filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p))
          .sort((a, b) =>
            Number(a.match(/slide(\d+)/)?.[1]) -
            Number(b.match(/slide(\d+)/)?.[1])
          );
        const result: SlideText[] = [];

        for (const path of paths) {
          const entry = z.file(path);
          if (!entry) continue;
          const xml = await entry.async("text");
          const doc = new DOMParser().parseFromString(xml, "application/xml");
          if (doc.querySelector("parsererror")) continue;
          const shapes = Array.from(doc.getElementsByTagNameNS("*", "sp"));

          shapes.forEach((shape, shapeIndex) => {
            const nodes = Array.from(shape.getElementsByTagNameNS("*", "t"));
            const text = nodes.map(n => n.textContent || "").join("");
            if (text.trim()) result.push({ id: `${path}:${shapeIndex}`, path, shapeIndex, text });
          });
        }

        setZip(z);
        setItems(result);
        setPlainMode(false);
        setSelected(result[0]?.id || "");
        setMessage(`Opened ${paths.length} slide XML files. ${result.length} editable text areas found.`);
      } catch {
        setMessage("Unable to open this PPTX. Try another valid file.");
      } finally {
        setBusy(false);
      }
    } else if (/\.(txt|csv|md)$/i.test(f.name)) {
      setPlainText(await f.text());
      setPlainMode(true);
      setZip(null);
      setItems([]);
      setMessage("Text file opened. Edit it and select Download.");
    } else {
      setZip(null);
      setPlainMode(false);
      setItems([]);
      setMessage("Supported formats: PPTX, TXT, CSV and MD. DOCX/PDF/XLSX editing is not implemented yet.");
    }
  }

  function changeText(id: string, text: string) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  }

  async function downloadFile() {
    if (!file) return;
    try {
      setBusy(true);
      if (plainMode) {
        const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage("Edited file download started.");
        return;
      }
      if (!zip) return;

      for (const item of items) {
        const entry = zip.file(item.path);
        if (!entry) continue;
        const xml = await entry.async("text");
        const doc = new DOMParser().parseFromString(xml, "application/xml");
        const shapes = Array.from(doc.getElementsByTagNameNS("*", "sp"));
        const shape = shapes[item.shapeIndex];
        if (!shape) continue;
        const nodes = Array.from(shape.getElementsByTagNameNS("*", "t"));
        if (!nodes.length) continue;
        nodes[0].textContent = item.text;
        for (let i = 1; i < nodes.length; i++) nodes[i].textContent = "";
        zip.file(item.path, new XMLSerializer().serializeToString(doc));
      }

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Edited PPTX download started.");
    } catch {
      setMessage("Could not export this file. Please try another PPTX.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null); setZip(null); setItems([]); setSelected("");
    setPlainText(""); setPlainMode(false); setMessage("");
  }

  const current = items.find(item => item.id === selected);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">A4</div>
          <div><h1>A4MP</h1><p>FILE EDITOR</p></div>
        </div>
        <span className="secure"><ShieldCheck size={16} /> Local file processing</span>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">YOUR DOCUMENT WORKSPACE</span>
          <h2>Edit files.<br /><span>Make them yours.</span></h2>
          <p>Upload a PowerPoint or text file, edit its content and download your updated copy.</p>
        </section>

        <section className="toolbar">
          <label className="upload"><Upload size={18} /> Upload file
            <input type="file" accept=".pptx,.txt,.csv,.md" hidden onChange={e => openFile(e.target.files?.[0])} />
          </label>
          <button className="secondary" onClick={downloadFile} disabled={!file || busy}>
            <Download size={18} /> Download edited file
          </button>
          <button className="icon-button" onClick={reset} title="Clear"><Trash2 size={18} /></button>
        </section>

        {message && <div className="message">{message}</div>}
        {busy && <p className="status">Processing file…</p>}

        {!file ? (
          <label className="dropzone">
            <div className="upload-icon"><Upload size={28} /></div>
            <h3>Drop your file here</h3>
            <p>or click to browse your device</p>
            <span>PPTX · TXT · CSV · MD</span>
            <input type="file" accept=".pptx,.txt,.csv,.md" hidden onChange={e => openFile(e.target.files?.[0])} />
          </label>
        ) : (
          <section className="workspace">
            <aside className="sidebar">
              <h3><FileText size={17} /> FILE CONTENTS</h3>
              <p className="filename">{file.name}</p>
              {plainMode ? <div className="file-note">Text editor ready</div> :
                items.length === 0 ? <div className="file-note">No editable text areas found.</div> :
                items.map((item, i) => (
                  <button key={item.id} className={`slide-item ${selected === item.id ? "active" : ""}`} onClick={() => setSelected(item.id)}>
                    <span className="slide-number">{i + 1}</span>
                    <span className="slide-label">{item.text.slice(0, 65) || "Empty text"}</span>
                  </button>
                ))}
            </aside>

            <section className="editor">
              <div className="editor-heading">
                <div><span className="eyebrow">EDITOR</span>
                  <h3>{plainMode ? "Text file" : current ? `Slide ${current.path.match(/slide(\d+)/)?.[1]}` : "Presentation content"}</h3>
                </div>
                <FileEdit size={22} />
              </div>
              {plainMode ? (
                <textarea className="text-editor" value={plainText} onChange={e => setPlainText(e.target.value)} spellCheck={false} />
              ) : current ? (
                <>
                  <div className="preview-slide"><Presentation size={24} /><p>TEXT PREVIEW</p><div>{current.text}</div></div>
                  <label className="field-label">EDIT TEXT</label>
                  <textarea className="text-editor" value={current.text} onChange={e => changeText(current.id, e.target.value)} placeholder="Enter your updated text…" />
                </>
              ) : <p>Select a text area to edit.</p>}
              <button className="primary" onClick={downloadFile} disabled={busy}><Save size={18} /> Save &amp; Download</button>
            </section>
          </section>
        )}

        <section className="features">
          <div><FileEdit /><b>Edit text</b><p>Change supported content</p></div>
          <div><Save /><b>Keep a copy</b><p>Export an edited file</p></div>
          <div><ShieldCheck /><b>Local processing</b><p>Files handled in browser</p></div>
        </section>
        <footer>A4MP FILE EDITOR · Built for productivity</footer>
      </main>
    </div>
  );
}
