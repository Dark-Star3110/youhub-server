import { Field, ID, InputType } from "type-graphql";

@InputType()
export class CreateVideoInput {
  @Field(_type=>ID)
  id: string

  @Field()
  title: string

  @Field()
  description: string

  @Field({nullable: true})
  commentable: boolean

  @Field({nullable: true})
  thumbnailId?: string

  @Field()
  size: string
}