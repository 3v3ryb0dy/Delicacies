#!/usr/bin/env node
import { rename, readdir, rm, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imagesDir = path.join(root, 'recipes', 'images')
const sourceExtensions = new Set(['.png', '.jpg', '.jpeg'])
const force = process.argv.includes('--force')
const dryRun = process.argv.includes('--dry-run')
const unknownArguments = process.argv.slice(2).filter((argument) => !['--force', '--dry-run'].includes(argument))

if (unknownArguments.length > 0) {
  console.error(`Unknown argument${unknownArguments.length === 1 ? '' : 's'}: ${unknownArguments.join(', ')}`)
  process.exit(1)
}

const entries = (await readdir(imagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && sourceExtensions.has(path.extname(entry.name).toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name, 'de'))

let converted = 0
let skipped = 0

for (const entry of entries) {
  const source = path.join(imagesDir, entry.name)
  const target = path.join(imagesDir, `${path.basename(entry.name, path.extname(entry.name))}.webp`)
  const temporaryTarget = `${target}.${process.pid}.tmp`
  const sourceStats = await stat(source)
  const targetStats = await stat(target).catch(() => undefined)

  if (!force && targetStats && targetStats.mtimeMs >= sourceStats.mtimeMs) {
    console.log(`Up to date: ${path.relative(root, target)}`)
    skipped += 1
    continue
  }

  if (dryRun) {
    console.log(`Would convert: ${path.relative(root, source)} -> ${path.relative(root, target)}`)
    converted += 1
    continue
  }

  const result = spawnSync(
    'cwebp',
    ['-quiet', '-q', '90', '-m', '6', '-metadata', 'all', source, '-o', temporaryTarget],
    { stdio: 'inherit' }
  )

  if (result.error?.code === 'ENOENT') {
    await rm(temporaryTarget, { force: true })
    console.error('`cwebp` was not found. Install the WebP tools first (for example, `brew install webp`).')
    process.exit(1)
  }

  if (result.error || result.status !== 0) {
    await rm(temporaryTarget, { force: true })
    console.error(`Failed to convert ${path.relative(root, source)}.`)
    process.exit(result.status || 1)
  }

  await rename(temporaryTarget, target)
  console.log(`Converted: ${path.relative(root, source)} -> ${path.relative(root, target)}`)
  converted += 1
}

console.log(`Done: ${converted} converted, ${skipped} skipped. Source files were retained.`)
