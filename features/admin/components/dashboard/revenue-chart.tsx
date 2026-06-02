"use client";

// ─── Revenue Chart ────────────────────────────────────────────────────────────
// Pure SVG line/area chart — no external charting library.
// Displays revenue over the last 7 days using cubic bezier smooth paths.

import { useId, useMemo, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type DataPoint = {
    date: string;
    revenue: number;
    orderCount: number;
};

type RevenueChartProps = {
    data: Array<DataPoint>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a revenue number into short Indonesian currency (150k, 1.5jt, etc.) */
function formatShort(value: number): string {
    if (value === 0) return "0";
    if (value >= 1_000_000) {
        const jt = value / 1_000_000;
        return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1)}jt`;
    }
    if (value >= 1_000) {
        const k = value / 1_000;
        return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return String(value);
}

/** Format a revenue number as full Rp (Rp 150.000) for tooltips */
function formatIDR(value: number): string {
    return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

/** Parse a date string and return a 3-letter day abbreviation in Indonesian */
function toDayAbbr(dateStr: string): string {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 3);
    return days[d.getDay()];
}

/**
 * Build a smooth cubic bezier SVG path from an array of [x, y] points.
 * Uses 1/3 of the horizontal distance as the control-point offset.
 */
function smoothPath(points: Array<[number, number]>): string {
    if (points.length < 2) return "";

    let d = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const cpx = (x0 + x1) / 2;
        d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
    }

    return d;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RevenueChart({ data }: RevenueChartProps) {
    const gradientId = useId();
    const [hovered, setHovered] = useState<number | null>(null);

    // Ensure we only show the last 7 items (caller should already pass 7, but guard)
    const points = useMemo(() => data.slice(-7), [data]);

    const allZero = useMemo(
        () => points.every((d) => d.revenue === 0),
        [points]
    );

    // ── Chart geometry constants ─────────────────────────────────────────────
    const SVG_W = 600;
    const SVG_H = 220;
    const PAD_TOP = 20;
    const PAD_BOTTOM = 36; // room for x-axis labels
    const PAD_LEFT = 52;   // room for y-axis labels
    const PAD_RIGHT = 16;

    const chartW = SVG_W - PAD_LEFT - PAD_RIGHT;
    const chartH = SVG_H - PAD_TOP - PAD_BOTTOM;

    // ── Scale helpers ────────────────────────────────────────────────────────
    const maxRevenue = useMemo(
        () => Math.max(...points.map((d) => d.revenue), 1),
        [points]
    );

    // Round up max to a "nice" ceiling so the top label looks clean
    const niceMax = useMemo(() => {
        const magnitude = Math.pow(10, Math.floor(Math.log10(maxRevenue)));
        return Math.ceil(maxRevenue / magnitude) * magnitude;
    }, [maxRevenue]);

    /** Map a revenue value to SVG Y coordinate (0 = top) */
    const toY = (revenue: number) =>
        PAD_TOP + chartH - (revenue / niceMax) * chartH;

    /** Map a data-point index to SVG X coordinate */
    const toX = (index: number) =>
        PAD_LEFT + (points.length <= 1 ? chartW / 2 : (index / (points.length - 1)) * chartW);

    // Pre-compute the XY coordinate for each data point
    const coords = useMemo<Array<[number, number]>>(
        () => points.map((d, i) => [toX(i), toY(d.revenue)]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [points, niceMax]
    );

    // Y-axis tick values (4 ticks: 0, 33%, 67%, 100%)
    const yTicks = useMemo(
        () => [0, 0.33, 0.67, 1].map((ratio) => Math.round(niceMax * ratio)),
        [niceMax]
    );

    // Path strings
    const linePath = smoothPath(coords);
    const areaPath =
        coords.length > 0
            ? `${linePath} L ${coords[coords.length - 1][0]},${PAD_TOP + chartH} L ${coords[0][0]},${PAD_TOP + chartH} Z`
            : "";

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="rounded-xl border border-border bg-card shadow-sm"
            style={{ boxShadow: "0 4px 12px rgba(61,26,26,0.08)" }}
        >
            {/* Card header */}
            <div className="px-5 pt-5 pb-3 border-b border-border">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Pendapatan 7 Hari Terakhir
                </h3>
                {!allZero && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Total:{" "}
                        <span className="font-medium text-foreground">
                            {formatIDR(points.reduce((s, d) => s + d.revenue, 0))}
                        </span>
                    </p>
                )}
            </div>

            {/* Chart body */}
            <div className="p-4">
                {allZero ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
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
                            <path d="M3 3v18h18" />
                            <path d="M7 16l4-4 4 4 4-4" />
                        </svg>
                        <p className="text-sm">Belum ada data pendapatan</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-x-auto">
                        <svg
                            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                            role="img"
                            aria-label="Grafik pendapatan 7 hari terakhir"
                            className="w-full"
                            style={{ minWidth: "280px", height: "auto" }}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#A48BBF"
                                        stopOpacity="0.30"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#A48BBF"
                                        stopOpacity="0.02"
                                    />
                                </linearGradient>
                            </defs>

                            {/* ── Y-axis grid lines & labels ── */}
                            {yTicks.map((tick) => {
                                const y = toY(tick);
                                return (
                                    <g key={tick}>
                                        {/* Grid line */}
                                        <line
                                            x1={PAD_LEFT}
                                            y1={y}
                                            x2={SVG_W - PAD_RIGHT}
                                            y2={y}
                                            stroke="var(--border)"
                                            strokeWidth="1"
                                            strokeDasharray={tick === 0 ? "none" : "3 3"}
                                        />
                                        {/* Y label */}
                                        <text
                                            x={PAD_LEFT - 6}
                                            y={y}
                                            textAnchor="end"
                                            dominantBaseline="middle"
                                            fontSize="10"
                                            fill="var(--muted-foreground)"
                                        >
                                            {formatShort(tick)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* ── Filled area ── */}
                            <path
                                d={areaPath}
                                fill={`url(#${gradientId})`}
                            />

                            {/* ── Smooth line ── */}
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#A48BBF"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* ── Data points, X labels, hover targets ── */}
                            {points.map((point, i) => {
                                const cx = coords[i][0];
                                const cy = coords[i][1];
                                const isHovered = hovered === i;
                                const dayLabel = toDayAbbr(point.date);

                                return (
                                    <g key={point.date + i}>
                                        {/* Invisible wide hover target */}
                                        <rect
                                            x={cx - (chartW / (points.length * 2))}
                                            y={PAD_TOP}
                                            width={chartW / points.length}
                                            height={chartH}
                                            fill="transparent"
                                            onMouseEnter={() => setHovered(i)}
                                            style={{ cursor: "crosshair" }}
                                        />

                                        {/* Vertical hover line */}
                                        {isHovered && (
                                            <line
                                                x1={cx}
                                                y1={PAD_TOP}
                                                x2={cx}
                                                y2={PAD_TOP + chartH}
                                                stroke="#A48BBF"
                                                strokeWidth="1"
                                                strokeDasharray="4 3"
                                                strokeOpacity="0.6"
                                            />
                                        )}

                                        {/* Dot */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={isHovered ? 5.5 : 3.5}
                                            fill={isHovered ? "#A48BBF" : "#F5EFE6"}
                                            stroke="#A48BBF"
                                            strokeWidth="2"
                                            style={{
                                                transition: "r 150ms ease-out",
                                                cursor: "crosshair",
                                            }}
                                            onMouseEnter={() => setHovered(i)}
                                        >
                                            <title>
                                                {dayLabel}: {formatIDR(point.revenue)} · {point.orderCount} order
                                            </title>
                                        </circle>

                                        {/* Tooltip box on hover */}
                                        {isHovered && (() => {
                                            // Tooltip dimensions
                                            const TW = 120;
                                            const TH = 44;
                                            const TP = 8;
                                            // Clamp X so tooltip stays within chart area
                                            let tx = cx - TW / 2;
                                            if (tx < PAD_LEFT) tx = PAD_LEFT;
                                            if (tx + TW > SVG_W - PAD_RIGHT) tx = SVG_W - PAD_RIGHT - TW;
                                            const ty = cy - TH - TP;

                                            return (
                                                <g style={{ pointerEvents: "none" }}>
                                                    <rect
                                                        x={tx}
                                                        y={ty}
                                                        width={TW}
                                                        height={TH}
                                                        rx="6"
                                                        fill="#3D1A1A"
                                                        fillOpacity="0.92"
                                                    />
                                                    <text
                                                        x={tx + TW / 2}
                                                        y={ty + 14}
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fill="#F5EFE6"
                                                        fontWeight="600"
                                                    >
                                                        {formatIDR(point.revenue)}
                                                    </text>
                                                    <text
                                                        x={tx + TW / 2}
                                                        y={ty + 30}
                                                        textAnchor="middle"
                                                        fontSize="9.5"
                                                        fill="#D6C8E8"
                                                    >
                                                        {point.orderCount} order · {dayLabel}
                                                    </text>
                                                </g>
                                            );
                                        })()}

                                        {/* X-axis day label */}
                                        <text
                                            x={cx}
                                            y={SVG_H - 8}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill={
                                                isHovered
                                                    ? "#3D1A1A"
                                                    : "var(--muted-foreground)"
                                            }
                                            fontWeight={isHovered ? "600" : "400"}
                                        >
                                            {dayLabel}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
