"use client";

import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Greetings = [
  "Good Morning",
  "Good Afternoon",
  "Good Evening",
]

const getGreeting = (): string => {
  const currentHour = new Date().getHours();
  
  if (currentHour < 12) {
    return Greetings[0];
  } else if (currentHour < 18) {
    return Greetings[1];
  } else {
    return Greetings[2];
  }
}

const menuItems = [
  {
    name: "Bika Ambon",
    slug: "bika-ambon",
    description: "Delicacy premium dengan resep autentik & bahan pilihan berkualitas tinggi",
    price: "Rp 50.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit",
    slug: "kue-cubit",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit Varian 2",
    slug: "kue-cubit-varian-2",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit Varian 3",
    slug: "kue-cubit-varian-3",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit Varian 4",
    slug: "kue-cubit-varian-4",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit Varian 5",
    slug: "kue-cubit-varian-5",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  },
  {
    name: "Kue Cubit Varian 6",
    slug: "kue-cubit-varian-6",
    description: "Produk artisanal istimewa dengan presentasi modern & cita rasa superior",
    price: "Rp 30.000",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80"
  }
]


export default function Home() {
  const greeting = getGreeting();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold">What We Serve</h1>
          <span className="text-sm text-slate-600">{greeting}</span>
        </div>
        <div className="w-full max-w-6xl mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item, index) => (
              <Link key={index} href={`/product/${item.slug}`}>
                <div className="w-full max-w-xs">
                  <div className="overflow-hidden bg-white border flex flex-col h-full">
                    <div className="relative h-48 w-full bg-slate-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="pb-0 pt-3 px-4 flex-1">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs text-slate-600 my-3">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between pt-4 px-4 pb-3">
                      <span className="font-semibold text-slate-900">{item.price}</span>
                      <Button size="sm">Add to Cart</Button>
                    </CardFooter>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
    </main>
  );
}