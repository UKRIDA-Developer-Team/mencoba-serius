import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authenticatedFetch } from "@/lib/auth/client";

export function IngredientUsageDialog({ isOpen, onClose, ingredient }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ingredient) {
      setLoading(true);
      authenticatedFetch(`/api/admin/ingredients/${ingredient.id}/usage`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) {
            setData(resData.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, ingredient]);

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "IN": return <span className="text-green-600 font-medium">Masuk</span>;
      case "OUT": return <span className="text-destructive font-medium">Keluar</span>;
      case "ADJUSTMENT": return <span className="text-orange-600 font-medium">Penyesuaian</span>;
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Riwayat Stok: {ingredient?.name}</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="size-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : data && data.movements ? (
            <div className="h-[300px] overflow-y-auto rounded-md border p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium">Waktu</th>
                    <th className="px-4 py-2 font-medium">Tipe</th>
                    <th className="px-4 py-2 font-medium">Jumlah</th>
                    <th className="px-4 py-2 font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.movements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada riwayat stok.</td>
                    </tr>
                  ) : (
                    data.movements.map((m: any) => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-2">{getMovementLabel(m.movementType)}</td>
                        <td className="px-4 py-2 font-medium tabular-nums">{m.quantity}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground max-w-[200px] truncate" title={m.notes || m.referenceType}>
                          {m.notes || m.referenceType || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
