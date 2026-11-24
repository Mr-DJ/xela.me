import mailchimp from '@mailchimp/mailchimp_marketing'

import { isValidEmail, readEmail, requirePost } from '@/lib/utils/api'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER, // E.g. us1
})

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  if (!requirePost(req, res)) return

  const email = readEmail(req)

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' })
  }

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
      email_address: email,
      status: 'subscribed',
    })
    return res.status(201).json({ error: '' })
  } catch (error) {
    return res.status(500).json({ error: error.message || error.toString() })
  }
}
