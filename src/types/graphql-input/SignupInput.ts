import { Field, InputType } from "type-graphql";

@InputType()
export class SignupInput {
  @Field()
  username: string

  @Field()
  email: string

  @Field()
  password: string

  @Field()
  firstName: string

  @Field({nullable: true})
  lastName?: string

  @Field(_type=> Date,{nullable: true})
  dateOfBirth?: Date
}