import { MENU_ITEMS, MenuItem } from "./menu-data";
import { AssessmentData, Chronotype, GeneratedPlan, Somatotype } from "./types";
import { TimelineItem, DashboardMeta, SmartCards, SkinHairProfile } from "./dashboard-types";

// ==========================================
// 1. CORE MATH & UTILITIES
// ==========================================

const timeToMinutes = (time: string): number => {
    if (!time) return 420; // Default 07:00
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// محاسبه دقیق BMR
const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    const s = gender === 'male' ? 5 : -161;
    return (10 * weight) + (6.25 * height) - (5 * age) + s;
};

// ✅ EXPORTED: مورد نیاز برای sync.ts
export function calculateBMI(weight: number, height: number) {
    const h = height / 100;
    const val = parseFloat((weight / (h * h)).toFixed(1));
    let status: GeneratedPlan['bmiStatus'] = 'Normal';
    if (val < 18.5) status = 'Underweight';
    else if (val >= 25 && val < 30) status = 'Overweight';
    else if (val >= 30) status = 'Obese';
    return { value: val, status };
}

// ✅ EXPORTED: مورد نیاز برای sync.ts (سیستم امتیازدهی سرنخ فروش)
export function calculateLeadScore(data: AssessmentData, bmiStatus: string): number {
    let score = 50; // امتیاز پایه

    // 1. فاکتور BMI (افراد چاق مشتریان راغب‌تری هستند)
    if (bmiStatus === 'Overweight') score += 15;
    if (bmiStatus === 'Obese') score += 25;

    // 2. هدف (کاهش وزن فشار بیشتری دارد)
    if (data.mainGoal === 'weight_loss') score += 10;

    // 3. محله (قدرت خرید)
    const richNeighborhoods = ['وکیل', 'آباد', 'سجاد', 'هاشمیه', 'فلسطین', 'فرشته', 'زعفرانیه'];
    if (data.neighborhood && richNeighborhoods.some(n => data.neighborhood?.includes(n))) {
        score += 20;
    }

    // 4. سن (اهمیت سلامتی)
    if (data.age && data.age > 30) score += 10;

    return Math.min(score, 100);
}

// ==========================================
// 2. AI-LEVEL SOMATOTYPING ENGINE
// ==========================================

function analyzeMetabolicProfile(gender: 'male' | 'female', wristSize: number, bmi: number) {
    let endoScore = 0;
    let mesoScore = 0;
    let ectoScore = 0;

    const wristThresholds = gender === 'male' ? { small: 17, large: 20 } : { small: 15, large: 17 };

    // Bone Structure
    if (wristSize < wristThresholds.small) ectoScore += 40;
    else if (wristSize > wristThresholds.large) endoScore += 30;
    else mesoScore += 40;

    // Body Mass Logic (Dominant Factor)
    if (bmi > 29) { // اصلاح شده: اگر چاق است، حتما اندومورف است
        return 'endomorph';
    } else if (bmi > 25) {
        endoScore += 40;
        mesoScore += 20;
    } else if (bmi < 18.5) {
        ectoScore += 60;
        endoScore -= 20;
    } else {
        mesoScore += 30;
        ectoScore += 10;
    }

    const maxScore = Math.max(endoScore, mesoScore, ectoScore);
    if (maxScore === endoScore) return 'endomorph';
    if (maxScore === mesoScore) return 'mesomorph';
    return 'ectomorph';
}

export function calculateAdvancedSomatotype(gender: 'male' | 'female', wristSize: number, bmi: number): Somatotype {
    return analyzeMetabolicProfile(gender, wristSize, bmi);
}

// ==========================================
// 3. CHRONOBIOLOGY ENGINE
// ==========================================

export function calculateChronotype(wakeTime: string): Chronotype {
    const wakeMin = timeToMinutes(wakeTime);
    if (wakeMin < 390) return 'lion';
    if (wakeMin > 510) return 'wolf';
    return 'bear';
}

export function getRelativeEnergyLevel(wakeTime: string, currentHour: number): 'Low' | 'Medium' | 'High' {
    const wakeHour = parseInt(wakeTime.split(':')[0]) || 7;
    let biologicalHour = currentHour - wakeHour;
    if (biologicalHour < 0) biologicalHour += 24;

    if (biologicalHour <= 1) return 'Low';
    if (biologicalHour <= 6) return 'High';
    if (biologicalHour <= 8) return 'Low';
    if (biologicalHour <= 12) return 'Medium';
    return 'Low';
}

// ==========================================
// 4. INTELLIGENT FOOD RECOMMENDATION
// ==========================================

function getSmartMealRecommendation(
    type: 'breakfast' | 'lunch' | 'dinner',
    somatotype: Somatotype,
    goal: string,
    chronotype: Chronotype
): MenuItem {

    let candidates = MENU_ITEMS.filter(item => {
        if (type === 'breakfast') return item.category === 'breakfast';
        if (type === 'lunch') return item.category === 'main' || (item.category === 'salad' && item.tags.includes('high-protein'));
        if (type === 'dinner') return item.category === 'salad' || (item.category === 'main' && item.tags.includes('low-carb'));
        return false;
    });

    const scoredCandidates = candidates.map(item => {
        let score = 0;

        if (goal === 'weight_loss') {
            if (item.tags.includes('low-carb')) score += 10;
            if (item.tags.includes('keto')) score += 5;
            if (item.name.includes('پیتزا') || item.name.includes('پنینی')) score -= 50;
        } else if (goal === 'muscle_gain') {
            if (item.tags.includes('high-protein')) score += 15;
            if (item.protein > 40) score += 10;
        }

        if (somatotype === 'endomorph') {
            if (item.tags.includes('high-carb')) score -= 20;
            if (item.tags.includes('balanced')) score += 5;
        } else if (somatotype === 'ectomorph') {
            if (item.tags.includes('high-carb')) score += 15;
        }

        if (chronotype === 'wolf' && type === 'dinner' && item.protein > 30) score += 5;

        return { item, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates.length > 0 ? scoredCandidates[0].item : MENU_ITEMS[0];
}

// ==========================================
// 5. TIMELINE GENERATOR
// ==========================================

export function generateTimeline(
    chronotype: Chronotype,
    somatotype: Somatotype,
    wakeTime: string,
    currentHour: number,
    goal: string = 'health'
): TimelineItem[] {
    const wakeMin = timeToMinutes(wakeTime || '07:00');
    const timeline: TimelineItem[] = [];

    const addEvent = (offsetHours: number, title: string, type: TimelineItem['type'], icon: string, foodItem?: MenuItem) => {
        const eventTimeMin = wakeMin + (offsetHours * 60);
        const timeString = minutesToTime(eventTimeMin);
        const eventHour = Math.floor(eventTimeMin / 60) % 24;

        // Modulo logic for midnight crossing
        const adjustedCurrent = currentHour < 4 ? currentHour + 24 : currentHour;
        const adjustedEvent = eventHour < 4 ? eventHour + 24 : eventHour;

        let status: 'done' | 'active' | 'pending' = 'pending';
        if (adjustedCurrent > adjustedEvent + 1) status = 'done';
        else if (adjustedCurrent >= adjustedEvent - 1 && adjustedCurrent <= adjustedEvent + 1) status = 'active';

        const item: TimelineItem = {
            time: timeString,
            type,
            title,
            status,
            icon,
            action_link: foodItem?.snappfood_link,
            action_label: foodItem ? 'سفارش از اسنپ‌فود' : undefined
        };
        timeline.push(item);
    };

    addEvent(0.25, 'هیدراتاسیون + الکترولیت', 'other', 'droplet');

    const bfItem = getSmartMealRecommendation('breakfast', somatotype, goal, chronotype);
    const bfOffset = somatotype === 'endomorph' ? 2.5 : 1;
    addEvent(bfOffset, `صبحانه: ${bfItem.name}`, 'meal', 'sun', bfItem);

    const lunchItem = getSmartMealRecommendation('lunch', somatotype, goal, chronotype);
    addEvent(6, `ناهار: ${lunchItem.name}`, 'meal', 'flame', lunchItem);

    addEvent(9, 'میان‌وعده عصرانه (آجیل/میوه)', 'meal', 'leaf');

    let workoutOffset = 11;
    if (chronotype === 'lion') workoutOffset = 10;
    if (chronotype === 'wolf') workoutOffset = 12;
    addEvent(workoutOffset, 'تمرین تخصصی', 'workout', 'dumbbell');

    const dinnerItem = getSmartMealRecommendation('dinner', somatotype, goal, chronotype);
    addEvent(13.5, `شام: ${dinnerItem.name}`, 'meal', 'moon', dinnerItem);

    addEvent(16, 'خواب (ریکاوری هورمونی)', 'sleep', 'moon');

    return timeline;
}

// ==========================================
// 6. DASHBOARD & RECOMMENDATIONS
// ==========================================

export function generateDashboardMeta(chronotype: Chronotype, wakeTime: string, currentHour: number): DashboardMeta {
    const energy = getRelativeEnergyLevel(wakeTime, currentHour);
    let greeting = "وقت بخیر";

    if (currentHour >= 5 && currentHour < 12) greeting = "صبح بخیر";
    else if (currentHour >= 12 && currentHour < 17) greeting = "ظهر بخیر";
    else if (currentHour >= 17 && currentHour < 21) greeting = "عصر بخیر";
    else greeting = "شب بخیر";

    return { greeting, energy_level: energy, hydration_goal: 8 };
}

export function generateSmartCards(somatotype: Somatotype, chronotype: Chronotype, goal: string): SmartCards {
    let p = 30, c = 40, f = 30;
    let title = "تعادل";

    if (somatotype === 'ectomorph') { c += 15; p -= 5; f -= 10; title = "High Carb"; }
    if (somatotype === 'endomorph') { c -= 20; p += 10; f += 10; title = "Low Carb"; }

    if (goal === 'muscle_gain') { p += 5; c += 5; f -= 10; }
    if (goal === 'weight_loss') { c -= 10; p += 10; }

    const workoutText = chronotype === 'wolf' ? 'تمرین قدرتی عصر' : (chronotype === 'lion' ? 'تمرین سرعتی صبح' : 'تمرین ترکیبی');

    return {
        nutrition: {
            title: title,
            value: somatotype === 'endomorph' ? 'کنترل انسولین' : 'کالری مثبت',
            detail: goal === 'weight_loss' ? 'چربی‌سوزی فعال' : 'عضله‌سازی',
            macros: { protein: p, carbs: c, fats: f }
        },
        workout: {
            title: 'فاز تمرینی',
            value: workoutText,
            detail: 'بر اساس ساعت زیستی'
        }
    };
}

export function generatePlan(data: AssessmentData): GeneratedPlan {
    const { value: bmiValue, status: bmiStatus } = calculateBMI(data.weight || 75, data.height || 175);
    const somatotype = analyzeMetabolicProfile(data.gender || 'male', data.wristSize || 18, bmiValue);
    const chronotype = calculateChronotype(data.wakeTime);
    const bmr = calculateBMR(data.weight || 75, data.height || 175, data.age || 30, data.gender || 'male');
    const tdee = Math.round(bmr * 1.35);

    return {
        somatotype,
        chronotype,
        bmiValue,
        bmiStatus,
        recommendations: {
            nutrition: `کالری پایه: ${Math.round(bmr)} | هدف: ${tdee} کالری`,
            workout: chronotype === 'wolf' ? "بهترین بازدهی شما: ساعت ۱۸ تا ۲۲" : "بهترین بازدهی شما: ساعت ۱۰ تا ۱۴",
            supplements: [],
            lifestyle: `تیپ متابولیک: ${somatotype.toUpperCase()}`
        }
    };
}

// ==========================================
// 7. IRANIAN SUPERFOOD ALGORITHM
// ==========================================

export function generateSkinHairProfile(
    somatotype: Somatotype,
    chronotype: Chronotype,
    stressLevel: string,
    age: number
): SkinHairProfile {
    let skinType = "Normal";
    let hairType = "Normal";
    let morning = "";
    let evening = "";
    let superFood = "";
    let tip = "";

    if (somatotype === 'endomorph') {
        skinType = "مستعد چربی (کبد گرم)";
        hairType = "نیاز به پاکسازی";
        morning = "نان جو + گردو (فیبر برای کنترل قند)";
        evening = "خوراک عدسی با گلپر (دفع سودا/سموم)";
        superFood = "زرشک (Zereshk)";
    } else if (somatotype === 'mesomorph') {
        skinType = "مقاوم / منافذ باز";
        hairType = "ریسک ریزش هورمونی";
        morning = "املت گوجه‌فرنگی (لیکوپن)";
        evening = "ماست و شوید + جوانه گندم (ویتامین B)";
        superFood = "تخمه کدو (Pumpkin Seeds)";
    } else {
        skinType = "خشک و حساس (کم‌آب)";
        hairType = "نازک و شکننده";
        morning = "شیر و عسل + بادام (رطوبت‌رسان)";
        evening = "سوپ قلم یا پای مرغ (کلاژن طبیعی)";
        superFood = "روغن زیتون (Olive Oil)";
    }

    if (stressLevel === 'high') {
        superFood += " + دمنوش گل‌گاو‌زبان (آرام‌بخش اعصاب)";
        evening += " (همراه سالاد کاهو)";
    }

    if (age > 35) {
        superFood += " + پودر سنجد (استحکام استخوان/پوست)";
    }

    tip = chronotype === 'wolf'
        ? "سیستم گوارش شما صبح‌ها کند است؛ صبحانه را سبک و گرم میل کنید."
        : "شام را حتماً ۳ ساعت قبل از خواب میل کنید تا هورمون رشد ترشح شود.";

    return {
        skinType,
        hairType,
        protocol: { morning, evening, hero_ingredient: superFood },
        circadian_tip: tip
    };
}