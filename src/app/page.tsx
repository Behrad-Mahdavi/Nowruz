'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-primary text-surface overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-action blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-2xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          ۱۴۰۵، سال نو، <br />
          <span className="text-accent">بدن نو</span>
        </h1>

        <p className="text-xl md:text-2xl mb-12 font-light opacity-90">
          معماری مجدد بدن شما با هوش مصنوعی.
          <br />
          یک برنامه کاملاً شخصی‌سازی‌شده برای شما.
        </p>

        <Link href="/quiz">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-action text-white px-10 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-action/50 transition-all border border-white/10"
          >
            شروع آنالیز رایگان
          </motion.button>
        </Link>
      </motion.div>

      {/* Trust Indicators / Minimal Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-sm opacity-50"
      >
        طراحی شده با ❤️ در مشهد
      </motion.div>
    </main>
  );
}
