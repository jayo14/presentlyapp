const GOLD = "#f9c406";
const BACKGROUND_LIGHT = "#f8f8f5";
const BACKGROUND_DARK = "#231e0f";
const SURFACE_DARK = "#352e18";
const SURFACE_LIGHT = "#ffffff";
const BORDER_GOLD = "#6a5d2f";
const TEXT_MUTED = "#ccbf8e";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const RED = "#EF5350";
const GREEN = "#66BB6A";
const AMBER = "#FFA726";

export default {
  gold: GOLD,
  white: WHITE,
  black: BLACK,
  light: {
    background: BACKGROUND_LIGHT,
    text: "#111418",
    textSecondary: "#666666",
    cardBg: SURFACE_LIGHT,
    border: "#E0E0E0",
    input: SURFACE_LIGHT,
    primary: GOLD,
    tint: GOLD,
    error: RED,
    success: GREEN,
    warning: AMBER,
  },
  dark: {
    background: BACKGROUND_DARK,
    text: WHITE,
    textSecondary: TEXT_MUTED,
    cardBg: SURFACE_DARK,
    border: BORDER_GOLD,
    input: SURFACE_DARK,
    primary: GOLD,
    tint: GOLD,
    error: RED,
    success: GREEN,
    warning: AMBER,
  },
};
