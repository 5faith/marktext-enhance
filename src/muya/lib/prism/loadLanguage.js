import components from 'prismjs/components.js'
import getLoader from 'prismjs/dependencies'
import { getDefer } from '../utils'

// Pre-define all prism component imports for Vite static analysis
const prismImports = {
  abap: () => import('prismjs/components/prism-abap'),
  abnf: () => import('prismjs/components/prism-abnf'),
  actionscript: () => import('prismjs/components/prism-actionscript'),
  ada: () => import('prismjs/components/prism-ada'),
  agda: () => import('prismjs/components/prism-agda'),
  al: () => import('prismjs/components/prism-al'),
  antlr4: () => import('prismjs/components/prism-antlr4'),
  apacheconf: () => import('prismjs/components/prism-apacheconf'),
  apex: () => import('prismjs/components/prism-apex'),
  apl: () => import('prismjs/components/prism-apl'),
  applescript: () => import('prismjs/components/prism-applescript'),
  aql: () => import('prismjs/components/prism-aql'),
  arduino: () => import('prismjs/components/prism-arduino'),
  arff: () => import('prismjs/components/prism-arff'),
  armasm: () => import('prismjs/components/prism-armasm'),
  arturo: () => import('prismjs/components/prism-arturo'),
  asciidoc: () => import('prismjs/components/prism-asciidoc'),
  asm6502: () => import('prismjs/components/prism-asm6502'),
  asmatmel: () => import('prismjs/components/prism-asmatmel'),
  aspnet: () => import('prismjs/components/prism-aspnet'),
  autohotkey: () => import('prismjs/components/prism-autohotkey'),
  autoit: () => import('prismjs/components/prism-autoit'),
  avisynth: () => import('prismjs/components/prism-avisynth'),
  'avro-idl': () => import('prismjs/components/prism-avro-idl'),
  awk: () => import('prismjs/components/prism-awk'),
  bash: () => import('prismjs/components/prism-bash'),
  basic: () => import('prismjs/components/prism-basic'),
  batch: () => import('prismjs/components/prism-batch'),
  bbcode: () => import('prismjs/components/prism-bbcode'),
  bbj: () => import('prismjs/components/prism-bbj'),
  bicep: () => import('prismjs/components/prism-bicep'),
  birb: () => import('prismjs/components/prism-birb'),
  bison: () => import('prismjs/components/prism-bison'),
  bnf: () => import('prismjs/components/prism-bnf'),
  bqn: () => import('prismjs/components/prism-bqn'),
  brainfuck: () => import('prismjs/components/prism-brainfuck'),
  brightscript: () => import('prismjs/components/prism-brightscript'),
  bro: () => import('prismjs/components/prism-bro'),
  bsl: () => import('prismjs/components/prism-bsl'),
  c: () => import('prismjs/components/prism-c'),
  cfscript: () => import('prismjs/components/prism-cfscript'),
  chaiscript: () => import('prismjs/components/prism-chaiscript'),
  cil: () => import('prismjs/components/prism-cil'),
  cilkc: () => import('prismjs/components/prism-cilkc'),
  cilkcpp: () => import('prismjs/components/prism-cilkcpp'),
  clike: () => import('prismjs/components/prism-clike'),
  clojure: () => import('prismjs/components/prism-clojure'),
  cmake: () => import('prismjs/components/prism-cmake'),
  cobol: () => import('prismjs/components/prism-cobol'),
  coffeescript: () => import('prismjs/components/prism-coffeescript'),
  concurnas: () => import('prismjs/components/prism-concurnas'),
  cooklang: () => import('prismjs/components/prism-cooklang'),
  coq: () => import('prismjs/components/prism-coq'),
  core: () => import('prismjs/components/prism-core'),
  cpp: () => import('prismjs/components/prism-cpp'),
  crystal: () => import('prismjs/components/prism-crystal'),
  csharp: () => import('prismjs/components/prism-csharp'),
  cshtml: () => import('prismjs/components/prism-cshtml'),
  csp: () => import('prismjs/components/prism-csp'),
  css: () => import('prismjs/components/prism-css'),
  'css-extras': () => import('prismjs/components/prism-css-extras'),
  csv: () => import('prismjs/components/prism-csv'),
  cue: () => import('prismjs/components/prism-cue'),
  cypher: () => import('prismjs/components/prism-cypher'),
  d: () => import('prismjs/components/prism-d'),
  dart: () => import('prismjs/components/prism-dart'),
  dataweave: () => import('prismjs/components/prism-dataweave'),
  dax: () => import('prismjs/components/prism-dax'),
  dhall: () => import('prismjs/components/prism-dhall'),
  diff: () => import('prismjs/components/prism-diff'),
  django: () => import('prismjs/components/prism-django'),
  'dns-zone-file': () => import('prismjs/components/prism-dns-zone-file'),
  docker: () => import('prismjs/components/prism-docker'),
  dot: () => import('prismjs/components/prism-dot'),
  ebnf: () => import('prismjs/components/prism-ebnf'),
  editorconfig: () => import('prismjs/components/prism-editorconfig'),
  eiffel: () => import('prismjs/components/prism-eiffel'),
  ejs: () => import('prismjs/components/prism-ejs'),
  elixir: () => import('prismjs/components/prism-elixir'),
  elm: () => import('prismjs/components/prism-elm'),
  erb: () => import('prismjs/components/prism-erb'),
  erlang: () => import('prismjs/components/prism-erlang'),
  etlua: () => import('prismjs/components/prism-etlua'),
  'excel-formula': () => import('prismjs/components/prism-excel-formula'),
  factor: () => import('prismjs/components/prism-factor'),
  false: () => import('prismjs/components/prism-false'),
  'firestore-security-rules': () => import('prismjs/components/prism-firestore-security-rules'),
  flow: () => import('prismjs/components/prism-flow'),
  fortran: () => import('prismjs/components/prism-fortran'),
  fsharp: () => import('prismjs/components/prism-fsharp'),
  ftl: () => import('prismjs/components/prism-ftl'),
  gap: () => import('prismjs/components/prism-gap'),
  gcode: () => import('prismjs/components/prism-gcode'),
  gdscript: () => import('prismjs/components/prism-gdscript'),
  gedcom: () => import('prismjs/components/prism-gedcom'),
  gettext: () => import('prismjs/components/prism-gettext'),
  gherkin: () => import('prismjs/components/prism-gherkin'),
  git: () => import('prismjs/components/prism-git'),
  glsl: () => import('prismjs/components/prism-glsl'),
  gml: () => import('prismjs/components/prism-gml'),
  gn: () => import('prismjs/components/prism-gn'),
  go: () => import('prismjs/components/prism-go'),
  'go-module': () => import('prismjs/components/prism-go-module'),
  gradle: () => import('prismjs/components/prism-gradle'),
  graphql: () => import('prismjs/components/prism-graphql'),
  groovy: () => import('prismjs/components/prism-groovy'),
  haml: () => import('prismjs/components/prism-haml'),
  handlebars: () => import('prismjs/components/prism-handlebars'),
  haskell: () => import('prismjs/components/prism-haskell'),
  haxe: () => import('prismjs/components/prism-haxe'),
  hcl: () => import('prismjs/components/prism-hcl'),
  hlsl: () => import('prismjs/components/prism-hlsl'),
  hoon: () => import('prismjs/components/prism-hoon'),
  hpkp: () => import('prismjs/components/prism-hpkp'),
  hsts: () => import('prismjs/components/prism-hsts'),
  http: () => import('prismjs/components/prism-http'),
  ichigojam: () => import('prismjs/components/prism-ichigojam'),
  icon: () => import('prismjs/components/prism-icon'),
  'icu-message-format': () => import('prismjs/components/prism-icu-message-format'),
  idris: () => import('prismjs/components/prism-idris'),
  iecst: () => import('prismjs/components/prism-iecst'),
  ignore: () => import('prismjs/components/prism-ignore'),
  inform7: () => import('prismjs/components/prism-inform7'),
  ini: () => import('prismjs/components/prism-ini'),
  io: () => import('prismjs/components/prism-io'),
  j: () => import('prismjs/components/prism-j'),
  java: () => import('prismjs/components/prism-java'),
  javadoc: () => import('prismjs/components/prism-javadoc'),
  javadoclike: () => import('prismjs/components/prism-javadoclike'),
  javascript: () => import('prismjs/components/prism-javascript'),
  javastacktrace: () => import('prismjs/components/prism-javastacktrace'),
  jexl: () => import('prismjs/components/prism-jexl'),
  jolie: () => import('prismjs/components/prism-jolie'),
  jq: () => import('prismjs/components/prism-jq'),
  jsdoc: () => import('prismjs/components/prism-jsdoc'),
  'js-extras': () => import('prismjs/components/prism-js-extras'),
  json: () => import('prismjs/components/prism-json'),
  json5: () => import('prismjs/components/prism-json5'),
  jsonp: () => import('prismjs/components/prism-jsonp'),
  jsstacktrace: () => import('prismjs/components/prism-jsstacktrace'),
  'js-templates': () => import('prismjs/components/prism-js-templates'),
  jsx: () => import('prismjs/components/prism-jsx'),
  julia: () => import('prismjs/components/prism-julia'),
  keepalived: () => import('prismjs/components/prism-keepalived'),
  keyman: () => import('prismjs/components/prism-keyman'),
  kotlin: () => import('prismjs/components/prism-kotlin'),
  kumir: () => import('prismjs/components/prism-kumir'),
  kusto: () => import('prismjs/components/prism-kusto'),
  latex: () => import('prismjs/components/prism-latex'),
  latte: () => import('prismjs/components/prism-latte'),
  less: () => import('prismjs/components/prism-less'),
  lilypond: () => import('prismjs/components/prism-lilypond'),
  'linker-script': () => import('prismjs/components/prism-linker-script'),
  liquid: () => import('prismjs/components/prism-liquid'),
  lisp: () => import('prismjs/components/prism-lisp'),
  livescript: () => import('prismjs/components/prism-livescript'),
  llvm: () => import('prismjs/components/prism-llvm'),
  log: () => import('prismjs/components/prism-log'),
  lolcode: () => import('prismjs/components/prism-lolcode'),
  lua: () => import('prismjs/components/prism-lua'),
  magma: () => import('prismjs/components/prism-magma'),
  makefile: () => import('prismjs/components/prism-makefile'),
  markdown: () => import('prismjs/components/prism-markdown'),
  markup: () => import('prismjs/components/prism-markup'),
  'markup-templating': () => import('prismjs/components/prism-markup-templating'),
  mata: () => import('prismjs/components/prism-mata'),
  matlab: () => import('prismjs/components/prism-matlab'),
  maxscript: () => import('prismjs/components/prism-maxscript'),
  mel: () => import('prismjs/components/prism-mel'),
  mermaid: () => import('prismjs/components/prism-mermaid'),
  metafont: () => import('prismjs/components/prism-metafont'),
  mizar: () => import('prismjs/components/prism-mizar'),
  mongodb: () => import('prismjs/components/prism-mongodb'),
  monkey: () => import('prismjs/components/prism-monkey'),
  moonscript: () => import('prismjs/components/prism-moonscript'),
  n1ql: () => import('prismjs/components/prism-n1ql'),
  n4js: () => import('prismjs/components/prism-n4js'),
  'nand2tetris-hdl': () => import('prismjs/components/prism-nand2tetris-hdl'),
  naniscript: () => import('prismjs/components/prism-naniscript'),
  nasm: () => import('prismjs/components/prism-nasm'),
  neon: () => import('prismjs/components/prism-neon'),
  nevod: () => import('prismjs/components/prism-nevod'),
  nginx: () => import('prismjs/components/prism-nginx'),
  nim: () => import('prismjs/components/prism-nim'),
  nix: () => import('prismjs/components/prism-nix'),
  nsis: () => import('prismjs/components/prism-nsis'),
  objectivec: () => import('prismjs/components/prism-objectivec'),
  ocaml: () => import('prismjs/components/prism-ocaml'),
  odin: () => import('prismjs/components/prism-odin'),
  opencl: () => import('prismjs/components/prism-opencl'),
  openqasm: () => import('prismjs/components/prism-openqasm'),
  oz: () => import('prismjs/components/prism-oz'),
  parigp: () => import('prismjs/components/prism-parigp'),
  parser: () => import('prismjs/components/prism-parser'),
  pascal: () => import('prismjs/components/prism-pascal'),
  pascaligo: () => import('prismjs/components/prism-pascaligo'),
  pcaxis: () => import('prismjs/components/prism-pcaxis'),
  peoplecode: () => import('prismjs/components/prism-peoplecode'),
  perl: () => import('prismjs/components/prism-perl'),
  php: () => import('prismjs/components/prism-php'),
  phpdoc: () => import('prismjs/components/prism-phpdoc'),
  'php-extras': () => import('prismjs/components/prism-php-extras'),
  'plant-uml': () => import('prismjs/components/prism-plant-uml'),
  plsql: () => import('prismjs/components/prism-plsql'),
  powerquery: () => import('prismjs/components/prism-powerquery'),
  powershell: () => import('prismjs/components/prism-powershell'),
  processing: () => import('prismjs/components/prism-processing'),
  prolog: () => import('prismjs/components/prism-prolog'),
  promql: () => import('prismjs/components/prism-promql'),
  properties: () => import('prismjs/components/prism-properties'),
  protobuf: () => import('prismjs/components/prism-protobuf'),
  psl: () => import('prismjs/components/prism-psl'),
  pug: () => import('prismjs/components/prism-pug'),
  puppet: () => import('prismjs/components/prism-puppet'),
  pure: () => import('prismjs/components/prism-pure'),
  purebasic: () => import('prismjs/components/prism-purebasic'),
  purescript: () => import('prismjs/components/prism-purescript'),
  python: () => import('prismjs/components/prism-python'),
  q: () => import('prismjs/components/prism-q'),
  qml: () => import('prismjs/components/prism-qml'),
  qore: () => import('prismjs/components/prism-qore'),
  qsharp: () => import('prismjs/components/prism-qsharp'),
  r: () => import('prismjs/components/prism-r'),
  racket: () => import('prismjs/components/prism-racket'),
  reason: () => import('prismjs/components/prism-reason'),
  regex: () => import('prismjs/components/prism-regex'),
  rego: () => import('prismjs/components/prism-rego'),
  renpy: () => import('prismjs/components/prism-renpy'),
  rescript: () => import('prismjs/components/prism-rescript'),
  rest: () => import('prismjs/components/prism-rest'),
  rip: () => import('prismjs/components/prism-rip'),
  roboconf: () => import('prismjs/components/prism-roboconf'),
  robotframework: () => import('prismjs/components/prism-robotframework'),
  ruby: () => import('prismjs/components/prism-ruby'),
  rust: () => import('prismjs/components/prism-rust'),
  sas: () => import('prismjs/components/prism-sas'),
  sass: () => import('prismjs/components/prism-sass'),
  scala: () => import('prismjs/components/prism-scala'),
  scheme: () => import('prismjs/components/prism-scheme'),
  scss: () => import('prismjs/components/prism-scss'),
  'shell-session': () => import('prismjs/components/prism-shell-session'),
  smali: () => import('prismjs/components/prism-smali'),
  smalltalk: () => import('prismjs/components/prism-smalltalk'),
  smarty: () => import('prismjs/components/prism-smarty'),
  sml: () => import('prismjs/components/prism-sml'),
  solidity: () => import('prismjs/components/prism-solidity'),
  'solution-file': () => import('prismjs/components/prism-solution-file'),
  soy: () => import('prismjs/components/prism-soy'),
  sparql: () => import('prismjs/components/prism-sparql'),
  'splunk-spl': () => import('prismjs/components/prism-splunk-spl'),
  sqf: () => import('prismjs/components/prism-sqf'),
  sql: () => import('prismjs/components/prism-sql'),
  squirrel: () => import('prismjs/components/prism-squirrel'),
  stan: () => import('prismjs/components/prism-stan'),
  stata: () => import('prismjs/components/prism-stata'),
  stylus: () => import('prismjs/components/prism-stylus'),
  supercollider: () => import('prismjs/components/prism-supercollider'),
  swift: () => import('prismjs/components/prism-swift'),
  systemd: () => import('prismjs/components/prism-systemd'),
  't4-cs': () => import('prismjs/components/prism-t4-cs'),
  't4-templating': () => import('prismjs/components/prism-t4-templating'),
  't4-vb': () => import('prismjs/components/prism-t4-vb'),
  tap: () => import('prismjs/components/prism-tap'),
  tcl: () => import('prismjs/components/prism-tcl'),
  textile: () => import('prismjs/components/prism-textile'),
  toml: () => import('prismjs/components/prism-toml'),
  tremor: () => import('prismjs/components/prism-tremor'),
  tsx: () => import('prismjs/components/prism-tsx'),
  tt2: () => import('prismjs/components/prism-tt2'),
  turtle: () => import('prismjs/components/prism-turtle'),
  twig: () => import('prismjs/components/prism-twig'),
  typescript: () => import('prismjs/components/prism-typescript'),
  typoscript: () => import('prismjs/components/prism-typoscript'),
  unrealscript: () => import('prismjs/components/prism-unrealscript'),
  uorazor: () => import('prismjs/components/prism-uorazor'),
  uri: () => import('prismjs/components/prism-uri'),
  v: () => import('prismjs/components/prism-v'),
  vala: () => import('prismjs/components/prism-vala'),
  vbnet: () => import('prismjs/components/prism-vbnet'),
  velocity: () => import('prismjs/components/prism-velocity'),
  verilog: () => import('prismjs/components/prism-verilog'),
  vhdl: () => import('prismjs/components/prism-vhdl'),
  vim: () => import('prismjs/components/prism-vim'),
  'visual-basic': () => import('prismjs/components/prism-visual-basic'),
  warpscript: () => import('prismjs/components/prism-warpscript'),
  wasm: () => import('prismjs/components/prism-wasm'),
  'web-idl': () => import('prismjs/components/prism-web-idl'),
  wgsl: () => import('prismjs/components/prism-wgsl'),
  wiki: () => import('prismjs/components/prism-wiki'),
  wolfram: () => import('prismjs/components/prism-wolfram'),
  wren: () => import('prismjs/components/prism-wren'),
  xeora: () => import('prismjs/components/prism-xeora'),
  'xml-doc': () => import('prismjs/components/prism-xml-doc'),
  xojo: () => import('prismjs/components/prism-xojo'),
  xquery: () => import('prismjs/components/prism-xquery'),
  yaml: () => import('prismjs/components/prism-yaml'),
  yang: () => import('prismjs/components/prism-yang'),
  zig: () => import('prismjs/components/prism-zig')
}

/**
 * The set of all languages which have been loaded using the below function.
 *
 * @type {Set<string>}
 */
export const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript'])

const { languages } = components

// Look for the origin languge by alias
export const transformAliasToOrigin = langs => {
  const result = []
  for (const lang of langs) {
    if (languages[lang]) {
      result.push(lang)
    } else {
      const language = Object.keys(languages).find(name => {
        const l = languages[name]
        if (l.alias) {
          return l.alias === lang || Array.isArray(l.alias) && l.alias.includes(lang)
        }
        return false
      })

      if (language) {
        result.push(language)
      } else {
        // The lang is not exist, the will handle in `initLoadLanguage`
        result.push(lang)
      }
    }
  }

  return result
}

async function loadPrismComponent (lang) {
  const loader = prismImports[lang]
  if (loader) {
    await loader()
    return true
  }
  return false
}

function initLoadLanguage (Prism) {
  return async function loadLanguages (langs) {
    // If no argument is passed, load all components
    if (!langs) {
      langs = Object.keys(languages).filter(lang => lang !== 'meta')
    }

    if (langs && !langs.length) {
      return Promise.reject(new Error('The first parameter should be a list of load languages or single language.'))
    }

    if (!Array.isArray(langs)) {
      langs = [langs]
    }

    const promises = []
    // The user might have loaded languages via some other way or used `prism.js` which already includes some
    // We don't need to validate the ids because `getLoader` will ignore invalid ones
    const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)]

    getLoader(components, langs, loaded).load(async lang => {
      const defer = getDefer()
      promises.push(defer.promise)
      if (!(lang in components.languages)) {
        defer.resolve({
          lang,
          status: 'noexist'
        })
      } else if (loadedLanguages.has(lang)) {
        defer.resolve({
          lang,
          status: 'cached'
        })
      } else {
        delete Prism.languages[lang]
        const success = await loadPrismComponent(lang)
        if (!success) {
          console.warn(`Prism component for '${lang}' not found in pre-defined imports`)
        }
        defer.resolve({
          lang,
          status: 'loaded'
        })
        loadedLanguages.add(lang)
      }
    })

    return Promise.all(promises)
  }
}

export default initLoadLanguage
