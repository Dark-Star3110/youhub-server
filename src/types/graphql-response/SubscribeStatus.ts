import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class SubscribeStatus {
  @Field()
  status: boolean;

  @Field()
  notification: boolean;
}
