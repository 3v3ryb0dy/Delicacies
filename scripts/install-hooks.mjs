#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { chmodSync } from 'node:fs'
import path from 'node:path'

/**
 * Activates the committed hooks by pointing `core.hooksPath` at `.githooks/`.
 * Runs from `npm install` (the `prepare` script) and from `npm run hooks:install`.
 *
 * Safe to call anywhere: outside a git repository it does nothing, and it exits
 * quietly when the hooks are already installed. It also restores the executable
 * bit, which a checkout can lose.
 */
const root = process.cwd()

function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    throw new Error((error.stderr || error.message).trim())
  }
}

try {
  git(['rev-parse', '--git-dir'])
} catch {
  // Not a git repository (packaged install, exported tarball): nothing to do.
  process.exit(0)
}

let current = ''
try {
  current = git(['config', '--get', 'core.hooksPath'])
} catch {
  // Not configured yet.
}

try {
  for (const hook of ['_common.sh', 'pre-commit', 'pre-push']) {
    chmodSync(path.join(root, '.githooks', hook), 0o755)
  }

  if (current !== '.githooks') {
    git(['config', 'core.hooksPath', '.githooks'])
    console.log('Git hooks installed (core.hooksPath → .githooks): pre-commit, pre-push.')
  }
} catch (error) {
  // A read-only .git must not break `npm install`; say what happened instead.
  console.warn(`Could not install the git hooks automatically (${error.message}).`)
  console.warn("Run 'npm run hooks:install' later, or set 'git config core.hooksPath .githooks' yourself.")
}
