## ADDED Requirements

### Requirement: Muya SHALL be built using Vite instead of Webpack
The Muya sub-package SHALL use Vite for its build process, replacing the existing Webpack configuration.

#### Scenario: Successful Vite build
- **WHEN** developer runs `yarn build:muya` from project root
- **THEN** Vite SHALL build Muya using `src/muya/vite.config.js`
- **AND** output files SHALL be generated in `src/muya/dist/`

#### Scenario: Build output matches Webpack output
- **WHEN** Vite build completes
- **THEN** `src/muya/dist/index.min.js` SHALL exist
- **AND** `src/muya/dist/index.min.css` SHALL exist
- **AND** both files SHALL be functionally equivalent to Webpack build output

### Requirement: Vite configuration SHALL support UMD library output
The Vite configuration SHALL produce UMD format output compatible with the existing Webpack configuration.

#### Scenario: UMD library export
- **WHEN** Vite builds Muya
- **THEN** output SHALL be in UMD format
- **AND** global variable name SHALL be `Muya`
- **AND** library SHALL be importable via CommonJS, AMD, and global variable

#### Scenario: Output file naming
- **WHEN** Vite build completes
- **THEN** JavaScript output SHALL be named `index.min.js`
- **AND** CSS output SHALL be named `index.min.css`
- **AND** both SHALL be located in `src/muya/dist/`

### Requirement: CSS SHALL be extracted to separate file
The build process SHALL extract CSS into a separate file, matching Webpack's MiniCssExtractPlugin behavior.

#### Scenario: CSS extraction
- **WHEN** Vite builds Muya
- **THEN** all CSS from `lib/assets/styles/` and `themes/` SHALL be extracted
- **AND** extracted CSS SHALL be written to `dist/index.min.css`
- **AND** CSS SHALL not be inlined into JavaScript

#### Scenario: CSS content preservation
- **WHEN** comparing Webpack and Vite CSS output
- **THEN** all CSS rules SHALL be preserved
- **AND** CSS variable names and values SHALL remain unchanged
- **AND** font-face declarations SHALL be preserved

### Requirement: Resource assets SHALL be handled correctly
The build SHALL process image, font, and media assets with proper naming and output locations.

#### Scenario: Image asset processing
- **WHEN** Vite encounters image files (png, jpg, gif, svg)
- **THEN** images SHALL be processed as assets
- **AND** output SHALL be in `dist/images/` directory
- **AND** filenames SHALL include content hash

#### Scenario: Font asset processing
- **WHEN** Vite encounters font files (woff, woff2, eot, ttf, otf)
- **THEN** fonts SHALL be processed as assets
- **AND** output SHALL be in `dist/fonts/` directory
- **AND** filenames SHALL include content hash

#### Scenario: Media asset processing
- **WHEN** Vite encounters media files (mp4, webm, ogg, mp3, wav, flac, aac)
- **THEN** media files SHALL be processed as assets
- **AND** output SHALL be in `dist/media/` directory
- **AND** filenames SHALL include content hash

### Requirement: Snap.svg SHALL be properly injected
The build SHALL handle Snap.svg library injection to ensure compatibility with browser environment.

#### Scenario: Snap.svg global injection
- **WHEN** Vite processes `lib/assets/libs/snap.svg-min.js`
- **THEN** `this` SHALL be bound to `window` global object
- **AND** Snap.svg SHALL be accessible as global variable
- **AND** sequence diagram rendering SHALL work correctly

### Requirement: Path aliases SHALL be configured
The Vite configuration SHALL define path aliases matching Webpack configuration.

#### Scenario: Snapsvg alias
- **WHEN** code imports `snapsvg`
- **THEN** Vite SHALL resolve to `lib/assets/libs/snap.svg-min.js`

#### Scenario: Node.js module fallbacks
- **WHEN** code references Node.js modules (fs, path)
- **THEN** `fs` SHALL resolve to `false` (browser-safe)
- **AND** `path` SHALL resolve to `path-browserify`

### Requirement: Build script SHALL be updated
The root package.json build script SHALL be updated to use Vite.

#### Scenario: Build command execution
- **WHEN** developer runs `yarn build:muya`
- **THEN** command SHALL execute `cd src/muya && vite build`
- **AND** build SHALL complete without errors
- **AND** exit code SHALL be 0 on success

## MODIFIED Requirements

### Requirement: Build system documentation SHALL be updated
The AGENTS.md documentation SHALL reflect the migration from Webpack to Vite.

#### Scenario: Technology stack table update
- **WHEN** reading AGENTS.md Technology Stack section
- **THEN** Webpack entry SHALL be removed or marked as legacy
- **AND** Vite entry SHALL indicate it is used for both main app and muya
- **AND** Muya build description SHALL reference Vite instead of Webpack

#### Scenario: Build system section update
- **WHEN** reading AGENTS.md Build System section
- **THEN** Legacy Webpack configs reference SHALL be removed
- **AND** Muya build description SHALL mention Vite instead of Webpack
