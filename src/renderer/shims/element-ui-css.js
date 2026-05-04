// This shim provides element-ui CSS content as a string for Vite.
// In dev mode, Vite injects CSS automatically, but we need the raw string for theme replacement.
import elementUiCss from 'element-ui/lib/theme-chalk/index.css?inline'

export default elementUiCss
