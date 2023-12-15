import express from "express";
import controller from "../controllers/Auth";

const router = express.Router();

// prettier-ignore
router
    .post('/authenticate', controller.authenticateAuth)
    .post('/', controller.createAuth)
    .get('/:_id', controller.readAuth)
    .patch('/:_id', controller.updateAuth)
    .delete('/:_id', controller.deleteAuth)

export default router;
