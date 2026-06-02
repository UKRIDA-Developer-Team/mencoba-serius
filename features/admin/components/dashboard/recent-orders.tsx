"use client";

// ─── Recent Orders List ────────────────────────────────────────────────────────
// Read-only component displaying the most recent 8 orders.

import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
    | "DRAFT"
    | "CONFIRMED"
    | "IN_PRODUCTION"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

type OrderType = "WALK_IN" | "PRE_ORDER" | "CUSTOM_CAKE";

type RecentOrder = {
    id: string;
    orderNumber: string;
    customerName: string;
    orderType: string;
    status: string;
    totalAmount: number;
    orderedAt: string;
};

type RecentOrdersProps = {
    orders: Array<RecentOrder>;
};

// ── Constants ─────────────────────────────────────────────────────────────────

/** Status badge styling: background + text color using brand semantic colors */
const STATUS_STYLE: Record<
    OrderStatus,
    { bg: string; text: string; label: string }
> = {
    DRAFT: {
        bg: "rgba(176,164,153,0.18)",
        text: "#7A6E65",
        label: "Draft",
    },
    CONFIRMED: {
        bg: "rgba(136,153,196,0.18)",
        text: "#5A6FA0",
        label: "Dikonfirmasi",
    },
    IN_PRODUCTION: {
        bg: "rgba(212,147,90,0.18)",
        text: "#A06325",
        label: "Diproduksi",
    },
    READY: {
        bg: "rgba(123,174,143,0.18)",
        text: "#3D7A56",
        label: "Siap Ambil",
    },
    COMPLETED: {
        bg: "rgba(61,26,26,0.12)",
        text: "#3D1A1A",
        label: "Selesai",
    },
    CANCELLED: {
        bg: "rgba(192,100,108,0.15)",
        text: "#A03040",
        label: "Dibatalkan",
    },
};

/** Order type display labels */
const ORDER_TYPE_LABEL: Record<OrderType, string> = {
    WALK_IN: "Walk-in",
    PRE_ORDER: "Pre-order",
    CUSTOM_CAKE: "Custom",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(value: number): string {
    return `Rp\u00a0${value.toLocaleString("id-ID")}`;
}

function formatDate(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getStatusStyle(status: string) {
    return (
        STATUS_STYLE[status as OrderStatus] ?? {
            bg: "rgba(176,164,153,0.18)",
            text: "#7A6E65",
            label: status,
        }
    );
}

function getOrderTypeLabel(orderType: string): string {
    return ORDER_TYPE_LABEL[orderType as OrderType] ?? orderType;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const style = getStatusStyle(status);
    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap"
            style={{
                backgroundColor: style.bg,
                color: style.text,
            }}
        >
            {style.label}
        </span>
    );
}

function TypeBadge({ orderType }: { orderType: string }) {
    return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap bg-muted text-muted-foreground">
            {getOrderTypeLabel(orderType)}
        </span>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RecentOrders({ orders }: RecentOrdersProps) {
    // Show only the 8 most recent
    const recent = orders.slice(0, 8);

    return (
        <div
            className="rounded-xl border border-border bg-card shadow-sm"
            style={{ boxShadow: "0 4px 12px rgba(61,26,26,0.08)" }}
        >
            {/* Card header */}
            <div className="px-5 pt-5 pb-3 border-b border-border">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Order Terbaru
                </h3>
                {recent.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Menampilkan{" "}
                        <span className="font-medium text-foreground">
                            {recent.length}
                        </span>{" "}
                        order terbaru
                    </p>
                )}
            </div>

            {/* List body */}
            <div>
                {recent.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2 px-5">
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
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="2" />
                            <path d="M9 12h6M9 16h4" />
                        </svg>
                        <p className="text-sm">Belum ada order</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border" role="list">
                        {recent.map((order) => (
                            <li
                                key={order.id}
                                className="flex items-start sm:items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                            >
                                {/* Left: order number + customer */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-foreground font-mono tracking-tight">
                                            {order.orderNumber}
                                        </span>
                                        <TypeBadge orderType={order.orderType} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {order.customerName}
                                    </p>
                                </div>

                                {/* Right: status, amount, date */}
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                                    <StatusBadge status={order.status} />
                                    <span className="text-sm font-medium tabular-nums text-foreground whitespace-nowrap">
                                        {formatIDR(order.totalAmount)}
                                    </span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(order.orderedAt)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer: link to full orders page */}
            <div className="px-5 py-3 border-t border-border">
                <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-accent hover:underline underline-offset-4 decoration-accent/60 transition-colors inline-flex items-center gap-1"
                    style={{ color: "#A48BBF" }}
                >
                    Lihat Semua
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
