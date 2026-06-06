"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type CartItem = {
    slug: string;
    name: string;
    image: string;
    category: string;
    size?: string;
    price: number;
    quantity: number;
    variantId?: number;
    variantLabel?: string;
    notes?: string;
    hasVariants?: boolean;
};

type CartContextValue = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (slug: string, variantId?: number) => void;
    updateQuantity: (slug: string, quantity: number, variantId?: number) => void;
    updateItemNotes: (slug: string, notes: string, variantId?: number) => void;
    updateItemVariant: (slug: string, oldVariantId: number | undefined, newVariantId: number, newVariantLabel: string, newPrice: number) => void;
    clearCart: () => void;
};

const CART_STORAGE_KEY = "chef-on-pointe-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as CartItem[];
                setItems(Array.isArray(parsed) ? parsed : []);
            }
        } catch {
            setItems([]);
        } finally {
            setHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items, hydrated]);

    const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find(
                (entry) => entry.slug === item.slug && entry.variantId === item.variantId
            );
            if (existing) {
                return prev.map((entry) =>
                    entry.slug === item.slug && entry.variantId === item.variantId
                        ? { ...entry, quantity: entry.quantity + quantity }
                        : entry
                );
            }
            return [...prev, { ...item, quantity }];
        });
    }, []);

    const removeItem = useCallback((slug: string, variantId?: number) => {
        setItems((prev) => prev.filter(
            (entry) => !(entry.slug === slug && entry.variantId === variantId)
        ));
    }, []);

    const updateQuantity = useCallback((slug: string, quantity: number, variantId?: number) => {
        setItems((prev) =>
            prev
                .map((entry) =>
                    entry.slug === slug && entry.variantId === variantId
                        ? { ...entry, quantity: Math.max(0, Math.floor(quantity)) }
                        : entry
                )
                .filter((entry) => entry.quantity > 0)
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const updateItemNotes = useCallback((slug: string, notes: string, variantId?: number) => {
        setItems((prev) =>
            prev.map((entry) =>
                entry.slug === slug && entry.variantId === variantId
                    ? { ...entry, notes }
                    : entry
            )
        );
    }, []);

    const updateItemVariant = useCallback((
        slug: string,
        oldVariantId: number | undefined,
        newVariantId: number,
        newVariantLabel: string,
        newPrice: number
    ) => {
        setItems((prev) => {
            const existing = prev.find(
                (entry) => entry.slug === slug && entry.variantId === newVariantId
            );
            if (existing) {
                return prev
                    .map((entry) =>
                        entry.slug === slug && entry.variantId === newVariantId
                            ? { ...entry, quantity: entry.quantity + 1 }
                            : entry
                    )
                    .filter((entry) => !(entry.slug === slug && entry.variantId === oldVariantId));
            }
            return prev.map((entry) =>
                entry.slug === slug && entry.variantId === oldVariantId
                    ? { ...entry, variantId: newVariantId, variantLabel: newVariantLabel, price: newPrice }
                    : entry
            );
        });
    }, []);

    const totalItems = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity, 0),
        [items]
    );

    const totalPrice = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity * item.price, 0),
        [items]
    );

    const value = useMemo(
        () => ({
            items,
            totalItems,
            totalPrice,
            addItem,
            removeItem,
            updateQuantity,
            updateItemNotes,
            updateItemVariant,
            clearCart,
        }),
        [items, totalItems, totalPrice, addItem, removeItem, updateQuantity, updateItemNotes, updateItemVariant, clearCart]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
}
