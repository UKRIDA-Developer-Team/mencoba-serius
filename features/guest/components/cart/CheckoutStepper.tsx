"use client";

import { useCheckout, STEP_LABELS, type CheckoutStep } from "./CheckoutProvider";
import { Check } from "lucide-react";

const STEPS: CheckoutStep[] = [1, 2, 3, 4];

export default function CheckoutStepper() {
    const { currentStep, completedSteps, goToStep } = useCheckout();

    return (
        <nav
            aria-label="Checkout progress"
            className="w-full mb-8"
        >
            <ol className="flex items-center justify-between relative">
                {STEPS.map((step, index) => {
                    const isCompleted = completedSteps.has(step);
                    const isActive = step === currentStep;
                    const isClickable = isCompleted || step < currentStep;

                    return (
                        <li
                            key={step}
                            className="flex flex-1 items-center"
                        >
                            {/* Step circle + label group */}
                            <div className="flex flex-col items-center relative z-10">
                                <button
                                    type="button"
                                    onClick={() => isClickable && goToStep(step)}
                                    disabled={!isClickable}
                                    aria-current={isActive ? "step" : undefined}
                                    className={`
                                        size-9 sm:size-10 rounded-full flex items-center justify-center
                                        text-sm font-semibold transition-all duration-300 ease-in-out
                                        border-2 shrink-0
                                        ${isCompleted
                                            ? "bg-[#7BAE8F] border-[#7BAE8F] text-white"
                                            : isActive
                                                ? "bg-accent border-accent text-accent-foreground stepper-pulse"
                                                : "bg-card border-border text-muted-foreground"
                                        }
                                        ${isClickable
                                            ? "cursor-pointer hover:scale-110"
                                            : "cursor-default"
                                        }
                                    `}
                                >
                                    {isCompleted ? (
                                        <Check className="size-4 sm:size-5" strokeWidth={2.5} />
                                    ) : (
                                        step
                                    )}
                                </button>

                                {/* Label */}
                                <span
                                    className={`
                                        mt-2 text-[10px] sm:text-xs font-medium text-center
                                        hidden sm:block whitespace-nowrap
                                        transition-colors duration-300
                                        ${isActive
                                            ? "text-accent"
                                            : isCompleted
                                                ? "text-[#7BAE8F]"
                                                : "text-muted-foreground"
                                        }
                                    `}
                                >
                                    {STEP_LABELS[step]}
                                </span>

                                {/* Mobile: show label only for active */}
                                {isActive && (
                                    <span className="mt-1.5 text-[10px] font-medium text-accent sm:hidden whitespace-nowrap">
                                        {STEP_LABELS[step]}
                                    </span>
                                )}
                            </div>

                            {/* Connecting line */}
                            {index < STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-1 sm:mx-2 relative self-start mt-[18px] sm:mt-5">
                                    {/* Background line */}
                                    <div className="absolute inset-0 bg-border rounded-full" />
                                    {/* Progress fill */}
                                    <div
                                        className={`
                                            absolute inset-y-0 left-0 rounded-full
                                            transition-all duration-500 ease-in-out
                                            ${isCompleted ? "w-full bg-[#7BAE8F]" : "w-0 bg-accent"}
                                        `}
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
