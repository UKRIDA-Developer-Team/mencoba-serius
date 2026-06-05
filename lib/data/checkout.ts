import { db } from "@/lib/db";
import {
    customers,
    salesOrders,
    salesOrderItems,
    payments,
    products,
} from "@/lib/schema";
import { eq } from "drizzle-orm";

type CheckoutItem = {
    slug: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    variantId?: number;
};

type CheckoutPayload = {
    items: CheckoutItem[];
    personalDetails: {
        fullName: string;
        phone: string;
        email: string;
        address: string;
        notes: string;
    };
    paymentMethod: "whatsapp" | "bank_transfer" | "cod";
    subtotal: number;
    deliveryFee: number;
    total: number;
};

type CheckoutResult = {
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    error?: string;
};

function generateOrderNumber(): string {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `COP-${datePart}-${randomPart}`;
}

function mapPaymentMethod(
    method: "whatsapp" | "bank_transfer" | "cod"
): "CASH" | "BANK_TRANSFER" | "E_WALLET" {
    switch (method) {
        case "cod":
            return "CASH";
        case "bank_transfer":
            return "BANK_TRANSFER";
        case "whatsapp":
            return "CASH";
    }
}

export async function createGuestOrder(
    payload: CheckoutPayload
): Promise<CheckoutResult> {
    try {
        const orderNumber = generateOrderNumber();

        // 1. Find or create customer
        let customerId: bigint;

        const existingCustomer = await db
            .select({ id: customers.id })
            .from(customers)
            .where(eq(customers.phone, payload.personalDetails.phone))
            .limit(1)
            .execute();

        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
            // Update customer info if needed
            await db
                .update(customers)
                .set({
                    fullName: payload.personalDetails.fullName,
                    email: payload.personalDetails.email || null,
                    notes: payload.personalDetails.address,
                })
                .where(eq(customers.id, customerId))
                .execute();
        } else {
            const newCustomer = await db
                .insert(customers)
                .values({
                    fullName: payload.personalDetails.fullName,
                    phone: payload.personalDetails.phone,
                    email: payload.personalDetails.email || null,
                    notes: payload.personalDetails.address,
                })
                .returning({ id: customers.id })
                .execute();

            if (newCustomer.length === 0) {
                throw new Error("Failed to create customer");
            }
            customerId = newCustomer[0].id;
        }

        // 2. Create sales order
        const newOrder = await db
            .insert(salesOrders)
            .values({
                orderNumber,
                customerId,
                orderType: "WALK_IN",
                status: "CONFIRMED",
                subtotalAmount: payload.subtotal.toString(),
                discountAmount: "0",
                taxAmount: "0",
                totalAmount: payload.total.toString(),
                notes: [
                    payload.personalDetails.address,
                    payload.personalDetails.notes,
                ]
                    .filter(Boolean)
                    .join(" | "),
            })
            .returning({ id: salesOrders.id })
            .execute();

        if (newOrder.length === 0) {
            throw new Error("Failed to create sales order");
        }

        const salesOrderId = newOrder[0].id;

        // 3. Create sales order items
        for (const item of payload.items) {
            // Get product ID from slug
            const productResult = await db
                .select({ id: products.id })
                .from(products)
                .where(eq(products.slug, item.slug))
                .limit(1)
                .execute();

            const productId =
                productResult.length > 0 ? productResult[0].id : undefined;

            await db
                .insert(salesOrderItems)
                .values({
                    salesOrderId,
                    productId,
                    itemNameSnapshot: `${item.name} (${item.size})`,
                    quantity: item.quantity.toString(),
                    unitPrice: item.price.toString(),
                })
                .execute();
        }

        // 4. Create payment record
        await db
            .insert(payments)
            .values({
                salesOrderId,
                method: mapPaymentMethod(payload.paymentMethod),
                status:
                    payload.paymentMethod === "cod" ? "PENDING" : "PENDING",
                amount: payload.total.toString(),
            })
            .execute();

        return {
            success: true,
            orderId: String(salesOrderId),
            orderNumber,
        };
    } catch (error) {
        console.error("Failed to create guest order:", error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
