import { Router} from "express";
import { deletePedido, getPedidos, postPedido } from "../controllers/pedidoController.js";

const router = Router();

router.post("/", postPedido);
router.get("/", getPedidos);
router.delete("/:id", deletePedido);

export const pedidoRoutes = router;
