import { Field, InputType } from "type-graphql";

@InputType()
export class CreateCommentInput {
  @Field()
  content: string;

  @Field({ nullable: true })
  parentCommentId?: string;
}
