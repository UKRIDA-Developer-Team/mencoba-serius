"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/guest/components/cart/CartProvider";
import { useCheckout } from "@/features/guest/components/cart/CheckoutProvider";
import { generateWhatsAppCheckoutLink } from "@/lib/utils/whatsapp";
import {
    ArrowLeft,
    CheckCircle2,
    Edit3,
    MessageCircle,
    Building2,
    Wallet,
    PartyPopper,
    Copy,
    Check,
    Loader2,
} from "lucide-react";

const PAYMENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    whatsapp: { label: "WhatsApp Order", icon: <MessageCircle className="size-4" /> },
    bank_transfer: { label: "Bank Transfer", icon: <Building2 className="size-4" /> },
    cod: { label: "Cash on Delivery", icon: <Wallet className="size-4" /> },
};

export default function ConfirmationStep() {
    const { items, totalItems, totalPrice, clearCart } = useCart();
    const { personalDetails, paymentMethod, prevStep, goToStep, resetCheckout, isOrderPlaced, placeOrder } = useCheckout();
    const estimatedDeliveryFee = totalItems > 0 ? 25000 : 0;
    const grandTotal = totalPrice + estimatedDeliveryFee;
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [savedGrandTotal, setSavedGrandTotal] = useState<number>(0);
    const [bankCopied, setBankCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    personalDetails,
                    paymentMethod,
                    subtotal: totalPrice,
                    deliveryFee: estimatedDeliveryFee,
                    total: grandTotal,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Checkout validation details:", data.details);
                throw new Error(data.details ? "Validation error: " + JSON.stringify(data.details) : data.error || "Failed to place order");
            }

            setOrderNumber(data.data.orderNumber);
            setSavedGrandTotal(grandTotal);

            if (paymentMethod === "whatsapp") {
                const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "62812345678";
                const link = generateWhatsAppCheckoutLink(items, grandTotal, whatsappNumber);
                window.open(link, "_blank");
            }

            placeOrder();
            clearCart();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyBank = () => {
        navigator.clipboard.writeText("BCA 1234567890 a/n Chef on Pointe");
        setBankCopied(true);
        setTimeout(() => setBankCopied(false), 2000);
    };

    const handleNewOrder = () => {
        clearCart();
        resetCheckout();
    };

    // Success screen after placing the order
    if (isOrderPlaced) {
        return (
            <div className="animate-step-in max-w-lg mx-auto text-center space-y-5 py-6">
                <div className="mx-auto size-20 rounded-full bg-[#7BAE8F]/15 flex items-center justify-center">
                    <PartyPopper className="size-10 text-[#7BAE8F]" />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-primary">Order Placed!</h2>
                    {orderNumber && (
                        <p className="text-sm text-accent font-medium mt-1">
                            Order #{orderNumber}
                        </p>
                    )}
                    <p className="text-sm text-foreground/70 mt-1 max-w-sm mx-auto">
                        {paymentMethod === "whatsapp"
                            ? "Your order details have been sent via WhatsApp. We'll confirm shortly!"
                            : paymentMethod === "bank_transfer"
                                ? "Please complete your bank transfer to finalize the order."
                                : "Your order is confirmed. Please prepare the payment upon delivery."
                        }
                    </p>
                </div>

                {/* Bank transfer details */}
                {paymentMethod === "bank_transfer" && (
                    <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2 mx-auto max-w-xs">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Transfer to
                        </p>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-primary">BCA</p>
                            <p className="text-foreground/80">1234567890</p>
                            <p className="text-foreground/80">a/n Chef on Pointe</p>
                        </div>
                        <div className="pt-1">
                            <p className="text-xs text-muted-foreground">Total to transfer</p>
                            <p className="text-lg font-semibold text-primary">
                                {savedGrandTotal.toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyBank}
                            className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors mt-1"
                        >
                            {bankCopied ? (
                                <><Check className="size-3.5" /> Copied!</>
                            ) : (
                                <><Copy className="size-3.5" /> Copy account details</>
                            )}
                        </button>
                    </div>
                )}

                <Button onClick={handleNewOrder} className="h-10 px-6">
                    Start New Order
                </Button>
            </div>
        );
    }

    // Order review before placing
    return (
        <div className="animate-step-in max-w-screen space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-primary">Review Your Order</h2>
                <p className="text-sm text-foreground/70 mt-0.5">
                    Double-check everything before placing your order.
                </p>
            </div>

            {/* Order Items compact */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">
                        Items ({totalItems})
                    </h3>
                    <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        <Edit3 className="size-3" />
                        Edit
                    </button>
                </div>

                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={`${item.slug}-${item.variantId ?? "base"}`} className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 rounded-lg bg-background overflow-hidden">
                                <Image src={item.image} alt={item.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                                <p className="text-xs text-foreground/60">
                                    {item.variantLabel ? '' : <span className="ml-1">{item.size} × {item.quantity}</span>}
                                    {item.variantLabel && (
                                        <span className="ml-1">{item.variantLabel} × {item.quantity}</span>
                                    )}
                                </p>
                                {item.notes && (
                                    <p className="text-xs text-foreground/50 italic mt-0.5 truncate">{item.notes}</p>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-primary shrink-0">
                                {(item.price * item.quantity).toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                })}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-foreground/70">Subtotal</span>
                        <span>
                            {totalPrice.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-foreground/70">Delivery</span>
                        <span>
                            {estimatedDeliveryFee.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary pt-1 border-t border-border">
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
            </div>

            {/* Personal Details */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">Delivery Details</h3>
                    <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        <Edit3 className="size-3" />
                        Edit
                    </button>
                </div>
                <div className="grid gap-1 text-sm">
                    <div className="flex gap-2">
                        <span className="text-foreground/60 w-16 shrink-0">Name</span>
                        <span className="font-medium text-primary">{personalDetails.fullName}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-foreground/60 w-16 shrink-0">Phone</span>
                        <span className="font-medium text-primary">{personalDetails.phone}</span>
                    </div>
                    {personalDetails.email && (
                        <div className="flex gap-2">
                            <span className="text-foreground/60 w-16 shrink-0">Email</span>
                            <span className="font-medium text-primary">{personalDetails.email}</span>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <span className="text-foreground/60 w-16 shrink-0">Address</span>
                        <span className="font-medium text-primary">{personalDetails.address}</span>
                    </div>
                    {personalDetails.notes && (
                        <div className="flex gap-2">
                            <span className="text-foreground/60 w-16 shrink-0">Notes</span>
                            <span className="text-foreground/70 italic">{personalDetails.notes}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">Payment Method</h3>
                    <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        <Edit3 className="size-3" />
                        Change
                    </button>
                </div>
                {paymentMethod && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="size-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                            {PAYMENT_LABELS[paymentMethod].icon}
                        </div>
                        <span className="font-medium text-primary">
                            {PAYMENT_LABELS[paymentMethod].label}
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={prevStep} className="h-10 gap-2 px-4" disabled={isSubmitting}>
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
                <div className="flex flex-col items-end gap-2">
                    {error && (
                        <p className="text-xs text-destructive text-right max-w-xs">{error}</p>
                    )}
                    <Button
                        onClick={handlePlaceOrder}
                        className="h-11 gap-2 px-6 text-sm"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="size-4" />
                                Place Order
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
