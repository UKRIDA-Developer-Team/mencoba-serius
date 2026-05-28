"use client";

import { useState } from "react";
import { upsertRecipe, deleteRecipe } from "./actions";
import type { Item, Recipe, RecipeIngredient, Ingredient } from "@/app/generated/prisma/client";
import { Pencil, Trash2, Plus, X, ChevronDown } from "lucide-react";

type FullRecipe = Recipe & {
  item: Item;
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
};

type Props = {
  items: Item[];
  recipes: FullRecipe[];
  ingredients: Ingredient[];
};

type RecipeIngredientRow = {
  ingredientId: string;
  quantity: string;
  unit: string;
};

export default function RecipesClient({ items, recipes, ingredients }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<FullRecipe | null>(null);
  const [rows, setRows] = useState<RecipeIngredientRow[]>([
    { ingredientId: "", quantity: "", unit: "" },
  ]);

  function openCreate() {
    setEditingRecipe(null);
    setRows([{ ingredientId: "", quantity: "", unit: "" }]);
    setShowForm(true);
  }

  function openEdit(recipe: FullRecipe) {
    setEditingRecipe(recipe);
    setRows(
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ri) => ({
            ingredientId: String(ri.ingredientId),
            quantity: String(ri.quantity),
            unit: ri.unit,
          }))
        : [{ ingredientId: "", quantity: "", unit: "" }]
    );
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRecipe(null);
  }

  function addRow() {
    setRows((r) => [...r, { ingredientId: "", quantity: "", unit: "" }]);
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof RecipeIngredientRow, value: string) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function prefillUnit(idx: number, ingredientId: string) {
    const ing = ingredients.find((i) => String(i.id) === ingredientId);
    if (ing) updateRow(idx, "unit", ing.unit);
    updateRow(idx, "ingredientId", ingredientId);
  }

  async function handleSubmit(formData: FormData) {
    await upsertRecipe(formData);
    closeForm();
  }

  async function handleDelete(formData: FormData) {
    await deleteRecipe(formData);
  }

  const itemsWithoutRecipe = items.filter(
    (item) => !recipes.some((r) => r.itemId === item.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products — Recipe</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage recipes for each menu item
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={itemsWithoutRecipe.length === 0 && !editingRecipe}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Recipe
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">
                {editingRecipe ? "Edit Recipe" : "New Recipe"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form action={handleSubmit} className="space-y-4">
              {editingRecipe && (
                <input type="hidden" name="itemId" value={editingRecipe.itemId} />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item <span className="text-red-500">*</span>
                </label>
                {editingRecipe ? (
                  <input
                    value={editingRecipe.item.name}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                  />
                ) : (
                  <div className="relative">
                    <select
                      name="itemId"
                      required
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    >
                      <option value="">Select item…</option>
                      {itemsWithoutRecipe.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingRecipe?.description ?? ""}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {rows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          name="ingredientId[]"
                          value={row.ingredientId}
                          onChange={(e) => prefillUnit(idx, e.target.value)}
                          required
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-6"
                        >
                          <option value="">Ingredient…</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                      <input
                        name="quantity[]"
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                        required
                        placeholder="Qty"
                        className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        name="unit[]"
                        value={row.unit}
                        onChange={(e) => updateRow(idx, "unit", e.target.value)}
                        required
                        placeholder="Unit"
                        className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        disabled={rows.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingRecipe ? "Save Changes" : "Create Recipe"}
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

      <div className="space-y-4">
        {recipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-12">
            <p className="text-gray-400 text-sm">No recipes yet.</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{recipe.item.name}</h3>
                  {recipe.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{recipe.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEdit(recipe)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={recipe.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      onClick={(e) => {
                        if (!confirm(`Delete recipe for "${recipe.item.name}"?`))
                          e.preventDefault();
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
              {recipe.ingredients.length === 0 ? (
                <p className="px-6 py-3 text-sm text-gray-400">No ingredients listed.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-2 text-left">Ingredient</th>
                      <th className="px-6 py-2 text-left">Quantity</th>
                      <th className="px-6 py-2 text-left">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipe.ingredients.map((ri) => (
                      <tr key={ri.id}>
                        <td className="px-6 py-2">{ri.ingredient.name}</td>
                        <td className="px-6 py-2">{ri.quantity}</td>
                        <td className="px-6 py-2">{ri.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
