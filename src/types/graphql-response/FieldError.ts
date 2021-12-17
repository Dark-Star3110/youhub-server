import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class FieldError {
  @Field()
  type: string

  @Field()
  error: string
}