import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesOrders } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

// GET /api/admin/dashboard — aggregated stats for dashboard charts
const getHandler = async () => {
  try {
    // Revenue for the last 7 days
    const revenueRows = await db.execute(sql`
      SELECT
        DATE_TRUNC('day', ordered_at AT TIME ZONE 'Asia/Jakarta') AS day,
        SUM(total_amount)::numeric AS revenue,
        COUNT(*)::int AS order_count
      FROM sales_orders
      WHERE ordered_at >= NOW() - INTERVAL '7 days'
        AND status NOT IN ('CANCELLED', 'DRAFT')
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    // Order count by status
    const statusRows = await db.execute(sql`
      SELECT status, COUNT(*)::int AS count
      FROM sales_orders
      GROUP BY status
      ORDER BY status ASC
    `);

    // Fill in all 7 days even if no orders
    const last7Days: { date: string; revenue: number; orderCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = revenueRows.find(
        (r) => String((r as Record<string, unknown>).day).slice(0, 10) === dateStr
      ) as Record<string, unknown> | undefined;
      last7Days.push({
        date: dateStr,
        revenue: found ? Number(found.revenue) : 0,
        orderCount: found ? Number(found.order_count) : 0,
      });
    }

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
        revenueLast7Days: last7Days,
        ordersByStatus: statusSummary,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to load stats" }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);
