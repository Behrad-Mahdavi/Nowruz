import { AssessmentData, Chronotype, GeneratedPlan, Somatotype } from "./types";
import { TimelineItem, DashboardMeta, LiveDashboard, SmartCards } from "./dashboard-types";

// ==========================================
// 1. UTILITY & HELPER FUNCTIONS (MATH CORE)
// ==========================================

/**
 * Converts "HH:MM" string to minutes from midnight.
 */
const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Converts minutes from midnight back to "HH:MM" string.
 */
const minutesToTime = (minutes: number): string => {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Calculates BMR using Revised Harris-Benedict Equation.
 */
const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    if (gender === 'male') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
};

// ==========================================
// 2. ADVANCED BIO-ANALYTICS
// ==========================================

/**
 * Advanced Somatotyping: Uses Wrist Size + BMI to determine "Phenotype".
 * Solves the issue where a skinny-fat person is mislabeled.
 */
export function calculateAdvancedSomatotype(gender: 'male' | 'female', wristSize: number, bmi: number): Somatotype {
    let score = 0;

    // Wrist Score
    if (gender === 'male') {
        if (wristSize < 17) score -= 1; // Ecto tendency
        else if (wristSize > 20) score += 1; // Endo tendency
    } else {
        if (wristSize < 15) score -= 1;
        else if (wristSize > 17) score += 1;
    }

    // BMI Modifier (The "Reality Check")
    if (bmi > 26) score += 1; // High body fat pushes towards Endo traits
    if (bmi < 19) score -= 1; // Low body mass pushes towards Ecto traits

    // Result Logic
    if (score <= -1) return 'ectomorph';
    if (score >= 1) return 'endomorph';
    return 'mesomorph';
}

/**
 * Calculates Chronotype based on "Mid-Sleep Point" theory (more accurate than just wake time).
 * Assuming 8 hours of sleep for calculation normalization.
 */
export function calculateChronotype(wakeTime: string): Chronotype {
    if (!wakeTime) return 'bear';
    
    const wakeMin = timeToMinutes(wakeTime);
    // Lion: Wakes up before 06:30
    if (wakeMin < 390) return 'lion'; 
    // Wolf: Wakes up after 08:30
    if (wakeMin > 510) return 'wolf'; 
    
    return 'bear';
}

/**
 * Calculates Bio-Rhythm Energy State relative to Wake Time.
 * This is dynamic, not fixed to clock hours.
 */
export function getRelativeEnergyLevel(wakeTime: string, currentHour: number): 'Low' | 'Medium' | 'High' {
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const hoursAwake = currentHour - wakeHour;

    // Biological Rhythms (approximate)
    // 0-2 hours after wake: Sleep Inertia (Low/Medium)
    // 2-7 hours after wake: Cortisol Peak (High)
    // 7-9 hours after wake: Post-Lunch Dip (Low)
    // 9-13 hours after wake: Second Wind (Medium/High)
    // 14+ hours: Melatonin Onset (Low)

    if (hoursAwake < 0) return 'Low'; // Sleeping or pre-wake
    if (hoursAwake <= 2) return 'Medium'; // Waking up
    if (hoursAwake <= 7) return 'High'; // Prime time
    if (hoursAwake <= 9) return 'Low'; // Afternoon crash
    if (hoursAwake <= 13) return 'Medium'; // Evening focus
    return 'Low'; // Preparing for sleep
}

// ==========================================
// 3. GENERATORS (THE ENGINE)
// ==========================================

export function generateSmartCards(somatotype: Somatotype, chronotype: Chronotype, goal: string): SmartCards {
    // Dynamic Macro Split based on Somatotype AND Goal
    let protein = 30, carbs = 40, fats = 30;
    let strategyTitle = "تعادل متابولیک";
    let strategyDetail = "حفظ سطح انرژی";

    // 1. Somatotype Base
    if (somatotype === 'ectomorph') { carbs = 50; protein = 25; fats = 25; }
    if (somatotype === 'endomorph') { carbs = 20; protein = 40; fats = 40; }
    if (somatotype === 'mesomorph') { carbs = 35; protein = 35; fats = 30; }

    // 2. Goal Modifier
    if (goal === 'muscle_gain') { protein += 5; carbs += 5; fats -= 10; strategyTitle = "هایپرتروفی (عضله)"; strategyDetail = "مازاد کالری کنترل شده"; }
    if (goal === 'weight_loss') { carbs -= 10; protein += 10; strategyTitle = "لیپولیز (چربی‌سوزی)"; strategyDetail = "کسری کالری + پروتئین بالا"; }
    if (goal === 'energy') { fats += 5; carbs += 5; protein -= 10; }

    // Workout Timing Logic
    const workoutTimes = {
        lion: { value: '17:00', detail: 'قدرتی / توان (Power)' }, // Lions fade in evening, need workout to boost or do it AM
        bear: { value: '18:00', detail: 'ترکیبی (هوازی + وزنه)' },
        wolf: { value: '19:00', detail: 'قدرتی / انفجاری' } // Wolves are strongest at night
    };

    return {
        nutrition: {
            title: strategyTitle,
            value: somatotype === 'endomorph' ? 'Low Carb' : (somatotype === 'ectomorph' ? 'High Carb' : 'Balanced'),
            detail: strategyDetail,
            macros: { protein, carbs, fats }
        },
        workout: {
            title: 'زمان اوج تستوسترون',
            value: workoutTimes[chronotype].value,
            detail: workoutTimes[chronotype].detail
        }
    };
}

export function generateTimeline(chronotype: Chronotype, somatotype: Somatotype, wakeTime: string, currentHour: number): TimelineItem[] {
    const wakeMin = timeToMinutes(wakeTime || '07:00');
    const timeline: TimelineItem[] = [];

    // --- Helper to add events relative to wake time ---
    const addEvent = (offsetHours: number, title: string, type: TimelineItem['type'], icon: string, promo?: any) => {
        const eventTimeMin = wakeMin + (offsetHours * 60);
        const timeString = minutesToTime(eventTimeMin);
        const eventHour = Math.floor(eventTimeMin / 60) % 24; // Handle past midnight

        let status: 'done' | 'active' | 'pending' = 'pending';
        if (currentHour > eventHour + 1) status = 'done';
        else if (currentHour >= eventHour - 1 && currentHour <= eventHour + 1) status = 'active';

        const item: TimelineItem = { time: timeString, type, title, status, icon };
        if (promo) { item.is_promo = true; item.promo_data = promo; }
        timeline.push(item);
    };

    // 1. Morning Hydration (Wake + 15min)
    addEvent(0.25, 'هیدراتاسیون + الکترولیت', 'other', 'droplet');

    // 2. Breakfast (Wake + 1-2h depending on Somatotype)
    // Endomorphs should delay breakfast (Intermittent Fasting Lite)
    const breakfastOffset = somatotype === 'endomorph' ? 2.5 : 1; 
    addEvent(breakfastOffset, 'صبحانه', 'meal', 'sun');

    // 3. Lunch (Wake + 5-6h)
    // This is where we sell the product
    addEvent(6, somatotype === 'mesomorph' ? 'ناهار (سوخت عضله)' : 'ناهار (کنترل انسولین)', 'meal', 'flame', {
        code: 'NORUZ1405',
        link: '/shop/promo',
        description: 'پیشنهاد: بشقاب فیبر و پروتئین ویتا'
    });

    // 4. Energy Dip / Snack (Wake + 9h)
    // Wolves need a boost here before their peak
    addEvent(9, 'میان‌وعده عصرانه', 'meal', 'leaf');

    // 5. Workout (Chronotype optimized)
    // Lion: +10h, Bear: +11h, Wolf: +12h (Relative to wake)
    let workoutOffset = 11;
    if (chronotype === 'lion') workoutOffset = 10;
    if (chronotype === 'wolf') workoutOffset = 12;
    addEvent(workoutOffset, 'تمرین تخصصی', 'workout', 'dumbbell');

    // 6. Dinner (Wake + 13h)
    addEvent(13.5, 'شام سبک (پروتئین)', 'meal', 'moon');

    // 7. Sleep (Wake + 16h)
    addEvent(16, 'خواب (ریکاوری)', 'sleep', 'moon');

    return timeline;
}

export function generateDashboardMeta(chronotype: Chronotype, wakeTime: string, currentHour: number): DashboardMeta {
    const energy = getRelativeEnergyLevel(wakeTime || '07:00', currentHour);
    
    let greeting = "سلام قهرمان";
    if (currentHour >= 5 && currentHour < 12) greeting = "صبح بخیر، قهرمان";
    else if (currentHour >= 12 && currentHour < 17) greeting = "ظهر بخیر، قهرمان";
    else if (currentHour >= 17 && currentHour < 21) greeting = "عصر بخیر، قهرمان";
    else greeting = "شب بخیر، قهرمان";

    return {
        greeting,
        energy_level: energy,
        hydration_goal: 8 // Could be calculated based on weight (Weight * 0.033)
    };
}

// ==========================================
// 4. MAIN ORCHESTRATOR
// ==========================================

export function generatePlan(data: AssessmentData): GeneratedPlan {
    // 1. Calculate Base Metrics
    const { value: bmiValue, status: bmiStatus } = calculateBMI(data.weight, data.height);
    
    // 2. Advanced Typing (Hybrid Logic)
    const somatotype = calculateAdvancedSomatotype(data.gender, data.wristSize, bmiValue);
    const chronotype = calculateChronotype(data.wakeTime);
    
    // 3. BMR & Caloric Needs
    // TDEE Multiplier: Sedentary 1.2, Active 1.55 (simplified based on user input could be added)
    const bmr = calculateBMR(data.weight, data.height, data.age || 30, data.gender);
    const tdee = Math.round(bmr * 1.35); // Average activity factor

    // 4. Recommendation Engine
    let nutritionRec = `کالری هدف روزانه: ${tdee} کالری. `;
    let workoutRec = "";
    let supplements = ["Multivitamin"];

    // Nutrition Logic
    if (somatotype === 'endomorph') {
        nutritionRec += "بهترین استراتژی برای شما 'چرخه کربوهیدرات' (Carb Cycling) است. صبحانه را فاقد قند نگه دارید.";
    } else if (somatotype === 'ectomorph') {
        nutritionRec += "شما به کالری مازاد نیاز دارید. هر ۳ ساعت یک وعده ترکیبی میل کنید.";
    } else {
        nutritionRec += "بدن شما پاسخ عالی به پروتئین می‌دهد. روی ۴۰٪ پروتئین در هر وعده تمرکز کنید.";
    }

    // Context & Stress Logic
    if (data.stressLevel === 'high') {
        supplements.push('Magnesium Glycinate (Night)', 'Ashwagandha (Afternoon)');
        nutritionRec += " (به دلیل استرس بالا، مصرف کافئین را بعد از ساعت ۱۴ محدود کنید).";
    }

    // Workout Logic
    workoutRec = chronotype === 'wolf' 
        ? "اوج انرژی شما عصرهاست. رکوردهای سنگین را برای ساعت ۱۹ به بعد بگذارید." 
        : "تمرینات خود را در پنجره ۶ تا ۱۰ ساعت بعد از بیداری انجام دهید.";

    // Local Context
    if (data.neighborhood && data.neighborhood.includes('وکیل')) {
        workoutRec += " پیشنهاد مکان: دویدن اینتروال در پارک ملت (شیب‌های شرقی).";
    }

    return {
        somatotype,
        chronotype,
        bmiValue,
        bmiStatus,
        recommendations: {
            nutrition: nutritionRec,
            workout: workoutRec,
            supplements,
            lifestyle: `تیپ متابولیک: ${Math.round(bmr)} BMR`
        }
    };
}

// Helper for BMI (kept simple as it is standard)
function calculateBMI(weight: number, height: number) {
    const h = height / 100;
    const val = parseFloat((weight / (h * h)).toFixed(1));
    let status: GeneratedPlan['bmiStatus'] = 'Normal';
    if (val < 18.5) status = 'Underweight';
    else if (val >= 25 && val < 30) status = 'Overweight';
    else if (val >= 30) status = 'Obese';
    return { value: val, status };
}