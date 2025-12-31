'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Image from 'next/image';

// اینترفیس پایه (بدون Title)
interface SmartCardBaseProps {
    className?: string;
    delay?: number;
}

// --- کارت تغذیه (Nutrition) ---
interface NutritionCardProps extends SmartCardBaseProps {
    data: {
        title: string;
        value: string;
        detail: string;
        macros?: { protein: number; carbs: number; fats: number };
    };
}

export function NutritionCard({ data, delay = 0 }: NutritionCardProps) {
    const { title, value, detail, macros } = data;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#FFF9F0] border-2 border-accent/20 rounded-3xl p-6 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                {/* آیکون آووکادو بزرگ: 50px */}
                <Image
                    src="/icons/Avacadoo.svg"
                    alt="Nutrition"
                    width={50}
                    height={50}
                    className="w-12 h-12 object-contain drop-shadow-sm"
                />
                <span className="text-xs font-black uppercase tracking-widest text-accent/60">{title}</span>
            </div>

            <div className="text-3xl font-black text-primary mb-2">{value}</div>
            <p className="text-sm text-primary/60 font-bold mb-4">{detail}</p>

            {macros && (
                <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-primary">{macros.protein}%</div>
                        <div className="text-[10px] font-black uppercase text-primary/40">پروتئین</div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-primary">{macros.carbs}%</div>
                        <div className="text-[10px] font-black uppercase text-primary/40">کربو</div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// --- کارت آب (Hydration) ---
interface HydrationCardProps extends SmartCardBaseProps {
    goal?: number;
}

export function HydrationCard({ goal = 8, delay = 0 }: HydrationCardProps) {
    const [count, setCount] = useState(goal);

    const handleDrink = () => {
        if (count > 0) {
            setCount(count - 1);
            toast.success('نوش جان! 💧');
        } else {
            toast('هدف امروز کامل شد! 🎉');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white border-2 border-primary/10 rounded-3xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                {/* آیکون بطری آب خیلی بزرگ: 60px */}
                <Image
                    src="/icons/Water Bottle.svg"
                    alt="Water"
                    width={60}
                    height={60}
                    className="w-14 h-14 object-contain drop-shadow-sm"
                />
                <span className="text-xs font-black uppercase tracking-widest text-primary/60">هیدراتاسیون</span>
            </div>

            <div className="text-center mb-6">
                <div className="text-5xl font-black text-primary mb-2">{count}</div>
                <p className="text-sm text-primary/60 font-bold">لیوان مانده</p>
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDrink}
                disabled={count === 0}
                className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg transition-colors",
                    count > 0
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
            >
                {count > 0 ? '+ نوشیدم' : '✅ کامل شد'}
            </motion.button>
        </motion.div>
    );
}

// --- کارت انرژی (Energy) ---
interface EnergyCardProps extends SmartCardBaseProps {
    level: 'Low' | 'Medium' | 'High';
    chronotype: string;
}

export function EnergyCard({ level, chronotype, delay = 0 }: EnergyCardProps) {
    const energyConfig = {
        Low: { text: 'پایین', color: 'text-gray-400', bg: 'bg-gray-50' },
        Medium: { text: 'متوسط', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        High: { text: 'اوج انرژی', color: 'text-red-500', bg: 'bg-red-50' }
    };

    const config = energyConfig[level];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={cn("border-2 border-gray-200/50 rounded-3xl p-6", config.bg)}
        >
            <div className="flex items-center justify-between mb-4">
                {/* آیکون بازو (قدرت) بزرگ: 50px */}
                <Image
                    src="/icons/Biceps.svg"
                    alt="Energy"
                    width={50}
                    height={50}
                    className="w-12 h-12 object-contain drop-shadow-sm"
                />
                <span className="text-xs font-black uppercase tracking-widest text-primary/60">سطح انرژی</span>
            </div>

            <div className="text-center">
                <div className="text-6xl mb-3">{level === 'High' ? '🔥' : '⚡'}</div>
                <div className={cn("text-2xl font-black mb-1", config.color)}>{config.text}</div>
                <p className="text-xs text-primary/50 font-bold">بر اساس کرونوتایپ {chronotype}</p>
            </div>
        </motion.div>
    );
}