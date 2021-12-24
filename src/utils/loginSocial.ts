import { OAuth2Client } from 'google-auth-library'
import { User } from './../entities/User';
import { SocialLogin } from './../types/graphql-input/LoginInput';

const clientGoogle = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const loginSocial = async (input: SocialLogin): Promise<User|null> => {
  const { type, accessToken } = input
  switch (type) {
    case 'google': 
      try {
        const ticket = await clientGoogle.verifyIdToken({
          idToken: accessToken,
          audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()
        if (!payload) return null
        const exsistingUser = await User.findOne({socialId: payload.sub})
        if (!exsistingUser) {
          const newUser = await User.create({
            email: payload.email,
            socialId: payload.sub,
            firstName: payload.family_name,
            lastName: payload.given_name,
            image_url: payload.picture
          }).save()
          return newUser
        }
        return exsistingUser
      } catch (error) {
        return null
      }
    default: 
      return null
  }
}