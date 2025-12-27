import {
  FaEnvelope,
  FaGithub,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
  FaDiscord,
  FaSteam,
} from 'react-icons/fa'

// Modern icon library - react-icons provides consistent, reliable SVG icons
const components = {
  mail: FaEnvelope,
  github: FaGithub,
  facebook: FaFacebook,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  discord: FaDiscord,
  steam: FaSteam,
}

const SocialIcon = ({ kind, href, size = 8 }) => {
  if (!href || !kind) return null

  const IconComponent = components[kind]
  if (!IconComponent) return null

  // Convert size to number if it's a string
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size || 8
  // react-icons uses fontSize for sizing, convert Tailwind size to pixels
  // h-6 = 24px, h-8 = 32px, etc.
  const iconSize = sizeNum * 4

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label={kind}
    >
      <span className="sr-only">{kind}</span>
      <IconComponent
        size={iconSize}
        className="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
      />
    </a>
  )
}

export default SocialIcon
