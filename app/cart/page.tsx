"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";

const CartItems = [
    {
        name: "Bika Ambon",
        slug: "bika-ambon",
        description: "Delicacy premium dengan resep autentik & bahan pilihan berkualitas tinggi",
        price: "Rp 50.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 2
    },
    {
        name: "Kue Cubit",
        slug: "kue-cubit",
        description: "Kue lezat dengan tekstur lembut dan rasa manis yang nikmat",
        price: "Rp 25.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 1
    },
    {
        name: "Bika Ambon",
        slug: "bika-ambon",
        description: "Delicacy premium dengan resep autentik & bahan pilihan berkualitas tinggi",
        price: "Rp 50.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 2
    },
    {
        name: "Kue Cubit",
        slug: "kue-cubit",
        description: "Kue lezat dengan tekstur lembut dan rasa manis yang nikmat",
        price: "Rp 25.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 1
    },
    {
        name: "Bika Ambon",
        slug: "bika-ambon",
        description: "Delicacy premium dengan resep autentik & bahan pilihan berkualitas tinggi",
        price: "Rp 50.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 2
    },
    {
        name: "Kue Cubit",
        slug: "kue-cubit",
        description: "Kue lezat dengan tekstur lembut dan rasa manis yang nikmat",
        price: "Rp 25.000",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kb25lc2lhbiUyMGNhbmtlfGVufDB8fDB8fHww&w=1000&q=80",
        quantity: 1
    }
];

export default function Cart() {
    const [items, setItems] = useState(CartItems);

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        const updatedItems = [...items];
        updatedItems[index].quantity = newQuantity;
        setItems(updatedItems);
    };

    const parsePrice = (priceString: string) => {
        return parseInt(priceString.replace(/\D/g, ''));
    };

    const totalPrice = items.reduce((sum, item) => {
        return sum + (parsePrice(item.price) * item.quantity);
    }, 0);

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24">
            <div className="w-full max-w-6xl">
                <h1 className="text-3xl font-bold mb-2">Keranjang Belanja</h1>
                <p className="text-slate-600 mb-8">Atur pesanan Anda dengan cermat.</p>
                
                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">Keranjang belanja Anda kosong</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item, index) => (
                                <Card key={index} className="flex flex-row p-4">
                                    <div className="relative h-32 w-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="ml-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="text-sm text-slate-500">{item.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold">{item.price}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                                                    <button
                                                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                        className="text-slate-600"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                        className="text-slate-600"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteItem(index)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Summary Card - Sticky */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-24">
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="font-semibold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Delivery Fee</span>
                                        <span className="text-sm text-slate-500">Calculated at next step</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Estimated Tax</span>
                                        <span className="font-semibold">Rp 0</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between text-xl font-bold">
                                        <span>Total Est.</span>
                                        <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                    <Button className="w-full mt-6" size="lg">
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}