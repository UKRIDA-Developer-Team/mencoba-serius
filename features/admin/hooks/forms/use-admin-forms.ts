import { useState } from "react";
import { type IngredientForm, type ProductForm } from "@/features/admin/types/forms";
import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";
import { authenticatedFetch } from "@/lib/auth/client";

interface UseAdminFormsReturn {
  ingredientForm: IngredientForm;
  productForm: ProductForm;
  setIngredientForm: (form: IngredientForm) => void;
  setProductForm: (form: ProductForm) => void;
  handleIngredientFormChange: (field: keyof IngredientForm, value: string) => void;
  handleProductFormChange: (field: keyof ProductForm, value: string) => void;
  handleAddIngredient: (e: React.FormEvent<HTMLFormElement>, onSuccess: (data: AdminIngredient) => void) => Promise<void>;
  handleAddProduct: (e: React.FormEvent<HTMLFormElement>, onSuccess: (data: AdminProduct) => void) => Promise<void>;
  handleToggleProductActive: (id: string, currentState: boolean, onSuccess: () => void) => Promise<void>;
  handleDeleteIngredient: (id: string, onSuccess: () => void) => Promise<void>;
  handleDeleteProduct: (id: string, onSuccess: () => void) => Promise<void>;
}

export function useAdminForms(defaultProductCategory: string = "Special"): UseAdminFormsReturn {
  const [ingredientForm, setIngredientForm] = useState<IngredientForm>({
    name: "",
    sku: "",
    reorder: "",
  });

  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    slug: "",
    price: "",
    category: defaultProductCategory,
  });

  const handleIngredientFormChange = (field: keyof IngredientForm, value: string) => {
    setIngredientForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductFormChange = (field: keyof ProductForm, value: string) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddIngredient = async (
    e: React.FormEvent<HTMLFormElement>,
    onSuccess: (data: AdminIngredient) => void
  ) => {
    e.preventDefault();
    const reorderLevel = Number(ingredientForm.reorder || 0);

    if (!ingredientForm.name || !ingredientForm.sku || reorderLevel < 0) {
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: ingredientForm.sku.toUpperCase(),
          name: ingredientForm.name,
          reorderLevelBaseQty: reorderLevel,
        }),
      });

      if (!response.ok) throw new Error("Failed to add ingredient");

      const data = await response.json();
      onSuccess(data.data);
      setIngredientForm({ name: "", sku: "", reorder: "" });
    } catch (error) {
      console.error("Error adding ingredient:", error);
      throw error;
    }
  };

  const handleAddProduct = async (
    e: React.FormEvent<HTMLFormElement>,
    onSuccess: (data: AdminProduct) => void
  ) => {
    e.preventDefault();
    const basePrice = Number(productForm.price || 0);

    if (!productForm.name || !productForm.slug || basePrice <= 0) {
      return;
    }

    try {
      const response = await authenticatedFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productForm.slug.toLowerCase(),
          name: productForm.name,
          category: productForm.category,
          basePrice,
        }),
      });

      if (!response.ok) throw new Error("Failed to add product");

      const data = await response.json();
      onSuccess(data.data);
      setProductForm({ name: "", slug: "", price: "", category: productForm.category });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const handleToggleProductActive = async (
    id: string,
    currentState: boolean,
    onSuccess: () => void
  ) => {
    try {
      const response = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      onSuccess();
    } catch (error) {
      console.error("Error toggling product active state:", error);
      throw error;
    }
  };

  const handleDeleteIngredient = async (id: string, onSuccess: () => void) => {
    try {
      const response = await authenticatedFetch(`/api/admin/ingredients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete ingredient");

      onSuccess();
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string, onSuccess: () => void) => {
    try {
      const response = await authenticatedFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      onSuccess();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  return {
    ingredientForm,
    productForm,
    setIngredientForm,
    setProductForm,
    handleIngredientFormChange,
    handleProductFormChange,
    handleAddIngredient,
    handleAddProduct,
    handleToggleProductActive,
    handleDeleteIngredient,
    handleDeleteProduct,
  };
}
