import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.js";
import { authMiddleware } from './middleware/auth.js';
import accountRoutes from "./routes/accountRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";



dotenv.config();

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();

  app.use(cors());
  app.use(express.json()); 
  app.use("/api/accounts", accountRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/loans", loanRoutes);

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

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}/graphql`);
      });
    })
    .catch(err => console.error("MongoDB connection error:", err));
};

startServer();
