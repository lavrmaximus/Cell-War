# Cyberpunk/Neo-Futurism UI Overhaul Plan

## 1. Dependencies
The following packages need to be installed:
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `framer-motion`
- `clsx`
- `tailwind-merge` (for merging utility classes safely)

## 2. Tailwind Configuration (`tailwind.config.js`)
We will define a custom theme to match the Cyberpunk aesthetic.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#050505',
          dark: '#0a0a12',
          gray: '#1a1a2e',
          primary: '#ff2a6d', // Neon Pink
          secondary: '#05d9e8', // Neon Blue
          accent: '#f7f052', // Neon Yellow
          success: '#00ff9f', // Neon Green
          danger: '#ff0055', // Red
        }
      },
      fontFamily: {
        cyber: ['"Orbitron"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(to right, #1a1a2e 1px, transparent 1px), linear-gradient(to bottom, #1a1a2e 1px, transparent 1px)",
      },
      boxShadow: {
        'neon-pink': '0 0 5px #ff2a6d, 0 0 10px #ff2a6d',
        'neon-blue': '0 0 5px #05d9e8, 0 0 10px #05d9e8',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // Glitch keyframes to be added
      }
    },
  },
  plugins: [],
}
```

## 3. Global Styles (`index.css`)
- Import Google Fonts: `Orbitron` and `Share Tech Mono`.
- Add Tailwind directives.
- Add base styles for the body (background color, text color).
- Add custom utility classes for scrollbars.

## 4. Component Architecture

### 4.1 UI Primitives (`src/components/ui/`)
Create a new directory for reusable UI components.

- **`CyberButton.tsx`**:
  - Props: `variant` (primary, secondary, danger), `size`, `glitch` (boolean).
  - Style: Angled corners (clip-path), neon border, hover glow effect.
  
- **`CyberCard.tsx`**:
  - Props: `title`, `children`, `className`.
  - Style: Dark background with slight transparency, border with glowing accents, angled corners.

- **`CyberInput.tsx`**:
  - Style: Minimalist, bottom border only or full box with neon focus state.

- **`CyberBadge.tsx`**:
  - Small status indicators (e.g., for resources or turn count).

### 4.2 Layout (`src/components/Layout.tsx`)
- Wraps the entire application.
- Contains the `cyber-grid` background.
- Adds a `Scanline` overlay (pointer-events-none).
- Handles the main container structure.

### 4.3 Refactoring Existing Components
- **`App.tsx`**:
  - Remove Bootstrap `navbar`.
  - Use `Layout`.
  - Create a new `GameHeader` component for the top bar (Game/Editor links).
  
- **`PlayerPanel.tsx`**:
  - Convert to use `CyberCard`.
  - Display stats using `CyberBadge` or styled text.

- **`ActionPanel.tsx`**:
  - Use `CyberButton` for actions.
  - Group actions logically.

- **`ToolSelectionPanel.tsx`**:
  - Vertical sidebar style.
  - Active tool highlighted with `neon-blue` glow.

## 5. Implementation Steps for Code Mode

1.  **Install Dependencies**: Run `npm install -D tailwindcss postcss autoprefixer` and `npm install framer-motion clsx tailwind-merge`.
2.  **Init Tailwind**: Run `npx tailwindcss init -p`.
3.  **Update Config**: Copy the configuration above into `tailwind.config.js`.
4.  **Update CSS**: Replace `src/index.css` content.
5.  **Create Primitives**: Implement `CyberButton`, `CyberCard`, `Layout`.
6.  **Refactor App**: Update `App.tsx` to use the new Layout and remove Bootstrap.
7.  **Refactor Panels**: Update child components to use the new primitives.
8.  **Cleanup**: Remove Bootstrap from `package.json` and `index.tsx` (if imported there).
