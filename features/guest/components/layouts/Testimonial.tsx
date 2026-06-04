import Image from "next/image";

const testimonials = [
    {
        id: 1,
        name: "Sarah L.",
        role: "Pelanggan Setia",
        content: "Kue dari Chef On Pointe selalu memuaskan! Rasanya pas, tidak terlalu manis, dan desainnya selalu sesuai dengan yang saya bayangkan. Sangat direkomendasikan untuk acara spesial Anda.",
        rating: 5,
    },
    {
        id: 2,
        name: "Budi Santoso",
        role: "Event Organizer",
        content: "Sudah berkali-kali pesan kue untuk klien saya di sini. Kualitas bahan dan detail dekorasinya luar biasa. Pengiriman juga selalu tepat waktu. Terima kasih Chef!",
        rating: 5,
    },
    {
        id: 3,
        name: "Amanda R.",
        role: "Pecinta Pastry",
        content: "Croissant dan artisan pastry-nya juara! Teksturnya renyah di luar dan lembut di dalam. Sangat cocok untuk teman ngopi di akhir pekan bersama keluarga tercinta.",
        rating: 5,
    }
];

export default function Testimonial() {
    return (
        <section className="w-full my-12 py-12 bg-[#faf6f1]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-primary mb-4">Apa Kata Mereka?</h2>
                    <p className="text-foreground/70 max-w-2xl mx-auto">
                        Kebahagiaan pelanggan adalah prioritas kami. Berikut adalah pengalaman mereka bersama Chef On Pointe.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div 
                            key={testimonial.id} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 flex flex-col h-full"
                        >
                            <div className="flex text-amber-400 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                    </svg>
                                ))}
                            </div>
                            
                            <p className="text-sm text-foreground/80 flex-1 italic mb-6">
                                "{testimonial.content}"
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{testimonial.name}</p>
                                    <p className="text-xs text-foreground/60">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
