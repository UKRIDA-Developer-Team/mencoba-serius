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
    isOrderPlaced: boolean;
    setPersonalDetails: (details: PersonalDetails) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: CheckoutStep) => void;
    placeOrder: () => void;
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
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    // Lock browser back button after order is placed
    useEffect(() => {
        if (!isOrderPlaced) return;

        // Push a new state so the first back goes here
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            // Push state again to prevent navigation
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isOrderPlaced]);

    const canAdvance = useMemo(() => {
        if (isOrderPlaced) return false;
        switch (currentStep) {
            case 1:
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
    }, [currentStep, personalDetails, paymentMethod, isOrderPlaced]);

    const nextStep = useCallback(() => {
        if (isOrderPlaced) return;
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
    }, [isOrderPlaced]);

    const prevStep = useCallback(() => {
        if (isOrderPlaced) return;
        setCurrentStep((prev) => {
            if (prev <= 1) return prev;
            setDirection("backward");
            return (prev - 1) as CheckoutStep;
        });
    }, [isOrderPlaced]);

    const goToStep = useCallback(
        (step: CheckoutStep) => {
            if (isOrderPlaced) return;
            if (step < currentStep || completedSteps.has(step)) {
                setDirection(step < currentStep ? "backward" : "forward");
                setCurrentStep(step);
            }
        },
        [currentStep, completedSteps, isOrderPlaced]
    );

    const placeOrder = useCallback(() => {
        setIsOrderPlaced(true);
    }, []);

    const resetCheckout = useCallback(() => {
        setCurrentStep(1);
        setCompletedSteps(new Set());
        setPersonalDetails(INITIAL_PERSONAL_DETAILS);
        setPaymentMethod(null);
        setDirection("forward");
        setIsOrderPlaced(false);
    }, []);

    const value = useMemo(
        () => ({
            currentStep,
            completedSteps,
            personalDetails,
            paymentMethod,
            isOrderPlaced,
            setPersonalDetails,
            setPaymentMethod,
            nextStep,
            prevStep,
            goToStep,
            placeOrder,
            canAdvance,
            direction,
            resetCheckout,
        }),
        [
            currentStep,
            completedSteps,
            personalDetails,
            paymentMethod,
            isOrderPlaced,
            nextStep,
            prevStep,
            goToStep,
            placeOrder,
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
