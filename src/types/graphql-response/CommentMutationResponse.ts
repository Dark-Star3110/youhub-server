import { FieldError } from './FieldError';
import { Comment } from './../../entities/Comment';
import { Field, ObjectType } from "type-graphql";
import { MutationResponse } from "./MutationResponse";

@ObjectType({implements: MutationResponse})
export class CommentMutationResponse implements MutationResponse {
  code: number
  success: boolean
  message: string

  @Field(_type=>Comment,{nullable: true})
  comment?: Comment

  @Field(_type=>[FieldError], {nullable: true})
  errors?: FieldError[]
}