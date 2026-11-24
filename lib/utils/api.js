const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email) =>
  typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email)

export const readEmail = (req) => (typeof req.body?.email === 'string' ? req.body.email.trim() : '')

export const requirePost = (req, res) => {
  if (req.method === 'POST') return true
  res.setHeader('Allow', 'POST')
  res.status(405).json({ error: 'Method not allowed' })
  return false
}
