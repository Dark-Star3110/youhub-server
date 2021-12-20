import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateCommentInput {
  @Field()
  content: string
}