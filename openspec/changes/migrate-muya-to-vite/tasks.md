## 1. Create Vite Configuration

- [ ] 1.1 Create `src/muya/vite.config.js` with basic structure
- [ ] 1.2 Configure library mode with UMD output
- [ ] 1.3 Set entry point to `lib/index.js`
- [ ] 1.4 Configure output directory to `dist/`
- [ ] 1.5 Set library name to `Muya` and filename to `index.min`

## 2. Configure CSS Handling

- [ ] 2.1 Install `rollup-plugin-styles` for CSS extraction
- [ ] 2.2 Configure CSS extraction to output `index.min.css`
- [ ] 2.3 Ensure CSS is not inlined into JavaScript
- [ ] 2.4 Test CSS output matches Webpack output

## 3. Configure Path Aliases

- [ ] 3.1 Add `snapsvg` alias pointing to `lib/assets/libs/snap.svg-min.js`
- [ ] 3.2 Configure `fs` fallback to `false`
- [ ] 3.3 Configure `path` fallback to `path-browserify`
- [ ] 3.4 Set file extensions: `.js`, `.vue`, `.json`, `.css`, `.node`

## 4. Configure Snap.svg Injection

- [ ] 4.1 Install `@rollup/plugin-inject` or `rollup-plugin-inject`
- [ ] 4.2 Configure injection for `snap.svg-min.js` to bind `this` to `window`
- [ ] 4.3 Test Snap.svg functionality (sequence diagram rendering)

## 5. Configure Resource Assets

- [ ] 5.1 Configure image assets (png, jpg, gif, svg) with content hash
- [ ] 5.2 Set image output directory to `dist/images/`
- [ ] 5.3 Configure font assets (woff, woff2, eot, ttf, otf)
- [ ] 5.4 Set font output directory to `dist/fonts/`
- [ ] 5.5 Configure media assets (mp4, webm, ogg, mp3, wav, flac, aac)
- [ ] 5.6 Set media output directory to `dist/media/`

## 6. Update Build Scripts

- [ ] 6.1 Update root `package.json` `build:muya` script to use Vite
- [ ] 6.2 Change from `webpack --progress --config webpack.config.js` to `vite build`
- [ ] 6.3 Verify `release:muya` script still works correctly

## 7. Test Build

- [ ] 7.1 Run `yarn build:muya` and verify successful completion
- [ ] 7.2 Check `src/muya/dist/index.min.js` exists and is valid UMD
- [ ] 7.3 Check `src/muya/dist/index.min.css` exists and contains expected styles
- [ ] 7.4 Verify resource assets in `dist/images/`, `dist/fonts/`, `dist/media/`
- [ ] 7.5 Compare file sizes with Webpack output (should be similar)

## 8. Integration Test

- [ ] 8.1 Run `yarn dev` to start development server
- [ ] 8.2 Test Markdown editor functionality
- [ ] 8.3 Test sequence diagram rendering (Snap.svg)
- [ ] 8.4 Test code syntax highlighting (Prism.js)
- [ ] 8.5 Test math formula rendering (KaTeX)
- [ ] 8.6 Test theme switching

## 9. Production Build Test

- [ ] 9.1 Run `yarn build` for full production build
- [ ] 9.2 Verify no build errors
- [ ] 9.3 Test packaged application functionality
- [ ] 9.4 Verify all Muya features work in production build

## 10. Documentation Update

- [ ] 10.1 Update `AGENTS.md` Technology Stack table
- [ ] 10.2 Remove Webpack entry or mark as legacy
- [ ] 10.3 Update Muya build description to reference Vite
- [ ] 10.4 Update Build System section to remove Legacy Webpack configs reference

## 11. Cleanup

- [ ] 11.1 Delete `src/muya/webpack.config.js`
- [ ] 11.2 Remove Webpack-related dependencies from root `package.json` (optional)
- [ ] 11.3 Update `.eslintrc` if it references webpack.config.js
- [ ] 11.4 Run `yarn install` to update lockfile

## 12. Final Verification

- [ ] 12.1 Run `yarn lint` to ensure no linting errors
- [ ] 12.2 Run `yarn unit` to ensure unit tests pass
- [ ] 12.3 Run `yarn build` and `yarn e2e` for full test suite
- [ ] 12.4 Verify all scenarios from specs pass
