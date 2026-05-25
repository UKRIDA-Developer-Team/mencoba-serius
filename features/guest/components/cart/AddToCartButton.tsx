"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/guest/components/cart/CartProvider";

type AddToCartButtonProps = {
    item: Omit<CartItem, "quantity">;
    className?: string;
    label?: string;
};

export default function AddToCartButton({
    item,
    className,
    label = "Add to Cart",
}: AddToCartButtonProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    return (
        <Button
            className={className}
            onClick={() => {
                addItem(item, 1);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1400);
            }}
        >
            {added ? "Added ✓" : label}
        </Button>
    );
}
