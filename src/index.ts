import express from "express";
import type { Application } from "express";
import { produtoRoutes } from "./routes/produtoRoutes.js";

const app:Application = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use("/api/produtos", produtoRoutes)

app.listen(port, ()=>{
    console.log(`Servidor rodando em http://localhost:${port}`);
})