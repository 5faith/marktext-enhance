# Vue 3 Migration Guide

## Overview
MarkText has been migrated from Vue 2 + Webpack + Vuex + Element UI to Vue 3 + Vite + Pinia + Element Plus.

## Key Changes
1. **Build Tool**: Webpack → Vite
2. **Vue Version**: Vue 2.7 → Vue 3.4+ (removed @vue/compat)
3. **State Management**: Vuex → Pinia
4. **UI Library**: Element UI → Element Plus
5. **Component API**: Options API → Composition API (script setup)

## Migration Steps Completed
- Phase 1: Environment Preparation
- Phase 2: Webpack to Vite Migration
- Phase 3: Vue 2.7 Upgrade
- Phase 4: Vue 3 with Compat Mode
- Phase 5: Element UI to Element Plus
- Phase 6: Remove Compat Layer & Optimize
  - Removed @vue/compat
  - Refactored 26+ components to `<script setup>`
  - Optimized reactive system usage
  - Fixed Vue 3 compatibility warnings

## Component Script Setup Migration
### Pattern Used
```vue
<script setup>
import { ref, computed } from 'vue'
import { useSomeStore } from '@/stores'

// Props
const props = defineProps({
  // ...
})

// State
const someState = ref('')

// Computed
const someComputed = computed(() => {
  // ...
})

// Methods
const someMethod = () => {
  // ...
}
</script>
```

### Stores (Pinia)
```javascript
// stores/someStore.js
import { defineStore } from 'pinia'

export const useSomeStore = defineStore('some', {
  state: () => ({
    // ...
  }),
  actions: {
    // ...
  }
})
```

## Known Issues
1. **Unit Tests**: Need to update Karma config for Vue 3
2. **Lint Errors**: 55 remaining (mostly unused vars, ESLint config)
3. **Complex Components**: `editor.vue` (1384 lines) not refactored (compatible)
4. **Source Code Editor**: `sourceCode.vue` kept as-is (compatible)

## New Development Guidelines
1. Use `<script setup>` for new components
2. Use Pinia stores instead of Vuex
3. Use Element Plus components (auto-import enabled)
4. Use Vue 3 Composition API patterns
5. Run `yarn lint:fix` before committing

## Build Commands
- `yarn dev` - Start dev server
- `yarn build` - Production build
- `yarn build:bin` - Build without packaging
- `yarn lint` - Check lint errors
- `yarn lint:fix` - Auto-fix lint errors

## References
- [Vue 3 Migration Guide](https://vuejs.org/guide/migration/introduction.html)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite Documentation](https://vitejs.dev/)
