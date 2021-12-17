import { ApolloServer } from 'apollo-server-express'
import { Express } from 'express'
import { getHeadersToken } from '../../utils/getHeadersToken'
import { buildSchema } from 'type-graphql'
import { resolvers } from '../../resolvers/index'

export const createApolloServer = async (app: Express) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
        resolvers,
        validate: false
    }),
    context: ({req, res}) => ({
      req,
      res,
      token: getHeadersToken(req)
    })
  })

  await apolloServer.start()

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: [process.env.CLIENT_DOMAINS as string, 'https://studio.apollographql.com'],
      credentials: true
    },
    path: process.env.GRAPHQL_PATH || '/graphql'
  })

  return apolloServer.graphqlPath
}