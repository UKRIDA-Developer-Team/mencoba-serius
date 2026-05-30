"use client";

import { Button } from "@/components/ui/button";
import { useCheckout, type PaymentMethod } from "@/features/guest/components/cart/CheckoutProvider";
import { ArrowLeft, ArrowRight, MessageCircle, Building2, Wallet } from "lucide-react";

type PaymentOption = {
    id: PaymentMethod;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        id: "whatsapp",
        title: "WhatsApp Order",
        description: "Send your order details via WhatsApp for a personalized confirmation.",
        icon: <MessageCircle className="size-6" />,
        badge: "Recommended",
    },
    {
        id: "bank_transfer",
        title: "Bank Transfer",
        description: "Pay via bank transfer. Account details will be shared after confirmation.",
        icon: <Building2 className="size-6" />,
    },
    {
        id: "cod",
        title: "Cash on Delivery",
        description: "Pay with cash when your order arrives at your doorstep.",
        icon: <Wallet className="size-6" />,
    },
];

export default function PaymentMethodStep() {
    const { paymentMethod, setPaymentMethod, nextStep, prevStep } = useCheckout();

    return (
        <div className="animate-step-in max-w-2xl mx-auto">
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Payment Method</h2>
                    <p className="text-sm text-foreground/70 mt-0.5">
                        Choose how you&apos;d like to pay for your order.
                    </p>
                </div>

                <div className="space-y-3">
                    {PAYMENT_OPTIONS.map((option) => {
                        const isSelected = paymentMethod === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setPaymentMethod(option.id)}
                                className={`
                                    w-full text-left rounded-xl p-4 sm:p-5
                                    border-2 transition-all duration-250 ease-in-out
                                    flex items-start gap-4
                                    group relative overflow-hidden
                                    ${isSelected
                                        ? "border-accent bg-accent/5 shadow-[0_4px_12px_rgba(61,26,26,0.08)]"
                                        : "border-border bg-card hover:border-accent/40 hover:shadow-[0_2px_8px_rgba(61,26,26,0.06)]"
                                    }
                                `}
                            >
                                {/* Radio indicator */}
                                <div
                                    className={`
                                        mt-0.5 size-5 rounded-full border-2 shrink-0
                                        flex items-center justify-center transition-all duration-250
                                        ${isSelected
                                            ? "border-accent"
                                            : "border-border group-hover:border-accent/40"
                                        }
                                    `}
                                >
                                    <div
                                        className={`
                                            size-2.5 rounded-full bg-accent transition-all duration-250
                                            ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                                        `}
                                    />
                                </div>

                                {/* Icon */}
                                <div
                                    className={`
                                        size-11 rounded-xl flex items-center justify-center shrink-0
                                        transition-colors duration-250
                                        ${isSelected
                                            ? "bg-accent/15 text-accent"
                                            : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                                        }
                                    `}
                                >
                                    {option.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-primary text-sm">
                                            {option.title}
                                        </span>
                                        {option.badge && (
                                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                                                {option.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
                <Button variant="outline" onClick={prevStep} className="h-10 gap-2 px-4">
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={!paymentMethod}
                    className="h-10 gap-2 px-5"
                >
                    Review Order
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
