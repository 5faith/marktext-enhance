import { createApp } from 'vue'
import VueElectron from 'vue-electron'
import sourceMapSupport from 'source-map-support'
import bootstrapRenderer from './bootstrap'
import { createRouter, createWebHashHistory } from 'vue-router'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
import axios from './axios'
import store from './store'
import './assets/symbolIcon'

// Load eve before snap.svg (which depends on eve being a global variable)
import eve from 'eve-raphael'
import {
  Dialog,
  Form,
  FormItem,
  InputNumber,
  Button,
  Tooltip,
  Upload,
  Slider,
  Checkbox,
  ColorPicker,
  Col,
  Row,
  Tree,
  Autocomplete,
  Switch,
  Select,
  Option,
  Radio,
  RadioGroup,
  Table,
  TableColumn,
  Tabs,
  TabPane,
  Input
} from 'element-ui'
import services from './services'
import routes from './router'
import { addElementStyle } from '@/util/theme'

import './assets/styles/index.css'
import './assets/styles/printService.css'
if (typeof window !== 'undefined') {
  window.eve = eve
}

// -----------------------------------------------

// Decode source map in production - must be registered first
sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: false,
  hookRequire: false
})

global.marktext = {}
bootstrapRenderer()

addElementStyle()

// -----------------------------------------------
// Be careful when changing code before this line!

// Configure Vue
locale.use(lang)

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes(global.marktext.env.type)
})

const app = createApp({
  store,
  router,
  template: '<router-view class="view"></router-view>'
})

app.use(router)
app.use(store)

app.use(Dialog)
app.use(Form)
app.use(FormItem)
app.use(InputNumber)
app.use(Button)
app.use(Tooltip)
app.use(Upload)
app.use(Slider)
app.use(Checkbox)
app.use(ColorPicker)
app.use(Col)
app.use(Row)
app.use(Tree)
app.use(Autocomplete)
app.use(Switch)
app.use(Select)
app.use(Option)
app.use(Radio)
app.use(RadioGroup)
app.use(Table)
app.use(TableColumn)
app.use(Tabs)
app.use(TabPane)
app.use(Input)

app.use(VueElectron)
app.config.globalProperties.$http = axios

services.forEach(s => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})

app.mount('#app')
