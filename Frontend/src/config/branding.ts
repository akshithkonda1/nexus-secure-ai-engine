export const BRANDING = {
  dark: {
    logo: "/brand/nexus-logo.png",
    alt: "Nexus"
  },
  light: {
    logo: "/brand/nexus-logo-inverted.png",
    alt: "Nexus"
  }
} as const;

export type BrandTheme = keyof typeof BRANDING;
