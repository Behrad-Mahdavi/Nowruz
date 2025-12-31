'use client';

import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";

export function PackagesSection() {
    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                    <Star className="w-6 h-6 fill-accent" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-primary">پکیج‌های اشتراک غذا</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest mt-1">۲۰٪ تخفیف ویژه اعضا</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* پکیج ماهانه */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[2rem] p-8 border-2 border-transparent hover:border-accent/30 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
                        ۲۰٪ تخفیف
                    </div>

                    <h4 className="text-2xl font-black text-primary mb-2">اشتراک ۱ ماهه</h4>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-black text-action">۹.۸۰۰.۰۰۰</span>
                        <span className="text-sm text-gray-400 line-through">۱۲.۲۵۰.۰۰۰</span>
                        <span className="text-xs text-gray-400">تومان</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                        <li className="flex gap-3 text-sm font-bold text-gray-600">
                            <Check className="w-5 h-5 text-green-500" /> ارسال رایگان روزانه
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-gray-600">
                            <Check className="w-5 h-5 text-green-500" /> تنوع غذایی ۳۰ روزه
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-gray-600">
                            <Check className="w-5 h-5 text-green-500" /> مشاوره هفتگی رایگان
                        </li>
                    </ul>

                    <button className="w-full py-4 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        ثبت نام و شروع
                    </button>
                </motion.div>

                {/* پکیج ۳ ماهه (VIP) */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-primary rounded-[2rem] p-8 text-white relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('/icons/Purple Shape.svg')] opacity-10 bg-cover" />
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-accent to-yellow-400 text-primary text-xs font-black px-4 py-2 rounded-bl-2xl flex items-center gap-1">
                        <Zap className="w-3 h-3" /> محبوب‌ترین
                    </div>

                    <h4 className="text-2xl font-black mb-2 relative z-10">اشتراک ۳ ماهه (VIP)</h4>
                    <div className="flex items-baseline gap-2 mb-6 relative z-10">
                        <span className="text-3xl font-black text-accent">۲۸.۰۰۰.۰۰۰</span>
                        <span className="text-sm text-white/40 line-through">۳۵.۰۰۰.۰۰۰</span>
                        <span className="text-xs text-white/40">تومان</span>
                    </div>

                    <ul className="space-y-3 mb-8 relative z-10">
                        <li className="flex gap-3 text-sm font-bold text-white/80">
                            <Check className="w-5 h-5 text-accent" /> تمام مزایای پکیج ماهانه
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-white/80">
                            <Check className="w-5 h-5 text-accent" /> آنالیز حضوری ماهیانه
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-white/80">
                            <Check className="w-5 h-5 text-accent" /> **فریز اشتراک** (سفر/تعطیلات)
                        </li>
                    </ul>

                    <button className="w-full py-4 rounded-xl bg-white text-primary font-black hover:bg-gray-100 transition-all shadow-lg relative z-10">
                        خرید اشتراک VIP
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
