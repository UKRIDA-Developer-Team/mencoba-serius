"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/guest/components/cart/CartProvider";
import { Check, ShoppingCart } from "lucide-react";

export type VariantOption = {
    id: number;
    label: string;
    priceOverride: number | null;
};

type ProductActionsProps = {
    product: {
        slug: string;
        name: string;
        image: string;
        category: string;
        size: string;
        price: number;
    };
    variants: VariantOption[];
};

export default function ProductActions({ product, variants }: ProductActionsProps) {
    const { addItem } = useCart();
    const hasVariants = variants.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(
        hasVariants ? variants[0] : null
    );
    const [added, setAdded] = useState(false);

    const finalPrice = selectedVariant?.priceOverride ?? product.price;

    const handleAddToCart = () => {
        const item: Omit<CartItem, "quantity"> = {
            slug: product.slug,
            name: product.name,
            image: product.image,
            category: product.category,
            size: product.size,
            price: finalPrice,
            hasVariants,
            ...(selectedVariant && {
                variantId: selectedVariant.id,
                variantLabel: selectedVariant.label,
            }),
        };
        addItem(item, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
    };

    return (
        <>
            {/* Variant inline picker */}
            {hasVariants && (
                <div className="space-y-2.5">
                    <h2 className="text-sm font-semibold text-foreground/80">Pilih Varian</h2>
                    <div className="grid gap-2">
                        {variants.map((variant) => {
                            const isSelected = selectedVariant?.id === variant.id;
                            const price = variant.priceOverride ?? product.price;
                            const hasPriceChange =
                                variant.priceOverride !== null &&
                                variant.priceOverride !== product.price;

                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`
                                        w-full text-left px-4 py-3 rounded-xl border-2
                                        transition-all duration-200 flex items-center justify-between gap-3
                                        ${
                                            isSelected
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border hover:border-primary/30 hover:bg-background"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                                                w-4 h-4 rounded-full border-2
                                                transition-all duration-200 flex items-center justify-center
                                                ${
                                                    isSelected
                                                        ? "border-primary bg-primary"
                                                        : "border-foreground/30"
                                                }
                                            `}
                                        >
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${
                                                isSelected ? "text-primary" : ""
                                            }`}
                                        >
                                            {variant.label}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-sm whitespace-nowrap ${
                                            hasPriceChange
                                                ? "font-semibold text-chart-2"
                                                : "text-foreground/60"
                                        }`}
                                    >
                                        {price.toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto grid sm:grid-cols-2 gap-2">
                <Button
                    className="h-10 gap-2"
                    onClick={handleAddToCart}
                    disabled={hasVariants && !selectedVariant}
                >
                    {added ? (
                        <>
                            <Check className="size-4" />
                            Added ✓
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="size-4" />
                            Add to Cart
                        </>
                    )}
                </Button>
                <Link
                    href="/cart"
                    className="h-10 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center hover:bg-background transition-colors"
                >
                    Go to Cart
                </Link>
            </div>
        </>
    );
}
