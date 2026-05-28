## ADDED Requirements

### Requirement: Load .dic and .aff dictionary files
The system SHALL support loading Hunspell dictionary files in `.dic` and `.aff` formats using the `electron-hunspell` library.

#### Scenario: Load dictionary from resources
- **WHEN** the application starts with spell checking enabled
- **THEN** the system SHALL load the default `en_US.dic` and `en_US.aff` files from the resources directory

#### Scenario: Load user-imported dictionary
- **WHEN** a user imports a `.dic` file through the preferences UI
- **THEN** the system SHALL also require the corresponding `.aff` file in the same directory
- **THEN** the system SHALL load both files and make the dictionary available for spell checking

### Requirement: Validate dictionary file pairs
The system SHALL validate that both `.dic` and `.aff` files are present when loading a dictionary.

#### Scenario: Missing .aff file
- **WHEN** a user tries to import a `.dic` file without the corresponding `.aff` file
- **THEN** the system SHALL display an error message indicating that both files are required

#### Scenario: Missing .dic file
- **WHEN** a user tries to import an `.aff` file without the corresponding `.dic` file
- **THEN** the system SHALL display an error message indicating that both files are required

### Requirement: Dictionary file format validation
The system SHALL validate that imported files are valid Hunspell dictionary files.

#### Scenario: Invalid file content
- **WHEN** a user imports files that are not valid Hunspell format
- **THEN** the system SHALL display an error message indicating the files are invalid

#### Scenario: File size validation
- **WHEN** a user imports a dictionary file pair
- **THEN** the system SHALL validate that the `.dic` file is larger than 8KB
- **THEN** the system SHALL validate that the `.aff` file is larger than 100 bytes

### Requirement: Dictionary storage location
The system SHALL store user-imported dictionaries in the userData/dictionaries directory.

#### Scenario: Store imported dictionary
- **WHEN** a user successfully imports a dictionary file pair
- **THEN** the system SHALL copy both `.dic` and `.aff` files to the userData/dictionaries directory
- **THEN** the files SHALL be named with the language code (e.g., `en_US.dic`, `en_US.aff`)

### Requirement: Available dictionaries listing
The system SHALL list all available dictionaries including both built-in and user-imported dictionaries.

#### Scenario: List built-in dictionaries
- **WHEN** the system queries available dictionaries
- **THEN** it SHALL return the default `en_US` dictionary from the resources directory

#### Scenario: List user-imported dictionaries
- **WHEN** the system queries available dictionaries
- **THEN** it SHALL scan the userData/dictionaries directory for `.dic` files
- **THEN** it SHALL return the language code extracted from each filename

#### Scenario: Deduplicate dictionaries
- **WHEN** a user-imported dictionary has the same language code as a built-in dictionary
- **THEN** the system SHALL only list it once
