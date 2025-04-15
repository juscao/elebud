import express from "express";
import folderController from "../controllers/folderController.js";
import projectController from "../controllers/projectController.js";

const router = express.Router();

router
  .route("/")
  .get(folderController.getFolders)
  .post(folderController.createFolder);

router
  .route("/:folderId")
  .get(projectController.getProjects)
  .patch(folderController.updateFolder)
  .delete(folderController.deleteFolder);

export default router;
