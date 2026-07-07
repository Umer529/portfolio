"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_BRAND } from "@/components/Reveal";
import type { DiagramEdge, DiagramNode } from "@/lib/types";

// Data-driven case-study diagram (PHASE_2.md Section 3): one reusable
// component laying out any {nodes, edges} pair from the case_studies jsonb —
// no hand-coded coordinates per project. Nodes are placed in columns by
// graph depth (left → right), edges draw sequentially on scroll-into-view
// (Section 8 of CLAUDE.md: no parallax, translate/draw only).

const NODE_W = 190;
const NODE_H = 72;
const GAP_X = 90;
const GAP_Y = 40;
const PAD = 24;

type Pos = { x: number; y: number };

function computeLayout(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const depth = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  // Relax edges n times — settles any DAG, tolerates bad data (cycles).
  for (let i = 0; i < nodes.length; i++) {
    for (const e of edges) {
      const from = depth.get(e.from);
      const to = depth.get(e.to);
      if (from !== undefined && to !== undefined && from + 1 > to && from + 1 <= nodes.length) {
        depth.set(e.to, from + 1);
      }
    }
  }

  const columns: string[][] = [];
  for (const n of nodes) {
    const d = depth.get(n.id) ?? 0;
    (columns[d] ??= []).push(n.id);
  }
  const colCount = columns.length;
  const maxRows = Math.max(1, ...columns.map((c) => c?.length ?? 0));
  const width = PAD * 2 + colCount * NODE_W + (colCount - 1) * GAP_X;
  const height = PAD * 2 + maxRows * NODE_H + (maxRows - 1) * GAP_Y;

  const positions = new Map<string, Pos>();
  columns.forEach((col, d) => {
    if (!col) return;
    const colHeight = col.length * NODE_H + (col.length - 1) * GAP_Y;
    const startY = (height - colHeight) / 2;
    col.forEach((id, i) => {
      positions.set(id, {
        x: PAD + d * (NODE_W + GAP_X),
        y: startY + i * (NODE_H + GAP_Y),
      });
    });
  });

  return { positions, width, height };
}

function edgeGeometry(a: Pos, b: Pos) {
  // 3px short of the target edge leaves room for the arrowhead marker.
  if (b.x > a.x) {
    // forward: right edge of source → left edge of target
    return {
      d: `M ${a.x + NODE_W},${a.y + NODE_H / 2} L ${b.x - 3},${b.y + NODE_H / 2}`,
      mid: { x: (a.x + NODE_W + b.x) / 2, y: (a.y + b.y + NODE_H) / 2 },
    };
  }
  if (b.x < a.x) {
    // backward: left edge of source → right edge of target
    return {
      d: `M ${a.x},${a.y + NODE_H / 2} L ${b.x + NODE_W + 3},${b.y + NODE_H / 2}`,
      mid: { x: (a.x + b.x + NODE_W) / 2, y: (a.y + b.y + NODE_H) / 2 },
    };
  }
  // same column: vertical
  const down = b.y > a.y;
  return {
    d: down
      ? `M ${a.x + NODE_W / 2},${a.y + NODE_H} L ${b.x + NODE_W / 2},${b.y - 3}`
      : `M ${a.x + NODE_W / 2},${a.y} L ${b.x + NODE_W / 2},${b.y + NODE_H + 3}`,
    mid: { x: a.x + NODE_W / 2, y: (a.y + b.y + NODE_H) / 2 },
  };
}

export function ArchDiagram({
  summary,
  nodes,
  edges,
}: {
  /** Plain-text architecture description — the diagram's a11y fallback. */
  summary: string | null;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}) {
  const reduceMotion = useReducedMotion();

  if (nodes.length === 0) return null;
  const { positions, width, height } = computeLayout(nodes, edges);
  const drawableEdges = edges.filter(
    (e) => positions.has(e.from) && positions.has(e.to),
  );

  return (
    <div className="overflow-x-auto rounded-card border border-border-hairline bg-bg-surface p-4">
      <svg
        role="img"
        aria-label={summary ?? "Architecture diagram"}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        style={{ minWidth: Math.min(width, 560) }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent-teal)" />
          </marker>
        </defs>

        {nodes.map((node, i) => {
          const pos = positions.get(node.id)!;
          return (
            <motion.g
              key={node.id}
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: EASE_BRAND, delay: i * 0.1 }}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
                rx="8"
                fill="var(--bg-surface-raised)"
                stroke="var(--border-hairline-hover)"
              />
              <text
                x={pos.x + NODE_W / 2}
                y={pos.y + (node.sublabel ? NODE_H / 2 - 4 : NODE_H / 2 + 4)}
                textAnchor="middle"
                fontFamily="var(--font-plex-mono), monospace"
                fontSize="13"
                fill="var(--text-primary)"
              >
                {node.label}
              </text>
              {node.sublabel ? (
                <text
                  x={pos.x + NODE_W / 2}
                  y={pos.y + NODE_H / 2 + 16}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), monospace"
                  fontSize="10.5"
                  fill="var(--text-secondary)"
                >
                  {node.sublabel}
                </text>
              ) : null}
            </motion.g>
          );
        })}

        {drawableEdges.map((edge, i) => {
          const geo = edgeGeometry(positions.get(edge.from)!, positions.get(edge.to)!);
          return (
            <motion.g
              key={`${edge.from}-${edge.to}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: EASE_BRAND, delay: 0.4 + i * 0.35 }}
            >
              <motion.path
                d={geo.d}
                fill="none"
                stroke="var(--accent-teal)"
                strokeWidth={edge.emphasized ? 2.5 : 1.5}
                markerEnd="url(#arrowhead)"
                initial={reduceMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_BRAND, delay: 0.4 + i * 0.35 }}
              />
              {edge.label ? (
                <text
                  x={geo.mid.x}
                  y={geo.mid.y - 8}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), monospace"
                  fontSize="10.5"
                  fill="var(--text-secondary)"
                >
                  {edge.label}
                </text>
              ) : null}
            </motion.g>
          );
        })}
      </svg>
      {summary ? <p className="sr-only">{summary}</p> : null}
    </div>
  );
}
