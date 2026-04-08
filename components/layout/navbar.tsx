'use client';

import { useState } from 'react';
import { ShoppingCart, User, LogOut } from 'lucide-react';

export default function NavigationBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="fixed top-0 left-1/2 -translate-x-1/2 mt-4 z-50 rounded-full bg-background/80 border border-border backdrop-blur-xl px-6 py-3">
            <div className="flex items-center justify-between gap-12">
                <h1 className="text-lg font-bold whitespace-nowrap">Mencoba Serius</h1>
                
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer border">
                        <ShoppingCart className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer border"
                        >
                            <User className="w-5 h-5 text-foreground" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                                {isLoggedIn ? (
                                    <>
                                        <a href="#" className="block px-4 py-2 text-sm hover:bg-muted rounded-t-lg text-foreground">
                                            My Profile
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-sm hover:bg-muted text-foreground">
                                            Orders
                                        </a>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-b-lg text-foreground flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => {
                                                setIsLoggedIn(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-t-lg text-foreground font-medium"
                                        >
                                            Sign In
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsLoggedIn(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted rounded-b-lg text-foreground font-medium"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}