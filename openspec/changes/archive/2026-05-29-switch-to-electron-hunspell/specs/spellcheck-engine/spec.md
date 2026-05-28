## ADDED Requirements

### Requirement: Spell checking using electron-hunspell
The system SHALL use the `electron-hunspell` library for spell checking instead of Electron's built-in spell checker.

#### Scenario: Initialize spell checker
- **WHEN** the application starts with spell checking enabled
- **THEN** the system SHALL initialize `electron-hunspell` with the selected language dictionary
- **THEN** the system SHALL disable Electron's built-in spell checker

#### Scenario: Check word spelling
- **WHEN** the spell checker receives a word to check
- **THEN** the system SHALL use `electron-hunspell`'s `check()` method to determine if the word is spelled correctly
- **THEN** the system SHALL return a boolean indicating whether the word is correct

#### Scenario: Get spelling suggestions
- **WHEN** the spell checker receives a misspelled word
- **THEN** the system SHALL use `electron-hunspell`'s `suggest()` method to get spelling suggestions
- **THEN** the system SHALL return an array of suggested corrections

### Requirement: Spell checker language switching
The system SHALL support switching the spell checker language at runtime.

#### Scenario: Switch to available language
- **WHEN** the user selects a different language from the preferences
- **THEN** the system SHALL load the corresponding dictionary files
- **THEN** the system SHALL switch the spell checker to use the new language

#### Scenario: Switch to unavailable language
- **WHEN** the user selects a language that is not available
- **THEN** the system SHALL display an error message
- **THEN** the system SHALL fall back to the previous language

### Requirement: Spell checker enable/disable
The system SHALL support enabling and disabling the spell checker.

#### Scenario: Enable spell checker
- **WHEN** the user enables spell checking in preferences
- **THEN** the system SHALL initialize the spell checker with the selected language
- **THEN** the system SHALL start checking spelling in the editor

#### Scenario: Disable spell checker
- **WHEN** the user disables spell checking in preferences
- **THEN** the system SHALL stop checking spelling
- **THEN** the system SHALL remove all spelling error marks from the editor

### Requirement: Spell checker word extraction
The system SHALL extract words from text for spell checking.

#### Scenario: Extract word at cursor position
- **WHEN** the user right-clicks on a word in the editor
- **THEN** the system SHALL extract the word at the cursor position
- **THEN** the system SHALL check if the word is spelled correctly
- **THEN** the system SHALL display spelling suggestions if available

#### Scenario: Handle punctuation and special characters
- **WHEN** the system extracts a word from text
- **THEN** it SHALL ignore punctuation and special characters
- **THEN** it SHALL only check the actual word content

### Requirement: Spell checker dictionary management
The system SHALL support adding and removing words from the user dictionary.

#### Scenario: Add word to dictionary
- **WHEN** the user selects "Add to Dictionary" from the context menu
- **THEN** the system SHALL add the word to the user dictionary
- **THEN** the system SHALL no longer flag the word as misspelled

#### Scenario: Remove word from dictionary
- **WHEN** the user selects "Remove from Dictionary" from the context menu
- **THEN** the system SHALL remove the word from the user dictionary
- **THEN** the system SHALL flag the word as misspelled if it's not in the main dictionary

### Requirement: Spell checker integration with editor
The system SHALL integrate with the Muya editor for spell checking.

#### Scenario: Show spelling errors in editor
- **WHEN** the spell checker identifies a misspelled word
- **THEN** the system SHALL highlight the word with a red underline in the editor

#### Scenario: Context menu spelling suggestions
- **WHEN** the user right-clicks on a misspelled word
- **THEN** the system SHALL display spelling suggestions in the context menu
- **THEN** the system SHALL allow the user to replace the word with a suggestion

#### Scenario: Ignore spelling for code blocks
- **WHEN** the spell checker encounters text in a code block
- **THEN** the system SHALL skip spell checking for that text
- **THEN** the system SHALL not highlight code blocks as spelling errors
