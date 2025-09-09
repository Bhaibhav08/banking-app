import { gql } from "graphql-tag";

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    createAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input UpdateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput): User
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): Boolean
    login(email: String!, password: String!): AuthPayload
  }
`;

export default userTypeDefs;
