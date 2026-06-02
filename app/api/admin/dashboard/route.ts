import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

type DashboardRange =
  | "this_week"
  | "last_week"
  | "weekly"
  | "monthly"
  | "yearly"
  | "yoy";

function normalizeRange(range: string | null): DashboardRange {
  if (
    range === "this_week" ||
    range === "last_week" ||
    range === "weekly" ||
    range === "monthly" ||
    range === "yearly" ||
    range === "yoy"
  ) {
    return range;
  }
  return "this_week";
}

function buildRangeConfig(range: DashboardRange) {
  switch (range) {
    case "last_week":
      return {
        bucketExpr: sql`DATE_TRUNC('day', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('day', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'Dy')`,
        whereExpr: sql`
          ordered_at >= ((DATE_TRUNC('week', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '7 days') AT TIME ZONE 'Asia/Jakarta')
          AND ordered_at < (DATE_TRUNC('week', NOW() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
    case "weekly":
      return {
        bucketExpr: sql`DATE_TRUNC('week', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('week', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'DD Mon')`,
        whereExpr: sql`
          ordered_at >= ((DATE_TRUNC('week', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '7 weeks') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
    case "monthly":
      return {
        bucketExpr: sql`DATE_TRUNC('month', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('month', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'Mon YY')`,
        whereExpr: sql`
          ordered_at >= ((DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '11 months') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
    case "yearly":
      return {
        bucketExpr: sql`DATE_TRUNC('year', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('year', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'YYYY')`,
        whereExpr: sql`
          ordered_at >= ((DATE_TRUNC('year', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '4 years') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
    case "yoy":
      return {
        bucketExpr: sql`DATE_TRUNC('month', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('month', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'Mon YY')`,
        whereExpr: sql`
          ordered_at >= ((DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '23 months') AT TIME ZONE 'Asia/Jakarta')
          AND ordered_at < ((DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '11 months') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
    case "this_week":
    default:
      return {
        bucketExpr: sql`DATE_TRUNC('day', ordered_at AT TIME ZONE 'Asia/Jakarta')`,
        labelExpr: sql`TO_CHAR(DATE_TRUNC('day', ordered_at AT TIME ZONE 'Asia/Jakarta'), 'Dy')`,
        whereExpr: sql`
          ordered_at >= (DATE_TRUNC('week', NOW() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta')
        `,
        orderExpr: sql`1 ASC`,
      };
  }
}

function toDateKey(value: unknown): string {
  return String(value).slice(0, 10);
}

function fillDailyPointsIfNeeded(
  range: DashboardRange,
  rows: Array<Record<string, unknown>>
) {
  if (range !== "this_week" && range !== "last_week") {
    return rows.map((row) => ({
      date: toDateKey(row.bucket),
      label: String(row.label),
      revenue: Number(row.revenue),
      orderCount: Number(row.order_count),
    }));
  }

  // Query groups by truncated day (`bucket`), so each date key is unique.
  const map = new Map(
    rows.map((row) => [
      toDateKey(row.bucket),
      {
        label: String(row.label),
        revenue: Number(row.revenue),
        orderCount: Number(row.order_count),
      },
    ])
  );

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 = Sunday
  const offsetToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - offsetToMonday);
  if (range === "last_week") {
    start.setDate(start.getDate() - 7);
  }

  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const points: Array<{ date: string; label: string; revenue: number; orderCount: number }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const found = map.get(key);
    points.push({
      date: key,
      label: found?.label || labels[i],
      revenue: found?.revenue || 0,
      orderCount: found?.orderCount || 0,
    });
  }
  return points;
}

// GET /api/admin/dashboard — aggregated stats for dashboard charts
const getHandler = async (request: NextRequest) => {
  try {
    const range = normalizeRange(request.nextUrl.searchParams.get("range"));
    const config = buildRangeConfig(range);

    const revenueRows = await db.execute(sql`
      SELECT
        ${config.bucketExpr} AS bucket,
        ${config.labelExpr} AS label,
        SUM(total_amount)::numeric AS revenue,
        COUNT(*)::int AS order_count
      FROM sales_orders
      WHERE ${config.whereExpr}
        AND status NOT IN ('CANCELLED', 'DRAFT')
      GROUP BY 1
      ORDER BY ${config.orderExpr}
    `);

    // Keep status distribution aligned with selected date range for donut chart context.
    const statusRows = await db.execute(sql`
      SELECT status, COUNT(*)::int AS count
      FROM sales_orders
      WHERE ${config.whereExpr}
      GROUP BY status
      ORDER BY status ASC
    `);

    const revenuePoints = fillDailyPointsIfNeeded(
      range,
      revenueRows as Array<Record<string, unknown>>
    );

    const statusSummary = statusRows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        status: row.status as string,
        count: Number(row.count),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        range,
        revenue: revenuePoints,
        ordersByStatus: statusSummary,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to load stats" }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);
