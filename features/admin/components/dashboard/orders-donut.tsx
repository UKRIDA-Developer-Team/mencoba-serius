"use client";

// ============================================================================
// Orders Donut Chart
// Pure SVG donut chart showing order count by status without external libraries.
// ============================================================================

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// --- Types ---

type DonutDataPoint = {
    status: string;
    count: number;
};

type OrdersDonutProps = {
    data: Array<DonutDataPoint>;
};

// --- Constants ---

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

// --- Helper Functions ---

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

// --- Main Component ---

export default function OrdersDonut({ data }: OrdersDonutProps) {
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
    const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

    const allZero = total === 0;

    // Filter out zero-count slices (they'd render as invisible anyway)
    const activeSlices = useMemo(
        () => data.filter((d) => d.count > 0),
        [data]
    );

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

    const activeSlice = useMemo(
        () => (hoveredStatus ? slices.find((s) => s.status === hoveredStatus) : null),
        [hoveredStatus, slices]
    );

    const centerValue = activeSlice ? activeSlice.count : total;
    const centerLabel = activeSlice
        ? (STATUS_LABELS[activeSlice.status] ?? activeSlice.status).toUpperCase()
        : "ORDER";

    // --- Chart Geometry ---
    const CX = 90;
    const CY = 90;
    const OUTER_R = 80;
    const INNER_R = 52; 
    const SVG_SIZE = 180;

    // --- Render ---
    return (
        <div
            className="rounded-xl border border-border bg-card"
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
                    <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-6">
                        {/* SVG Donut Chart */}
                        <div className="shrink-0 flex items-center justify-center">
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
                                        onMouseEnter={() => setHoveredStatus(slices[0].status)}
                                        onMouseLeave={() => setHoveredStatus(null)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <title>
                                            {STATUS_LABELS[slices[0].status] ?? slices[0].status}:{" "}
                                            {slices[0].count} order (100%)
                                        </title>
                                    </circle>
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
                                            onMouseEnter={() => setHoveredStatus(slice.status)}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                            style={{
                                                opacity: hoveredStatus && hoveredStatus !== slice.status ? 0.25 : 1,
                                                transition: "opacity 200ms ease",
                                                cursor: "pointer",
                                            }}
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
                                    y={CY - 10}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="26"
                                    fontWeight="700"
                                    fill="#3D1A1A"
                                    style={{ transition: "all 150ms ease" }}
                                >
                                    {centerValue}
                                </text>
                                <text
                                    x={CX}
                                    y={CY + 16}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={activeSlice ? "10" : "11"}
                                    fill="var(--muted-foreground)"
                                    letterSpacing="0.04em"
                                    style={{ transition: "all 150ms ease" }}
                                >
                                    {centerLabel}
                                </text>
                            </svg>
                        </div>

                        {/* Chart Legend */}
                        <ul
                            className="flex-1 w-full space-y-0.5 min-w-0"
                            onMouseLeave={() => setHoveredStatus(null)}
                        >
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
                                        onMouseEnter={() => setHoveredStatus(d.status)}
                                        className={cn(
                                            "flex items-center gap-2.5 min-w-0 px-2 py-1.5 -mx-2 rounded-md transition-colors cursor-pointer",
                                            hoveredStatus === d.status ? "bg-muted" : "hover:bg-muted/40",
                                            hoveredStatus && hoveredStatus !== d.status ? "opacity-40" : "opacity-100"
                                        )}
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
                                        <span className="flex-1 text-sm text-foreground break-words leading-tight">
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
