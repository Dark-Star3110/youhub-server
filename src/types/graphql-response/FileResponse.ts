import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class FileResponse {
  @Field()
  id: string

  @Field(_type=>String, {nullable: true})
  size?: string | null
}