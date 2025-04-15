import express from "express";
import chartController from "../controllers/sankeyChartController.js";

const router = express.Router();

router.route("/sankey").get(chartController.getSankey);

export default router;
