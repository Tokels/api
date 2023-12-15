import express from "express";
import controller from "../controllers/Users";

const router = express.Router();

// prettier-ignore
router
    .get('/:_id', controller.readUser)

export default router;
