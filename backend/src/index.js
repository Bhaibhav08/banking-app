import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.js";
import { authMiddleware } from './middleware/auth.js';


dotenv.config();

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();

  app.use(cors());
  app.use(express.json()); // ✅ Add this middleware to parse JSON request bodies

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        authMiddleware(req, res, () => {});
        return { user: req.user };
      },
    })
  );

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");

      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}/graphql`);
      });
    })
    .catch(err => console.error("MongoDB connection error:", err));
};

startServer();
