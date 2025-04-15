import dotenv from "dotenv";
dotenv.config();
import express from "express";
import contactRouter from "./routes/contactRouter.js";
import userRouter from "./routes/userRouter.js";
import folderRouter from "./routes/folderRouter.js";
import projectRouter from "./routes/projectRouter.js";
import authenticateToken from "./middleware/authenticateToken.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/folders", authenticateToken, folderRouter);
app.use("/api/v1/projects", authenticateToken, projectRouter);
app.use("/api/v1/contact", contactRouter);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { prisma };
