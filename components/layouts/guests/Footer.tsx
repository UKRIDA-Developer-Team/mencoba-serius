import Image from "next/image";
import Link from "next/link";

const socialMedia = [
    {
        name: "Instagram",
        url: "https://www.instagram.com/chef_on_pointe/",
        icon: "/icon/instagram.png",
    },
];

export default function Footer() {
    return (
        <footer className="flex items-center justify-center w-full py-6 border border-t">
            <div className="flex flex-col items-center gap-4">
                <h2 className="font-bold text-xl leading-tight text-primary">
                    Follow us on{' '}
                </h2>
                {socialMedia.map((item) => (
                    <Link
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity duration-200"
                    >
                        <Image src={item.icon} alt={item.name} width={24} height={24} />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </Link>
                ))}
            </div>
        </footer>
    );
}