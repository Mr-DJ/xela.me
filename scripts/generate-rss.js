const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const globby = require('globby')

const root = process.cwd()

// Simple HTML escape function
const escape = (str) => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Load site metadata
const siteMetadata = require('../data/siteMetadata')

// Recursively get all files
function getAllFilesRecursively(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath))
    } else {
      results.push(filePath)
    }
  })
  return results
}

// Format slug
function formatSlug(slug) {
  return slug.replace(/\.(mdx|md)/, '')
}

// Get all blog posts
function getAllPosts() {
  const prefixPaths = path.join(root, 'data', 'blog')
  const files = getAllFilesRecursively(prefixPaths)
  const allPosts = []

  files.forEach((file) => {
    const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, '/')
    if (path.extname(fileName) !== '.md' && path.extname(fileName) !== '.mdx') {
      return
    }
    const source = fs.readFileSync(file, 'utf8')
    const { data: frontmatter } = matter(source)
    if (frontmatter.draft !== true) {
      allPosts.push({
        ...frontmatter,
        slug: formatSlug(fileName),
        date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
      })
    }
  })

  // Sort by date descending
  return allPosts.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}

const generateRssItem = (post) => `
  <item>
    <guid>${siteMetadata.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${siteMetadata.siteUrl}/blog/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${siteMetadata.email} (${siteMetadata.author})</author>
    ${post.tags && post.tags.map((t) => `<category>${escape(t)}</category>`).join('')}
  </item>
`

const generateRss = (posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(siteMetadata.title)}</title>
      <link>${siteMetadata.siteUrl}/blog</link>
      <description>${escape(siteMetadata.description)}</description>
      <language>${siteMetadata.language}</language>
      <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
      <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
      <lastBuildDate>${
        posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()
      }</lastBuildDate>
      <atom:link href="${siteMetadata.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map(generateRssItem).join('')}
    </channel>
  </rss>
`

try {
  console.log('Generating RSS feed...')

  const posts = getAllPosts()

  if (posts.length === 0) {
    console.warn('No blog posts found!')
    process.exit(0)
  }

  const rss = generateRss(posts)
  const feedPath = path.join(root, 'public', 'feed.xml')

  // Ensure public directory exists
  const publicDir = path.join(root, 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(feedPath, rss)
  console.log(`RSS feed generated successfully at ${feedPath}`)
  console.log(`   Feed contains ${posts.length} post(s)`)
} catch (error) {
  console.error('Error generating RSS feed:', error.message)
  console.error(error.stack)
  process.exit(1)
}
