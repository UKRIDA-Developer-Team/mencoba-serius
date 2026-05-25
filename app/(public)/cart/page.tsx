"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/guest/components/cart/CartProvider";

export default function CartPage() {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
    const estimatedDeliveryFee = totalItems > 0 ? 25000 : 0;
    const grandTotal = totalPrice + estimatedDeliveryFee;

    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Your Cart</h1>
                <p className="text-sm text-foreground/70 mt-1">
                    Review quantity and total before confirming your order.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm text-foreground/70 mt-1 mb-4">
                        Explore the catalog and add cakes you want to order.
                    </p>
                    <Link
                        href="/catalog"
                        className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center"
                    >
                        Browse Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <article
                                key={item.slug}
                                className="bg-card border border-border rounded-xl p-3 sm:p-4 flex gap-3"
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
                                                className="size-8 rounded-lg border border-border"
                                                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                                                aria-label={`Decrease ${item.name} quantity`}
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                type="button"
                                                className="size-8 rounded-lg border border-border"
                                                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                                aria-label={`Increase ${item.name} quantity`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-xs text-destructive hover:underline"
                                            onClick={() => removeItem(item.slug)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

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

                        <Button className="w-full h-10">Proceed to Checkout</Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/catalog"
                                className="h-9 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center"
                            >
                                Add More
                            </Link>
                            <button
                                type="button"
                                onClick={clearCart}
                                className="h-9 rounded-lg border border-destructive/40 text-destructive text-sm font-medium"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}
