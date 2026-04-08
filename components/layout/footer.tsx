export default function Footer() {
    return (
        <footer className="w-full border-t bg-muted/50 p-4 text-center text-sm">
            <p className="text-muted-foreground">
                &copy; {new Date().getFullYear()} Mencoba Serius. All rights reserved.
            </p>
        </footer>
    );
}