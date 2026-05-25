"use client";

import type { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type DataTableWithFormProps<T extends Record<string, any>> = {
    title: string;
    items: T[];
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    renderTable: (items: T[]) => React.ReactNode;
    form: Record<string, string>;
    onFormChange: (field: string, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    formFields: Array<{
        name: string;
        placeholder: string;
        type?: string;
        required?: boolean;
    }>;
    submitLabel?: string;
};

export function DataTableWithForm<T extends Record<string, any>>({
    title,
    items,
    search,
    onSearchChange,
    searchPlaceholder,
    renderTable,
    form,
    onFormChange,
    onSubmit,
    formFields,
    submitLabel = "Add",
}: DataTableWithFormProps<T>) {
    const filteredItems = items.filter((item) =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search Box */}
            <Input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
                {renderTable(filteredItems)}
            </div>

            {/* Form Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {formFields.map((field) => (
                            <Input
                                key={field.name}
                                type={field.type || "text"}
                                placeholder={field.placeholder}
                                value={form[field.name] || ""}
                                onChange={(e) => onFormChange(field.name, e.target.value)}
                                required={field.required}
                            />
                        ))}
                        <Button type="submit">
                            {submitLabel}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
