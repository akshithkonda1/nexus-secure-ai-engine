module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Blend Image 2 (pastel/light) with Image 3 (dark navy)
        primary: '#3B82F6',   // blue-500 for accents
        surface: '#111827',   // gray-900 dark base
        elevated: '#1F2937',  // gray-800 for cards
        muted: '#9CA3AF',     // gray-400 for text
        accent: '#10B981',    // emerald-500 for highlights
        lightBg: '#F3F4F6',   // gray-100 for light mode (Image 2 inspo)
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
