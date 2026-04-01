import { Router } from "express";
import { criarProduto, getProdutos } from "../controllers/produtoController.js";

const router = Router();

router.get("/", getProdutos);
router.post("/", criarProduto);

export const produtoRoutes = router;