import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import Discord from './discord.svg'
import Steam from './steam.svg'

// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  discord: Discord,
  steam: Steam,
}

const SocialIcon = ({ kind, href, size = 8 }) => {
  // Ensure kind and href are strings
  const safeKind = typeof kind === 'string' ? kind : String(kind || '')
  const safeHref = typeof href === 'string' ? href : String(href || '')
  const safeSize =
    typeof size === 'number' ? size : typeof size === 'string' ? parseInt(size, 10) || 8 : 8

  if (
    !safeHref ||
    (safeKind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(safeHref))
  )
    return null

  const SocialSvg = components[safeKind]

  // Ensure SocialSvg is a valid React component
  if (!SocialSvg || typeof SocialSvg !== 'function') {
    return null
  }

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={safeHref}
    >
      <span className="sr-only">{safeKind}</span>
      <SocialSvg
        className={`fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-${safeSize} w-${safeSize}`}
      />
    </a>
  )
}

export default SocialIcon
