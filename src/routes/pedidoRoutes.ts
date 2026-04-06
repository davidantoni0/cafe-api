import { Router} from "express";
import { getPedidos, postPedido } from "../controllers/pedidoController.js";

const router = Router();

router.post("/", postPedido);
router.get("/", getPedidos);

export const pedidoRoutes = router;
