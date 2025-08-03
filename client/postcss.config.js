export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace'
    },
    // Only add CSSNano in production
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Preserve Tailwind utilities
          discardUnused: false,
          mergeIdents: false,
          reduceIdents: false,
          zindex: false,
        }]
      }
    } : {})
  },
} 