import { Video } from './../../entities/Video';
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedVideos {
  @Field()
  totalCount!: number

  @Field(_type=>Date)
  cursor!: Date

  @Field()
  hasMore!: boolean
  
  @Field(_type=>[Video])
  paginatedVideos!: Video[]
}