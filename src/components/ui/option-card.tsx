'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";

interface OptionCardProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    icon?: string; // آدرس فایل یا ایموجی
    className?: string;
    isImage?: boolean; // فلگ جدید برای تشخیص اینکه آیکون تصویر است یا متن
}

export function OptionCard({ label, selected, onClick, icon, className, isImage = true }: OptionCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200",
                selected 
                    ? "border-accent bg-accent/5 shadow-lg shadow-accent/10 scale-105" 
                    : "border-gray-100 bg-white hover:border-accent/30 hover:bg-gray-50",
                className
            )}
        >
            {icon && (
                <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-xl text-3xl transition-transform",
                    selected ? "scale-110" : ""
                )}>
                    {isImage && icon.startsWith('/') ? (
                        <Image 
                            src={icon} 
                            alt={label} 
                            width={40} 
                            height={40} 
                            className="w-10 h-10 object-contain drop-shadow-sm" 
                        />
                    ) : (
                        <span>{icon}</span>
                    )}
                </div>
            )}
            <span className={cn(
                "font-bold text-lg",
                selected ? "text-primary" : "text-gray-500"
            )}>
                {label}
            </span>
        </button>
    );
}