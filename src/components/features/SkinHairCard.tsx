'use client';

import { motion } from "framer-motion";
import Image from 'next/image';
import { SkinHairProfile } from "@/lib/dashboard-types";
import { Sparkles, Moon, Sun, Utensils } from "lucide-react";

interface SkinHairCardProps {
    profile: SkinHairProfile;
    delay?: number;
}

export function SkinHairCard({ profile, delay = 0.8 }: SkinHairCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="md:col-span-3 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden"
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600 shadow-sm">
                    <Utensils className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-primary">تغذیه هوشمند پوست و مو</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest mt-1">نسخه طب سنتی و مدرن</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Skin Analysis */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <h4 className="font-bold text-gray-400 text-sm">وضعیت بیولوژیک</h4>
                    </div>
                    <p className="text-lg font-black text-primary leading-tight">{profile.skinType}</p>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                        <span className="text-xs text-green-600 block mb-1 font-bold">سوپرفود پیشنهادی (Hero Food):</span>
                        <span className="font-bold text-green-800 text-lg">{profile.protocol.hero_ingredient}</span>
                    </div>
                </div>

                {/* Nutrition Protocol */}
                <div className="space-y-4 md:border-r md:border-gray-100 md:pr-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-orange-400" />
                        <h4 className="font-bold text-gray-400 text-sm">پیشنهاد صبحانه</h4>
                    </div>
                    <p className="text-sm font-bold text-primary/80 leading-relaxed bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">{profile.protocol.morning}</p>

                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent my-2" />

                    <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-bold text-gray-400 text-sm">پیشنهاد شام</h4>
                    </div>
                    <p className="text-sm font-bold text-primary/80 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">{profile.protocol.evening}</p>
                </div>

                {/* Circadian Tip */}
                <div className="bg-purple-50 rounded-3xl p-6 flex flex-col justify-center border border-purple-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        <Image src="/icons/Purple Shape.svg" alt="Tip" width={48} height={48} className="w-12 h-12 opacity-90 drop-shadow-sm" />
                    </div>
                    <h4 className="font-bold text-purple-700 mb-2 text-sm relative z-10">نکته طلایی (ساعت زیستی):</h4>
                    <p className="text-sm text-purple-900/70 font-bold leading-relaxed relative z-10">
                        {profile.circadian_tip}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}