import { registerEnumType } from "type-graphql";

export enum Action {
  ACTIVATE = 'activate',
  DISACTIVATE = 'disactivate'
}

export enum Type {
  LIKE = 'like',
  DISLIKE = 'dislike'
}

registerEnumType(Action, {
  name: 'Action'
})

registerEnumType(Type, {
  name: 'Type'
})