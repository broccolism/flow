import React, { useState } from "react";
import { FlowCanvas } from "./FlowCanvas";
import { sampleDoc } from "./sample";
import type { Doc } from "./model";
import { openDoc, saveDoc } from "./storage";

export default function App() {
  const [doc, setDoc] = useState<Doc>(sampleDoc);
  const [path, setPath] = useState<string | undefined>(undefined);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 12px", display: "flex", gap: 8, borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
        <button onClick={() => { setDoc(sampleDoc); setPath(undefined); }}>Load Sample</button>
        <button onClick={async () => { const res = await openDoc(); if (res) { setDoc(res.doc); setPath(res.path); } }}>Open…</button>
        <button onClick={async () => { const p = await saveDoc(doc); if (p) setPath(p); }}>Save As…</button>
        <div style={{ marginLeft: "auto", font: "12px system-ui", opacity: 0.7 }}>
          {path ? `File: ${path}` : "No file opened"}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <FlowCanvas doc={doc} />
      </div>
    </div>
  );
}

