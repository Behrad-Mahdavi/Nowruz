// src/lib/dashboard-types.ts

import { Chronotype, Somatotype } from './types';

// اصلاح مهم: اضافه شدن 'other' برای هیدراتاسیون و موارد متفرقه
export type TimelineItemType = 'meal' | 'workout' | 'sleep' | 'supplement' | 'other';

export type TimelineStatus = 'done' | 'active' | 'pending';

export interface PromoData {
    code: string;
    link: string;
    description?: string;
}

export interface TimelineItem {
    time: string; // HH:MM format
    type: TimelineItemType;
    title: string;
    status: TimelineStatus;
    icon: string; // کلید آیکون مثل 'sun', 'flame', 'droplet'
    is_promo?: boolean;
    promo_data?: PromoData;
}

export interface NutritionCard {
    title: string;
    value: string;
    detail: string;
    macros?: {
        protein: number;
        carbs: number;
        fats: number;
    };
}

export interface WorkoutCard {
    title: string;
    value: string; // Time
    detail: string;
}

export interface SmartCards {
    nutrition: NutritionCard;
    workout: WorkoutCard;
}

export interface DashboardMeta {
    greeting: string;
    energy_level: 'Low' | 'Medium' | 'High';
    hydration_goal: number;
}

export interface SkinHairProfile {
    skinType: string; // e.g., "Lipid Dry" or "Sebum Rich"
    hairType: string; // e.g., "Androgenic Risk" or "Structural Thin"
    protocol: {
        morning: string; // روتین صبح
        evening: string; // روتین شب
        hero_ingredient: string; // ماده موثره اصلی (مثل رتینول، نیاسینامید)
    };
    circadian_tip: string; // نکته زمانی
}

export interface LiveDashboard {
    dashboard_meta: DashboardMeta;
    smart_cards: SmartCards;
    skin_hair_profile?: SkinHairProfile;
    timeline: TimelineItem[];
}