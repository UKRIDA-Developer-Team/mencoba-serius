import { useState } from "react";

/**
 * Custom hook to manage table form state
 * Handles search input and form field state management
 */
export function useTableForm<T extends Record<string, string>>(initialForm: T) {
    const [form, setForm] = useState<T>(initialForm);
    const [search, setSearch] = useState("");

    const handleFormChange = (field: keyof T, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setSearch("");
    };

    return {
        form,
        search,
        setSearch,
        handleFormChange,
        resetForm,
    };
}
