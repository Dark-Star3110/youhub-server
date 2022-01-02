import { Video } from "./../../entities/Video";
import { Field, ObjectType } from "type-graphql";
import { PaginatedResponse } from "./PaginatedResponse";

@ObjectType({ implements: PaginatedResponse })
export class PaginatedVideos implements PaginatedResponse {
  totalCount!: number;
  cursor!: Date;
  hasMore!: boolean;

  @Field((_type) => [Video])
  paginatedVideos!: Video[];
}
