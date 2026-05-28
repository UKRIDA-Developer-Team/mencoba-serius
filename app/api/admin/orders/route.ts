import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, salesOrders } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const ORDER_TYPES = ["WALK_IN", "PRE_ORDER", "CUSTOM_CAKE"] as const;
const ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

type OrderType = (typeof ORDER_TYPES)[number];
type OrderStatus = (typeof ORDER_STATUSES)[number];

const generateOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = `${now.getHours().toString().padStart(2, "0")}${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
  return `SO-${date}-${time}`;
};

const getHandler = async () => {
  try {
    const result = await db
      .select({
        id: salesOrders.id,
        orderNumber: salesOrders.orderNumber,
        orderType: salesOrders.orderType,
        status: salesOrders.status,
        totalAmount: salesOrders.totalAmount,
        orderedAt: salesOrders.orderedAt,
        customerName: customers.fullName,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .orderBy(desc(salesOrders.orderedAt));

    return NextResponse.json(
      {
        success: true,
        data: result.map((order) => ({
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          orderType: order.orderType,
          status: order.status,
          totalAmount: Number(order.totalAmount),
          orderedAt: order.orderedAt,
          customerName: order.customerName ?? "Guest",
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data order" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const orderType = body.orderType as OrderType;
    const status = (body.status as OrderStatus) ?? "CONFIRMED";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const totalAmount = Number(body.totalAmount ?? 0);
    const notes = typeof body.notes === "string" ? body.notes : null;

    if (!ORDER_TYPES.includes(orderType)) {
      return NextResponse.json(
        { success: false, message: "Tipe order tidak valid" },
        { status: 400 }
      );
    }

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status order tidak valid" },
        { status: 400 }
      );
    }

    let customerId: bigint | null = null;
    if (customerName.length > 0) {
      const existingCustomer = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.fullName, customerName))
        .limit(1);

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const insertedCustomer = await db
          .insert(customers)
          .values({ fullName: customerName })
          .returning({ id: customers.id });
        customerId = insertedCustomer[0].id;
      }
    }

    const result = await db
      .insert(salesOrders)
      .values({
        orderNumber: generateOrderNumber(),
        customerId,
        orderType,
        status,
        totalAmount: totalAmount.toString(),
        subtotalAmount: totalAmount.toString(),
        discountAmount: "0",
        taxAmount: "0",
        notes,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Order berhasil dibuat",
        data: {
          id: result[0].id.toString(),
          orderNumber: result[0].orderNumber,
          orderType: result[0].orderType,
          status: result[0].status,
          totalAmount: Number(result[0].totalAmount),
          orderedAt: result[0].orderedAt,
          customerName: customerName || "Guest",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat order" },
      { status: 500 }
    );
  }
};

const patchHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const id = body.id as string;
    const status = body.status as OrderStatus;

    if (!id || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Field wajib: id, status valid" },
        { status: 400 }
      );
    }

    const result = await db
      .update(salesOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(salesOrders.id, BigInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status order berhasil diperbarui",
        data: {
          id: result[0].id.toString(),
          status: result[0].status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui order" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
export const PATCH = withAdminAuth(patchHandler);
