import { execFileSync } from 'node:child_process'

/** Files staged for the next commit (added, copied, modified, renamed). */
export function stagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z', '--'], {
    encoding: 'utf8'
  })
  return output.split('\0').filter(Boolean)
}

/**
 * The staged files Prettier can format and is configured to format.
 * `getFileInfo` applies the same `.prettierignore` and parser detection as the
 * CLI, which keeps generated files such as README.md out of the list.
 */
export async function formattableStagedFiles(prettier, files = stagedFiles()) {
  const formattable = []

  for (const file of files) {
    const info = await prettier.getFileInfo(file, { ignorePath: '.prettierignore' })
    if (!info.ignored && info.inferredParser) formattable.push(file)
  }

  return formattable
}
