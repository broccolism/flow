import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Doc, Transaction } from "./model";

type Props = { doc: Doc };

function parseDate(d: string) { return new Date(d + "T00:00:00"); }
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

export function FlowCanvas({ doc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);        // 0.5 ~ 3
  const [panX, setPanX] = useState(0);        // px
  const [drag, setDrag] = useState<{x:number, startPan:number} | null>(null);

  const txsSorted = useMemo(() => {
    return [...doc.transactions].sort((a,b) => +parseDate(a.date) - +parseDate(b.date));
  }, [doc]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // resize to device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = c;
    c.width = Math.floor(clientWidth * dpr);
    c.height = Math.floor(clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    ctx.clearRect(0, 0, clientWidth, clientHeight);

    // layout params
    const left = 40;
    const top = 60;
    const midY = clientHeight / 2;
    const pxPerDay = 2.2 * zoom;

    // compute timeline range
    const minD = parseDate(txsSorted[0]?.date ?? "2023-01-01");
    const maxD = parseDate(txsSorted[txsSorted.length - 1]?.date ?? "2023-12-31");
    const spanDays = Math.max(1, Math.round((+maxD - +minD) / 86400000));

    // draw axis
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.moveTo(left, midY);
    ctx.lineTo(clientWidth - 20, midY);
    ctx.stroke();

    // ticks (monthly-ish)
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.font = "12px system-ui";
    for (let day = 0; day <= spanDays; day += 30) {
      const x = left + panX + day * pxPerDay;
      if (x < left - 50 || x > clientWidth + 50) continue;
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.moveTo(x, midY - 6);
      ctx.lineTo(x, midY + 6);
      ctx.stroke();
    }

    // helper: date -> x
    const xOf = (t: Transaction) => {
      const d = parseDate(t.date);
      const days = Math.round((+d - +minD) / 86400000);
      return left + panX + days * pxPerDay;
    };

    // blocks
    const blockW = 160;
    const blockH = 44;
    const laneUp = midY - 120;
    const laneDown = midY + 60;

    const income = txsSorted.filter(t => t.type === "income");
    const expense = txsSorted.filter(t => t.type === "expense");

    // draw incomes (upper lane)
    income.forEach((t) => {
      const x = xOf(t);
      drawBlock(ctx, x, laneUp, blockW, blockH, t.label ?? t.asset, `+${fmt(t.amount)}`, t.estimated);
    });

    // draw expenses (lower lane)
    expense.forEach((t) => {
      const x = xOf(t);
      drawBlock(ctx, x, laneDown, blockW, blockH, t.label ?? t.asset, `-${fmt(t.amount)}`, t.estimated);
    });

    // links: source -> expense (conceptual lines for now)
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    doc.links.forEach(link => {
      const target = doc.transactions.find(t => t.id === link.expenseTxId);
      if (!target) return;
      const txTargetX = xOf(target) + blockW/2;
      const txTargetY = laneDown;

      link.sourceTxIds.forEach(srcId => {
        const src = doc.transactions.find(t => t.id === srcId);
        if (!src) return;
        const sx = xOf(src) + blockW/2;
        const sy = laneUp + blockH;
        drawCurve(ctx, sx, sy, txTargetX, txTargetY);
      });
    });
  }, [doc, zoom, panX, txsSorted]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: drag ? "grabbing" : "grab" }}
        onWheel={(e) => {
          e.preventDefault();
          const next = clamp(zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.5, 3);
          setZoom(next);
        }}
        onMouseDown={(e) => setDrag({ x: e.clientX, startPan: panX })}
        onMouseMove={(e) => { if (drag) setPanX(drag.startPan + (e.clientX - drag.x)); }}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      />
      <div style={{ position: "absolute", left: 12, top: 10, font: "12px system-ui", opacity: 0.8 }}>
        Zoom: {zoom.toFixed(2)} · PanX: {Math.round(panX)}
      </div>
    </div>
  );
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  title: string, subtitle: string, estimated?: boolean
) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.strokeStyle = estimated ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.5)";
  ctx.setLineDash(estimated ? [6,4] : []);
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.font = "13px system-ui";
  ctx.fillText(title, x + 10, y + 18);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.font = "12px system-ui";
  ctx.fillText(subtitle, x + 10, y + 36);
}

function drawCurve(ctx: CanvasRenderingContext2D, x1:number,y1:number,x2:number,y2:number) {
  const mx = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(mx, y1, mx, y2, x2, y2);
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function fmt(n:number) {
  return n.toLocaleString("en-US");
}

