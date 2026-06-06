"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/guest/components/cart/CartProvider";
import VariantPickerModal, { type VariantOption } from "./VariantPickerModal";

type AddToCartButtonProps = {
    item: Omit<CartItem, "quantity">;
    className?: string;
    label?: string;
    variants?: VariantOption[];
};

export default function AddToCartButton({
    item,
    className,
    label = "Add to Cart",
    variants,
}: AddToCartButtonProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const [showVariantPicker, setShowVariantPicker] = useState(false);

    const hasVariants = variants && variants.length > 0;

    const handleClick = () => {
        if (hasVariants) {
            setShowVariantPicker(true);
            return;
        }
        addItem({ ...item, hasVariants: false }, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
    };

    return (
        <>
            <Button
                className={className}
                onClick={handleClick}
            >
                {added ? "Added ✓" : label}
            </Button>

            {hasVariants && (
                <VariantPickerModal
                    open={showVariantPicker}
                    onClose={() => setShowVariantPicker(false)}
                    product={{
                        slug: item.slug,
                        name: item.name,
                        image: item.image,
                        category: item.category,
                        size: item.size,
                        price: item.price,
                    }}
                    variants={variants}
                />
            )}
        </>
    );
}
