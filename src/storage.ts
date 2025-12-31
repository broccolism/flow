import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Doc } from "./model";

export async function saveDoc(doc: Doc) {
  const path = await save({
    title: "Save money flow map",
    filters: [{ name: "MoneyFlow", extensions: ["moneyflow.json"] }]
  });
  if (!path) return;
  await writeTextFile(path, JSON.stringify(doc, null, 2));
  return path;
}

export async function openDoc(): Promise<{ doc: Doc; path?: string } | null> {
  const path = await open({
    title: "Open money flow map",
    multiple: false,
    filters: [{ name: "MoneyFlow", extensions: ["moneyflow.json","json"] }]
  });
  if (!path || Array.isArray(path)) return null;
  const text = await readTextFile(path);
  const doc = JSON.parse(text) as Doc;
  return { doc, path };
}

