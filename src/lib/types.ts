export type Gender = 'male' | 'female';
export type Somatotype = 'ectomorph' | 'mesomorph' | 'endomorph';
export type Chronotype = 'lion' | 'bear' | 'wolf';
export type Goal = 'weight_loss' | 'muscle_gain' | 'energy' | 'health_detox';
export type StressLevel = 'low' | 'medium' | 'high';

export interface AssessmentData {
    gender: Gender;
    age: number;
    height: number; // cm
    weight: number; // kg
    wristSize: number; // cm
    wakeTime: string; // HH:MM
    sleepTime: string; // HH:MM
    dailyActivity: 'sedentary' | 'active';
    stressLevel: StressLevel;
    mainGoal: Goal;
    city?: string;
    neighborhood?: string;
    full_name?: string;
}

export interface GeneratedPlan {
    somatotype: Somatotype;
    chronotype: Chronotype;
    bmiValue: number;
    bmiStatus: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
    recommendations: {
        nutrition: string;
        workout: string;
        supplements: string[];
        lifestyle: string;
    };
}
