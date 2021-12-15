import { FieldError } from './FieldError';
import { Video } from './../../entities/Video';
import { Field, ObjectType } from "type-graphql";
import { MutationResponse } from "./MutationResponse";

@ObjectType({implements: MutationResponse})
export class VideoMutationResponse implements MutationResponse{
  code: number
  success: boolean
  message: string

  @Field(_type=>Video, {nullable: true})
  video?: Video

  @Field(_type=>[FieldError], {nullable: true})
  errors?: FieldError[]
}