import fs from 'node:fs'

import { format, resolveConfig } from 'prettier'

import siteMetadata from '../data/siteMetadata.js'
import { getAllFilesRecursively } from './utils.mjs'

const prettierConfig = await resolveConfig('./prettier.config.js')
const pages = [
  ...fs
    .readdirSync('pages')
    .filter((file) => file.endsWith('.js') && !file.startsWith('_'))
    .map((file) => `pages/${file}`),
  ...getAllFilesRecursively('data/blog').filter((file) => /\.(md|mdx)$/.test(file)),
  ...getAllFilesRecursively('public/tags').filter((file) => file.endsWith('.xml')),
]

const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
              .map((page) => {
                const routePath = page
                  .replace('pages/', '/')
                  .replace('data/blog', '/blog')
                  .replace('public/', '/')
                  .replace('.js', '')
                  .replace('.mdx', '')
                  .replace('.md', '')
                  .replace('/feed.xml', '')
                const route = routePath === '/index' ? '' : routePath
                if (page === `pages/404.js` || page === `pages/blog/[...slug].js`) {
                  return
                }
                return `
                        <url>
                            <loc>${siteMetadata.siteUrl}${route}</loc>
                        </url>
                    `
              })
              .join('')}
        </urlset>
    `

const formatted = await format(sitemap, {
  ...prettierConfig,
  parser: 'html',
})

fs.writeFileSync('public/sitemap.xml', formatted)
