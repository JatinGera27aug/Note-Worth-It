/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
      colors: {
        current: {
          50: '#f9fafb',   // Very light gray (almost white)
          100: '#f3f4f6',  // Light gray
          200: '#e5e7eb',  // Soft gray
          300: '#d1d5db',  // Medium gray
          400: '#9ca3af',  // Slate gray
          500: '#6b7280',  // Neutral gray
          600: '#4b5563',  // Dark gray
          700: '#374151',  // Deeper gray
          800: '#1f2937',  // Almost black gray
          900: '#111827',  // Deep charcoal
        },
        snowman: {
          50: '#f0f7ff',   // Light icy blue
          100: '#e0f2fe',  // Soft snow white
          200: '#b9e6fe',  // Light winter blue
          300: '#7cd4fd',  // Frosty blue
          400: '#38bdf8',  // Bright winter sky
          500: '#0ea5e9',  // Crisp winter blue
          600: '#0284c7',  // Deep winter blue
          700: '#0369a1',  // Dark winter blue
          800: '#075985',  // Midnight winter blue
          900: '#0c4a6e',  // Deepest winter blue
        },
        dark: {
          50: '#1e293b',   // Deep slate blue-gray
          100: '#334155',  // Slate gray
          200: '#475569',  // Muted slate
          300: '#64748b',  // Stone gray
          400: '#1e293b',  // Deep background
          500: '#0f172a',  // Almost black with blue undertones
          600: '#0e1525',  // Slightly lighter deep blue-black
          700: '#1e293b',  // Rich dark slate
          800: '#273244',  // Soft dark blue-gray
          900: '#374151',  // Dark charcoal gray
        }
      },
      fontFamily: {
        current: ['Inter', 'sans-serif'],
        snowman: ['Inter', 'sans-serif'],
        dark: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'current-subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'snowman-soft': '0 4px 6px -1px rgba(135, 206, 235, 0.3), 0 2px 4px -1px rgba(135, 206, 235, 0.2)',
        'dark-luxe': '0 10px 20px rgba(0, 0, 0, 0.3), 0 6px 6px rgba(49, 46, 46, 0.23)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};