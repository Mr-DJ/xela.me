import { useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'

import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import AuthorLayout from '@/layouts/AuthorLayout'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

const layouts = {
  PostLayout,
  PostSimple,
  AuthorLayout,
}

export const MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components, layout, children, ...rest }) => {
    const Layout = layouts[layout]
    if (!Layout) {
      console.error(`Unknown MDX layout: ${layout}`)
      return <div>{children}</div>
    }
    return <Layout {...rest}>{children}</Layout>
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }) => {
  // getMDXComponent creates a component from the bundled MDX source
  // This is the required pattern for mdx-bundler - the component must be created from source

  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
