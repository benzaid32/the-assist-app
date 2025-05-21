
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Match iOS theme.ts monochromatic palette
				border: 'rgba(60, 60, 67, 0.25)', // iOS standard separator
				input: 'rgba(60, 60, 67, 0.12)', // iOS light separator
				ring: '#333333', // Focus rings matching iOS accent secondary
				background: '#FFFFFF',
				foreground: '#000000',
				uplift: {
					primary: '#000000',    // Primary accent matching iOS
					secondary: '#333333',  // Secondary accent for hover states
					accent: '#666666',     // Muted accent for subtle emphasis
					muted: '#F2F2F7',      // iOS system gray 6
					light: '#FFFFFF'       // White background
				},
				primary: {
					DEFAULT: '#000000',    // Primary accent matching iOS theme
					foreground: '#FFFFFF'  // White text on primary
				},
				secondary: {
					DEFAULT: '#333333',    // Secondary accent for hover states
					foreground: '#FFFFFF'  // White text on secondary
				},
				destructive: {
					DEFAULT: '#FF5A5F',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#F5F5F5',
					foreground: '#6B7280'
				},
				accent: {
					DEFAULT: '#F4A261',
					foreground: '#FFFFFF'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#000000'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#000000'
				},
				sidebar: {
					DEFAULT: '#1F2937', // Dark sidebar color from screenshot
					foreground: '#FFFFFF',
					primary: '#FF5A5F',
					'primary-foreground': '#FFFFFF',
					accent: '#F4A261',
					'accent-foreground': '#FFFFFF',
					border: '#374151',
					ring: '#374151'
				}
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s ease-out'
			},
			fontFamily: {
				sans: ['"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
				mono: ['"SF Mono"', 'monospace'],
			},
			fontSize: {
				'xs': ['12px', { lineHeight: '16px' }],
				'sm': ['14px', { lineHeight: '20px' }],
				'base': ['16px', { lineHeight: '24px' }],
				'lg': ['18px', { lineHeight: '28px' }],
				'xl': ['22px', { lineHeight: '30px', letterSpacing: '-0.5px' }],
				'2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
				'3xl': ['28px', { lineHeight: '38px', letterSpacing: '-0.5px' }],
				'4xl': ['32px', { lineHeight: '42px', letterSpacing: '-0.5px' }],
			},
			letterSpacing: {
				tighter: '-0.5px',
				tight: '-0.25px',
				normal: '0',
				wide: '0.2px',
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			lineHeight: {
				none: '1',
				tight: '1.25',
				snug: '1.375',
				normal: '1.5',
				relaxed: '1.625',
				loose: '2',
				'3': '12px',
				'4': '16px',
				'5': '20px',
				'6': '24px',
				'7': '28px',
				'8': '32px',
				'9': '36px',
				'10': '40px',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
