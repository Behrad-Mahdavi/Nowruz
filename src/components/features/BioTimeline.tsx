'use client';

import { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { TimelineItem } from "@/lib/dashboard-types";
import Image from 'next/image';
import { Check } from "lucide-react";

interface BioTimelineProps {
    timeline: TimelineItem[];
    onPromoClick: (promo: { code: string; link: string; description?: string }) => void;
}

// مپینگ آیکون‌ها بر اساس فایل‌های موجود در پوشه public/icons
const iconPaths: Record<string, string> = {
    sun: '/icons/Leaf.svg',          // صبحانه (تازگی)
    flame: '/icons/Dish.svg',        // ناهار (وعده اصلی)
    moon: '/icons/Avacadoo.svg',     // شام (سبک/سالم)
    dumbbell: '/icons/Dumbble.svg',  // ورزش
    droplet: '/icons/Water.svg',     // آب
};

export function BioTimeline({ timeline, onPromoClick }: BioTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeCardRef.current && scrollContainerRef.current) {
            activeCardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [timeline]);

    return (
        <div className="mb-12">
            <h2 className="text-lg font-black text-primary/60 mb-4 uppercase tracking-widest text-xs">
                تایم‌لاین بیولوژیک (۲۴ ساعته)
            </h2>

            <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-8 -mx-6 px-6 scrollbar-hide"
                style={{ scrollbarWidth: 'none' }}
            >
                <div className="flex gap-6 min-w-max px-2">
                    {timeline.map((item, idx) => {
                        const iconSrc = iconPaths[item.icon] || '/icons/Leaf.svg';
                        const isActive = item.status === 'active';
                        const isDone = item.status === 'done';

                        return (
                            <motion.div
                                key={idx}
                                ref={isActive ? activeCardRef : null}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: isDone ? 0.6 : 1,
                                    y: 0,
                                    scale: isActive ? 1.05 : 1
                                }}
                                transition={{ delay: idx * 0.1 }}
                                className={`
                                    relative flex-shrink-0 w-72 p-6 rounded-3xl border-2 transition-colors duration-300
                                    ${isActive
                                        ? 'bg-white border-primary/20 shadow-xl shadow-primary/10 z-10'
                                        : 'bg-surface border-transparent opacity-80'
                                    }
                                `}
                            >
                                {/* تیک انجام شده */}
                                {isDone && (
                                    <div className="absolute top-4 left-4 w-6 h-6 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5" strokeWidth={4} />
                                    </div>
                                )}

                                {/* ساعت */}
                                <div className={`
                                    inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4
                                    ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
                                `}>
                                    {item.time}
                                </div>

                                {/* بخش آیکون و تیتر */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`
                                        /* کانتینر بزرگتر: w-16 h-16 */
                                        w-16 h-16 rounded-2xl flex items-center justify-center relative
                                        ${isActive ? 'bg-action/10' : 'bg-gray-200/50'}
                                    `}>
                                        <Image
                                            src={iconSrc}
                                            alt={item.title}
                                            /* سایز تصویر بزرگتر: 40px */
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 object-contain drop-shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black leading-tight ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">
                                            {item.type === 'meal' ? 'وعده غذایی' : item.type === 'workout' ? 'ورزش' : 'استراحت'}
                                        </p>
                                    </div>
                                </div>

                                {/* دکمه اکشن */}
                                {isActive && item.is_promo && item.promo_data && (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onPromoClick(item.promo_data!)}
                                        className="mt-4 w-full bg-primary text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>🎁</span>
                                        <span>🎁 دریافت پیشنهاد حس‌خوب</span>
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}