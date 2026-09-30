/**
 * Northwind Market — "Minimalist / Architectural" design system.
 *
 * Token names mirror the designer mockups 1:1 (primary/accent-pine, on-surface,
 * border-grid, surface-container scale, the headline/body/label type scale,
 * and the space/margin spacing scale) so ported markup needs no translation. Storefront uses zero radius + 1px
 * hairline borders; the scale below also allows the subtle admin rounding.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Accent family
        primary: '#047857',
        'primary-dark': '#064e3b',
        'accent-pine': '#047857',
        'accent-pine-hover': '#065f46',
        tertiary: '#1b5b47',

        // Text
        'text-primary': '#18181b',
        'text-muted': '#71717a',
        'on-surface': '#18181b',
        'on-surface-variant': '#52525b',
        'on-primary': '#ffffff',
        secondary: '#5f5e61',

        // Borders / outlines
        'border-grid': '#e4e4e1',
        'border-strong': '#18181b',
        outline: '#a1a1aa',
        'outline-variant': '#e4e4e7',

        // Surfaces
        'surface-pure': '#ffffff',
        surface: '#f9f9f7',
        'surface-paper': '#f8f8f6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f4f2',
        'surface-container': '#eeeeec',
        'surface-container-high': '#e8e8e6',
        'surface-container-highest': '#e4e4e1',

        // Error
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // Designer tokens appear as font-headline-* / font-body-* / font-label-*
        'headline-xl': ['"Space Grotesk"', 'sans-serif'],
        'headline-lg': ['"Space Grotesk"', 'sans-serif'],
        'headline-md': ['"Space Grotesk"', 'sans-serif'],
        'headline-sm': ['"Space Grotesk"', 'sans-serif'],
        'body-lg': ['"Space Grotesk"', 'sans-serif'],
        'body-md': ['"Space Grotesk"', 'sans-serif'],
        'body-sm': ['"Space Grotesk"', 'sans-serif'],
        'label-lg': ['"Space Grotesk"', 'sans-serif'],
        'label-md': ['"Space Grotesk"', 'sans-serif'],
        'label-sm': ['"Space Grotesk"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em', fontWeight: '600' }],
        'headline-lg': ['36px', { lineHeight: '40px', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '500' }],
        'headline-sm': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-lg': ['13px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '600' }],
        'label-md': ['11px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '12px', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '3rem',
        'margin-mobile': '1.25rem',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};
