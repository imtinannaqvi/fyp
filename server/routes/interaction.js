import express from "express";
import { checkInteraction } from "../Controllers/interaction.controller.js";

const router = express.Router();

router.post("/check", checkInteraction);

export default router;