'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPreview } from '@/components/features/dashboard-preview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { sendOTP } from '@/lib/auth';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBlurred = searchParams.get('blurred') === 'true';
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 1 } },
    };

    const handleSendOTP = async () => {
        // Validate phone number
        if (phone.length < 10) {
            toast.error('شماره موبایل معتبر نیست');
            return;
        }

        setLoading(true);

        try {
            // Send real OTP via KavehNegar
            const result = await sendOTP(phone);

            if (result.success) {
                toast.success('کد تایید ارسال شد');
                sessionStorage.setItem('auth_phone', phone);
                router.push('/auth/verify');
            } else {
                toast.error(result.error || 'خطا در ارسال کد');
            }
        } catch (error) {
            console.error('OTP send error:', error);
            toast.error('خطا در ارسال پیامک');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-surface overflow-hidden">
            <motion.div
                className="absolute inset-0 p-8 pt-24 filter blur-xl scale-105 pointer-events-none"
                initial={isBlurred ? { opacity: 0, filter: "blur(0px)" } : { opacity: 1, filter: "blur(20px)" }}
                animate={{ opacity: 0.6, filter: "blur(16px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <DashboardPreview />
            </motion.div>

            <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/40"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">ورود به حساب</h1>
                    <p className="text-sm opacity-60">برای مشاهده برنامه اختصاصی، شماره موبایل خود را وارد کنید.</p>
                </div>

                <div className="space-y-6">
                    <Input
                        type="tel"
                        dir="ltr"
                        placeholder="0912 345 6789"
                        className="text-center text-2xl tracking-widest"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <Button
                        className="w-full h-14 text-lg rounded-2xl"
                        onClick={handleSendOTP}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'دریافت کد تایید'}
                    </Button>
                </div>

                <p className="text-xs text-center mt-6 opacity-40">
                    با ورود به سیستم، قوانین و مقررات را می‌پذیرم.
                </p>
            </motion.div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </main>
        }>
            <LoginContent />
        </Suspense>
    );
}
