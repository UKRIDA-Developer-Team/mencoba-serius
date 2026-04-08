"use client";

import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MinusSquare, PlusCircle, Quote } from "lucide-react";

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

const cakeImageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lsZGJlcnJ5JTIwY2FudGlsbHklMjByb2lhbGV8ZW58MHx8MHx8fHww&w=1000&q=80";
const cakeImageAlt = "Minimalist overhead shot of a tiered white cake decorated with delicate fresh wild berries on a textured cream surface with soft shadows"


export default function Home() {
  const greeting = getGreeting();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-24 py-16">
        <section className="w-full mb-16">
            <div className="relative bg-black/50 w-full rounded-lg overflow-hidden flex items-start justify-start">
                <Image
                src={cakeImageUrl}
                alt={cakeImageAlt}
                fill className="object-cover"
                />
                <div className="relative z-10 max-w-3xl h-96 flex flex-col justify-end px-8">
                    <span className="font-label text-xs uppercase tracking-[0.2em] text-[#534345] mb-2 block">Signature Collection</span>
                    <h1 className="text-4xl md:text-6xl text-[#4f1724] leading-tight mb-6">Wildberry Chantilly Royale</h1>
                    <button className="w-fit berry-gradient text-white px-8 py-4 rounded-md font-semibold text-sm tracking-wide shadow-lg active:scale-95 transition-transform">
                        Start Pre-Ordering
                    </button>
                </div>
            </div>
        </section>
        
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold">Our Favourite</h1>
          <span className="text-sm text-slate-600">{greeting}</span>
        </div>
        <div className="w-full max-w-6xl mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <Link key={index} href={`/product/${item.slug}`}>
                {/* <div className="w-full max-w-xs">
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
                </div> */}
                <div className="group flex flex-col">
                    <div className="aspect-[4/5] mb-6 relative cursor-pointer">
                        {/* <img alt="Dark Chocolate Ganache" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="High-end editorial shot of a deep dark chocolate cake with smooth ganache and edible gold leaf, soft side lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgfx3-K5pwewL1VUVTwovQzTUrNlTTeaoAbFdx8izv6qBZujvFsxJ4SDTh0lCqnssVSoRL2GyTlZ-rpLK48t7IM_fMFCnyo7PnE1raRd0PyD97qkr305oHO8LZHfbdE54xqcUlCE72lzFFStxyA57r9NI2NIDDT7sWyFnPTKC717alrfbgI0JY6y6zYU1SRX8A0YerS4r2XAZtCN3S3BusvGkEYLz3M1XgqFeSrKVDL5AtbqUEveIiOPc1Owe4KcJo0oxI1nQHD7hT" /> */}
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-serif text-primary cursor-pointer hover:text-primary-container transition-colors">{item.name}</h3>
                        <span className="text-lg font-body text-secondary">{item.price}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant font-body mb-6">{item.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center bg-surface-container rounded-md px-3 py-2 space-x-4">
                            <button className="text-primary hover:opacity-70 transition-opacity">
                                <MinusSquare className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium font-body w-4 text-center">01</span>
                            <button className="text-primary hover:opacity-70 transition-opacity">
                                <PlusCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <button className="berry-gradient text-on-primary px-6 py-2.5 rounded-md font-body text-sm font-semibold tracking-wide hover:opacity-90 transition-all">
                            Pre-Order
                        </button>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* <!-- Artisan Quote Section --> */}
        <section className="mt-20">
            <div className="max-w-2xl mx-auto text-center">
                <Quote className="w-8 h-8 mx-auto mb-4 text-primary" />
                <p className="text-2xl italic font-serif text-primary leading-relaxed mb-8">
                    "We believe every cake should be a sensory journey. From the first sight of a delicate petal to the lingering note of Madagascan vanilla, we bake stories into every crumb."
                </p>
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-12 bg-outline-variant/30"></div>
                    <span className="font-label uppercase tracking-widest text-xs text-secondary">Elara Vance, Master Pâtissier</span>
                    <div className="h-[1px] w-12 bg-outline-variant/30"></div>
                </div>
            </div>
        </section>
    </main>
  );
}