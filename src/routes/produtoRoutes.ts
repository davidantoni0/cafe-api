import { Router } from "express";
import {
  getProdutos,
  createProduto,
} from "../controllers/produtoController.js";

const router = Router();

router.get("/", getProdutos);
router.post("/", createProduto);

export const produtoRoutes = router;