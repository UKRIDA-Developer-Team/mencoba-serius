'use client';

import { Home, Search, ShoppingCart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t bg-muted/50 p-4 text-center text-sm">
            <div className="fixed bottom-15 left-1/2 -translate-x-1/2 w-fit z-50 bg-[#fcf9f4] flex justify-around items-center px-4 py-3 pb-safe">
                <nav className="flex space-x-4">
                    <a href="/" className="flex flex-col items-center justify-center bg-[#4f1724] text-white rounded-full px-6 py-2 active:scale-90 duration-300">
                        <Home className="w-5 h-5" />
                        <span className="font-sans text-[10px] uppercase tracking-widest mt-0.5">Home</span>
                    </a>
                    <a href="/menu" className="flex flex-col items-center justify-center text-[#735a3a] px-6 py-2 hover:text-[#4f1724] dark:hover:text-white transition-colors active:scale-90 duration-300">
                        <Search className="w-5 h-5" />
                        <span className="font-sans text-[10px] uppercase tracking-widest mt-0.5">Search</span>
                    </a>
                    <a href="/cart" className="flex flex-col items-center justify-center text-[#735a3a] px-6 py-2 hover:text-[#4f1724] dark:hover:text-white transition-colors active:scale-90 duration-300">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-sans text-[10px] uppercase tracking-widest mt-0.5">Cart</span>
                    </a>
                </nav>
            </div>
            <p className="text-muted-foreground">
                &copy; {new Date().getFullYear()} Mencoba Serius. All rights reserved.
            </p>
        </footer>
    );
}