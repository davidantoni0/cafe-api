import type { Request, Response } from "express";
import { ProdutoModel } from "../models/Produto.js";

export const getProdutos = async (req: Request, res: Response) => {
  try {
    const produtos = await ProdutoModel.listarTodos();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

export const createProduto = async (req: Request, res: Response) => {
  if (!req.body.nome || !req.body.preco) {
    return res.status(400).json({ error: "Nome e preço são obrigatórios" });
  }
  try {
    const novoProduto = await ProdutoModel.criar(req.body);
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar produto" });
  }
};