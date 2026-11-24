import fs from 'node:fs'
import path from 'node:path'

export const toPosixPath = (filePath) => filePath.split(path.sep).join('/')

export const getAllFilesRecursively = (dir) => {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name)
    return entry.isDirectory() ? getAllFilesRecursively(filePath) : [toPosixPath(filePath)]
  })
}
