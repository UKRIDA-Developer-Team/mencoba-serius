"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/guest/components/cart/CartProvider";
import { useCheckout } from "@/features/guest/components/cart/CheckoutProvider";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";

export default function CartReviewStep() {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
    const { nextStep } = useCheckout();
    const estimatedDeliveryFee = totalItems > 0 ? 25000 : 0;
    const grandTotal = totalPrice + estimatedDeliveryFee;

    return (
        <div className="space-y-5 animate-step-in">
            <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
                {/* Cart items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-foreground/70">
                            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                        </p>
                        <button
                            type="button"
                            onClick={clearCart}
                            className="inline-flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                        >
                            <Trash2 className="size-3.5" />
                            Clear All
                        </button>
                    </div>

                    {items.map((item) => {
                        const itemKey = `${item.slug}-${item.variantId ?? 'base'}`;
                        return (
                        <article
                            key={itemKey}
                            className="bg-card border border-border rounded-xl p-3 sm:p-4 flex gap-3 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(61,26,26,0.08)]"
                        >
                            <div className="relative size-20 shrink-0 rounded-lg bg-background overflow-hidden">
                                <Image src={item.image} alt={item.name} fill className="object-contain" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Link href={`/catalog/${item.slug}`} className="font-semibold text-primary hover:underline">
                                    {item.name}
                                </Link>
                                <p className="text-xs text-foreground/70 mt-1">
                                    {item.category} • {item.size}
                                    {item.variantLabel && (
                                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                                            {item.variantLabel}
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm font-semibold mt-2">
                                    {item.price.toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                    })}
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="size-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center"
                                            onClick={() => updateQuantity(item.slug, item.quantity - 1, item.variantId)}
                                            aria-label={`Decrease ${item.name} quantity`}
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            type="button"
                                            className="size-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center"
                                            onClick={() => updateQuantity(item.slug, item.quantity + 1, item.variantId)}
                                            aria-label={`Increase ${item.name} quantity`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-xs text-destructive hover:underline"
                                        onClick={() => removeItem(item.slug, item.variantId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </article>
                        );
                    })}

                    <Link
                        href="/catalog"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        <ShoppingBag className="size-4" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Order summary */}
                <aside className="bg-card border border-border rounded-xl p-4 space-y-3 sticky top-20">
                    <h2 className="font-semibold text-primary">Order Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Items ({totalItems})</span>
                            <span>
                                {totalPrice.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated delivery</span>
                            <span>
                                {estimatedDeliveryFee.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>
                                {grandTotal.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-10 gap-2"
                        onClick={nextStep}
                        disabled={items.length === 0}
                    >
                        Continue to Details
                        <ArrowRight className="size-4" />
                    </Button>
                </aside>
            </div>
        </div>
    );
}
