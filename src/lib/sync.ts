import { supabase } from './supabase';
import { AssessmentData } from './types';
import { calculateBMI, calculateLeadScore } from './algorithms';

export const syncQuizData = async (data: Partial<AssessmentData>) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Logic check: ensure we have basic data to calculate BMI/Score
        const height = data.height || 175;
        const weight = data.weight || 70;
        const { status: bmiStatus } = calculateBMI(weight, height);

        // Calculate Lead Score (for sales team prioritization)
        const leadScore = calculateLeadScore(data as AssessmentData, bmiStatus);

        // 1. Update Profile (Phone is already there from Auth, we update neighborhood/lead_score)
        const profileUpdate = {
            neighborhood: data.neighborhood || '',
            city: data.city || 'Mashhad',
            lead_score: leadScore,
            full_name: data.full_name || user.user_metadata?.full_name || '',
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', user.id);

        if (profileError) console.warn('Profile Sync Warning:', profileError.message);

        // 2. Insert Assessment Record
        const payload = {
            user_id: user.id,
            gender: data.gender || 'male',
            age: data.age || 30,
            height: height,
            weight: weight,
            wrist_size: data.wristSize || 17,
            wake_time: data.wakeTime || '07:30',
            stress_level: data.stressLevel || 'low',
            main_goal: data.mainGoal || 'health_detox',
            neighborhood: data.neighborhood || '',
            daily_activity: data.dailyActivity || 'active',
        };

        const { error: assessmentError } = await supabase
            .from('assessments')
            .insert(payload);

        if (assessmentError) throw assessmentError;

        return true;
    } catch (err) {
        console.error('Sync Error:', err);
        return false;
    }
};
