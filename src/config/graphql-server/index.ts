import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { getHeadersToken } from "../../utils/getHeadersToken";
import { buildSchema } from "type-graphql";
import { resolvers } from "../../resolvers/index";
import { Connection } from "typeorm";
import { buildDataLoaders } from "../../utils/dataLoader";

export const createApolloServer = async (
  app: Express,
  connection?: Connection
) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      connection,
      token: getHeadersToken(req),
      dataLoaders: buildDataLoaders(),
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: [
        process.env.CLIENT_DOMAINS as string,
        "https://studio.apollographql.com",
      ],
      credentials: true,
    },
    path: process.env.GRAPHQL_PATH || "/graphql",
  });

  return apolloServer.graphqlPath;
};
