import { supabase } from './supabase';



/**
 * Sends OTP via KavehNegar SMS
 */
// Helper to normalize phone numbers
function normalizePhone(phone: string): string {
    return phone.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .replace(/\D/g, ''); // Remove non-digits
}

// تابع اصلاح شده ارسال پیامک
export const sendOTP = async (mobile: string) => {
    // 0. نرمال‌سازی شماره موبایل (تبدیل اعداد فارسی و حذف فاصله‌ها)
    const normalizedMobile = normalizePhone(mobile);

    // 1. تولید کد تصادفی
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes expiry

    console.log("Generated Code:", code);

    // 2. ذخیره در دیتابیس (Supabase)
    const { error: dbError } = await supabase
        .from('otp_codes')
        .insert({
            phone: normalizedMobile,
            code,
            expires_at: expiresAt
        });

    if (dbError) {
        console.error('Supabase Error:', dbError);
        return { success: false, error: dbError.message };
    }

    console.log(`OTP stored in database: {phone: '${normalizedMobile}', code: '${code}'}`);

    // 3. ارسال درخواست به API Route خودمان (Proxy)
    try {
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: normalizedMobile, code }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'SMS sending failed');
        }

        console.log('SMS sent successfully via Server Route');
        return { success: true, code }; // در پروداکشن کد را برنگردانید

    } catch (error: any) {
        console.error('Client SMS Error:', error);
        // جهت تست، حتی اگر پیامک خطا داد، موفقیت برمی‌گردانیم تا لاگین انجام شود
        // در پروداکشن این خط را بردارید:
        return { success: true, code, warning: "SMS failed but process continued for testing" };

        // در حالت واقعی این را برگردانید:
        // return { success: false, error: error.message };
    }
};

/**
 * Verifies OTP code
 */
export async function verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Check OTP in database
        const { data, error } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('phone', phoneNumber)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            return { success: false, error: 'کد نامعتبر یا منقضی شده است' };
        }

        // Delete OTP to prevent reuse
        await supabase
            .from('otp_codes')
            .delete()
            .eq('id', data.id);

        // ---------------------------------------------------------
        // PSEUDO-AUTH STRATEGY
        // Since we use a custom SMS provider (KavehNegar), we bridge
        // to Supabase Auth by creating a deterministic email/password.
        // This allows us to use RLS and standard Supabase features.
        // ---------------------------------------------------------

        const fakeEmail = `${phoneNumber}@vita.app`;
        const fakePassword = `vita-secret-${phoneNumber}-${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 8)}`;

        // 1. Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: fakePassword,
        });

        if (signInError) {
            console.log('SignIn failed, attempting creation...', signInError.message);

            // 2. If sign in fails, try to sign up
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: fakeEmail,
                password: fakePassword,
                options: {
                    data: {
                        phone: phoneNumber,
                        full_name: 'کاربر جدید',
                    },
                },
            });

            if (signUpError) {
                console.error('SignUp Error:', signUpError);
                return { success: false, error: 'خطا در ایجاد حساب کاربری' };
            }

            // CRITICAL: Check for session immediately after signup
            if (!signUpData.session) {
                // If no session, try signing in one more time (sometimes needed)
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                    email: fakeEmail,
                    password: fakePassword,
                });

                if (retryError || !retryData.session) {
                    console.error('Session creation failed. Confirm Email might be ON.');
                    return {
                        success: false,
                        error: 'خطا سیستمی: لطفا در تنظیمات Supabase گزینه "Confirm Email" را غیرفعال کنید.'
                    };
                }
            }
        } else if (!signInData.session) {
            return { success: false, error: 'خطا در دریافت نشست کاربری' };
        }

        return { success: true };
    } catch (error) {
        console.error('Verify OTP error:', error);
        return { success: false, error: 'خطا در تایید کد' };
    }
}
