import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateVideoInput {
  @Field({nullable: true})
  title?: string

  @Field({nullable: true})
  description?: string

  @Field({nullable: true})
  commentable?: boolean
}