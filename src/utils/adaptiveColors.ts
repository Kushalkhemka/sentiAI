import { Sentiment } from "@/types/chat";

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export const getSentimentColorTheme = (sentiment: Sentiment): ColorTheme => {
  switch (sentiment) {
    case "positive":
      return {
        primary: "hsl(142, 76%, 36%)",     // Green
        secondary: "hsl(149, 80%, 90%)",   // Light green
        accent: "hsl(143, 85%, 58%)",      // Bright green
        background: "hsl(0, 0%, 100%)",    // White
        foreground: "hsl(215, 28%, 17%)"   // Dark blue-gray
      };
    case "hopeful":
      return {
        primary: "hsl(202, 80%, 50%)",     // Blue
        secondary: "hsl(203, 87%, 92%)",   // Light blue
        accent: "hsl(199, 89%, 48%)",      // Bright blue
        background: "hsl(210, 40%, 98%)",  // Very light blue
        foreground: "hsl(215, 28%, 17%)"   // Dark blue-gray
      };
    case "calm":
      return {
        primary: "hsl(262, 83%, 58%)",     // Purple
        secondary: "hsl(263, 70%, 95%)",   // Light purple
        accent: "hsl(263, 70%, 70%)",      // Soft purple
        background: "hsl(260, 40%, 98%)",  // Very light purple
        foreground: "hsl(215, 28%, 17%)"   // Dark blue-gray
      };
    case "neutral":
      return {
        primary: "hsl(240, 5.9%, 10%)",    // Default shadcn/ui
        secondary: "hsl(240, 4.8%, 95.9%)",// Default shadcn/ui
        accent: "hsl(240, 4.8%, 95.9%)",   // Default shadcn/ui
        background: "hsl(0, 0%, 100%)",    // Default shadcn/ui
        foreground: "hsl(240, 10%, 3.9%)"  // Default shadcn/ui
      };
    case "anxious":
      return {
        primary: "hsl(45, 93%, 47%)",      // Yellow
        secondary: "hsl(48, 96%, 89%)",    // Light yellow
        accent: "hsl(38, 92%, 50%)",       // Amber
        background: "hsl(60, 40%, 98%)",   // Very light yellow
        foreground: "hsl(24, 10%, 10%)"    // Dark brown
      };
    case "overwhelmed":
    case "frustrated":
      return {
        primary: "hsl(20, 90%, 48%)",      // Orange
        secondary: "hsl(49, 100%, 96%)",   // Cream
        accent: "hsl(21, 90%, 48%)",       // Bright orange
        background: "hsl(40, 40%, 98%)",   // Very light orange
        foreground: "hsl(24, 12%, 10%)"    // Dark brown
      };
    case "negative":
    case "depressed":
    case "fearful":
      return {
        primary: "hsl(235, 21%, 35%)",     // Dark blue-gray
        secondary: "hsl(240, 11%, 90%)",   // Light gray
        accent: "hsl(208, 79%, 51%)",      // Bright blue
        background: "hsl(210, 20%, 98%)",  // Very light blue-gray
        foreground: "hsl(215, 25%, 27%)"   // Medium blue-gray
      };
    case "suppressed":
    case "confused":
      return {
        primary: "hsl(280, 37%, 45%)",     // Muted purple
        secondary: "hsl(280, 30%, 92%)",   // Very light purple
        accent: "hsl(280, 67%, 40%)",      // Deep purple
        background: "hsl(280, 20%, 97%)",  // Nearly white with hint of purple
        foreground: "hsl(280, 15%, 20%)"   // Dark purple-gray
      };
    case "urgent":
      return {
        primary: "hsl(0, 84%, 60%)",       // Red
        secondary: "hsl(0, 86%, 97%)",     // Very light red
        accent: "hsl(0, 84%, 50%)",        // Bright red
        background: "hsl(0, 0%, 100%)",    // White
        foreground: "hsl(0, 30%, 20%)"     // Dark red-gray
      };
    default:
      return {
        primary: "hsl(240, 5.9%, 10%)",    // Default shadcn/ui
        secondary: "hsl(240, 4.8%, 95.9%)",// Default shadcn/ui
        accent: "hsl(240, 4.8%, 95.9%)",   // Default shadcn/ui
        background: "hsl(0, 0%, 100%)",    // Default shadcn/ui
        foreground: "hsl(240, 10%, 3.9%)"  // Default shadcn/ui
      };
  }
};

export const applyColorTheme = (theme: ColorTheme, isDark = false) => {
  const root = document.documentElement;
  
  if (isDark) {
    // Invert colors for dark mode
    root.style.setProperty('--primary', invertLightness(theme.primary));
    root.style.setProperty('--secondary', invertLightness(theme.secondary));
    root.style.setProperty('--accent', invertLightness(theme.accent));
    root.style.setProperty('--background', "hsl(240, 10%, 4%)"); // Dark background
    root.style.setProperty('--foreground', "hsl(0, 0%, 98%)");   // Light text
  } else {
    // Light mode uses colors directly
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
  }
  
  // Update the derived colors for proper UI
  root.style.setProperty('--primary-foreground', isDark ? "hsl(0, 0%, 10%)" : "hsl(0, 0%, 98%)");
  root.style.setProperty('--secondary-foreground', isDark ? "hsl(0, 0%, 98%)" : theme.foreground);
  root.style.setProperty('--accent-foreground', isDark ? "hsl(0, 0%, 98%)" : theme.foreground);
  root.style.setProperty('--muted', isDark ? "hsl(240, 5%, 15%)" : "hsl(240, 5%, 96%)");
  root.style.setProperty('--muted-foreground', isDark ? "hsl(240, 5%, 65%)" : "hsl(240, 4%, 46%)");
};

// Helper function to invert HSL lightness for dark mode
const invertLightness = (hsl: string): string => {
  // Simple implementation - for production, you'd want a more sophisticated color manipulation
  if (hsl.startsWith('hsl(')) {
    const parts = hsl.slice(4, -1).split(',');
    const h = parts[0].trim();
    const s = parts[1].trim();
    const l = parseFloat(parts[2].trim().replace('%', ''));
    
    // Invert lightness while keeping reasonable contrast
    const invertedL = 100 - l;
    return `hsl(${h}, ${s}, ${invertedL}%)`;
  }
  return hsl;
};

export const resetToDefaultTheme = (isDark = false) => {
  const root = document.documentElement;
  
  if (isDark) {
    // Default dark theme
    root.style.setProperty('--background', "hsl(240, 10%, 4%)");
    root.style.setProperty('--foreground', "hsl(0, 0%, 98%)");
    root.style.setProperty('--primary', "hsl(240, 5%, 64.9%)");
    root.style.setProperty('--primary-foreground', "hsl(0, 0%, 9%)");
    root.style.setProperty('--secondary', "hsl(240, 4%, 16%)");
    root.style.setProperty('--secondary-foreground', "hsl(0, 0%, 98%)");
    root.style.setProperty('--muted', "hsl(240, 5%, 15%)");
    root.style.setProperty('--muted-foreground', "hsl(240, 5%, 65%)");
    root.style.setProperty('--accent', "hsl(240, 4%, 16%)");
    root.style.setProperty('--accent-foreground', "hsl(0, 0%, 98%)");
  } else {
    // Default light theme
    root.style.setProperty('--background', "hsl(0, 0%, 100%)");
    root.style.setProperty('--foreground', "hsl(240, 10%, 3.9%)");
    root.style.setProperty('--primary', "hsl(240, 5.9%, 10%)");
    root.style.setProperty('--primary-foreground', "hsl(0, 0%, 98%)");
    root.style.setProperty('--secondary', "hsl(240, 4.8%, 95.9%)");
    root.style.setProperty('--secondary-foreground', "hsl(240, 5.9%, 10%)");
    root.style.setProperty('--muted', "hsl(240, 4.8%, 95.9%)");
    root.style.setProperty('--muted-foreground', "hsl(240, 3.8%, 46.1%)");
    root.style.setProperty('--accent', "hsl(240, 4.8%, 95.9%)");
    root.style.setProperty('--accent-foreground', "hsl(240, 5.9%, 10%)");
  }
};
