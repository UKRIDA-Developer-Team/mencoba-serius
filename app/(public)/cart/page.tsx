"use client";

import Link from "next/link";
import { useCart } from "@/features/guest/components/cart/CartProvider";
import { CheckoutProvider, useCheckout } from "@/features/guest/components/cart/CheckoutProvider";
import CheckoutStepper from "@/features/guest/components/cart/CheckoutStepper";
import CartReviewStep from "@/features/guest/components/cart/steps/CartReviewStep";
import PersonalDetailsStep from "@/features/guest/components/cart/steps/PersonalDetailsStep";
import PaymentMethodStep from "@/features/guest/components/cart/steps/PaymentMethodStep";
import ConfirmationStep from "@/features/guest/components/cart/steps/ConfirmationStep";

function CheckoutWizard() {
    const { items } = useCart();
    const { currentStep } = useCheckout();

    if (items.length === 0 && currentStep === 1) {
        return (
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
        );
    }

    return (
        <>
            <CheckoutStepper />

            <div className="checkout-step-container">
                {currentStep === 1 && <CartReviewStep />}
                {currentStep === 2 && <PersonalDetailsStep />}
                {currentStep === 3 && <PaymentMethodStep />}
                {currentStep === 4 && <ConfirmationStep />}
            </div>
        </>
    );
}

export default function CartPage() {
    return (
        <CheckoutProvider>
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Checkout</h1>
                    <p className="text-sm text-foreground/70 mt-1">
                        Complete the steps below to place your order.
                    </p>
                </div>

                <CheckoutWizard />
            </section>
        </CheckoutProvider>
    );
}
