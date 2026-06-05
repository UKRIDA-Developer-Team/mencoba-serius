import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseOrders, purchaseOrderItems } from "@/lib/schema";
import { withAdminAuth } from "@/lib/auth/middleware";

const generatePONumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
  return `PO-${date}-${randomSuffix}`;
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { supplierId, items, notes } = body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid: supplierId dan items wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Create Purchase Order
    const poResult = await db
      .insert(purchaseOrders)
      .values({
        poNumber: generatePONumber(),
        supplierId: BigInt(supplierId),
        status: "RECEIVED", // Quick purchase automatically marked as received
        receivedAt: new Date(),
        notes: notes || "Direct purchase from ingredient page",
      })
      .returning();

    const poId = poResult[0].id;

    // 2. Create Purchase Order Items
    const itemsToInsert = items.map((item: any) => ({
      purchaseOrderId: poId,
      ingredientId: BigInt(item.ingredientId),
      unitId: BigInt(item.unitId),
      quantity: item.quantity.toString(),
      unitCost: item.unitCost.toString(),
      notes: item.notes || null,
    }));

    await db.insert(purchaseOrderItems).values(itemsToInsert);

    return NextResponse.json(
      {
        success: true,
        message: "Pembelian berhasil dicatat dan stok ditambahkan",
        data: { poNumber: poResult[0].poNumber },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses pembelian" },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(postHandler);
