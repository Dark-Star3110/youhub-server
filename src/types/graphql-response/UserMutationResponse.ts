import { Field, ObjectType } from "type-graphql";
import { FieldError } from './FieldError';
import { MutationResponse } from "./MutationResponse";

@ObjectType({implements: MutationResponse})
export class UserMutationResponse implements MutationResponse {
  code: number
  success: boolean
  message?: string

  @Field({nullable: true})
  token?: string

  @Field(_type=>[FieldError], {nullable: true})
  errors?: FieldError[]
}