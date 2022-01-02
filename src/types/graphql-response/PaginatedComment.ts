import { Comment } from "./../../entities/Comment";
import { Field, ObjectType } from "type-graphql";
import { PaginatedResponse } from "./PaginatedResponse";

@ObjectType({ implements: PaginatedResponse })
export class PaginatedComments implements PaginatedResponse {
  totalCount: number;
  cursor: Date;
  hasMore: boolean;

  @Field((_type) => [Comment])
  paginatedComments: Comment[];
}
