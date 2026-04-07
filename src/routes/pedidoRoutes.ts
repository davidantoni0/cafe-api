import { Router} from "express";
import { deletePedido, getPedidos, patchStatus, postPedido } from "../controllers/pedidoController.js";

const router = Router();

router.post("/", postPedido);
router.get("/", getPedidos);
router.delete("/:id", deletePedido);
router.patch("/:id", patchStatus);

export const pedidoRoutes = router;

