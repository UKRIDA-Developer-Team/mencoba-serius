"use client";

import { useState } from "react";
import { createStockOpname, deleteStockOpname } from "./actions";
import type { Ingredient, StockOpname } from "@/app/generated/prisma/client";
import { Plus, X, Trash2, ChevronDown } from "lucide-react";

type FullOpname = StockOpname & { ingredient: Ingredient };

type Props = {
  opnames: FullOpname[];
  ingredients: Ingredient[];
};

export default function StockOpnameClient({ opnames, ingredients }: Props) {
  const [showForm, setShowForm] = useState(false);

  function closeForm() {
    setShowForm(false);
  }

  async function handleSubmit(formData: FormData) {
    await createStockOpname(formData);
    closeForm();
  }

  async function handleDelete(formData: FormData) {
    await deleteStockOpname(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory — Stock Opname
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Record physical stock counts and reconcile with system stock
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Stock Count
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">New Stock Opname</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="ingredientId"
                    required
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                  >
                    <option value="">Select ingredient…</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (current: {ing.currentStock} {ing.unit})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Physical Count <span className="text-red-500">*</span>
                </label>
                <input
                  name="physicalCount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Actual quantity you counted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Optional notes about this count"
                />
              </div>
              <p className="text-xs text-gray-400">
                Submitting will update the ingredient&apos;s current stock to the
                physical count value.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Submit Count
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {opnames.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">
            No stock opname records yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Ingredient</th>
                <th className="px-6 py-3 text-left">System Stock</th>
                <th className="px-6 py-3 text-left">Physical Count</th>
                <th className="px-6 py-3 text-left">Difference</th>
                <th className="px-6 py-3 text-left">Notes</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opnames.map((op) => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(op.date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {op.ingredient.name}
                  </td>
                  <td className="px-6 py-3">
                    {op.systemStock} {op.ingredient.unit}
                  </td>
                  <td className="px-6 py-3">
                    {op.physicalCount} {op.ingredient.unit}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`font-medium ${
                        op.difference > 0
                          ? "text-green-600"
                          : op.difference < 0
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {op.difference > 0 ? "+" : ""}
                      {op.difference} {op.ingredient.unit}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                    {op.notes ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={op.id} />
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        onClick={(e) => {
                          if (!confirm("Delete this stock opname record?"))
                            e.preventDefault();
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
