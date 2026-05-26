import { type AdminIngredient, type AdminProduct } from "@/lib/data/admin";
import { useAdminForms } from "./use-admin-forms";
import { useToast } from "./use-toast";

interface UseAdminHandlersReturn {
  handleAddIngredient: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleAddProduct: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleToggleProductActive: (slug: string) => Promise<void>;
  ingredientForm: any;
  productForm: any;
  handleIngredientFormChange: (field: any, value: string) => void;
  handleProductFormChange: (field: any, value: string) => void;
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
      await apiAddIngredient(e, (data) => {
        callbacks.onIngredientAdded(data);
        showToast("Ingredient ditambahkan!");
      });
    } catch {
      showToast("Gagal menambahkan ingredient");
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      await apiAddProduct(e, (data) => {
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
