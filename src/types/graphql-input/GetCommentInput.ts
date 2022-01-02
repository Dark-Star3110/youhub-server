import { Field, InputType } from "type-graphql";

@InputType()
export class GetCommentInput {
  @Field()
  limit: number;

  @Field()
  videoId: string;

  @Field({ nullable: true })
  cursor?: string;

  @Field({ nullable: true })
  parentCmtId?: string;
}
