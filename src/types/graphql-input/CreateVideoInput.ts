import { Field, InputType } from "type-graphql";

@InputType()
export class CreateVideoInput {
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  description: string

  @Field({nullable: true})
  commentable: boolean

  @Field({nullable: true})
  thumbnailUrl: string

  @Field()
  size: number
}