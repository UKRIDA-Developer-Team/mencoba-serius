"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart, type CartItem } from "@/features/guest/components/cart/CartProvider";
import { useCheckout } from "@/features/guest/components/cart/CheckoutProvider";
import CartVariantPickerModal, { type VariantOption } from "@/features/guest/components/cart/CartVariantPickerModal";
import { ShoppingBag, ArrowRight, Trash2, RefreshCw, MessageSquare } from "lucide-react";

export default function CartReviewStep() {
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, updateItemNotes } = useCart();
    const { nextStep } = useCheckout();
    const estimatedDeliveryFee = totalItems > 0 ? 25000 : 0;
    const grandTotal = totalPrice + estimatedDeliveryFee;

    const [variantModal, setVariantModal] = useState<{
        open: boolean;
        item: CartItem | null;
        variants: VariantOption[];
    }>({ open: false, item: null, variants: [] });

    const [editingNotes, setEditingNotes] = useState<string | null>(null);

    const handleOpenVariantPicker = useCallback(async (item: CartItem) => {
        try {
            const res = await fetch(`/api/product/${item.slug}/variants`);
            const data = await res.json();
            if (data.success) {
                setVariantModal({
                    open: true,
                    item,
                    variants: data.data,
                });
            }
        } catch (error) {
            console.error("Failed to fetch variants:", error);
        }
    }, []);

    const handleCloseVariantPicker = useCallback(() => {
        setVariantModal({ open: false, item: null, variants: [] });
    }, []);

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
                        const itemKey = `${item.slug}-${item.variantId ?? "base"}`;
                        return (
                            <article
                                key={itemKey}
                                className="bg-card border border-border rounded-xl p-3 sm:p-4"
                            >
                                <div className="flex gap-3 min-w-0">
                                    <div className="relative size-20 shrink-0 rounded-lg bg-background overflow-hidden">
                                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link href={`/catalog/${item.slug}`} className="font-semibold text-primary hover:underline">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-foreground/70 mt-1">
                                            {item.category} {item.size}
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
                                                    -
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
                                            <div className="flex items-center gap-2">
                                                {item.hasVariants && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenVariantPicker(item)}
                                                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                                                        title="Ubah varian"
                                                    >
                                                        <RefreshCw className="size-3" />
                                                        Ubah
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="text-xs text-destructive hover:underline"
                                                    onClick={() => removeItem(item.slug, item.variantId)}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes for custom cake */}
                                <div className="mt-3 pt-3 border-t min-w-0 overflow-hidden">
                                    {editingNotes === itemKey ? (
                                        <div className="space-y-2 min-w-0">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Tambahkan catatan untuk kustomisasi kue ini. Informasi ini akan membantu kami membuat kue sesuai keinginanmu!
                                                </span>
                                            </div>
                                            <Textarea
                                                value={item.notes || ""}
                                                onChange={(e) => updateItemNotes(item.slug, e.target.value, item.variantId)}
                                                placeholder="Contoh: Tulisan 'Happy Birthday Budi', warna biru muda, hiasan bunga..."
                                                rows={2}
                                                className="text-sm overflow-hidden break-all"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setEditingNotes(null)}
                                                className="text-xs text-accent hover:text-accent/80 font-medium"
                                            >
                                                Selesai
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                          type="button"
                                          onClick={() => setEditingNotes(itemKey)}
                                          className="w-full text-left flex items-start gap-1.5 min-w-0"
                                        >
                                          <span className="flex-1 min-w-0 break-all">
                                            {item.notes || "Tambah catatan untuk kustom kue..."}
                                          </span>
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}

                    <Link
                        href="/catalog"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        <ShoppingBag className="size-4" />
                        Lanjut Belanja
                    </Link>
                </div>

                {/* Order summary */}
                <aside className="bg-card border border-border rounded-xl p-4 space-y-3 sticky top-20">
                    <h2 className="font-semibold text-primary">Ringkasan Pesanan</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Item ({totalItems})</span>
                            <span>
                                {totalPrice.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimasi pengiriman</span>
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
                        Lanjut ke Detail
                        <ArrowRight className="size-4" />
                    </Button>
                </aside>
            </div>

            {/* Variant Picker Modal */}
            {variantModal.item && (
                <CartVariantPickerModal
                    open={variantModal.open}
                    onClose={handleCloseVariantPicker}
                    item={variantModal.item}
                    variants={variantModal.variants}
                />
            )}
        </div>
    );
}
