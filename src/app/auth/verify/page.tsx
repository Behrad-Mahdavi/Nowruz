'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuizStore } from '@/lib/store';
import { syncQuizData } from '@/lib/sync';
import { verifyOTP } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function VerifyPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const p = sessionStorage.getItem('auth_phone');
        if (p) setPhone(p);
    }, []);

    const handleVerify = async () => {
        if (code.length < 4) {
            toast.error('کد تایید را وارد کنید');
            return;
        }

        setLoading(true);

        try {
            // Verify OTP with KavehNegar
            const result = await verifyOTP(phone, code);

            if (!result.success) {
                toast.error(result.error || 'کد نامعتبر است');
                setLoading(false);
                return;
            }

            toast.success('ورود موفق!');

            // Sync quiz data to Supabase
            const { data } = useQuizStore.getState();
            const syncSuccess = await syncQuizData(data);

            if (syncSuccess) {
                toast.success('اطلاعات ثبت شد');
            }

            router.push('/dashboard');
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('خطا در تایید کد');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-surface p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">تایید شماره موبایل</h1>
                    <p className="text-sm opacity-60">کد ارسال شده به {phone} را وارد کنید.</p>
                </div>

                <div className="space-y-6">
                    <Input
                        type="number"
                        dir="ltr"
                        placeholder="----"
                        className="text-center text-4xl tracking-[1em]"
                        maxLength={4}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <Button
                        className="w-full h-14 text-lg rounded-2xl"
                        onClick={handleVerify}
                        disabled={loading || code.length < 4}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'ورود'}
                    </Button>

                    <button onClick={() => router.back()} className="w-full text-sm text-primary/60 hover:text-primary">
                        اصلاح شماره موبایل
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
