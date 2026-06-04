"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCart, type CartItem } from "@/features/guest/components/cart/CartProvider";

export type VariantOption = {
    id: number;
    label: string;
    priceOverride: number | null;
};

type VariantPickerModalProps = {
    open: boolean;
    onClose: () => void;
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

export default function VariantPickerModal({
    open,
    onClose,
    product,
    variants,
}: VariantPickerModalProps) {
    const { addItem } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null);
    const [added, setAdded] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
            setSelectedVariant(null);
            setAdded(false);
        } else {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => onClose();
        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [onClose]);

    const finalPrice = selectedVariant?.priceOverride ?? product.price;

    const handleAdd = () => {
        const item: Omit<CartItem, "quantity"> = {
            slug: product.slug,
            name: product.name,
            image: product.image,
            category: product.category,
            size: product.size,
            price: finalPrice,
            ...(selectedVariant && {
                variantId: selectedVariant.id,
                variantLabel: selectedVariant.label,
            }),
        };
        addItem(item, 1);
        setAdded(true);
        window.setTimeout(() => {
            setAdded(false);
            onClose();
        }, 900);
    };

    return (
        <dialog
            ref={dialogRef}
            className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 m-auto max-w-md w-[calc(100%-2rem)] rounded-2xl outline-none"
            onClick={(e) => {
                if (e.target === dialogRef.current) onClose();
            }}
        >
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-step-in">
                {/* Product header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background shrink-0">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="64px"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary text-sm truncate">
                            {product.name}
                        </h3>
                        <p className="text-xs text-foreground/60 mt-0.5">
                            Pilih varian sebelum menambahkan
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background transition-colors text-foreground/60 hover:text-foreground"
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 1l12 12M13 1L1 13" />
                        </svg>
                    </button>
                </div>

                {/* Variant options */}
                <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {variants.map((variant) => {
                        const isSelected = selectedVariant?.id === variant.id;
                        const price = variant.priceOverride ?? product.price;
                        const hasPriceChange = variant.priceOverride !== null && variant.priceOverride !== product.price;

                        return (
                            <button
                                key={variant.id}
                                type="button"
                                onClick={() => setSelectedVariant(variant)}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-3 ${
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/30 hover:bg-background"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                            isSelected
                                                ? "border-primary bg-primary"
                                                : "border-foreground/30"
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                                        {variant.label}
                                    </span>
                                </div>
                                <span className={`text-sm whitespace-nowrap ${hasPriceChange ? "font-semibold text-chart-2" : "text-foreground/60"}`}>
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

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="text-sm">
                        <span className="text-foreground/60">Total: </span>
                        <span className="font-semibold text-primary">
                            {finalPrice.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            })}
                        </span>
                    </div>
                    <button
                        type="button"
                        disabled={!selectedVariant || added}
                        onClick={handleAdd}
                        className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {added ? "Added ✓" : "Add to Cart"}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
