<template>
  <div class="pref-spellchecker">
    <h4>Spelling</h4>
    <compound>
      <template #head>
        <bool
          description="Enable spell checker"
          :bool="spellcheckerEnabled"
          :onChange="handleSpellcheckerEnabled"
        ></bool>
      </template>
      <template #children>
        <bool
          description="Hide marks for spelling errors"
          :bool="spellcheckerNoUnderline"
          :disable="!spellcheckerEnabled"
          :onChange="value => onSelectChange('spellcheckerNoUnderline', value)"
        ></bool>
        <bool
          v-show="isOsx"
          description="Automatically detect document language (requires showing marks for spelling errors)"
          :bool="spellcheckerAutoDetectLanguage"
          :disable="!spellcheckerEnabled"
          :onChange="value => onSelectChange('spellcheckerAutoDetectLanguage', value)"
        ></bool>
      </template>
    </compound>

    <separator></separator>

    <cur-select
      description="Default language for spell checker"
      :value="spellcheckerLanguage"
      :options="availableDictionaries"
      :disable="!spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerLanguage', value)"
    ></cur-select>
    <div
      v-if="isOsx && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through "Language & Region" in your system preferences pane.
    </div>
    <div
      v-if="isWindows && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through "Language" in your "Time & language" settings.
    </div>
    <div
      v-if="isLinux && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through your system settings.
    </div>
  </div>
</template>
      <template #children>
        <bool
          description="Hide marks for spelling errors"
          :bool="spellcheckerNoUnderline"
          :disable="!spellcheckerEnabled"
          :onChange="value => onSelectChange('spellcheckerNoUnderline', value)"
        ></bool>
      </template>
    </compound>

    <separator></separator>

    <cur-select
      description="Default language for spell checker"
      :value="spellcheckerLanguage"
      :options="availableDictionaries"
      :disable="!spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerLanguage', value)"
    ></cur-select>
    <div
      v-if="isOsx && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through "Language & Region" in your system preferences pane.
    </div>
    <div
      v-if="isWindows && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through "Language" in your "Time & language" settings.
    </div>
    <div
      v-if="isLinux && spellcheckerEnabled"
      class="description"
    >
      Additional languages may be added through your system settings.
    </div>
  </div>
</template>

<script>
import { usePreferencesStore } from '@/stores'
import Compound from '../common/compound'
import CurSelect from '../common/select'
import Bool from '../common/bool'
import Separator from '../common/separator'
import { isOsx, isLinux, isWindows } from '@/util'
import { SpellChecker } from '@/spellchecker'
import { getLanguageName } from '@/spellchecker/languageMap'

export default {
  components: {
    Bool,
    Compound,
    CurSelect,
    Separator
  },
  data () {
    this.isOsx = isOsx
    this.isLinux = isLinux
    this.isWindows = isWindows
    return {
      availableDictionaries: [],
      spellchecker: null
    }
  },
  computed: {
    spellcheckerEnabled () { return usePreferencesStore().spellcheckerEnabled },
    spellcheckerNoUnderline () { return usePreferencesStore().spellcheckerNoUnderline },
    spellcheckerAutoDetectLanguage () { return usePreferencesStore().spellcheckerAutoDetectLanguage },
    spellcheckerLanguage () { return usePreferencesStore().spellcheckerLanguage }
  },
  created () {
    this.$nextTick(() => {
      this.refreshDictionaryList()
    })
  },
  methods: {
    getAvailableDictionaries () {
      // Get available dictionaries from Electron's built-in spell checker
      if (!this.spellchecker) {
        // Create a new spell checker instance to get available dictionaries
        this.spellchecker = new SpellChecker(false)
      }

      const dictionaries = this.spellchecker.getAvailableDictionaries()
      return dictionaries.map(item => {
        return {
          value: item,
          label: getLanguageName(item)
        }
      })
    },
    refreshDictionaryList () {
      this.availableDictionaries = this.getAvailableDictionaries()
    },
    ensureDictLanguage () {
      const { spellcheckerLanguage } = this
      if (!this.spellchecker) {
        this.spellchecker = new SpellChecker(false)
      }

      const dicts = this.spellchecker.getAvailableDictionaries()
      const index = dicts.findIndex(d => d === spellcheckerLanguage)
      if (index === -1 && dicts.length >= 1) {
        // Language is not supported, prefer OS language.
        let lang = process.env.LANG
        lang = lang ? lang.split('.')[0] : null
        if (lang) {
          lang = lang.replace(/_/g, '-')
          if (dicts.findIndex(d => d === lang) === -1) {
            lang = null
          }
        }
        this.onSelectChange('spellcheckerLanguage', lang || dicts[0])
      }
    },

    handleSpellcheckerEnabled (value) {
      if (value) {
        this.ensureDictLanguage()
      }
      this.onSelectChange('spellcheckerEnabled', value)
    },
    onSelectChange (type, value) {
      usePreferencesStore().setSinglePreference({ type, value })
    }
  }
}
</script>

<style scoped>
  .pref-spellchecker {
    & div.description {
      margin-top: 10px;
      margin-bottom: 2px;
      color: var(--iconColor);
      font-size: 14px;
    }
    & h6.title {
      font-weight: 400;
      font-size: 1.1em;
    }
  }
  .el-table, .el-table__expanded-cell {
    background: var(--editorBgColor);
  }
  .el-table button {
    padding: 1px 2px;
    margin: 5px 10px;
    color: var(--themeColor);
    background: none;
    border: none;
  }
  .el-table button:hover,
  .el-table button:active {
    opacity: 0.9;
    background: none;
    border: none;
  }
  .dictionary-group {
    display: flex;
    & button.el-button {
      height: 30px;
      width: 30px;
      padding: 0;
      margin-left: 6px;
    }

  }
</style>
<style>
  .pref-spellchecker .el-table table {
    margin: 0;
  }
  .pref-spellchecker .el-table th,
  .pref-spellchecker .el-table tr {
    background: var(--editorBgColor);
  }
  .pref-spellchecker .el-table td,
  .pref-spellchecker .el-table th.is-leaf {
    border: 1px solid var(--tableBorderColor);
  }
  .pref-spellchecker .el-table--border::after,
  .pref-spellchecker .el-table--group::after,
  .pref-spellchecker .el-table::before,
  .pref-spellchecker .el-table__fixed-right::before,
  .pref-spellchecker .el-table__fixed::before {
    background: var(--tableBorderColor);
  }
  .pref-spellchecker .el-table__body tr.hover-row.current-row>td,
  .pref-spellchecker .el-table__body tr.hover-row.el-table__row--striped.current-row>td,
  .pref-spellchecker .el-table__body tr.hover-row.el-table__row--striped>td,
  .pref-spellchecker .el-table__body tr.hover-row>td {
    background: var(--selectionColor);
  }

 .pref-spellchecker li.el-select-dropdown__item {
    color: var(--editorColor);
    height: 30px;
  }
  .pref-spellchecker li.el-select-dropdown__item.hover, li.el-select-dropdown__item:hover {
    background: var(--floatHoverColor);
  }
  .pref-spellchecker div.el-select-dropdown {
    background: var(--floatBgColor);
    border-color: var(--floatBorderColor);
    & .popper__arrow {
      display: none;
    }
  }
  .pref-spellchecker input.el-input__inner {
    height: 30px;
    background: transparent;
    color: var(--editorColor);
    border-color: var(--editorColor10);
  }
  .pref-spellchecker .el-input__icon,
  .pref-spellchecker .el-input__inner {
    line-height: 30px;
  }
</style>
