import { Field, InterfaceType } from "type-graphql";

@InterfaceType()
export abstract class PaginatedResponse {
  @Field()
  totalCount: number;

  @Field()
  cursor: Date;

  @Field()
  hasMore: boolean;
}
