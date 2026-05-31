<template>
  <section class="image-folder">
    <h5>Global or relative image folder</h5>
    <text-box
      description="Global image folder"
      :input="imageFolderPath"
      :regexValidator="/^(?:$|([a-zA-Z]:)?[\/\\].*$)/"
      :defaultValue="folderPathPlaceholder"
      :onChange="(value) => modifyImageFolderPath(value)"
    ></text-box>
    <div>
      <el-button size="mini" @click="modifyImageFolderPath(undefined)"
        >Open...</el-button
      >
      <el-button size="mini" @click="openImageFolder">Show in Folder</el-button>
    </div>
    <compound>
      <template #head>
        <bool
          description="Prefer relative assets folder"
          more="https://github.com/5faith/marktext-enhance/blob/develop/docs/IMAGES.md"
          :bool="imagePreferRelativeDirectory"
          :onChange="
            (value) => onSelectChange('imagePreferRelativeDirectory', value)
          "
        ></bool>
      </template>
      <template #children>
        <text-box
          description="Relative image folder name"
          :input="imageRelativeDirectoryName"
          :regexValidator="/^(?:$|(?![a-zA-Z]:)[^\/\\].*$)/"
          :defaultValue="relativeDirectoryNamePlaceholder"
          :onChange="
            (value) => onSelectChange('imageRelativeDirectoryName', value)
          "
        ></text-box>
        <div class="footnote">
          Include <code>${filename}</code> in the text-box above to
          automatically insert the document file name.
        </div>
      </template>
    </compound>
  </section>
</template>

<script>
import { usePreferencesStore } from '@/stores'
import { shell } from 'electron'
import Bool from '@/prefComponents/common/bool'
import Compound from '@/prefComponents/common/compound'
import TextBox from '@/prefComponents/common/textBox'

export default {
  components: {
    Bool,
    Compound,
    TextBox
  },
  data () {
    return {}
  },
  computed: {
    imageFolderPath () {
      return usePreferencesStore().imageFolderPath
    },
    imagePreferRelativeDirectory () {
      return usePreferencesStore().imagePreferRelativeDirectory
    },
    imageRelativeDirectoryName () {
      return usePreferencesStore().imageRelativeDirectoryName
    },
    imageInsertAction: {
      get: function () {
        return usePreferencesStore().imageInsertAction
      }
    },
    folderPathPlaceholder: {
      get: function () {
        return usePreferencesStore().imageFolderPath || ''
      }
    },
    relativeDirectoryNamePlaceholder: {
      get: function () {
        return usePreferencesStore().imageRelativeDirectoryName || 'assets'
      }
    }
  },
  methods: {
    openImageFolder () {
      shell.openPath(this.imageFolderPath)
    },
    modifyImageFolderPath (value) {
      usePreferencesStore().setImageFolderPath(value)
    },
    onSelectChange (type, value) {
      usePreferencesStore().setSinglePreference({ type, value })
    }
  }
}
</script>

<style scoped>
.image-folder .footnote {
  font-size: 13px;
  & code {
    font-size: 13px;
  }
}
</style>
