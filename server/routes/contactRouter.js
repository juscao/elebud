import express from "express";
import contactController from "../controllers/contactController.js";

const router = express.Router();

router.route("/").post(contactController.submitContactForm);

export default router;
