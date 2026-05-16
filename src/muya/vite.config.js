import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Build configuration for library mode
  build: {
    // Library mode configuration
    lib: {
      entry: resolve(__dirname, 'lib/index.js'),
      name: 'Muya',
      fileName: 'index.min',
      formats: ['umd']
    },
    
    // Output directory
    outDir: 'dist',
    
    // CSS configuration - extract to separate file
    cssCodeSplit: false,
    
    // Rollup options for advanced configuration
    rollupOptions: {
      // External dependencies (none for pure browser library)
      external: [],
      
      output: {
        // Asset file naming patterns
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|gif|svg/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          if (/mp4|webm|ogg|mp3|wav|flac|aac/i.test(ext)) {
            return `media/[name]-[hash][extname]`
          }
          // CSS files go to root as index.min.css
          return '[name][extname]'
        },
        
        // UMD global variable name
        globals: {}
      }
    }
  },
  
  // Resolve configuration
  resolve: {
    // Path aliases
    alias: {
      'snapsvg': resolve(__dirname, 'lib/assets/libs/snap.svg-min.js')
    },
    
    // File extensions
    extensions: ['.js', '.vue', '.json', '.css', '.node'],
    
    // Node.js module fallbacks for browser environment
    fallback: {
      'fs': false,
      'path': 'path-browserify'
    }
  },
  
  // CSS configuration
  css: {
    // PostCSS configuration (will auto-load postcss.config.js if exists)
    postcss: {}
  },
  
  // ESBuild configuration
  esbuild: {
    // Target environment
    target: 'es2015'
  },
  
  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
