'use client';

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface PromoModalProps {
    isOpen: boolean;
    onClose: () => void;
    promoData: {
        code: string;
        link: string;
        description?: string;
    } | null;
}

export function PromoModal({ isOpen, onClose, promoData }: PromoModalProps) {
    if (!promoData) return null;

    const copyCode = () => {
        navigator.clipboard.writeText(promoData.code);
        toast.success('کد تخفیف کپی شد!');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="bg-white rounded-[3rem] max-w-md w-full p-8 shadow-2xl pointer-events-auto relative overflow-hidden">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 left-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Decorative background */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-action/10 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative z-10 text-center">
                                <div className="text-6xl mb-6">🎁</div>
                                <h2 className="text-3xl font-black text-primary mb-3">پیشنهاد ویژه حس‌خوب</h2>
                                <p className="text-lg text-primary/70 font-bold mb-8">
                                    {promoData.description || 'استیک مرغ ویژه + سالاد کینوا'}
                                </p>

                                {/* Promo Code */}
                                <div className="bg-gradient-to-r from-accent to-action p-6 rounded-2xl mb-6">
                                    <div className="text-sm font-black uppercase tracking-widest text-white/70 mb-2">کد تخفیف ۲۰٪</div>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="font-mono text-3xl font-black text-white tracking-[0.3em]">
                                            {promoData.code}
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={copyCode}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                        >
                                            <Copy className="w-5 h-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <a
                                    href={promoData.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-primary hover:bg-primary/90 text-white font-black py-4 px-8 rounded-2xl transition-colors"
                                >
                                    🛒 سفارش آنلاین
                                </a>

                                <p className="text-xs text-primary/40 mt-4 font-bold">
                                    اعتبار تا پایان نوروز ۱۴۰۵
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
