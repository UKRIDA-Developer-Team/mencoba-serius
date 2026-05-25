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
    size: string;
    price: number;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (slug: string) => void;
    updateQuantity: (slug: string, quantity: number) => void;
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
            const existing = prev.find((entry) => entry.slug === item.slug);
            if (existing) {
                return prev.map((entry) =>
                    entry.slug === item.slug
                        ? { ...entry, quantity: entry.quantity + quantity }
                        : entry
                );
            }
            return [...prev, { ...item, quantity }];
        });
    }, []);

    const removeItem = useCallback((slug: string) => {
        setItems((prev) => prev.filter((entry) => entry.slug !== slug));
    }, []);

    const updateQuantity = useCallback((slug: string, quantity: number) => {
        setItems((prev) =>
            prev
                .map((entry) =>
                    entry.slug === slug
                        ? { ...entry, quantity: Math.max(0, Math.floor(quantity)) }
                        : entry
                )
                .filter((entry) => entry.quantity > 0)
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
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
            clearCart,
        }),
        [items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart]
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
