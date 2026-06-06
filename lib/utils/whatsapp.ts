import type { CartItem } from "@/features/guest/components/cart/CartProvider";

export function generateWhatsAppCheckoutLink(
  items: CartItem[],
  grandTotal: number,
  whatsappNumber: string
): string {
  const phoneNumber = whatsappNumber.replace(/\D/g, "");

  const itemsSummary = items
    .map(
      (item) =>
        `• ${item.name} (${item.size}) x${item.quantity}\n  Rp ${item.price.toLocaleString("id-ID")}`
    )
    .join("\n");

  const message = `Halo! Saya ingin memesan:\n\n${itemsSummary}\n\n*Total: Rp ${grandTotal.toLocaleString("id-ID")}*\n\nMohon konfirmasi ketersediaan dan pengiriman. Terima kasih!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
