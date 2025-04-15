import express from "express";
import userController from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router
  .route("/")
  .get(authenticateToken, userController.getUser)
  .post(userController.createUser)
  .patch(authenticateToken, userController.updateUser)
  .delete(authenticateToken, userController.deleteUsers);

router
  .route("/session")
  .post(userController.verifyUser)
  .delete(userController.logoutUser);

export default router;
