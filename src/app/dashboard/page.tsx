'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/lib/store';
import { generatePlan, generateTimeline, generateDashboardMeta, generateSmartCards } from '@/lib/algorithms';
import { GeneratedPlan } from '@/lib/types';
import { LiveDashboard } from '@/lib/dashboard-types';
import toast from 'react-hot-toast';
import { BentoCard, InfoCard } from '@/components/features/dashboard-components';
import { BioTimeline } from '@/components/features/BioTimeline';
import { NutritionCard, HydrationCard, EnergyCard } from '@/components/features/SmartCard';
import { PromoModal } from '@/components/features/PromoModal';
import { Activity, Sun, Utensils } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { data } = useQuizStore();
    const [plan, setPlan] = useState<GeneratedPlan | null>(null);
    const [liveDashboard, setLiveDashboard] = useState<LiveDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [promoModal, setPromoModal] = useState<{ code: string; link: string; description?: string } | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            // شبیه‌سازی لودینگ اولیه
            await new Promise(r => setTimeout(r, 800));
            toast('⏳ در حال اسکن متابولیسم...', { icon: '🧬' });

            await new Promise(r => setTimeout(r, 1200));

            // اگر دیتای کوییز نباشد (کاربر مستقیم آمده باشد)
            const generated = generatePlan(data as any);
            setPlan(generated);

            // استخراج پارامترهای جدید برای الگوریتم‌های پیشرفته
            const currentHour = new Date().getHours();
            // مقدار پیش‌فرض اگر کاربر وارد نکرده باشد
            const wakeTime = data.wakeTime || '07:00'; 
            const mainGoal = data.mainGoal || 'health_detox';

            // --- فراخوانی توابع با آرگومان‌های جدید ---
            
            // 1. تایم‌لاین هوشمند (نیاز به ساعت بیداری دارد)
            const timeline = generateTimeline(
                generated.chronotype, 
                generated.somatotype, 
                wakeTime, 
                currentHour
            );

            // 2. دیتای متا (سلام و انرژی نسبی)
            const dashboardMeta = generateDashboardMeta(
                generated.chronotype, 
                wakeTime, 
                currentHour
            );

            // 3. کارت‌های هوشمند (نیاز به هدف کاربر دارد)
            const smartCards = generateSmartCards(
                generated.somatotype, 
                generated.chronotype, 
                mainGoal
            );
            // ----------------------------------------

            setLiveDashboard({
                dashboard_meta: dashboardMeta,
                smart_cards: smartCards,
                timeline
            });

            toast.success(`تیپ بدنی شناسایی شد: ${generated.somatotype === 'ectomorph' ? 'پیکرتراش (Ecto)' : generated.somatotype === 'endomorph' ? 'درشت‌نقش (Endo)' : 'ورزشی (Meso)'}`);
            
            await new Promise(r => setTimeout(r, 800));

            setLoading(false);
            toast.success("برنامه شما آماده است ✅");
        };

        loadDashboard();
    }, [data, router]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <p className="text-primary/60 font-medium">در حال طراحی بیولوژیک...</p>
                </div>
            </main>
        );
    }

    if (!plan || !liveDashboard) return null;

    return (
        <main className="min-h-screen bg-[#F8F9FA] p-6 pb-24 md:p-12 overflow-x-hidden">
            <header className="mb-12 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-3xl font-black md:text-5xl text-primary tracking-tight">
                        {liveDashboard.dashboard_meta.greeting}
                    </h1>
                    <p className="text-sm md:text-lg opacity-40 font-medium mt-1">
                        وضعیت انرژی: {liveDashboard.dashboard_meta.energy_level === 'High' ? '🔥 اوج' : liveDashboard.dashboard_meta.energy_level === 'Medium' ? '⚡ متوسط' : '🔋 پایین'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-end gap-2"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">حساب کاربری</span>
                </motion.div>
            </header>

            {/* Smart Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <NutritionCard
                    title={liveDashboard.smart_cards.nutrition.title}
                    value={liveDashboard.smart_cards.nutrition.value}
                    detail={liveDashboard.smart_cards.nutrition.detail}
                    macros={liveDashboard.smart_cards.nutrition.macros}
                    delay={0.1}
                />
                <HydrationCard
                    goal={liveDashboard.dashboard_meta.hydration_goal}
                    delay={0.2}
                />
                <EnergyCard
                    level={liveDashboard.dashboard_meta.energy_level}
                    chronotype={plan.chronotype}
                    delay={0.3}
                />
            </div>

            {/* Bio-Timeline */}
            <BioTimeline
                timeline={liveDashboard.timeline}
                onPromoClick={(promo) => setPromoModal(promo)}
            />

            {/* Analysis Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <InfoCard
                    title="تیپ بدنی"
                    value={plan.somatotype.toUpperCase()}
                    icon="🧬"
                    subtext="ساختار استخوانی و پتانسیل ژنتیک"
                    className="md:col-span-1 bg-surface"
                    delay={0.4}
                />
                <InfoCard
                    title="کرونوتایپ"
                    value={plan.chronotype === 'lion' ? 'LION' : plan.chronotype === 'wolf' ? 'WOLF' : 'BEAR'}
                    icon="⏰"
                    subtext={`${plan.chronotype === 'lion' ? 'سحرخیز' : plan.chronotype === 'wolf' ? 'شب‌زی' : 'نرمال'}`}
                    className="md:col-span-1 bg-surface"
                    delay={0.5}
                />
                <InfoCard
                    title="شاخص BMI"
                    value={plan.bmiValue.toFixed(1)}
                    icon="⚖️"
                    subtext={plan.bmiStatus}
                    className={`md:col-span-1 bg-surface ${plan.bmiStatus === 'Normal' ? 'text-green-600' : 'text-orange-500'}`}
                    delay={0.6}
                />
            </div>

            {/* Advanced Protocol */}
            <BentoCard className="md:col-span-1" delay={0.7}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-action/10 rounded-[1.5rem] text-action">
                        <Utensils className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-primary">پروتکل ۳ روزه پاکسازی</h2>
                        <p className="text-sm opacity-40 font-bold uppercase tracking-widest">تغذیه و فعالیت هوشمند</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface p-6 rounded-[2rem] border border-gray-100/50">
                        <h3 className="font-black text-lg text-primary mb-3 flex items-center gap-3">
                            <Sun className="w-5 h-5 text-orange-400" />
                            تغذیه هوشمند
                        </h3>
                        <p className="text-base leading-relaxed text-primary/70 font-bold">{plan.recommendations.nutrition}</p>
                    </div>

                    <div className="bg-surface p-6 rounded-[2rem] border border-gray-100/50">
                        <h3 className="font-black text-lg text-primary mb-3 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-red-400" />
                            استراتژی ورزش
                        </h3>
                        <p className="text-base leading-relaxed text-primary/70 font-bold">{plan.recommendations.workout}</p>
                    </div>
                </div>
            </BentoCard>

            {/* Promo Modal */}
            <PromoModal
                isOpen={promoModal !== null}
                onClose={() => setPromoModal(null)}
                promoData={promoModal}
            />
        </main>
    );
}