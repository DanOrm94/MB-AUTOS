/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Impact', 'sans-serif']
      },
      boxShadow: {
        industrial: '0 20px 60px rgba(0,0,0,.35)'
      }
    }
  }
};
