import { Router } from "express";
import { createProduto, deleteProduto, getProdutoPorId, getProdutos, updateProduto } from "../controllers/produtoController.js";

const router = Router();

router.get("/", getProdutos);
router.get("/:id", getProdutoPorId);
router.post("/", createProduto);
router.patch("/:id", updateProduto);
router.delete("/:id", deleteProduto);

export const produtoRoutes = router;