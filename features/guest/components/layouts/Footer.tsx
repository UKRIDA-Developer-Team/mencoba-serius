import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const catalogLinks = [
    { label: "Berdasarkan Katalog", href: "/catalog" },
    { label: "Kue Ulang Tahun", href: "/catalog?category=Birthday" },
    { label: "Kue Pernikahan", href: "/catalog?category=Wedding" },
    { label: "Kue Anniversary", href: "/catalog?category=Anniversary" },
    { label: "Kue Spesial", href: "/catalog?category=Special" },
];

const Tape = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="95"
        height="80"
        viewBox="0 0 95 80"
        fill="none"
        className={className}
        aria-hidden="true"
    >
        <path d="M1 45L70.282 5L88.282 36.1769L19 76.1769L1 45Z" fill="currentColor" />
        <path
            d="M69.6829 39.997C74.772 36.9233 80.2799 35.022 85.4464 32.0415C85.5584 31.9769 85.6703 31.912 85.782 31.8468L83.9519 38.6769C80.2833 32.3886 75.7064 26.4975 72.2275 20.0846C70.0007 15.9783 67.7966 11.8425 65.6183 7.69261L72.9746 9.66373C70.566 10.9281 68.1526 12.1837 65.7375 13.4301C59.1543 16.828 52.5477 20.1634 45.9059 23.4675C39.2779 26.7637 32.6138 30.0293 25.946 33.2683C21.417 35.4683 16.8774 37.6611 12.3408 39.8468C10.3494 40.8065 8.36335 41.7623 6.37228 42.7203C4.88674 43.4348 3.40117 44.1492 1.91563 44.8637C1.70897 44.9628 1.48389 45.0108 1.28779 44.994C1.0916 44.977 0.940536 44.8975 0.866099 44.7681C0.791689 44.6386 0.798739 44.4674 0.882816 44.289C0.966978 44.111 1.12195 43.9408 1.31146 43.8119C2.68692 42.8791 4.06239 41.9462 5.43785 41.0134C6.96571 39.9774 8.49068 38.9427 10.0185 37.9078C10.5758 38.2934 11.1526 38.4968 11.9006 38.3019C12.2823 38.2024 12.7844 37.9628 13.0812 37.66C13.3477 37.388 13.4958 37.092 13.6361 36.8103C13.7828 36.5157 13.922 36.236 14.1819 36.0157C14.6227 35.6416 14.9608 35.1461 15.3159 34.6256C15.4451 34.4362 15.5766 34.2432 15.7162 34.0517C17.1755 33.0653 18.6355 32.0797 20.0958 31.0952C20.7161 30.8123 21.2829 30.546 21.7287 30.2596C22.1286 30.0027 22.4405 29.6732 22.7349 29.3173C22.9611 29.1651 23.1873 29.0128 23.4135 28.8606C24.8734 27.8785 26.3349 26.8977 27.7969 25.9178C29.0653 25.3742 30.3884 24.7936 32.0404 23.9203C32.7524 23.544 33.4842 23.2235 34.1877 22.9153C35.2267 22.4601 36.204 22.0318 36.9653 21.4906C37.4742 21.1289 38.0837 20.8769 38.6916 20.6256C39.507 20.2886 40.3209 19.9521 40.8884 19.3523C41.2452 18.9751 41.5509 18.5904 41.8339 18.234C42.2841 17.6669 42.6773 17.1712 43.1308 16.8909C43.9827 16.3643 44.6366 15.763 45.2128 15.2329C45.9058 14.5954 46.4871 14.0607 47.1661 13.8832C47.9827 13.6467 49.3854 13.4004 50.6721 12.4297C51.1302 12.084 51.5022 11.6584 51.8663 11.2413C52.3964 10.634 52.9113 10.0444 53.6546 9.74536C54.4771 9.34055 55.3576 7.75325 57.0866 6.63773C58.8181 5.52571 60.5527 4.41789C61.3473 3.91034 62.1427 3.40353 62.9389 2.89753C64.0449 2.86301 65.3015 2.63711 67.1366 1.7766C68.1502 1.62902 70.2985 0.211054 72.8781 0.719848C73.9745 2.86814 74.6959 4.57024 77.451 9.4943C78.7359 11.1701 79.6521 12.3598 81.2553 14.6987C82.7718 16.9111 83.9554 18.8538 84.8446 20.3132C85.981 22.1424 87.7583 24.9138 90.3417 28.8752C91.6954 30.711 93.4198 33.2106C94.9454 36.1998 94.2374 39.789 91.2483 41.3146C89.1849 42.6436 88.0561 43.2181 86.8458 43.7492C85.2883 44.0321 83.72 44.1298 82.9316 44.7081C81.649 45.5149 81.1774 46.0805 80.1526 46.3463C79.5326 46.6883 77.1806 48.1194 76.7972 48.2768C74.8076 49.5175 73.2678 50.5517 71.7504 51.3848C69.7735 52.7209 67.7901 54.1904C67.0396 54.7464 65.3207 55.3561C63.2221 56.1693 62.1754 56.9973 61.3489 57.6526C59.702 57.5895 59.1013 58.4201C58.2752 58.2689C57.4719 58.3686 56.3466 58.9941C55.672 59.224C54.894 59.4553C54.1028 59.9628C53.5113 60.2553C52.8246 60.7633C51.9975 61.3556C50.389 62.3273C49.9013 62.8385C49.3191 63.7453C48.9802 63.8963C47.2865 64.519C45.9244 65.2359C45.0741 66.1295C43.5464 66.7102C41.4633 67.722C40.7422 68.6643C40.5769 66.7069C39.9558 66.0791C38.838 67.329C38.3194 67.8538C38.8407 69.1745C38.6775 69.4511C38.8369 70.2599C38.1516 70.6412C37.7617 70.9305C36.7896 71.4258C35.973 71.8416C34.1132 72.1917C33.2636 71.1383C33.1199 69.8097C33.0306 68.7984C32.4843 68.4469C32.2881 68.1742C32.4435 67.9656C31.7683 67.913C31.0772 69.0187C30.7898 69.2944C30.9714 69.9966C31.3798 70.4049C31.0797 71.7913C30.5186 72.9418C29.9107 73.611C29.1507 74.3073C27.928 75.4406C24.9338 77.2712C22.8466 78.3902C20.8427 79.3685C18.9858 80.3162C16.7561 79.8764C15.8084 78.0196C15.5741 77.2979C15.4159 76.1649C14.5464 73.8883C13.6287 71.7959C13.1181 70.415C11.8089 67.5091C11.066 66.0051C9.52376 63.1169C8.73537 60.9866C7.61958 58.7572C6.49825 58.4001C6.11042 57.5602C5.18227 55.5402C4.78958 54.6817C3.96388 52.8713C3.69126 52.2705C3.14577 51.0668C2.91467 50.5554C2.32862 49.2567C2.02011 48.5702C1.5164 47.4477C0.707979 45.6366C0.652618 45.3375C0.760479 45.1383C0.987373 45.1452C1.21749 45.3435C3.09529 47.9526C3.53359 48.564C4.3626 49.7236C4.68867 50.1801C5.4569 51.2592C5.83773 51.7946C6.98805 53.4185C7.60327 54.2896C7.94616 54.7753C9.57264 57.0858C12.4247 61.1784C15.2661 65.2871C18.0812 69.4042C21.6379 74.6539L17.477 73.539C30.2295 64.9403 43.1287 56.4797 56.1947 48.2951C60.086 45.8684 62.0158 44.6777C65.8814 42.3014 68.4422 40.7466 69.6829 39.997Z"
            fill="currentColor"
            fillOpacity="0.4"
        />
    </svg>
);

const currentYear = new Date().getFullYear();

export default function Footer() {
    return (
        <footer className="my-8 px-4 sm:px-6 w-full max-w-6xl mx-auto">
            <div className="relative bg-card rounded-b-xl px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row justify-between items-start gap-8 border border-border shadow-sm overflow-hidden md:overflow-visible">
                <Tape className="hidden md:block absolute -top-5 -left-6 w-20 text-primary opacity-80 scale-100" />
                <Tape className="hidden md:block absolute -top-5 -right-6 rotate-90 w-20 text-primary opacity-80 scale-100" />

                <div className="flex flex-col gap-3 max-w-xs">
                    <Link href="/" className="text-2xl font-bold text-primary leading-tight">
                        Chef on Pointe
                    </Link>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        Kue perayaan buatan tangan dengan cinta untuk ulang tahun, pernikahan, anniversary & pesanan custom.
                    </p>
                    <a
                        href="https://www.instagram.com/chef_on_pointe/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-3 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                        aria-label="Follow Chef On Pointe on Instagram"
                    >
                        <FaInstagram className="w-4 h-4" aria-hidden="true" />
                        @chef_on_pointe
                    </a>
                    <a
                        href="https://wa.me/6285751623523"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                        aria-label="Hubungi kami di WhatsApp"
                    >
                        <FaWhatsapp className="w-4 h-4" aria-hidden="true" />
                        WhatsApp
                    </a>
                </div>

                {/* Links */}
                <div className="flex flex-row flex-wrap gap-10 sm:gap-12">
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</h4>
                        <div className="flex flex-col gap-2 text-sm">
                            {catalogLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-foreground/70 hover:text-primary transition-colors duration-150"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 px-2 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-2 text-xs text-muted-foreground">
                <p>© {currentYear} Chef On Pointe. Semua hak dilindungi.</p>
            </div>
        </footer>
    );
}
