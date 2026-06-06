import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createGuestOrder } from "@/lib/data/checkout";

const CheckoutItemSchema = z.object({
    slug: z.string(),
    name: z.string(),
    size: z.string().optional().nullable(),
    price: z.coerce.number().min(0),
    quantity: z.coerce.number().int().min(1),
    variantId: z.any().nullable().optional(),
    variantLabel: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

const PersonalDetailsSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email().optional().or(z.literal("")).nullable(),
    address: z.string().min(1, "Delivery address is required"),
    notes: z.string().optional().or(z.literal("")).nullable(),
});

const CheckoutSchema = z.object({
    items: z.array(CheckoutItemSchema).min(1, "At least one item is required"),
    personalDetails: PersonalDetailsSchema,
    paymentMethod: z.enum(["whatsapp", "bank_transfer", "cod"]),
    subtotal: z.coerce.number().min(0),
    deliveryFee: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CheckoutSchema.parse(body);

        const result = await createGuestOrder({
            ...parsed,
            personalDetails: {
                ...parsed.personalDetails,
                email: parsed.personalDetails.email || "",
                notes: parsed.personalDetails.notes || "",
            },
        });

        if (!result.success) {
            return Response.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        revalidateTag("products", "max");

        return Response.json({
            success: true,
            data: {
                orderId: result.orderId,
                orderNumber: result.orderNumber,
            },
            message: "Order placed successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        console.error("Checkout error:", error);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
