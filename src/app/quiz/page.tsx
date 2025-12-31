'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/lib/store';
import { OptionCard } from '@/components/ui/option-card';
import { ArrowLeft, ArrowRight, Ruler, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function QuizPage() {
    const router = useRouter();
    const { currentStep, nextStep, prevStep, data, setData } = useQuizStore();

    const variants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
    };

    const handleNext = () => {
        // Validation Logic
        if (currentStep === 1 && !data.age) { toast.error('لطفا سن خود را وارد کنید'); return; }
        if (currentStep === 2 && (!data.height || !data.weight)) { toast.error('لطفا قد و وزن را وارد کنید'); return; }
        if (currentStep === 3 && !data.wristSize) { toast.error('لطفا دور مچ را وارد کنید'); return; }

        if (currentStep === 7) {
            toast.success("تحلیل انجام شد");
            setTimeout(() => router.push('/auth/login?blurred=true'), 500);
            return;
        }
        nextStep();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: // جنسیت
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">جنسیت شما؟</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {/* چون آیکون جنسیتی خاصی در لیست نبود، از ایموجی با استایل بزرگ استفاده میکنیم */}
                            <OptionCard label="آقا" selected={data.gender === 'male'} onClick={() => setData({ gender: 'male' })} icon="👨" isImage={false} />
                            <OptionCard label="خانم" selected={data.gender === 'female'} onClick={() => setData({ gender: 'female' })} icon="👩" isImage={false} />
                        </div>
                    </div>
                );
            case 1: // سن
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">سن شما؟</h2>
                        <input type="number" value={data.age || ''} onChange={(e) => setData({ age: parseInt(e.target.value) })} className="w-full text-5xl font-black text-center p-6 rounded-3xl border-2 border-primary/10 outline-none bg-white focus:border-accent transition-colors placeholder:text-gray-200" placeholder="مثال: ۲۸" autoFocus />
                    </div>
                );
            case 2: // قد و وزن
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">قد و وزن؟</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Ruler className="w-6 h-6 text-accent" />
                                </div>
                                <input type="number" value={data.height || ''} onChange={(e) => setData({ height: parseInt(e.target.value) })} className="flex-1 text-2xl font-bold text-center bg-transparent outline-none placeholder:text-gray-300" placeholder="قد (cm)" />
                            </div>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Scale className="w-6 h-6 text-accent" />
                                </div>
                                <input type="number" value={data.weight || ''} onChange={(e) => setData({ weight: parseInt(e.target.value) })} className="flex-1 text-2xl font-bold text-center bg-transparent outline-none placeholder:text-gray-300" placeholder="وزن (kg)" />
                            </div>
                        </div>
                    </div>
                );
            case 3: // دور مچ
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">دور مچ دست؟</h2>
                        <div className="relative w-24 h-24 mx-auto opacity-50">
                            {/* اینجا آیکون دست اگر داشتیم عالی بود، فعلا جاش خالی */}
                            <div className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full animate-spin-slow" />
                        </div>
                        <p className="text-center text-primary/60 font-medium">با انگشت شست و اشاره، دور مچ دست مخالف را بگیرید.</p>
                        <input type="number" value={data.wristSize || ''} onChange={(e) => setData({ wristSize: parseInt(e.target.value) })} className="w-full text-5xl font-black text-center p-4 rounded-3xl border-2 border-primary/20 outline-none bg-white focus:border-accent" placeholder="cm" />
                        <div className="flex justify-center gap-4 text-xs font-bold text-primary/40">
                            <span className="bg-white px-3 py-1 rounded-lg">۱۵-۱۷: ریز</span>
                            <span className="bg-white px-3 py-1 rounded-lg">۱۷-۲۰: متوسط</span>
                            <span className="bg-white px-3 py-1 rounded-lg">۲۰+: درشت</span>
                        </div>
                    </div>
                );
            case 4: // ساعت بیداری
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">ساعت بیداری طبیعی؟</h2>
                        <div className="relative">
                            <input type="time" value={data.wakeTime || '07:00'} onChange={(e) => setData({ wakeTime: e.target.value })} className="w-full text-5xl font-black text-center p-8 rounded-3xl border-2 border-primary/20 bg-white outline-none focus:border-accent" />
                        </div>
                        <p className="text-center text-primary/50 text-sm">بدون زنگ ساعت کی بیدار می‌شی؟</p>
                    </div>
                );
            case 5: // استرس
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">سطح استرس روزانه؟</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {/* برای استرس آیکون خاصی نداریم، ایموجی گویاتر است */}
                            <OptionCard label="کم" selected={data.stressLevel === 'low'} onClick={() => setData({ stressLevel: 'low' })} icon="😌" isImage={false} />
                            <OptionCard label="متوسط" selected={data.stressLevel === 'medium'} onClick={() => setData({ stressLevel: 'medium' })} icon="😐" isImage={false} />
                            <OptionCard label="زیاد" selected={data.stressLevel === 'high'} onClick={() => setData({ stressLevel: 'high' })} icon="😫" isImage={false} />
                        </div>
                    </div>
                );
            case 6: // هدف (جایگزینی با آیکون‌های اصلی)
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">هدف اصلی؟</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <OptionCard 
                                label="کاهش وزن" 
                                selected={data.mainGoal === 'weight_loss'} 
                                onClick={() => setData({ mainGoal: 'weight_loss' })} 
                                className="text-sm" 
                                icon="/icons/Avacadoo.svg" // نماد رژیم/چربی سالم
                            />
                            <OptionCard 
                                label="عضله سازی" 
                                selected={data.mainGoal === 'muscle_gain'} 
                                onClick={() => setData({ mainGoal: 'muscle_gain' })} 
                                className="text-sm" 
                                icon="/icons/Biceps.svg" // نماد قدرت
                            />
                            <OptionCard 
                                label="افزایش انرژی" 
                                selected={data.mainGoal === 'energy'} 
                                onClick={() => setData({ mainGoal: 'energy' })} 
                                className="text-sm" 
                                icon="/icons/Dart.svg" // نماد تمرکز/انرژی
                            />
                            <OptionCard 
                                label="سلامتی" 
                                selected={data.mainGoal === 'health_detox'} 
                                onClick={() => setData({ mainGoal: 'health_detox' })} 
                                className="text-sm" 
                                icon="/icons/Heart.svg" // نماد سلامت قلب
                            />
                        </div>
                    </div>
                );
            case 7: // محله
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-center text-primary">محله سکونت؟</h2>
                        <p className="text-center text-primary/60 text-sm">برای پیشنهاد بهترین پارک‌های ورزشی</p>
                        <input type="text" value={data.neighborhood || ''} onChange={(e) => setData({ neighborhood: e.target.value })} className="w-full text-3xl font-bold text-center p-6 rounded-3xl border-2 border-primary/20 outline-none bg-white focus:border-accent placeholder:text-gray-200" placeholder="مثال: وکیل‌آباد" />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-6 bg-surface text-primary overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="w-full max-w-md mt-8 z-10">
                {/* Progress Bar */}
                <div className="flex justify-between text-xs font-bold text-primary/30 mb-2 px-1">
                    <span>شروع</span>
                    <span>{Math.round(((currentStep + 1) / 8) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full mb-12 overflow-hidden shadow-inner border border-gray-100">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-accent to-action rounded-full" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${((currentStep + 1) / 8) * 100}%` }} 
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentStep} 
                        variants={variants} 
                        initial="enter" 
                        animate="center" 
                        exit="exit" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                        className="min-h-[400px]"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="w-full max-w-md flex justify-between mb-8 z-10">
                <button 
                    onClick={prevStep} 
                    disabled={currentStep === 0} 
                    className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-transparent hover:border-gray-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ArrowRight className="w-6 h-6 text-primary" />
                </button>
                
                <button 
                    onClick={handleNext} 
                    className="flex-1 mr-4 h-14 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <span className="text-lg">{currentStep === 7 ? 'پایان و تحلیل' : 'مرحله بعد'}</span>
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>
        </main>
    );
}