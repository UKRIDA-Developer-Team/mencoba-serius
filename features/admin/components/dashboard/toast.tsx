"use client";

type ToastProps = {
    message: string | null;
};

export default function Toast({ message }: ToastProps) {
    if (!message) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-lg max-w-xs"
        >
            <span className="size-1.5 rounded-full bg-primary-foreground/70 shrink-0" />
            {message}
        </div>
    );
}
