import { google } from "googleapis";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN_MAIL });

export async function sendMail(
  to: string,
  subject: string,
  html?: string,
  text?: string
) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const options: SMTPTransport.Options = {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "youhubvippro@gmail.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_MAIL,
        accessToken: accessToken.token as string | undefined,
      },
    };
    const transport = nodemailer.createTransport(options);

    const mailOptions = {
      from: "YOUHUB<Watch for today, Watch for tomorrow>",
      to,
      subject,
      text,
      html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
