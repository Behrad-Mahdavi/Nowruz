import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentData } from './types';

interface QuizState {
    currentStep: number;
    data: Partial<AssessmentData>;
    setData: (data: Partial<AssessmentData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useQuizStore = create<QuizState>()(
    persist(
        (set) => ({
            currentStep: 0,
            data: {
                city: 'Mashhad', // Default
                wakeTime: '07:30',
                gender: 'male',
            },
            setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
            nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
            prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
            reset: () => set({ currentStep: 0, data: { city: 'Mashhad' } }),
        }),
        {
            name: 'vita-quiz-storage',
        }
    )
);
