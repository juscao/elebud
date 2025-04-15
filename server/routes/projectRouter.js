import express from "express";
import projectController from "../controllers/projectController.js";
import sankeyChartController from "../controllers/sankeyChartController.js";

const router = express.Router();

router.route("/").post(projectController.createProject);
router
  .route("/:projectId")
  .get(projectController.getProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);
router
  .route("/:projectId/chart/sankey")
  .get(sankeyChartController.getSankey)
  .patch(sankeyChartController.updateSankey);

router
  .route("/:projectId/chart/sankey/nodes")
  .post(sankeyChartController.addSankeyNode);

router
  .route("/:projectId/chart/sankey/nodes/:nodeId")
  .patch(sankeyChartController.updateSankeyNode)
  .delete(sankeyChartController.deleteSankeyNode);

export default router;
