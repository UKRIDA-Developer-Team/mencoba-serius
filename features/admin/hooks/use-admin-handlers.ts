import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";
import { type IngredientForm, type ProductForm } from "@/features/admin/types/forms";
import { useAdminForms } from "./forms";
import { useToast } from "./ui";

interface UseAdminHandlersReturn {
  handleAddIngredient: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddProduct: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleProductActive: (slug: string) => Promise<void>;
  ingredientForm: IngredientForm;
  productForm: ProductForm;
  handleIngredientFormChange: (field: keyof IngredientForm, value: string) => void;
  handleProductFormChange: (field: keyof ProductForm, value: string) => void;
}

interface HandlerCallbacks {
  onIngredientAdded: (data: AdminIngredient) => void;
  onProductAdded: (data: AdminProduct) => void;
  onProductToggled: (slug: string, wasActive: boolean) => void;
}

export function useAdminHandlers(
  defaultCategory: string,
  callbacks: HandlerCallbacks
): UseAdminHandlersReturn {
  const { showToast } = useToast();
  const {
    ingredientForm,
    productForm,
    handleIngredientFormChange,
    handleProductFormChange,
    handleAddIngredient: apiAddIngredient,
    handleAddProduct: apiAddProduct,
    handleToggleProductActive: apiToggleProduct,
  } = useAdminForms(defaultCategory);

  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      await apiAddIngredient(e, (data: AdminIngredient) => {
        callbacks.onIngredientAdded(data);
        showToast("Ingredient ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan ingredient");
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      await apiAddProduct(e, (data: AdminProduct) => {
        callbacks.onProductAdded(data);
        showToast("Produk ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan produk");
    }
  };

  const handleToggleProductActive = async (slug: string) => {
    try {
      // Find product in memory to get current state
      // Note: This assumes products are passed separately
      showToast("Toggling product...");
    } catch {
      showToast("Gagal mengupdate produk");
    }
  };

  return {
    handleAddIngredient,
    handleAddProduct,
    handleToggleProductActive,
    ingredientForm,
    productForm,
    handleIngredientFormChange,
    handleProductFormChange,
  };
}
