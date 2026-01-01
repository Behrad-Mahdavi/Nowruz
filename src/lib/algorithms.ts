import { MENU_ITEMS, MenuItem } from "./menu-data";
import { AssessmentData, Chronotype, GeneratedPlan, Somatotype } from "./types";
import { TimelineItem, DashboardMeta, SmartCards, SkinHairProfile } from "./dashboard-types";

// ==========================================
// 0. CONFIGURATION & CONSTANTS
// ==========================================

const CONSTANTS = {
    MASHHAD_ZONES: {
        TIER_1: ['سجاد', 'هاشمیه', 'فلسطین', 'فرشته', 'زعفرانیه', 'ملک آباد', 'احمدآباد', 'کوهسنگی'],
        TIER_2: ['وکیل آباد', 'هفت تیر', 'صیاد', 'اقبال', 'پیروزی'],
    },
    LEAD_SCORE: {
        BASE: 50,
        WEIGHT_TIER_1: 25,
        WEIGHT_TIER_2: 15,
        WEIGHT_OBESE: 25,
        WEIGHT_OVERWEIGHT: 15,
        WEIGHT_AGE_GT_30: 10,
        WEIGHT_GOAL_LOSS: 10,
    },
    CHRONO: {
        LION_LIMIT: 390, // Before 06:30
        WOLF_LIMIT: 510, // After 08:30
    }
};

// ==========================================
// 1. CORE MATH & UTILITIES
// ==========================================

const timeToMinutes = (time: string): number => {
    if (!time) return 420; // Default 07:00
    const [h, m] = time.split(':').map(Number);
    return (h * 60) + m;
};

const minutesToTime = (minutes: number): string => {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
    const s = gender === 'male' ? 5 : -161;
    return (10 * weight) + (6.25 * height) - (5 * age) + s;
};

export function calculateBMI(weight: number, height: number) {
    const h = height / 100;
    if (h <= 0) return { value: 0, status: 'Normal' as const };
    
    const val = parseFloat((weight / (h * h)).toFixed(1));
    let status: GeneratedPlan['bmiStatus'] = 'Normal';
    if (val < 18.5) status = 'Underweight';
    else if (val >= 25 && val < 30) status = 'Overweight';
    else if (val >= 30) status = 'Obese';
    return { value: val, status };
}

export function calculateLeadScore(data: AssessmentData, bmiStatus: string): number {
    let score = CONSTANTS.LEAD_SCORE.BASE;
    if (bmiStatus === 'Obese') score += CONSTANTS.LEAD_SCORE.WEIGHT_OBESE;
    else if (bmiStatus === 'Overweight') score += CONSTANTS.LEAD_SCORE.WEIGHT_OVERWEIGHT;
    if (data.mainGoal === 'weight_loss') score += CONSTANTS.LEAD_SCORE.WEIGHT_GOAL_LOSS;

    if (data.neighborhood) {
        const hood = data.neighborhood.trim();
        const isTier1 = CONSTANTS.MASHHAD_ZONES.TIER_1.some(n => hood.includes(n));
        const isTier2 = CONSTANTS.MASHHAD_ZONES.TIER_2.some(n => hood.includes(n));
        if (isTier1) score += CONSTANTS.LEAD_SCORE.WEIGHT_TIER_1;
        else if (isTier2) score += CONSTANTS.LEAD_SCORE.WEIGHT_TIER_2;
    }
    if (data.age && data.age > 30) score += CONSTANTS.LEAD_SCORE.WEIGHT_AGE_GT_30;
    return Math.min(score, 100);
}

// ==========================================
// 2. SOMATOTYPING ENGINE
// ==========================================

function analyzeMetabolicProfile(gender: 'male' | 'female', wristSize: number, bmi: number): Somatotype {
    let endoPoints = 0;
    let mesoPoints = 0;
    let ectoPoints = 0;
    const wristThresholds = gender === 'male' ? { small: 17, large: 20 } : { small: 15, large: 17 };
    
    if (wristSize < wristThresholds.small) ectoPoints += 3;
    else if (wristSize > wristThresholds.large) endoPoints += 3;
    else mesoPoints += 3;

    if (bmi >= 30) endoPoints += 5;
    else if (bmi >= 25) { endoPoints += 2; mesoPoints += 2; }
    else if (bmi <= 18.5) ectoPoints += 5;
    else { mesoPoints += 3; ectoPoints += 1; }

    if (endoPoints >= mesoPoints && endoPoints >= ectoPoints) return 'endomorph';
    if (mesoPoints >= ectoPoints) return 'mesomorph';
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
    if (wakeMin < CONSTANTS.CHRONO.LION_LIMIT) return 'lion';
    if (wakeMin > CONSTANTS.CHRONO.WOLF_LIMIT) return 'wolf';
    return 'bear';
}

export function getRelativeEnergyLevel(wakeTime: string, currentHour: number): 'Low' | 'Medium' | 'High' {
    const wakeHour = parseInt(wakeTime.split(':')[0]) || 7;
    let hoursAwake = currentHour - wakeHour;
    if (hoursAwake < 0) hoursAwake += 24;

    if (hoursAwake <= 1) return 'Low'; 
    if (hoursAwake <= 5) return 'High'; 
    if (hoursAwake <= 8) return 'Low';  
    if (hoursAwake <= 12) return 'Medium'; 
    return 'Low'; 
}

// ==========================================
// 4. INTELLIGENT FOOD RECOMMENDATION (Corrected for Variety)
// ==========================================

function getSmartMealRecommendation(
    type: 'breakfast' | 'lunch' | 'dinner',
    somatotype: Somatotype,
    goal: string,
    chronotype: Chronotype,
    excludeIds: string[] = [] // ✅ FIX: Added exclusion parameter
): MenuItem {

    // 1. Strict Category Filtering & Exclusion
    const candidates = MENU_ITEMS.filter(item => {
        // First check exclusion
        if (excludeIds.includes(item.id)) return false;

        if (type === 'breakfast') return item.category === 'breakfast';
        if (type === 'lunch') return item.category === 'main' || (item.category === 'salad' && item.tags.includes('high-protein'));
        if (type === 'dinner') return item.category === 'salad' || (item.category === 'main' && item.tags.includes('low-carb'));
        return false;
    });

    // Fallback logic: If exclusion removes all options, reset exclusion (prevent crash)
    let finalCandidates = candidates;
    if (finalCandidates.length === 0) {
        finalCandidates = MENU_ITEMS.filter(item => {
             if (type === 'breakfast') return item.category === 'breakfast';
             if (type === 'lunch') return item.category === 'main' || (item.category === 'salad' && item.tags.includes('high-protein'));
             if (type === 'dinner') return item.category === 'salad' || (item.category === 'main' && item.tags.includes('low-carb'));
             return false;
        });
    }
    
    // Safety Net
    if (finalCandidates.length === 0) return MENU_ITEMS[0]; 

    // 2. Scoring System
    const scoredCandidates = finalCandidates.map(item => {
        let score = 50; 

        // Goal Alignment
        if (goal === 'weight_loss') {
            if (item.tags.includes('low-carb')) score += 20;
            if (item.tags.includes('keto')) score += 15;
            if (item.tags.includes('high-carb')) score -= 20; 
        } else if (goal === 'muscle_gain') {
            if (item.protein > 30) score += 20;
            if (item.tags.includes('high-carb')) score += 10;
        }

        // Somatotype Alignment
        if (somatotype === 'endomorph') {
            if (item.tags.includes('high-carb')) score -= 30;
            if (item.tags.includes('keto') || item.tags.includes('balanced')) score += 10;
        } else if (somatotype === 'ectomorph') {
            if (item.tags.includes('high-carb')) score += 20;
        }

        // Chronotype Alignment
        if (chronotype === 'wolf' && type === 'dinner' && item.protein > 25) score += 10;

        return { item, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0].item;
}

// ==========================================
// 5. TIMELINE GENERATOR (Updated)
// ==========================================

export function generateTimeline(
    chronotype: Chronotype,
    somatotype: Somatotype,
    wakeTime: string,
    currentHour: number,
    goal: string = 'health_detox'
): TimelineItem[] {
    const wakeMin = timeToMinutes(wakeTime || '07:00');
    const timeline: TimelineItem[] = [];

    const createEvent = (offsetHours: number, title: string, type: TimelineItem['type'], icon: string, foodItem?: MenuItem) => {
        const eventTimeMin = wakeMin + (offsetHours * 60);
        const timeString = minutesToTime(eventTimeMin);
        const eventHour = Math.floor(eventTimeMin / 60) % 24;

        const adjustedCurrent = currentHour < 4 ? currentHour + 24 : currentHour;
        const adjustedEvent = eventHour < 4 ? eventHour + 24 : eventHour;

        let status: 'done' | 'active' | 'pending' = 'pending';
        if (adjustedCurrent > adjustedEvent + 1) status = 'done';
        else if (adjustedCurrent >= adjustedEvent - 1 && adjustedCurrent <= adjustedEvent + 1) status = 'active';

        return {
            time: timeString,
            type,
            title,
            status,
            icon,
            action_link: foodItem?.snappfood_link,
            action_label: foodItem ? 'سفارش آنلاین' : undefined
        };
    };

    timeline.push(createEvent(0.25, 'هیدراتاسیون + الکترولیت', 'other', 'droplet'));

    // 1. Breakfast
    const bfItem = getSmartMealRecommendation('breakfast', somatotype, goal, chronotype, []);
    const bfOffset = somatotype === 'endomorph' ? 2.5 : 1; 
    timeline.push(createEvent(bfOffset, `صبحانه: ${bfItem.name}`, 'meal', 'sun', bfItem));

    // 2. Lunch
    const lunchItem = getSmartMealRecommendation('lunch', somatotype, goal, chronotype, []);
    timeline.push(createEvent(6, `ناهار: ${lunchItem.name}`, 'meal', 'flame', lunchItem));

    timeline.push(createEvent(9, 'میان‌وعده عصرانه (آجیل/میوه)', 'meal', 'leaf'));

    let workoutOffset = 11; 
    if (chronotype === 'lion') workoutOffset = 10; 
    if (chronotype === 'wolf') workoutOffset = 12.5; 
    timeline.push(createEvent(workoutOffset, 'تمرین تخصصی', 'workout', 'dumbbell'));

    // 3. Dinner (✅ FIX: Exclude lunch item to prevent duplicates)
    const dinnerItem = getSmartMealRecommendation('dinner', somatotype, goal, chronotype, [lunchItem.id]);
    timeline.push(createEvent(13.5, `شام: ${dinnerItem.name}`, 'meal', 'moon', dinnerItem));

    timeline.push(createEvent(16, 'خواب (ریکاوری هورمونی)', 'sleep', 'moon'));

    return timeline;
}

// ... (Rest of the file: generateDashboardMeta, generateSmartCards, generatePlan, generateSkinHairProfile remains the same)
// برای جلوگیری از طولانی شدن، بقیه توابع که تغییری نکردند را اینجا تکرار نکردم اما در فایل نهایی باید باشند.
// تابع generateSkinHairProfile همان نسخه علمی قبلی است.

export function generateDashboardMeta(chronotype: Chronotype, wakeTime: string, currentHour: number): DashboardMeta {
    const energy = getRelativeEnergyLevel(wakeTime, currentHour);
    const greetingMap = [
        { limit: 5, text: "شب بخیر" },
        { limit: 12, text: "صبح بخیر" },
        { limit: 17, text: "ظهر بخیر" },
        { limit: 21, text: "عصر بخیر" },
        { limit: 24, text: "شب بخیر" }
    ];
    const greeting = greetingMap.find(g => currentHour < g.limit)?.text || "وقت بخیر";
    return { greeting, energy_level: energy, hydration_goal: 8 };
}

export function generateSmartCards(somatotype: Somatotype, chronotype: Chronotype, goal: string): SmartCards {
    const baseMacros = { p: 30, c: 40, f: 30 };
    
    if (somatotype === 'ectomorph') { baseMacros.c += 15; baseMacros.f -= 10; baseMacros.p -= 5; }
    if (somatotype === 'endomorph') { baseMacros.c -= 20; baseMacros.f += 10; baseMacros.p += 10; }

    if (goal === 'muscle_gain') { baseMacros.p += 5; baseMacros.c += 5; baseMacros.f -= 10; }
    if (goal === 'weight_loss') { baseMacros.c -= 10; baseMacros.p += 10; }

    const workoutTitle = {
        wolf: 'تمرین قدرتی عصر',
        lion: 'تمرین سرعتی صبح',
        bear: 'تمرین ترکیبی'
    }[chronotype];

    return {
        nutrition: {
            title: somatotype === 'ectomorph' ? "High Carb" : (somatotype === 'endomorph' ? "Low Carb" : "Balanced"),
            value: somatotype === 'endomorph' ? 'کنترل انسولین' : 'تراکم انرژی', 
            detail: goal === 'weight_loss' ? 'چربی‌سوزی' : 'عضله‌سازی',
            macros: { 
                protein: Math.max(0, baseMacros.p), 
                carbs: Math.max(0, baseMacros.c), 
                fats: Math.max(0, baseMacros.f) 
            }
        },
        workout: {
            title: 'فاز تمرینی',
            value: workoutTitle,
            detail: 'بر اساس ساعت زیستی'
        }
    };
}

export function generatePlan(data: AssessmentData): GeneratedPlan {
    const weight = data.weight || 75;
    const height = data.height || 175;
    const gender = data.gender || 'male';

    const { value: bmiValue, status: bmiStatus } = calculateBMI(weight, height);
    const somatotype = analyzeMetabolicProfile(gender, data.wristSize || 18, bmiValue);
    const chronotype = calculateChronotype(data.wakeTime || '07:00');
    
    const chronoRanges = {
        wolf: "۱۸ تا ۲۲",
        lion: "۰۶ تا ۱۰",
        bear: "۱۰ تا ۱۴"
    };

    return {
        somatotype,
        chronotype,
        bmiValue,
        bmiStatus,
        recommendations: {
            nutrition: somatotype === 'endomorph' 
                ? "رژیم کنترل گلیسمی (قند پایین)" 
                : "رژیم متعادل ماکرومغذی",
            workout: `بهترین بازدهی: ساعت ${chronoRanges[chronotype]}`,
            supplements: [],
            lifestyle: `تیپ متابولیک: ${somatotype.toUpperCase()}`
        }
    };
}

export function generateSkinHairProfile(
    somatotype: Somatotype,
    chronotype: Chronotype,
    stressLevel: string,
    age: number
): SkinHairProfile {
    
    const CLINICAL_PROFILES = {
        endomorph: {
            skinCondition: "مستعد آکنه / چربی بالا (حساس به انسولین)",
            hairCondition: "نازک شدن هورمونی (PCOS/Androgenic)",
            nutritionStrategy: "Anti-Glycation (ضد قند)",
            superfood: "زرشک (منبع بربرین برای کنترل قند)", 
            morningProtocol: "نان جو + گردو (امگا ۳ برای کاهش التهاب)",
            eveningProtocol: "سالاد سبزیجات تیره (فیبر برای دفع استروژن اضافی)"
        },
        mesomorph: {
            skinCondition: "نرمال / نیازمند محافظت آنتی‌اکسیدانی",
            hairCondition: "ریسک آسیب محیطی (اکسیداسیون)",
            nutritionStrategy: "Cellular Defense (دفاع سلولی)",
            superfood: "تخمه کدو (مهارکننده طبیعی DHT)",
            morningProtocol: "تخم‌مرغ آب‌پز (پروتئین سولفوردار برای کراتین مو)",
            eveningProtocol: "ماست یونانی + توت‌فرنگی (ویتامین C کلاژن‌ساز)"
        },
        ectomorph: {
            skinCondition: "خشک / سد دفاعی ضعیف (Low Lipid Barrier)",
            hairCondition: "شکننده / کمبود مواد مغذی",
            nutritionStrategy: "Hydration & Lipids (آبرسانی و چربی مفید)",
            superfood: "روغن زیتون فرابکر (سرشار از ویتامین E)",
            morningProtocol: "شیربادام + عسل (رطوبت‌رسان عمقی)",
            eveningProtocol: "سوپ قلم یا پای‌مرغ (منبع غنی کلاژن و هیالورونیک)"
        }
    };

    const profile = CLINICAL_PROFILES[somatotype];
    
    let heroIngredient = profile.superfood;
    let lifestyleTip = "";

    if (stressLevel === 'high') {
        heroIngredient += " + دارک چاکلت ۸۵٪ (کاهش کورتیزول)";
        lifestyleTip = "کورتیزول بالا کلاژن پوست را تجزیه می‌کند؛ مصرف منیزیم ضروری است.";
    } else {
        lifestyleTip = "برای حفظ درخشش پوست، هیدراتاسیون الکترولیتی را فراموش نکنید.";
    }

    if (age > 30) {
        profile.morningProtocol += " + گوجه (لیکوپن ضدپیری)";
    }
    if (age > 40) {
        heroIngredient += " + پودر سنجد (بازسازی ماتریکس استخوان/پوست)";
    }

    let circadianTip = "";
    if (chronotype === 'wolf') {
        circadianTip = "اوج بازسازی پوست شما ساعت ۲ تا ۴ صبح است؛ ویتامین C را عصر مصرف کنید.";
    } else {
        circadianTip = "خواب قبل از ساعت ۱۱ شب، ترشح هورمون رشد (HGH) را برای پوست تضمین می‌کند.";
    }

    return {
        skinType: profile.skinCondition,
        hairType: profile.hairCondition,
        protocol: { 
            morning: profile.morningProtocol, 
            evening: profile.eveningProtocol, 
            hero_ingredient: heroIngredient 
        },
        circadian_tip: lifestyleTip + " " + circadianTip
    };
}