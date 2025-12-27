import { useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

export const MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components, layout, ...rest }) => {
    if (!layout) {
      return <div {...rest} />
    }
    try {
      const Layout = require(`../layouts/${layout}`).default
      if (!Layout) {
        return <div {...rest} />
      }
      return <Layout {...rest} />
    } catch (error) {
      console.error(`Failed to load layout: ${layout}`, error)
      return <div {...rest} />
    }
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }) => {
  // getMDXComponent creates a component from the bundled MDX source
  // This is the required pattern for mdx-bundler - the component must be created from source

  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
