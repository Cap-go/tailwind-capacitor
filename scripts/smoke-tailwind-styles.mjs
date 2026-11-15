/** Tailwind v4 @source paths so runtime class strings from registry shared JS are emitted. */
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

export const angularSmokeStylesNoSource = `@import "./capacitor/styles/tailwind-capacitor.css";
`;

export const reactSmokeStylesNoSource = `@import "./capacitor/styles/tailwind-capacitor.css";
`;

export const vueSmokeStylesNoSource = `@import "./capacitor/styles/tailwind-capacitor.css";
`;

export const vueSmokeStyles = `@source "./capacitor/shared/**/*.js";
@source "./capacitor/vue/**/*.vue";
@source "./**/*.{js,vue,css}";

@import "./capacitor/styles/tailwind-capacitor.css";
`;