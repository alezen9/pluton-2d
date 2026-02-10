export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1480,
} as const;

// const createMediaQueries = () => Object.entries(BREAKPOINTS).reduce((acc, [key, value]) => {
//   acc[key] = `(max-width: ${value}px)`,
//   return acc
// }, {})

export const mediaQueries = {
  mobile: `(max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `(max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(max-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(max-width: ${BREAKPOINTS.wide}px)`,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
