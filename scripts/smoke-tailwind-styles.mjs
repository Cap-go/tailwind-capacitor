/** Tailwind v4 @source paths so runtime class strings from registry shared JS are emitted. */
const capacitorTailwindNoAutoSource = `@import "tailwindcss" source(none);
@import "./capacitor/styles/theme-tokens.css";
@import "./capacitor/styles/variants.css";
@import "./capacitor/styles/safe-areas-base.css";
@import "./capacitor/styles/safe-areas-generated.css";
@import "./capacitor/styles/utilities.css";
@import "./capacitor/styles/line-clamp.css";
@plugin "./capacitor/config/plugin-base.js";
@plugin "./capacitor/config/plugin-colors.js";
`;

export const angularSmokeStyles = `@source "./capacitor/shared/**/*.js";
@source "./capacitor/angular/**/*.ts";
@source "./app/**/*.ts";

@import "./capacitor/styles/tailwind-capacitor.css";
`;

export const reactSmokeStyles = `@source "./capacitor/shared/**/*.js";
@source "./capacitor/react/**/*.{js,jsx,ts,tsx}";
@source "./**/*.{ts,tsx,css}";

@import "./capacitor/styles/tailwind-capacitor.css";
`;

export const angularSmokeStylesNoSource = capacitorTailwindNoAutoSource;

export const reactSmokeStylesNoSource = capacitorTailwindNoAutoSource;

export const vueSmokeStylesNoSource = capacitorTailwindNoAutoSource;

export const vueSmokeStyles = `@source "./capacitor/shared/**/*.js";
@source "./capacitor/vue/**/*.vue";
@source "./**/*.{js,vue,css}";

@import "./capacitor/styles/tailwind-capacitor.css";
`;