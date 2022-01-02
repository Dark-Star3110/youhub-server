import { CommentResolver } from './comment';
import { NonEmptyArray } from 'type-graphql'
import { HelloResolver } from './hello'
import { UserResolver } from './user'
import { VideoResolver } from './video'

const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  HelloResolver,
  UserResolver,
  VideoResolver,
  CommentResolver
]

export { 
  resolvers
}