/**
 * ERP Design System — Design Tokens
 * Centralized constants for colors, spacing, typography, and radii.
 * Use these tokens for programmatic styling and theme configuration.
 */

// ── Ocean-Blue Color Palette ──
export const colors = {
  erp: {
    950: "#03045E",
    900: "#023E8A",
    800: "#4854CC",
    700: "#0096C7",
    600: "#006AA3",
    500: "#4854CC",
    400: "#0A5F8F",
    300: "#E2E8F0",
    200: "#F1F5F9",
    100: "#F8FAFC",
    50: "#FFFFFF",
  },
} as const;

// ── Semantic Color Tokens ──
export const semanticColors = {
  primary: "#4854CC",
  primaryHover: "#0096C7",
  primaryDark: "#03045E",
  secondary: "#023E8A",
  accent: "#4854CC",
  accentSoft: "rgba(0, 119, 182, 0.1)",
  info: "#4854CC",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  destructive: "#DC2626",
  surface: "rgba(255, 255, 255, 0.65)",
  surfaceBlue: "rgba(248, 250, 252, 0.78)",
  surfaceMuted: "rgba(248, 250, 252, 0.75)",
  borderSoft: "#E2E8F0",
  textPrimary: "#111827",
  textSecondary: "#1F2937",
  textMuted: "#6B7280",
} as const;

// ── 8px Spacing System ──
export const spacing = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

// ── Page Layout Spacing ──
export const pageSpacing = {
  /** Container horizontal padding per breakpoint */
  containerPadding: {
    mobile: "px-3",
    tablet: "px-4",
    desktop: "px-6",
    wide: "px-6",
  },
  /** Top padding */
  pageTop: "pt-4",
  /** Bottom padding */
  pageBottom: "pb-8",
  /** Gap between sections */
  sectionGap: "gap-4",
  /** Card internal padding */
  cardPadding: "p-5",   // 20px  (or p-6 for larger cards)
  /** Form field gap */
  formGap: "gap-4",     // 16px
  /** Table/action gap */
  actionGap: "gap-2",   // 8px
  /** Header to content gap */
  headerGap: "mt-4",
} as const;

// ── Typography Classes ──
export const typography = {
  /** Main page title */
  pageTitle: "text-2xl md:text-3xl font-semibold tracking-tight text-[#111827]",
  /** Section title */
  sectionTitle: "text-lg md:text-xl font-semibold text-[#111827]",
  /** Card title */
  cardTitle: "text-base font-semibold text-[#1F2937]",
  /** Body text */
  body: "text-sm text-[#1F2937]",
  /** Helper text */
  helper: "text-xs text-[#6B7280]",
  /** Table header */
  tableHeader: "text-xs font-semibold uppercase tracking-wide text-[#374151]",
  /** Button text */
  button: "text-sm font-medium",
  /** Form label */
  formLabel: "text-sm font-medium text-[#1F2937]",
  /** Error text */
  error: "text-xs font-medium text-red-500",
} as const;

// ── Border Radius ──
export const radii = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;

// ── Button Sizes ──
export const buttonSizes = {
  xs: { height: "h-7", text: "text-xs" },
  sm: { height: "h-8", text: "text-xs" },
  default: { height: "h-9", text: "text-sm" },
  lg: { height: "h-10", text: "text-sm" },
  icon: { height: "h-9 w-9", text: "" },
} as const;

// ── Responsive Breakpoints ──
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ── Standard Button Labels ──
export const buttonLabels = [
  "Add New",
  "Create",
  "Save",
  "Save Changes",
  "Submit",
  "Edit",
  "Delete",
  "View",
  "Approve",
  "Reject",
  "Cancel",
  "Back",
  "Print",
  "Export",
  "Import",
  "Upload",
  "Download",
  "Search",
  "Filter",
  "Reset",
  "Clear",
  "Continue",
  "Close",
  "Logout",
] as const;

export type ButtonLabel = (typeof buttonLabels)[number];
