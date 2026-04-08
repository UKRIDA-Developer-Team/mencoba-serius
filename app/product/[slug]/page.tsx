"use client";

import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

// Mock data - in production, fetch from database/API
const menuItems = [
  {
    name: "Bika Ambon",
    slug: "bika-ambon",
    description: "Delicacy premium dengan resep autentik & bahan pilihan berkualitas tinggi",
    fullDescription: "Bika Ambon adalah kue tradisional Indonesia yang terkenal dengan teksturnya yang lembut dan empuk. Dibuat dengan bahan-bahan pilihan berkualitas tinggi dan resep autentik yang telah diwariskan turun temurun.",
    price: "Rp 50.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
    rating: 4.8,
    reviews: 120,
    stock: 45
  },
  {
    name: "Kue Cubit",
    slug: "kue-cubit",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    fullDescription: "Kue Cubit adalah camilan tradisional yang legendaris dengan cita rasa yang tak terlupakan. Setiap gigitan memberikan pengalaman rasa yang luar biasa dengan presentasi yang modern.",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
    rating: 4.6,
    reviews: 95,
    stock: 120
  },
];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = menuItems.find(item => item.slug === slug);

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-3xl font-bold">Produk tidak ditemukan</h1>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-6xl">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div>
            <div className="relative h-96 w-full bg-slate-100 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-slate-500">({product.reviews} reviews)</span>
            </div>

            <p className="text-2xl font-bold text-slate-900 mb-4">{product.price}</p>

            <p className="text-slate-600 mb-6 leading-relaxed">
              {product.fullDescription}
            </p>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                Add to Wishlist
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 border-t pt-6">
              <h3 className="font-semibold mb-4">Detail Produk</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">SKU</span>
                  <span className="font-medium">{product.slug.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kategori</span>
                  <span className="font-medium">Kue & Camilan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Berat</span>
                  <span className="font-medium">200g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}