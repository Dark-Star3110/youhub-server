import { Comment } from './../../entities/Comment';
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedComments {
  @Field()
  totalCount: number

  @Field()
  cursor: Date

  @Field()
  hasMore: boolean

  @Field(_type=>[Comment])
  paginatedComments: Comment[]
}