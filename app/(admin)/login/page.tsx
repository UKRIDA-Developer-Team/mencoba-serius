"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simple validation
        if (!username || !password) {
            setError("Username and password are required");
            setIsLoading(false);
            return;
        }

        // Mock authentication
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Store auth token in localStorage
            localStorage.setItem("admin_token", "authenticated");
            localStorage.setItem("admin_username", username);
            
            // Redirect to admin dashboard
            router.push("/admin");
            router.refresh();
        } else {
            setError("Invalid username or password");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Chef On Pointe Admin Control Center
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center pt-2">
                            Demo credentials: admin / admin123
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
