import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ingredientStockMovements,
  measurementUnits,
  purchaseOrderItems,
  purchaseOrders,
} from "@/lib/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { withAdminAuth } from "@/lib/auth/middleware";

const getHandler = async (
  request: NextRequest,
  payload: any,
  context: { params: { id: string } }
) => {
  try {
    // Await params if Next 15+
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID bahan tidak valid" },
        { status: 400 }
      );
    }

    const ingredientId = BigInt(id);

    // 1. Get stock movements (OUT, ADJUSTMENT, etc)
    const movements = await db
      .select({
        id: ingredientStockMovements.id,
        movementType: ingredientStockMovements.movementType,
        quantity: ingredientStockMovements.quantity,
        unitCode: measurementUnits.code,
        referenceType: ingredientStockMovements.referenceType,
        referenceId: ingredientStockMovements.referenceId,
        notes: ingredientStockMovements.notes,
        createdAt: ingredientStockMovements.createdAt,
      })
      .from(ingredientStockMovements)
      .leftJoin(measurementUnits, eq(ingredientStockMovements.unitId, measurementUnits.id))
      .where(eq(ingredientStockMovements.ingredientId, ingredientId));

    // 2. Get purchases (IN)
    const purchases = await db
      .select({
        id: purchaseOrderItems.id,
        quantity: purchaseOrderItems.quantity,
        unitCode: measurementUnits.code,
        poNumber: purchaseOrders.poNumber,
        notes: purchaseOrderItems.notes,
        receivedAt: purchaseOrders.receivedAt,
      })
      .from(purchaseOrderItems)
      .innerJoin(purchaseOrders, eq(purchaseOrderItems.purchaseOrderId, purchaseOrders.id))
      .leftJoin(measurementUnits, eq(purchaseOrderItems.unitId, measurementUnits.id))
      .where(
        eq(purchaseOrderItems.ingredientId, ingredientId)
      );
      // We'll filter RECEIVED / PARTIALLY_RECEIVED in memory or by adding where clause.
      // Since drizzle supports multiple wheres, let's just fetch all and filter in memory for safety against type errors with enums.

    // Map movements
    let allMovements: any[] = movements.map(m => ({
      id: `mov-${m.id.toString()}`,
      movementType: m.movementType,
      quantity: `${m.movementType === 'OUT' ? '-' : ''}${Number(m.quantity)} ${m.unitCode || ''}`,
      referenceType: m.referenceType,
      referenceId: m.referenceId?.toString(),
      notes: m.notes,
      createdAt: m.createdAt,
    }));

    // Map purchases
    const validPurchases = purchases.filter(p => p.receivedAt != null);
    
    validPurchases.forEach(p => {
      allMovements.push({
        id: `po-${p.id.toString()}`,
        movementType: 'IN', // We represent purchase as IN
        quantity: `${Number(p.quantity)} ${p.unitCode || ''}`,
        referenceType: 'PURCHASE_ORDER',
        referenceId: p.poNumber,
        notes: p.notes || `Pembelian ${p.poNumber}`,
        createdAt: p.receivedAt,
      });
    });

    // Sort descending
    allMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(
      {
        success: true,
        data: {
          movements: allMovements.slice(0, 100),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching ingredient usage:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data penggunaan" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
