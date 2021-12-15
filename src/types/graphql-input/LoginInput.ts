import { Field, InputType, registerEnumType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  username: string

  @Field()
  password: string
}

export enum Strategy {
  LOCAL = 'local',
  GOOGLE = 'google'
}

registerEnumType(Strategy, {
  name: 'Strategy',
  description: 'strategy login with social'
})

@InputType()
export class SocialLogin {
  @Field(_type=>Strategy)
  type: Strategy

  @Field()
  accessToken: string
}