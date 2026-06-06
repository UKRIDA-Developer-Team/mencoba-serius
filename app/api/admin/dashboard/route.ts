import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";
import { getAdminIngredients, getAdminProducts } from "@/lib/data/admin";

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
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d.getTime()) ? s.slice(0, 10) : d.toISOString().slice(0, 10);
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

  // Gunakan waktu Jakarta (UTC+7) agar konsisten dengan database
  const JAKARTA_OFFSET = 7 * 60 * 60 * 1000;
  const nowJakarta = new Date(Date.now() + JAKARTA_OFFSET);
  const jakartaDay = nowJakarta.getUTCDay(); // 0=Sun, 6=Sat
  const offsetToMonday = jakartaDay === 0 ? 6 : jakartaDay - 1;

  // Start = Senin minggu ini dalam waktu Jakarta
  const mondayJakarta = new Date(nowJakarta);
  mondayJakarta.setUTCDate(nowJakarta.getUTCDate() - offsetToMonday);

  if (range === "last_week") {
    mondayJakarta.setUTCDate(mondayJakarta.getUTCDate() - 7);
  }

  // Buat map dari data SQL menggunakan tanggal Jakarta
  const map = new Map(
    rows.map((row) => {
      const bucket = row.bucket;
      let key: string;
      if (bucket instanceof Date) {
        // Convert UTC Date ke tanggal Jakarta
        const jakartaDate = new Date(bucket.getTime() + JAKARTA_OFFSET);
        key = jakartaDate.toISOString().slice(0, 10);
      } else {
        key = String(bucket).slice(0, 10);
      }
      return [key, {
        revenue: Number(row.revenue),
        orderCount: Number(row.order_count),
      }];
    })
  );

  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const points = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayJakarta);
    d.setUTCDate(mondayJakarta.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const found = map.get(key);
    points.push({
      date: key,
      label: labels[i],
      revenue: found?.revenue ?? 0,
      orderCount: found?.orderCount ?? 0,
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

    const [ingredients, products] = await Promise.all([
      getAdminIngredients(),
      getAdminProducts(),
    ]);

    const lowStockItems = ingredients
      .filter((i) => i.currentStockBaseQty < i.reorderLevelBaseQty)
      .sort((a, b) => a.currentStockBaseQty - b.currentStockBaseQty);

    const inventoryStats = {
      totalProducts: products.filter((p) => p.isActive).length,
      totalIngredients: ingredients.length,
      totalLowStock: lowStockItems.length,
      totalPreorderOnly: products.filter((p) => p.isPreorderOnly && p.isActive).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        range,
        revenue: revenuePoints,
        ordersByStatus: statusSummary,
        inventoryStats,
        lowStockItems,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to load stats" }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);
