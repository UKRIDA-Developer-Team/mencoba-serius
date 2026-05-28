"use client";

import { useRef, useState } from "react";
import { createIngredient, updateIngredient, deleteIngredient } from "./actions";
import type { Ingredient } from "@/app/generated/prisma/client";
import { Pencil, Trash2, Plus, X, AlertTriangle } from "lucide-react";

type Props = { ingredients: Ingredient[] };

export default function IngredientsClient({ ingredients }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateIngredient(formData);
    } else {
      await createIngredient(formData);
    }
    closeForm();
  }

  async function handleDelete(formData: FormData) {
    await deleteIngredient(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory — Ingredients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your ingredient stock levels
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Ingredient
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">
                {editing ? "Edit Ingredient" : "New Ingredient"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  name="unit"
                  defaultValue={editing?.unit ?? ""}
                  required
                  placeholder="e.g. kg, g, L, pcs"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    name="currentStock"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editing?.currentStock ?? 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock
                  </label>
                  <input
                    name="minStock"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editing?.minStock ?? 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Unit (Rp)
                </label>
                <input
                  name="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing?.pricePerUnit ?? 0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editing ? "Save Changes" : "Create Ingredient"}
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
        {ingredients.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">
            No ingredients yet. Click &quot;Add Ingredient&quot; to get started.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Unit</th>
                <th className="px-6 py-3 text-left">Current Stock</th>
                <th className="px-6 py-3 text-left">Min Stock</th>
                <th className="px-6 py-3 text-left">Price / Unit</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingredients.map((ing) => (
                <tr
                  key={ing.id}
                  className={`hover:bg-gray-50 ${ing.currentStock <= ing.minStock ? "bg-red-50" : ""}`}
                >
                  <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                    {ing.currentStock <= ing.minStock && (
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    )}
                    {ing.name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{ing.unit}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`font-medium ${ing.currentStock <= ing.minStock ? "text-red-600" : "text-gray-900"}`}
                    >
                      {ing.currentStock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{ing.minStock}</td>
                  <td className="px-6 py-3">
                    Rp {ing.pricePerUnit.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(ing)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={ing.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={(e) => {
                            if (!confirm(`Delete "${ing.name}"?`)) e.preventDefault();
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
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
