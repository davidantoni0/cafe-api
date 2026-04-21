import { Router} from "express";
import { deletePedido, getPedidos, getTotalFaturamento, patchCancelarPedido, patchStatus, postPedido, updatePedido } from "../controllers/pedidoController.js";

const router = Router();

router.post("/", postPedido);
router.get("/", getPedidos);
router.delete("/:id", deletePedido);
router.patch("/:id", patchStatus);
router.put("/:id", updatePedido)
router.get("/faturamentos", getTotalFaturamento)
router.patch("/:id/cancelar", patchCancelarPedido)

export const pedidoRoutes = router;

