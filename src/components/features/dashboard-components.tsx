import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Copy, Timer } from "lucide-react";
import toast from "react-hot-toast";

export const BentoCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
            delay,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={cn(
            "bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40",
            className
        )}
    >
        {children}
    </motion.div>
);

export const InfoCard = ({ title, value, icon, subtext, className, delay = 0 }: { title: string; value: string; icon: string; subtext?: string; className?: string; delay?: number }) => (
    <BentoCard className={cn("flex flex-col justify-between h-full min-h-[180px]", className)} delay={delay}>
        <div className="flex justify-between items-start">
            <div className="p-4 bg-gray-50/50 rounded-2xl text-3xl shadow-inner-sm">{icon}</div>
        </div>
        <div className="mt-4">
            <h3 className="text-xs uppercase tracking-widest opacity-40 font-bold mb-1">{title}</h3>
            <div className="text-3xl font-extrabold tracking-tight text-primary">{value}</div>
            {subtext && <div className="text-sm opacity-60 mt-2 font-medium">{subtext}</div>}
        </div>
    </BentoCard>
);

export const PlanDayCard = ({ day, title, items }: { day: number; title: string; items: string[] }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-8 last:mb-0 group"
    >
        <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                {day}
            </span>
            <h4 className="font-bold text-xl text-primary/90">{title}</h4>
        </div>
        <ul className="space-y-3 pr-14">
            {items.map((item, idx) => (
                <li key={idx} className="text-base text-primary/70 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    </motion.div>
);

export const OfferCard = ({ delay = 0.4 }: { delay?: number }) => {
    const copyCode = () => {
        navigator.clipboard.writeText("NORUZ1405");
        toast.success("کد تخفیف کپی شد!");
    }
    return (
        <BentoCard
            className="bg-gradient-to-br from-[#0B2545] to-[#1a3a5a] text-white relative overflow-hidden group cursor-pointer border-none"
            delay={delay}
        >
            <div onClick={copyCode} className="relative h-full flex flex-col items-center text-center justify-center gap-6 py-4">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-colors" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-action/10 rounded-full blur-3xl group-hover:bg-action/20 transition-colors" />

                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                        <Timer className="w-3 h-3 text-accent" />
                        <span>پیشنهاد محدود</span>
                    </div>
                    <div className="text-4xl font-black text-accent tracking-tighter">۲۰٪ تخفیف</div>
                    <p className="text-sm opacity-70 max-w-[220px] leading-relaxed">برای سفارش پکیج‌های غذایی آماده <span className="text-white font-bold underline decoration-accent/40">حس‌خوب</span></p>
                </div>

                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center justify-between w-full border border-white/20 transition-colors group/btn"
                >
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[10px] opacity-50 uppercase font-black tracking-widest">کد تخفیف</span>
                        <span className="font-mono text-xl font-bold tracking-[0.2em] text-accent">NORUZ1405</span>
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl group-hover/btn:bg-accent group-hover/btn:text-primary transition-all">
                        <Copy className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>
        </BentoCard>
    );
};
