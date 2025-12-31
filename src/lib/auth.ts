import { supabase } from './supabase';

// Use require for kavenegar as it's a CommonJS module
const Kavenegar = require('kavenegar');

const KAVENEGAR_API_KEY = process.env.NEXT_PUBLIC_KAVENEGAR_API_KEY || '';
const KAVENEGAR_SENDER = process.env.NEXT_PUBLIC_KAVENEGAR_SENDER || '2000660110';

/**
 * Generates a random 4-digit OTP code
 */
function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Sends OTP via KavehNegar SMS
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
        const otp = generateOTP();
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Normalize phone number (remove spaces, dashes, etc.)
        const normalizedPhone = phoneNumber.replace(/[\s\-()]/g, '');

        // Validate Iranian phone format
        if (!normalizedPhone.match(/^(09\d{9}|9\d{9})$/)) {
            return { success: false, error: 'شماره موبایل باید با 09 شروع شود' };
        }

        // Store OTP in Supabase
        const { error: dbError } = await supabase
            .from('otp_codes')
            .insert({
                phone: normalizedPhone,
                code: otp,
                expires_at: expiryTime.toISOString()
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return { success: false, error: 'خطا در ذخیره‌سازی کد' };
        }

        console.log('OTP stored in database:', { phone: normalizedPhone, code: otp });

        // Send SMS via KavehNegar
        try {
            if (!KAVENEGAR_API_KEY || KAVENEGAR_API_KEY === '') {
                console.warn('KavehNegar API key not set, skipping SMS');
                return { success: true, error: 'کد در دیتابیس ذخیره شد (SMS غیرفعال)' };
            }

            const api = Kavenegar.KavenegarApi({ apikey: KAVENEGAR_API_KEY });

            // Simple ASCII message for testing (avoid encoding issues)
            const message = `HesseKhub Code: ${otp} (5min)`;

            await new Promise((resolve, reject) => {
                api.Send({
                    message: message,
                    sender: KAVENEGAR_SENDER,
                    receptor: normalizedPhone
                }, (response: any, status: number) => {
                    console.log('KavehNegar response:', { status, response });

                    if (status === 200) {
                        resolve(response);
                    } else {
                        reject(new Error(`SMS failed with status: ${status}`));
                    }
                });
            });

            console.log('SMS sent successfully');
            return { success: true };
        } catch (smsError: any) {
            console.error('KavehNegar SMS error:', smsError.message || smsError);
            // Return success anyway since OTP is stored
            return { success: true, error: 'کد ذخیره شد اما پیامک ارسال نشد' };
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        return { success: false, error: 'خطا در ارسال پیامک' };
    }
}

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
