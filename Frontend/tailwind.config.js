export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        surface: '#111827',
        elevated: '#1F2937',
        muted: '#9CA3AF',
        accent: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
