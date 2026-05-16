## ADDED Requirements

### Requirement: Remove element-ui dependency
The system SHALL completely remove the `element-ui` package from dependencies.

#### Scenario: Package.json updated
- **WHEN** the migration is complete
- **THEN** `element-ui` SHALL NOT be present in `package.json` dependencies
- **AND** `yarn install` SHALL NOT install element-ui

#### Scenario: No element-ui imports
- **WHEN** searching the codebase for element-ui imports
- **THEN** no files SHALL import from `element-ui` package
- **AND** no files SHALL reference `element-ui` CSS

### Requirement: Update Vite configuration
The system SHALL update Vite configuration to remove element-ui references.

#### Scenario: Vite alias removed
- **WHEN** examining `vite.config.js`
- **THEN** the alias for `element-ui/lib/theme-chalk/index.css` SHALL be removed
- **AND** `element-ui` SHALL NOT be in `optimizeDeps.include`

#### Scenario: Auto-import configuration maintained
- **WHEN** examining the Vite plugins
- **THEN** `unplugin-vue-components` SHALL continue to use `ElementPlusResolver`
- **AND** `unplugin-auto-import` SHALL continue to use `ElementPlusResolver`

### Requirement: Remove element-ui CSS shim
The system SHALL remove the element-ui CSS shim file.

#### Scenario: Shim file deleted
- **WHEN** checking `src/renderer/shims/`
- **THEN** `element-ui-css.js` SHALL NOT exist
- **AND** no files SHALL import from this shim

### Requirement: Theme system compatibility
The system SHALL ensure theme system works with Element Plus.

#### Scenario: Theme variables defined
- **WHEN** the application loads
- **THEN** Element Plus CSS variables SHALL be properly defined
- **AND** custom themes SHALL override Element Plus variables correctly

#### Scenario: Theme switching works
- **WHEN** user switches between light and dark themes
- **THEN** Element Plus components SHALL reflect the theme change
- **AND** no visual glitches SHALL occur

### Requirement: Component functionality preserved
The system SHALL ensure all Element components continue to function correctly.

#### Scenario: Dialog components work
- **WHEN** user opens any dialog (about, import, rename, etc.)
- **THEN** the dialog SHALL display correctly
- **AND** dialog interactions (close, confirm) SHALL work as expected

#### Scenario: Table components work
- **WHEN** viewing tables (keybindings, spellchecker settings)
- **THEN** table data SHALL display correctly
- **AND** table interactions (sort, select) SHALL work as expected

#### Scenario: Form components work
- **WHEN** using form elements (preferences, export settings)
- **THEN** form inputs SHALL accept user input
- **AND** form validation SHALL work as expected

#### Scenario: Button and Tooltip work
- **WHEN** interacting with buttons and tooltips
- **THEN** buttons SHALL be clickable
- **AND** tooltips SHALL display on hover

### Requirement: Build success
The system SHALL successfully build without element-ui.

#### Scenario: Development build
- **WHEN** running `yarn dev`
- **THEN** the development server SHALL start without errors
- **AND** the application SHALL be accessible

#### Scenario: Production build
- **WHEN** running `yarn build`
- **THEN** the build SHALL complete successfully
- **AND** no element-ui related warnings SHALL appear

### Requirement: No runtime errors
The system SHALL run without JavaScript errors related to element-ui.

#### Scenario: Application startup
- **WHEN** starting the application
- **THEN** no console errors related to element-ui SHALL appear
- **AND** all components SHALL render correctly

#### Scenario: Component interactions
- **WHEN** interacting with Element Plus components
- **THEN** no runtime errors SHALL occur
- **AND** component events SHALL fire correctly
