import { getUserIdToRequest } from "./../../utils/getUserId";
import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { buildSchema } from "type-graphql";
import { resolvers } from "../../resolvers/index";
import { Connection } from "typeorm";
import { buildDataLoaders } from "../../utils/dataLoader";
import { Redis } from "ioredis";

export const createApolloServer = async (
  app: Express,
  redis?: Redis,
  connection?: Connection
) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req: getUserIdToRequest(req),
      res,
      connection,
      redis,
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
