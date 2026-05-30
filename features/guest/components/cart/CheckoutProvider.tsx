"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type PersonalDetails = {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
};

export type PaymentMethod = "whatsapp" | "bank_transfer" | "cod" | null;

export type CheckoutStep = 1 | 2 | 3 | 4;

type CheckoutContextValue = {
    currentStep: CheckoutStep;
    completedSteps: Set<CheckoutStep>;
    personalDetails: PersonalDetails;
    paymentMethod: PaymentMethod;
    setPersonalDetails: (details: PersonalDetails) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: CheckoutStep) => void;
    canAdvance: boolean;
    direction: "forward" | "backward";
    resetCheckout: () => void;
};

const INITIAL_PERSONAL_DETAILS: PersonalDetails = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
};

const STEP_LABELS: Record<CheckoutStep, string> = {
    1: "Cart Review",
    2: "Personal Details",
    3: "Payment Method",
    4: "Confirmation",
};

export { STEP_LABELS };

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(
        new Set()
    );
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(
        INITIAL_PERSONAL_DETAILS
    );
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [direction, setDirection] = useState<"forward" | "backward">(
        "forward"
    );

    const canAdvance = useMemo(() => {
        switch (currentStep) {
            case 1:
                // Cart validation is handled by the cart provider (items.length > 0)
                return true;
            case 2:
                return (
                    personalDetails.fullName.trim().length > 0 &&
                    personalDetails.phone.trim().length > 0 &&
                    personalDetails.address.trim().length > 0
                );
            case 3:
                return paymentMethod !== null;
            case 4:
                return true;
            default:
                return false;
        }
    }, [currentStep, personalDetails, paymentMethod]);

    const nextStep = useCallback(() => {
        setCurrentStep((prev) => {
            if (prev >= 4) return prev;
            setDirection("forward");
            setCompletedSteps((completed) => {
                const next = new Set(completed);
                next.add(prev);
                return next;
            });
            return (prev + 1) as CheckoutStep;
        });
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => {
            if (prev <= 1) return prev;
            setDirection("backward");
            return (prev - 1) as CheckoutStep;
        });
    }, []);

    const goToStep = useCallback(
        (step: CheckoutStep) => {
            // Can only jump to completed steps or the current step
            if (step < currentStep || completedSteps.has(step)) {
                setDirection(step < currentStep ? "backward" : "forward");
                setCurrentStep(step);
            }
        },
        [currentStep, completedSteps]
    );

    const resetCheckout = useCallback(() => {
        setCurrentStep(1);
        setCompletedSteps(new Set());
        setPersonalDetails(INITIAL_PERSONAL_DETAILS);
        setPaymentMethod(null);
        setDirection("forward");
    }, []);

    const value = useMemo(
        () => ({
            currentStep,
            completedSteps,
            personalDetails,
            paymentMethod,
            setPersonalDetails,
            setPaymentMethod,
            nextStep,
            prevStep,
            goToStep,
            canAdvance,
            direction,
            resetCheckout,
        }),
        [
            currentStep,
            completedSteps,
            personalDetails,
            paymentMethod,
            nextStep,
            prevStep,
            goToStep,
            canAdvance,
            direction,
            resetCheckout,
        ]
    );

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckout must be used inside CheckoutProvider");
    }
    return context;
}
