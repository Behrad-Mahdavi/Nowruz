import { AssessmentData, Chronotype, GeneratedPlan, Somatotype } from "./types";
import { TimelineItem, DashboardMeta, LiveDashboard, SmartCards, SkinHairProfile } from "./dashboard-types";

// ==========================================
// 1. UTILITY & HELPER FUNCTIONS (MATH CORE)
// ==========================================

const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

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

export function calculateChronotype(wakeTime: string): Chronotype {
    if (!wakeTime) return 'bear';

    const wakeMin = timeToMinutes(wakeTime);
    // Lion: Wakes up before 06:30
    if (wakeMin < 390) return 'lion';
    // Wolf: Wakes up after 08:30
    if (wakeMin > 510) return 'wolf';

    return 'bear';
}

export function getRelativeEnergyLevel(wakeTime: string, currentHour: number): 'Low' | 'Medium' | 'High' {
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const hoursAwake = currentHour - wakeHour;

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

import { MENU_ITEMS, MenuItem } from "./menu-data";

// تابع کمکی برای انتخاب غذا بر اساس الگوریتم
function getSuggestedMeal(type: 'breakfast' | 'lunch' | 'dinner', somatotype: Somatotype, goal: string): MenuItem {
    // فیلتر اولیه بر اساس وعده
    let candidates = MENU_ITEMS.filter(item => {
        if (type === 'breakfast') return item.category === 'breakfast';
        if (type === 'lunch') return item.category === 'main' || (item.category === 'salad' && item.tags.includes('high-protein'));
        if (type === 'dinner') return item.category === 'salad' || (item.category === 'main' && item.tags.includes('low-carb'));
        return false;
    });

    // فیلتر ثانویه بر اساس تیپ بدنی
    if (somatotype === 'endomorph') {
        // اندومورف‌ها نباید پنینی یا پیتزا (کربوهیدرات بالا) بخورند
        candidates = candidates.filter(item => !item.tags.includes('high-carb'));
    } else if (somatotype === 'ectomorph') {
        // اکتومورف‌ها نیاز به کربوهیدرات دارند
        const highCarbs = candidates.filter(item => item.tags.includes('high-carb'));
        if (highCarbs.length > 0) candidates = highCarbs;
    }

    // فیلتر نهایی بر اساس هدف
    if (goal === 'muscle_gain') {
        // سورت بر اساس پروتئین نزولی
        candidates.sort((a, b) => b.protein - a.protein);
    } else if (goal === 'weight_loss') {
        // حذف غذاهای خیلی سنگین (پنینی/پیتزا) اگر مانده باشند و انتخاب سالادها
        const salads = candidates.filter(item => item.category === 'salad' || item.id === 'veggie-plate');
        if (salads.length > 0) candidates = salads;
    }

    // انتخاب بهترین گزینه (اولی) یا یک مورد رندوم از ۳ تای اول برای تنوع
    return candidates.length > 0 ? candidates[0] : MENU_ITEMS[0]; // فال‌بک
}

export function generateTimeline(chronotype: Chronotype, somatotype: Somatotype, wakeTime: string, currentHour: number, goal: string = 'health'): TimelineItem[] {
    const wakeMin = timeToMinutes(wakeTime || '07:00');
    const timeline: TimelineItem[] = [];

    // --- Helper to add events relative to wake time ---
    const addEvent = (offsetHours: number, title: string, type: TimelineItem['type'], icon: string, foodItem?: MenuItem) => {
        const eventTimeMin = wakeMin + (offsetHours * 60);
        const timeString = minutesToTime(eventTimeMin);
        const eventHour = Math.floor(eventTimeMin / 60) % 24; // Handle past midnight

        let status: 'done' | 'active' | 'pending' = 'pending';
        if (currentHour > eventHour + 1) status = 'done';
        else if (currentHour >= eventHour - 1 && currentHour <= eventHour + 1) status = 'active';

        const item: TimelineItem = {
            time: timeString,
            type,
            title,
            status,
            icon,
            action_link: foodItem ? foodItem.snappfood_link : undefined,
            action_label: foodItem ? 'سفارش از اسنپ‌فود' : undefined
        };
        timeline.push(item);
    };

    // 1. Morning Hydration (Wake + 15min)
    addEvent(0.25, 'هیدراتاسیون + الکترولیت', 'other', 'droplet');

    // 2. Breakfast (Real Food)
    const breakfastItem = getSuggestedMeal('breakfast', somatotype, goal);
    const breakfastOffset = somatotype === 'endomorph' ? 2.5 : 1;
    addEvent(breakfastOffset, `صبحانه: ${breakfastItem.name}`, 'meal', 'sun', breakfastItem);

    // 3. Lunch (Real Food)
    const lunchItem = getSuggestedMeal('lunch', somatotype, goal);
    addEvent(6, `ناهار: ${lunchItem.name}`, 'meal', 'flame', lunchItem);

    // 4. Energy Dip / Snack (Wake + 9h)
    addEvent(9, 'میان‌وعده عصرانه (میوه/آجیل)', 'meal', 'leaf');

    // 5. Workout (Chronotype optimized)
    let workoutOffset = 11;
    if (chronotype === 'lion') workoutOffset = 10;
    if (chronotype === 'wolf') workoutOffset = 12;
    addEvent(workoutOffset, 'تمرین تخصصی', 'workout', 'dumbbell');

    // 6. Dinner (Real Food)
    const dinnerItem = getSuggestedMeal('dinner', somatotype, goal);
    addEvent(13.5, `شام: ${dinnerItem.name}`, 'meal', 'moon', dinnerItem);

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
        hydration_goal: 8
    };
}

export function generatePlan(data: AssessmentData): GeneratedPlan {
    const { value: bmiValue, status: bmiStatus } = calculateBMI(data.weight || 75, data.height || 175);
    const somatotype = calculateAdvancedSomatotype(data.gender || 'male', data.wristSize || 18, bmiValue);
    const chronotype = calculateChronotype(data.wakeTime);
    const bmr = calculateBMR(data.weight || 75, data.height || 175, data.age || 30, data.gender || 'male');
    const tdee = Math.round(bmr * 1.35);

    let nutritionRec = `کالری هدف روزانه: ${tdee} کالری. `;
    let workoutRec = "";
    let supplements = ["Multivitamin"];

    if (somatotype === 'endomorph') {
        nutritionRec += "بهترین استراتژی برای شما 'چرخه کربوهیدرات' است. صبحانه را فاقد قند نگه دارید.";
    } else if (somatotype === 'ectomorph') {
        nutritionRec += "شما به کالری مازاد نیاز دارید. هر ۳ ساعت یک وعده ترکیبی میل کنید.";
    } else {
        nutritionRec += "بدن شما پاسخ عالی به پروتئین می‌دهد. روی ۴۰٪ پروتئین در هر وعده تمرکز کنید.";
    }

    if (data.stressLevel === 'high') {
        supplements.push('منیزیم (قبل خواب)');
        nutritionRec += " (مصرف کافئین بعد از ساعت ۱۴ ممنوع).";
    }

    workoutRec = chronotype === 'wolf'
        ? "اوج انرژی شما عصرهاست. رکوردهای سنگین را برای ساعت ۱۹ به بعد بگذارید."
        : "تمرینات خود را در پنجره ۶ تا ۱۰ ساعت بعد از بیداری انجام دهید.";

    if (data.neighborhood && data.neighborhood.includes('وکیل')) {
        workoutRec += " پیشنهاد مکان: دویدن اینتروال در پارک ملت.";
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

export function calculateBMI(weight: number, height: number) {
    const h = height / 100;
    const val = parseFloat((weight / (h * h)).toFixed(1));
    let status: GeneratedPlan['bmiStatus'] = 'Normal';
    if (val < 18.5) status = 'Underweight';
    else if (val >= 25 && val < 30) status = 'Overweight';
    else if (val >= 30) status = 'Obese';
    return { value: val, status };
}

/**
 * ==========================================
 * NEW: Dermo-Nutritional Algorithm (v2.0)
 * Focus: Iranian Functional Foods (No Meds)
 * ==========================================
 */
export function generateSkinHairProfile(
    somatotype: Somatotype,
    chronotype: Chronotype,
    stressLevel: string,
    age: number
): SkinHairProfile {
    let skinType = "Normal";
    let hairType = "Normal";
    let morning = ""; // Now Morning Nutrition
    let evening = ""; // Now Evening Nutrition
    let superFood = ""; // The Hero Food
    let tip = "";

    // 1. Somatotype Analysis (Hormonal Baseline -> Food Solution)
    if (somatotype === 'endomorph') {
        skinType = "مستعد چربی (حساس به انسولین)";
        hairType = "نیاز به سم‌زدایی فولیکول";
        // Strategy: Liver Detox & Blood Sugar Control
        morning = "نان جو + گردو (کربوهیدرات پیچیده برای کنترل سبوم)";
        evening = "خوراک عدسی با گلپر (فیبر بالا برای دفع استروژن)";
        superFood = "زرشک (Zereshk)"; // پاکسازی کبد = پوست شفاف
    } else if (somatotype === 'mesomorph') {
        skinType = "مقاوم / مستعد منافذ باز";
        hairType = "ریسک ریزش آندروژنیک (ارثی)";
        // Strategy: Natural DHT Blockers & Antioxidants
        morning = "املت گوجه‌فرنگی (لیکوپن برای محافظت نوری پوست)";
        evening = "ماست کم‌چرب + شوید + پودر جوانه گندم (ویتامین B)";
        superFood = "تخمه کدو (Pumpkin Seeds)"; // مهارکننده طبیعی DHT
    } else { // Ectomorph
        skinType = "نازک و خشک (سد دفاعی ضعیف)";
        hairType = "نازک و شکننده (کمبود املاح)";
        // Strategy: Healthy Fats & Hydration
        morning = "شیر و عسل + بادام درختی (بمب انرژی و کلسیم)";
        evening = "سوپ پای مرغ یا قلم (کلاژن‌سازی طبیعی)";
        superFood = "روغن زیتون (Olive Oil)"; // ویتامین E برای پوست خشک
    }

    // 2. Chronotype Modifier (Eating Time)
    if (chronotype === 'wolf') {
        tip = "کبد شما صبح‌ها کند است؛ ناشتا یک لیوان خاکشیر با آب ولرم بخورید.";
        if (somatotype === 'endomorph') morning += " + دارچین"; // Boost metabolism
    } else if (chronotype === 'lion') {
        tip = "شام را قبل از ساعت ۱۹ بخورید تا هورمون رشد (GH) در خواب ترشح شود.";
    } else {
        tip = "سعی کنید زمان شام خوردن‌تان هر شب ثابت باشد (تنظیم ساعت بیولوژیک).";
    }

    // 3. Stress Modifier (Anti-Cortisol Foods)
    if (stressLevel === 'high') {
        hairType += " (ریزش استرسی)";
        // Iranian herbal remedies
        superFood += " + دمنوش گل‌گاو‌زبان";
        evening = "سالاد کاهو با روغن زیتون (لاکتوکارین کاهو خواب‌آور است)";
    }

    // 4. Age Logic
    if (age > 35) {
        superFood += " + سنجد (با هسته آسیاب شده)"; // Bone & Skin density
    }

    return {
        skinType,
        hairType,
        protocol: { morning, evening, hero_ingredient: superFood },
        circadian_tip: tip
    };
}