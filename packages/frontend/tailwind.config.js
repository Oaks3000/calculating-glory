/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens
        'bg-deep':    '#0B1622',
        'bg-surface': '#1B2635',
        'bg-raised':  '#243447',
        'txt-primary':'#F1F5F9',
        'txt-muted':  '#94A3B8',
        'data-blue':  '#448AFF',
        'alert-red':  '#D32F2F',
        'pitch-green':'#4CAF50',
        'warn-amber': '#FF8F00',
        'chat-npc':   '#F0F2F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'tag':    '4px',
        'card':   '12px',
        'bubble': '20px',
      },
      fontSize: {
        'xs2': '0.65rem',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in':        'fadeIn 0.2s ease-in',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'ticker':         'ticker 206s linear infinite',
        'rep-flash-up':   'repFlashUp 0.7s ease-out forwards',
        'rep-flash-down': 'repFlashDown 0.7s ease-out forwards',
        'msg-bump':            'msgBump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'msg-goal-bump':      'msgGoalBump 1.4s ease-out forwards',
        'msg-goal-bump-oppo': 'msgGoalBumpOppo 0.9s ease-out forwards',
        // Match pitch blip animations
        'blip-jitter':    'blipJitter 1.2s ease-in-out infinite',
        'blip-drift':     'blipDrift 2s ease-in-out infinite',
        'blip-tense':     'blipTense 0.4s ease-in-out infinite',
        'blip-celebrate': 'blipCelebrate 0.6s ease-in-out infinite',
        'goal-pulse':     'goalPulse 1.8s ease-out forwards',
        'crowd-glow':     'crowdGlow 1.5s ease-in-out infinite',
        'score-bounce':   'scoreBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(68,138,255,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(68,138,255,0.3)' },
        },
        ticker: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(-100%)' },
        },
        repFlashUp: {
          '0%':   { boxShadow: '0 0 0 0 rgba(76,175,80,0)',  backgroundColor: 'rgba(76,175,80,0.25)' },
          '30%':  { boxShadow: '0 0 0 8px rgba(76,175,80,0.35)', backgroundColor: 'rgba(76,175,80,0.18)' },
          '100%': { boxShadow: '0 0 0 0 rgba(76,175,80,0)',  backgroundColor: 'transparent' },
        },
        repFlashDown: {
          '0%':   { boxShadow: '0 0 0 0 rgba(211,47,47,0)',  backgroundColor: 'rgba(211,47,47,0.25)' },
          '30%':  { boxShadow: '0 0 0 8px rgba(211,47,47,0.35)', backgroundColor: 'rgba(211,47,47,0.18)' },
          '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)',  backgroundColor: 'transparent' },
        },
        msgBump: {
          '0%':   { transform: 'scale(1.08)', opacity: '0' },
          '60%':  { transform: 'scale(0.98)', opacity: '1' },
          '100%': { transform: 'scale(1.0)',  opacity: '1' },
        },
        msgGoalBump: {
          '0%':   { transform: 'scale(1.0)',  opacity: '0' },
          '7%':   { transform: 'scale(1.18)', opacity: '1' },
          '16%':  { transform: 'scale(1.0)' },
          '26%':  { transform: 'scale(1.14)' },
          '36%':  { transform: 'scale(1.0)' },
          '48%':  { transform: 'scale(1.10)' },
          '58%':  { transform: 'scale(1.0)' },
          '70%':  { transform: 'scale(1.06)' },
          '80%':  { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.0)' },
        },
        msgGoalBumpOppo: {
          '0%':   { transform: 'scale(1.0)',  opacity: '0' },
          '14%':  { transform: 'scale(1.12)', opacity: '1' },
          '30%':  { transform: 'scale(1.0)' },
          '48%':  { transform: 'scale(1.08)' },
          '65%':  { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.0)' },
        },
        // Match pitch animations
        blipJitter: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%':      { transform: 'translate(1.5px, -1px)' },
          '50%':      { transform: 'translate(-1px, 1.5px)' },
          '75%':      { transform: 'translate(1px, 0.5px)' },
        },
        blipDrift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%':      { transform: 'translate(1px, -2px)' },
        },
        blipTense: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%':      { transform: 'translate(2px, -2px)' },
          '50%':      { transform: 'translate(-2px, 1.5px)' },
          '75%':      { transform: 'translate(1.5px, 2px)' },
        },
        blipCelebrate: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%':      { transform: 'scale(1.5)', opacity: '1' },
        },
        scoreBounce: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.35)' },
          '70%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
