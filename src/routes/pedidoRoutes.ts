import { Router} from "express";
import { deletePedido, getPedidos, getTotalFaturamento, patchStatus, postPedido, updatePedido } from "../controllers/pedidoController.js";

const router = Router();

router.post("/", postPedido);
router.get("/", getPedidos);
router.delete("/:id", deletePedido);
router.patch("/:id", patchStatus);
router.put("/:id", updatePedido)
router.get("/faturamentos", getTotalFaturamento)

export const pedidoRoutes = router;

