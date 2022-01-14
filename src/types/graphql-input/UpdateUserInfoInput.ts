import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateUserInfoInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  channelDecscription?: string;

  @Field({ nullable: true })
  image_url?: string;

  @Field({ nullable: true })
  banner_id?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  password?: string;
}
