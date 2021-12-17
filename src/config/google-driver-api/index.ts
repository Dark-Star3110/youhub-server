import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI,
)

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
})

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
})

export default drive