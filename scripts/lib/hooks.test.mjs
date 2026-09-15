import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'
import { formattableStagedFiles } from './staged-files.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const hooksDir = path.join(root, '.githooks')
const installScript = path.join(root, 'scripts', 'install-hooks.mjs')

function isExecutable(file) {
  return (statSync(file).mode & 0o111) !== 0
}

function temporaryRepo() {
  const directory = mkdtempSync(path.join(tmpdir(), 'delicacies-hooks-'))
  cpSync(hooksDir, path.join(directory, '.githooks'), { recursive: true })
  execFileSync('git', ['init', '--quiet'], { cwd: directory })
  return directory
}

test('the committed hooks are present and executable', () => {
  for (const hook of ['pre-commit', 'pre-push']) {
    assert.ok(isExecutable(path.join(hooksDir, hook)), `${hook} must be executable`)
  }
})

test('pre-commit formats, regenerates the README and runs the fast checks', () => {
  const script = readFileSync(path.join(hooksDir, 'pre-commit'), 'utf8')
  for (const command of [
    'scripts/format-staged.mjs',
    'generate-readme.mjs --check',
    'npm test',
    'scripts/check-recipes.mjs'
  ]) {
    assert.ok(script.includes(command), `pre-commit should run ${command}`)
  }
  assert.ok(script.includes("BYPASS='git commit --no-verify'"))
})

test('pre-push runs the CI gate and skips deleting-only pushes', () => {
  const script = readFileSync(path.join(hooksDir, 'pre-push'), 'utf8')
  assert.ok(script.includes('npm run ci'))
  assert.ok(script.includes('0000000000000000000000000000000000000000'))
})

test('installing the hooks points core.hooksPath at .githooks and restores the mode', () => {
  const directory = temporaryRepo()
  try {
    const hook = path.join(directory, '.githooks', 'pre-commit')
    chmodSync(hook, 0o644)

    execFileSync(process.execPath, [installScript], { cwd: directory })
    assert.equal(
      execFileSync('git', ['config', '--get', 'core.hooksPath'], { cwd: directory, encoding: 'utf8' }).trim(),
      '.githooks'
    )
    assert.ok(isExecutable(hook), 'install-hooks should restore the executable bit')

    // Running it again keeps the existing configuration.
    const again = execFileSync(process.execPath, [installScript], { cwd: directory, encoding: 'utf8' })
    assert.equal(again, '')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('installing the hooks outside a repository is a no-op', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'delicacies-nogit-'))
  try {
    mkdirSync(path.join(directory, '.githooks'))
    const result = execFileSync(process.execPath, [installScript], { cwd: directory, encoding: 'utf8' })
    assert.equal(result, '')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('only staged files Prettier handles and does not ignore are formatted', async () => {
  const files = await formattableStagedFiles(prettier, [
    'src/tailwind.css',
    'recipes/karotten.md',
    'README.md', // generated, listed in .prettierignore
    'package-lock.json', // listed in .prettierignore
    'public/robots.txt', // no parser
    'recipes/images/karotten.webp' // no parser
  ])

  assert.deepEqual(files, ['src/tailwind.css', 'recipes/karotten.md'])
})

test('format-staged reformats and re-stages a badly formatted staged file', () => {
  const directory = temporaryRepo()
  try {
    const file = path.join(directory, 'sample.mjs')
    writeFileSync(file, 'const    list=[1,2,3]\n')
    execFileSync('git', ['add', 'sample.mjs'], { cwd: directory })

    const output = execFileSync(process.execPath, [path.join(root, 'scripts', 'format-staged.mjs')], {
      cwd: directory,
      encoding: 'utf8'
    })

    assert.match(output, /Formatted and staged 1 file\(s\): sample\.mjs/)
    assert.equal(readFileSync(file, 'utf8'), 'const list = [1, 2, 3];\n')
    // The formatted content is what the next commit would record: staged, with
    // nothing left over in the working tree.
    assert.equal(
      execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: directory, encoding: 'utf8' }).trim(),
      'sample.mjs'
    )
    assert.equal(execFileSync('git', ['diff', '--name-only'], { cwd: directory, encoding: 'utf8' }).trim(), '')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
