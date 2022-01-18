import { Notification } from "../../models/notification";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedNotification {
  @Field((_type) => Int)
  cursor: number;
  @Field()
  hasMore: boolean;
  @Field()
  totalCount: number;

  @Field((_type) => [Notification])
  paginatedNotification: Notification[];
}
