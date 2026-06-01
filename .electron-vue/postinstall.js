'use strict'
const fs = require('fs')
const path = require('path')

// WORKAROUND: Fix @hfelix/spellchecker compilation error on Windows with newer compilers.
//   The error is: cannot bind non-const lvalue reference to an rvalue.
//   NOTE: This fix must be applied BEFORE node-gyp rebuild in the yarn install process.
//   We fix it in postinstall and then re-run node-gyp manually.
const spellcheckerPath = path.resolve(__dirname, '../node_modules/@hfelix/spellchecker/src/spellchecker_win.cc')
if (fs.existsSync(spellcheckerPath)) {
  let content = fs.readFileSync(spellcheckerPath, { encoding: 'utf-8' })
  const fixedContent = content.replace(
    /std::wstring& wword = ToWString\(word\);/g,
    'const std::wstring wword = ToWString(word);'
  )
  if (content !== fixedContent) {
    console.log('[WORKAROUND] Fixing @hfelix/spellchecker compilation error...')
    fs.writeFileSync(spellcheckerPath, fixedContent, { encoding: 'utf-8' })
    
    // Rebuild the spellchecker native module after fixing
    const { execSync } = require('child_process')
    const spellcheckerDir = path.resolve(__dirname, '../node_modules/@hfelix/spellchecker')
    try {
      console.log('[WORKAROUND] Rebuilding @hfelix/spellchecker...')
      execSync('node-gyp rebuild', { cwd: spellcheckerDir, stdio: 'inherit' })
      console.log('[WORKAROUND] @hfelix/spellchecker rebuilt successfully')
    } catch (err) {
      console.error('[ERROR] Failed to rebuild @hfelix/spellchecker:', err.message)
    }
  }
}

// WORKAROUND: Fix slow startup time on Windows due to blocking powershell call(s) in windows-release.
//   Replace the problematic file with our "fixed" version.
const windowsReleasePath = path.resolve(__dirname, '../node_modules/windows-release')
if (fs.existsSync(windowsReleasePath)) {
  const windowsReleaseJson = path.join(windowsReleasePath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(windowsReleaseJson, { encoding : 'utf-8' }))

  const windowsReleaseMajor = Number(packageJson.version.match(/^(\d+)\./)[1])
  if (windowsReleaseMajor >= 5) {
    console.error('[ERROR] "windows-release" workaround failed because version is >=5.\n')
    process.exit(1)
  }

  const srcPath = path.resolve(__dirname, '../resources/build/windows-release.js')
  const destPath = path.join(windowsReleasePath, 'index.js')
  fs.copyFileSync(srcPath, destPath)
}

// WORKAROUND: electron-builder downloads the wrong prebuilt architecture on macOS and the reason is unknown.
//   For now, we rebuild all native libraries from source.
const keytarPath = path.resolve(__dirname, '../node_modules/keytar')
if (process.platform === 'darwin' && fs.existsSync(keytarPath)) {
  const keytarPackageJsonPath = path.join(keytarPath, 'package.json')
  let packageText = fs.readFileSync(keytarPackageJsonPath, { encoding : 'utf-8' })

  packageText = packageText.replace(/"install": "prebuild-install \|\| npm run build",/i, '"install": "npm run build",')
  fs.writeFileSync(keytarPackageJsonPath, packageText, { encoding: 'utf-8' })
}

// Rebuild native modules for the correct Electron version
const { execSync } = require('child_process')
try {
  console.log('[postinstall] Rebuilding native modules for Electron...')
  execSync('npx electron-rebuild -f -w cld,ced,keytar,native-keymap,fontmanager-redux,keyboard-layout', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  })
  console.log('[postinstall] Native modules rebuilt successfully')
} catch (err) {
  console.error('[ERROR] Failed to rebuild native modules:', err.message)
}
