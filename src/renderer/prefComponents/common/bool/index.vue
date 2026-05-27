<template>
  <section class="pref-switch-item" :class="{'ag-underdevelop': disable}">
    <div class="description">
      <span>{{description}}:</span>
      <i class="el-icon-info"
        v-if="more"
        @click="handleMoreClick"
      ></i>
      <el-tooltip
        v-else-if="detailedDescription"
        :content="detailedDescription"
        class="item"
        effect="dark"
        placement="top-start"
      >
        <i class="el-icon-info"></i>
      </el-tooltip>
      <span v-if="notes" class="notes">
        {{notes}}
      </span>
    </div>
    <el-switch
      v-model="status"
      @change="handleSwitchChange">
    </el-switch>
  </section>
</template>

<script>
import { shell } from 'electron'

export default {
  data () {
    return {
      status: this.bool
    }
  },
  props: {
    description: String,
    notes: String,
    bool: Boolean,
    onChange: Function,
    more: String,
    detailedDescription: String,
    disable: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    bool: function (value, oldValue) {
      if (value !== oldValue) {
        this.status = value
      }
    }
  },
  methods: {
    handleMoreClick () {
      if (typeof this.more === 'string') {
        shell.openExternal(this.more)
      }
    },
    handleSwitchChange (value) {
      this.onChange(value)
    }
  }
}
</script>

<style>
  .pref-switch-item {
    font-size: 14px;
    user-select: none;
    margin: 20px 0;
    color: var(--editorColor);
    display: flex;
    align-items: center;
    justify-content: space-between;

    & .description {
      & i {
        cursor: pointer;
        opacity: .7;
        color: var(--iconColor);
      }
      & i:hover {
        color: var(--themeColor);
      }
    }

    & .notes {
      font-style: italic;
      font-size: 12px;
    }
  }

  span.el-switch__label {
    color: var(--editorColor50);
  }
</style>
