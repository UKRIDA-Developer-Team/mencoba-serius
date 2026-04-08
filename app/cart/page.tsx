import { Calendar, Edit, Info, Store, Van } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <header className="mb-12">
                <h1 className="font-serif text-4xl md:text-5xl text-primary mb-2">Review Your Selection</h1>
                <p className="text-secondary font-light">Crafting your sensory experience with care.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* <!-- Cart Items Section (8 Cols) --> */}
                <section className="lg:col-span-7 space-y-8">
                    {/* Item 1 */}
                    <div className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-surface-container-lowest transition-all">
                        <div className="w-full md:w-40 aspect-[4/5] overflow-hidden rounded-lg shrink-0">
                            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Close-up of a decadent dark chocolate cake with edible gold leaf and velvet texture on a cream pedestal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFimSt-3a-Ll63PJUxMecnPEVV2WRCCavm05hdsxqzYpYSC-TWEEAUxJAAi8raDBoGaomAHoMFsjh2gTE8dNwER5pp3f33OJTh5xt7MvyMzNml0TwlaW8WQi-WrXRdKpfPiNCNV2RvncPlUlBsRjs6ZPyhD-zloUE9-GUiLhwmGtQZeQlw1WQ7sh28hHRKO0wA_0vGKpJAQbaMPMA0SitPyhxMj5OJtqS0YLeHuujvcg1I8FOBQGrR_LfNuWT2hafMLhajinjFe78w" />
                        </div>
                        <div className="flex flex-col justify-between py-2 grow">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif text-xl text-primary">Midnight Ganache Velvet</h3>
                                    <p className="text-primary font-semibold">$84.00</p>
                                </div>
                                <p className="text-secondary text-sm mt-1">Size: 8-inch Atelier Circle</p>
                                <p className="text-on-surface-variant text-xs mt-4 flex items-center gap-1">
                                    <Edit className="w-4 h-4 text-secondary" />
                                    Note: "Happy Birthday Eloise"
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center bg-surface-container-low rounded-full px-3 py-1 border border-outline-variant/20">
                                    <button className="text-secondary hover:text-primary p-1"><span className="material-symbols-outlined text-sm">remove</span></button>
                                    <span className="px-4 text-sm font-medium">01</span>
                                    <button className="text-secondary hover:text-primary p-1"><span className="material-symbols-outlined text-sm">add</span></button>
                                </div>
                                <button className="text-outline hover:text-error transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Item 2 --> */}
                    <div className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl bg-surface-container-lowest transition-all">
                        <div className="w-full md:w-40 aspect-[4/5] overflow-hidden rounded-lg shrink-0">
                            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Selection of artisan rose-water macarons arranged asymmetrically on a rustic stone surface with dried petals" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmaGcCWOSKTxROKRHpjqiX4bmH74aRAK9p-LNGInr_TRBPCe8FdMdElYdomhXBK01mgNbv7XCH4jTngfQKsH5y65S6zWqFTD0TTJ2IegXk1teJd2izrxtixsEwFFfmawPZDsEt-ZRGNKUV4KX1dTzrNaUR5aGLgcnamP-lLIArT4DXVxjvEG4-Y-fOl0cBb4g-bjiqLLRkjhfee9olQ-uWl_Iz9ChcmHnzvWfzf0DbXoaeQaBIOjDsLwZ3aFOKjgQEtxDh1uavM7KU" />
                        </div>
                        <div className="flex flex-col justify-between py-2 grow">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif text-xl text-primary">Petal &amp; Pistachio Box</h3>
                                    <p className="text-primary font-semibold">$32.00</p>
                                </div>
                                <p className="text-secondary text-sm mt-1">Quantity: 12 Piece Collection</p>
                            </div>
                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center bg-surface-container-low rounded-full px-3 py-1 border border-outline-variant/20">
                                    <button className="text-secondary hover:text-primary p-1"><span className="material-symbols-outlined text-sm">remove</span></button>
                                    <span className="px-4 text-sm font-medium">01</span>
                                    <button className="text-secondary hover:text-primary p-1"><span className="material-symbols-outlined text-sm">add</span></button>
                                </div>
                                <button className="text-outline hover:text-error transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Pre-Order Scheduling --> */}
                    <div className="mt-12 p-8 rounded-2xl bg-surface-container">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h2 className="font-serif text-2xl text-primary">Pre-Order Schedule</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Select Date</label>
                                <div className="relative">
                                    <input className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary-fixed appearance-none" type="date" defaultValue="2024-05-24" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Preferred Time</label>
                                <select className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary-fixed appearance-none">
                                    <option>10:00 AM - 12:00 PM</option>
                                    <option>12:00 PM - 02:00 PM</option>
                                    <option>02:00 PM - 04:00 PM</option>
                                    <option>04:00 PM - 06:00 PM</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input defaultChecked className="hidden peer" name="method" type="radio" />
                                <div className="p-4 rounded-xl border border-outline-variant/20 peer-checked:bg-primary peer-checked:text-white transition-all flex items-center justify-center gap-2">
                                    <Store className="w-5 h-5 text-white" />
                                    <span className="text-sm font-medium">Boutique Pickup</span>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input className="hidden peer" name="method" type="radio" />
                                <div className="p-4 rounded-xl border border-outline-variant/20 peer-checked:bg-primary peer-checked:text-white transition-all flex items-center justify-center gap-2">
                                    <Van className="w-5 h-5 text-white" />
                                    <span className="text-sm font-medium">White-Glove Delivery</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>
                {/* <!-- Summary Section (4 Cols) --> */}
                <aside className="lg:col-span-5 lg:sticky lg:top-32">
                    <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
                        <h2 className="font-serif text-2xl text-primary mb-8">Atelier Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-secondary">
                                <span>Subtotal</span>
                                <span>$116.00</span>
                            </div>
                            <div className="flex justify-between text-secondary">
                                <span>Delivery Fee</span>
                                <span className="italic text-xs">Calculated at next step</span>
                            </div>
                            <div className="flex justify-between text-secondary">
                                <span>Estimated Tax</span>
                                <span>$9.28</span>
                            </div>
                            <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-center">
                                <span className="font-serif text-xl text-primary">Total Est.</span>
                                <span className="font-serif text-2xl text-primary">$125.28</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Link href="/order/confirm" className="w-full berry-gradient text-white py-5 rounded-lg font-bold tracking-widest text-xs uppercase hover:opacity-90 transition-opacity active:scale-95 duration-200 shadow-xl shadow-primary/10">
                                Proceed to Checkout
                            </Link>
                            <p className="text-center text-[10px] text-secondary uppercase tracking-[0.2em] pt-4">
                                Secure Encrypted Checkout
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 p-6 rounded-xl bg-primary-fixed/30 flex items-start gap-4">
                        <Info className="w-5 h-5 text-primary" />
                        <div>
                            <h4 className="text-xs font-bold text-primary-container uppercase tracking-wider mb-1">Pre-Order Notice</h4>
                            <p className="text-xs text-on-primary-fixed-variant leading-relaxed">
                                Our creations require 48 hours lead time for perfection. Cancellations must be made within 24 hours of ordering.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}