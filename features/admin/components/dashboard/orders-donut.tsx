"use client";

// ─── Orders Donut Chart ───────────────────────────────────────────────────────
// Pure SVG donut chart showing order count by status — no external libraries.

import { useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type DonutDataPoint = {
    status: string;
    count: number;
};

type OrdersDonutProps = {
    data: Array<DonutDataPoint>;
};

// ── Constants ─────────────────────────────────────────────────────────────────

/** Brand-consistent color per order status */
const STATUS_COLORS: Record<string, string> = {
    DRAFT: "#B0A499",       // muted warm grey
    CONFIRMED: "#8899C4",   // periwinkle / info
    IN_PRODUCTION: "#D4935A", // warm amber / warning
    READY: "#7BAE8F",       // sage mint / success
    COMPLETED: "#3D1A1A",   // chocolate brown / primary
    CANCELLED: "#C0646C",   // dusty rose / error
};

/** Human-readable Indonesian label per status */
const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    CONFIRMED: "Dikonfirmasi",
    IN_PRODUCTION: "Diproduksi",
    READY: "Siap Ambil",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert polar coordinates to Cartesian (SVG coordinate system).
 * `angleDeg` is measured clockwise from the top (12 o'clock).
 */
function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDeg: number
): [number, number] {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/**
 * Build an SVG arc path for a donut segment.
 * Returns `null` when the segment spans the full 360° (SVG arc can't render that).
 */
function arcPath(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    startDeg: number,
    endDeg: number,
    gapDeg: number = 1.5
): string {
    const s = startDeg + gapDeg / 2;
    const e = endDeg - gapDeg / 2;

    const [ox1, oy1] = polarToCartesian(cx, cy, outerR, s);
    const [ox2, oy2] = polarToCartesian(cx, cy, outerR, e);
    const [ix1, iy1] = polarToCartesian(cx, cy, innerR, e);
    const [ix2, iy2] = polarToCartesian(cx, cy, innerR, s);

    const largeArc = e - s > 180 ? 1 : 0;

    return [
        `M ${ox1} ${oy1}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
        "Z",
    ].join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersDonut({ data }: OrdersDonutProps) {
    const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

    const allZero = total === 0;

    // Filter out zero-count slices (they'd render as invisible anyway)
    const activeSlices = useMemo(
        () => data.filter((d) => d.count > 0),
        [data]
    );

    // Pre-compute arc start/end angles for each slice
    const slices = useMemo(() => {
        let cursor = 0;
        return activeSlices.map((d) => {
            const span = (d.count / total) * 360;
            const start = cursor;
            const end = cursor + span;
            cursor = end;
            return { ...d, start, end, span };
        });
    }, [activeSlices, total]);

    // ── Geometry ─────────────────────────────────────────────────────────────
    const CX = 80;
    const CY = 80;
    const OUTER_R = 68;
    const INNER_R = 37; // ~55% of 68 ≈ 37.4

    const SVG_SIZE = 160;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="rounded-xl border border-border bg-card shadow-sm"
            style={{ boxShadow: "0 4px 12px rgba(61,26,26,0.08)" }}
        >
            {/* Card header */}
            <div className="px-5 pt-5 pb-3 border-b border-border">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Status Order
                </h3>
                {!allZero && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Total{" "}
                        <span className="font-medium text-foreground">{total}</span>{" "}
                        order
                    </p>
                )}
            </div>

            {/* Chart body */}
            <div className="p-5">
                {allZero ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-36 text-muted-foreground gap-2">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                        </svg>
                        <p className="text-sm">Belum ada data order</p>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* ── SVG donut ── */}
                        <div className="shrink-0">
                            <svg
                                width={SVG_SIZE}
                                height={SVG_SIZE}
                                viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                                role="img"
                                aria-label="Donut chart status order"
                            >
                                {/* Single full-circle track when all in one status */}
                                {slices.length === 1 && (
                                    <circle
                                        cx={CX}
                                        cy={CY}
                                        r={(OUTER_R + INNER_R) / 2}
                                        fill="none"
                                        stroke={
                                            STATUS_COLORS[slices[0].status] ?? "#A48BBF"
                                        }
                                        strokeWidth={OUTER_R - INNER_R}
                                    />
                                )}

                                {/* Multi-slice arcs */}
                                {slices.length > 1 &&
                                    slices.map((slice) => (
                                        <path
                                            key={slice.status}
                                            d={arcPath(
                                                CX,
                                                CY,
                                                OUTER_R,
                                                INNER_R,
                                                slice.start,
                                                slice.end,
                                                slices.length > 1 ? 2 : 0
                                            )}
                                            fill={
                                                STATUS_COLORS[slice.status] ?? "#A48BBF"
                                            }
                                            style={{ transition: "opacity 150ms ease" }}
                                        >
                                            <title>
                                                {STATUS_LABELS[slice.status] ?? slice.status}:{" "}
                                                {slice.count} order (
                                                {Math.round((slice.count / total) * 100)}%)
                                            </title>
                                        </path>
                                    ))}

                                {/* Center label */}
                                <text
                                    x={CX}
                                    y={CY - 8}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="22"
                                    fontWeight="700"
                                    fill="#3D1A1A"
                                >
                                    {total}
                                </text>
                                <text
                                    x={CX}
                                    y={CY + 14}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="9.5"
                                    fill="var(--muted-foreground)"
                                    letterSpacing="0.04em"
                                >
                                    ORDER
                                </text>
                            </svg>
                        </div>

                        {/* ── Legend ── */}
                        <ul className="flex-1 space-y-2 min-w-0">
                            {data.map((d) => {
                                const color = STATUS_COLORS[d.status] ?? "#A48BBF";
                                const label = STATUS_LABELS[d.status] ?? d.status;
                                const pct =
                                    total > 0
                                        ? Math.round((d.count / total) * 100)
                                        : 0;
                                return (
                                    <li
                                        key={d.status}
                                        className="flex items-center gap-2.5 min-w-0"
                                    >
                                        {/* Colored dot */}
                                        <span
                                            className="shrink-0 rounded-full"
                                            style={{
                                                width: 10,
                                                height: 10,
                                                backgroundColor: color,
                                            }}
                                            aria-hidden="true"
                                        />
                                        {/* Label */}
                                        <span className="flex-1 text-sm text-foreground truncate">
                                            {label}
                                        </span>
                                        {/* Count + pct */}
                                        <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                                            {d.count}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums w-9 text-right">
                                            {pct}%
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
