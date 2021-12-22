import { registerEnumType } from "type-graphql";

export enum Action {
  ACTIVATE = 'activate',
  DISACTIVATE = 'disactivate'
}

export enum VoteType {
  LIKE = 1,
  DISLIKE = -1
}

registerEnumType(Action, {
  name: 'Action'
})

registerEnumType(VoteType, {
  name: 'VoteType'
})