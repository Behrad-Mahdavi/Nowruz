import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0B2545', // Navy Blue (Trust/Science)
                accent: '#C59D5F',  // Gold (Luxury/Nowruz)
                action: '#D86C45',  // Orange (CTA/Appetite)
                surface: '#F3F4F6', // Beige/Soft Gray
            },
            fontFamily: {
                sans: ['var(--font-dana)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
