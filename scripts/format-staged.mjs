#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import prettier from 'prettier'
import { formattableStagedFiles } from './lib/staged-files.mjs'

/**
 * Formats the staged files and stages them again, so forgetting
 * `npm run format` cannot fail the push. Uses the Prettier API with the
 * project's `prettier.config.mjs`, which is what `npm run format` uses.
 */
const files = await formattableStagedFiles(prettier)

if (files.length === 0) {
  console.log('Nothing staged that Prettier handles.')
  process.exit(0)
}

const changed = []
const failed = []

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const options = (await prettier.resolveConfig(file)) ?? {}
  let formatted

  try {
    formatted = await prettier.format(source, { ...options, filepath: file })
  } catch (error) {
    // Prettier's own errors carry the parser message on `cause`; its stack
    // points into the bundled formatter, which is noise in a commit log.
    failed.push(`${file}: ${error.cause?.message ?? error.message}`)
    continue
  }

  if (formatted !== source) {
    await writeFile(file, formatted)
    changed.push(file)
  }
}

if (failed.length > 0) {
  console.error(`Could not format ${failed.length} staged file(s):`)
  for (const failure of failed) console.error(`  - ${failure}`)
  process.exit(1)
}

if (changed.length === 0) {
  console.log(`Checked ${files.length} staged file(s); already formatted.`)
  process.exit(0)
}

execFileSync('git', ['add', '--', ...changed])
console.log(`Formatted and staged ${changed.length} file(s): ${changed.join(', ')}`)
