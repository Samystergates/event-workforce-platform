// Configure optional assets to preload at startup.
// Safe defaults are empty; add your brand assets when ready.

// 1) Fonts: map font family name to a require() of the font file.
// Example:
// export const FONT_MAP = {
//   EventicoSans: require('../../assets/fonts/EventicoSans-Regular.ttf'),
//   EventicoSans_Bold: require('../../assets/fonts/EventicoSans-Bold.ttf'),
// } as const;

export const FONT_MAP = {} as const;

// 2) Local images: add require() entries for images to cache.
// Example:
// export const LOCAL_IMAGES = [
//   require('../../assets/images/company-logo.png'),
// ] as const;

export const LOCAL_IMAGES = [] as const;

// 3) Remote images: http(s) URLs to prefetch into cache on startup.
// Example:
// export const REMOTE_IMAGES = [
//   'https://your.cdn.com/hero.jpg',
// ];

export const REMOTE_IMAGES: string[] = [];
