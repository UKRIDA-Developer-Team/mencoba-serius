"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/features/guest/components/cart/CheckoutProvider";
import { ArrowLeft, ArrowRight, User, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

type FieldErrors = {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
};

export default function PersonalDetailsStep() {
    const { personalDetails, setPersonalDetails, nextStep, prevStep } = useCheckout();
    const [form, setForm] = useState(personalDetails);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const updateField = useCallback(
        (field: keyof typeof form, value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
            if (errors[field as keyof FieldErrors]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field as keyof FieldErrors];
                    return next;
                });
            }
        },
        [errors]
    );

    const handleBlur = useCallback((field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: FieldErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[\d\s+\-()]{8,}$/.test(form.phone.trim())) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!form.address.trim()) {
            newErrors.address = "Delivery address is required";
        }

        setErrors(newErrors);
        setTouched({ fullName: true, phone: true, address: true, email: true });
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleContinue = useCallback(() => {
        if (validate()) {
            setPersonalDetails(form);
            nextStep();
        }
    }, [validate, setPersonalDetails, form, nextStep]);

    return (
        <div className="animate-step-in max-w-screen">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-5">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Personal Details</h2>
                    <p className="text-sm text-foreground/70 mt-0.5">
                        We need your details to process and deliver your order.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="checkout-fullname"
                            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
                        >
                            Full Name <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="checkout-fullname"
                                type="text"
                                value={form.fullName}
                                onChange={(e) => updateField("fullName", e.target.value)}
                                onBlur={() => handleBlur("fullName")}
                                placeholder="Enter your full name"
                                className={`
                                    w-full h-11 pl-10 pr-4 rounded-xl bg-input text-sm
                                    border transition-all duration-200 outline-none
                                    placeholder:text-[#B0A499]
                                    focus:border-accent focus:ring-2 focus:ring-accent/30
                                    ${touched.fullName && errors.fullName
                                        ? "border-destructive ring-2 ring-destructive/20"
                                        : "border-border"
                                    }
                                `}
                            />
                        </div>
                        {touched.fullName && errors.fullName && (
                            <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="checkout-phone"
                            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
                        >
                            Phone Number <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="checkout-phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                onBlur={() => handleBlur("phone")}
                                placeholder="e.g. +62 812 3456 7890"
                                className={`
                                    w-full h-11 pl-10 pr-4 rounded-xl bg-input text-sm
                                    border transition-all duration-200 outline-none
                                    placeholder:text-[#B0A499]
                                    focus:border-accent focus:ring-2 focus:ring-accent/30
                                    ${touched.phone && errors.phone
                                        ? "border-destructive ring-2 ring-destructive/20"
                                        : "border-border"
                                    }
                                `}
                            />
                        </div>
                        {touched.phone && errors.phone && (
                            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="checkout-email"
                            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
                        >
                            Email <span className="text-muted-foreground text-[10px] normal-case tracking-normal">(optional)</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="checkout-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                onBlur={() => handleBlur("email")}
                                placeholder="you@example.com"
                                className={`
                                    w-full h-11 pl-10 pr-4 rounded-xl bg-input text-sm
                                    border transition-all duration-200 outline-none
                                    placeholder:text-[#B0A499]
                                    focus:border-accent focus:ring-2 focus:ring-accent/30
                                    ${touched.email && errors.email
                                        ? "border-destructive ring-2 ring-destructive/20"
                                        : "border-border"
                                    }
                                `}
                            />
                        </div>
                        {touched.email && errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="checkout-address"
                            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
                        >
                            Delivery Address <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                            <textarea
                                id="checkout-address"
                                value={form.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                onBlur={() => handleBlur("address")}
                                placeholder="Full delivery address"
                                rows={3}
                                className={`
                                    w-full pl-10 pr-4 py-3 rounded-xl bg-input text-sm resize-none
                                    border transition-all duration-200 outline-none
                                    placeholder:text-[#B0A499]
                                    focus:border-accent focus:ring-2 focus:ring-accent/30
                                    ${touched.address && errors.address
                                        ? "border-destructive ring-2 ring-destructive/20"
                                        : "border-border"
                                    }
                                `}
                            />
                        </div>
                        {touched.address && errors.address && (
                            <p className="text-xs text-destructive mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="checkout-notes"
                            className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
                        >
                            Order Notes <span className="text-muted-foreground text-[10px] normal-case tracking-normal">(optional)</span>
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                            <textarea
                                id="checkout-notes"
                                value={form.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Special requests, dietary notes, delivery instructions..."
                                rows={2}
                                className="
                                    w-full pl-10 pr-4 py-3 rounded-xl bg-input text-sm resize-none
                                    border border-border transition-all duration-200 outline-none
                                    placeholder:text-[#B0A499]
                                    focus:border-accent focus:ring-2 focus:ring-accent/30
                                "
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
                <Button variant="outline" onClick={prevStep} className="h-10 gap-2 px-4">
                    <ArrowLeft className="size-4" />
                    Back to Cart
                </Button>
                <Button onClick={handleContinue} className="h-10 gap-2 px-5">
                    Choose Payment
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
