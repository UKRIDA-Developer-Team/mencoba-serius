import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Check } from "lucide-react";

type Category = { id: string; name: string };

type ProductFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any; // null if adding, product object if editing
};

export function ProductFormDialog({ isOpen, onClose, categories, onSubmit, initialData }: ProductFormDialogProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    imagePath: "",
    isRecommended: false,
    isPreorderOnly: false,
  });

  // Effect to populate form when initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || (categories[0]?.name || ""),
        price: initialData.basePrice?.toString() || "",
        description: initialData.description || "",
        imagePath: initialData.imagePath || "",
        isRecommended: initialData.isRecommended || false,
        isPreorderOnly: initialData.isPreorderOnly || false,
      });
    } else {
      setForm({
        name: "",
        category: categories[0]?.name || "",
        price: "",
        description: "",
        imagePath: "",
        isRecommended: false,
        isPreorderOnly: false,
      });
    }
  }, [initialData, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, basePrice: Number(form.price) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Nama Produk
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Kue Coklat"
              className="bg-card border-border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Kategori</label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm((p) => ({ ...p, category: value }))}
              required
            >
              <SelectTrigger className="w-full bg-card border-border rounded-lg px-3 text-sm focus:ring-accent/40 focus:border-accent transition-colors">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Harga Dasar (Rp)</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="0"
              min={1}
              className="bg-card border-border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Deskripsi</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi produk..."
              className="bg-card border-border rounded-lg resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Gambar Produk</label>
            <ImageUpload
              value={form.imagePath}
              onChange={(url) => setForm((p) => ({ ...p, imagePath: url || "" }))}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Sistem Pre-order?</label>
            <Switch
              checked={form.isPreorderOnly}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isPreorderOnly: checked }))}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Jadikan Rekomendasi?</label>
            <Switch
              checked={form.isRecommended}
              onCheckedChange={(checked) => setForm((p) => ({ ...p, isRecommended: checked }))}
            />
          </div>
          <Button type="submit" className="w-full gap-1">
            {initialData ? (
              <><Check className="size-4" /> Simpan Perubahan</>
            ) : (
              <><Plus className="size-4" /> Simpan Produk</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
