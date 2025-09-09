import { gql } from "graphql-tag";
import userTypeDefs from "./userTypeDefs.js"; // default import
import { userResolver } from "../resolvers/userResolver.js"; // named import

import { helloTypeDefs } from "./helloTypeDefs.js";
import { helloResolver } from "../resolvers/helloResolver.js";

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [baseTypeDefs, userTypeDefs, helloTypeDefs];
export const resolvers = [userResolver, helloResolver];
