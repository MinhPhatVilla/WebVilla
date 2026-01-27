import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0F172A', // Deep Blue
                    light: '#1E293B',
                },
                gold: {
                    DEFAULT: '#D4AF37', // Luxury Gold
                }
            },
        },
    },
    plugins: [],
};
export default config;
