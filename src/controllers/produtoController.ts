import type { Request, Response } from "express"
import { ProdutoModel } from "../models/Produto.js"
import { error } from "node:console";

export const getProdutos = async (req: Request, res: Response) => {
    try {
        const produtos = await ProdutoModel.listarTodos();
        res.json(produtos);
    }catch {
        res.status(500).json({error: "Erro ao buscar produtos =("})
    }
}

export const createProduto = async (req: Request, res: Response) => {
    if(!req.body.nome || !req.body.preco || !req.body.estoque){
        return res.status(400).json({error: "Nome, preço e estoque são obrigatórios"})
    }
    try {
        const novoProduto = await ProdutoModel.criar(req.body)
        console.log(novoProduto)
        return res.status(201).json(novoProduto)
    }catch(error){
            res.status(500).json({error: `Erro ao cadastrar: ${error}`})
    }
}

export const deleteProduto = async(req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const produtoDeletado = await ProdutoModel.delete(id);
        if (!produtoDeletado) {
            return res.status(404).json({ error: "Produto não encontrado." });
          }
          return res.status(204).send();

    } catch (error) {
        res.status(500).json({error: `Erro ao deletar: ${error}`})
    }
}

export const updateProduto = async(req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const produtoAtual = await ProdutoModel.buscarPorId(id);
        if(!produtoAtual){
            return res.status(404).json({error: "Produto não encontrado."})
        }
        const dados = {
            nome: req.body.nome ?? produtoAtual.nome,
            preco: req.body.preco ?? produtoAtual.preco,
            estoque: req.body.estoque ?? produtoAtual.estoque
        };
        const produtoAtualizado = await ProdutoModel.atualizar(id, dados)
        return res.status(200).json(produtoAtualizado)

    } catch (error) {
        res.status(500).json({error: `Erro ao Atualizar: ${error}`})
    }
}

export const getProdutoPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
  
    try {
      const produtoEncontrado = await ProdutoModel.buscarPorId(id);
  
      if (!produtoEncontrado) {
        return res.status(404).json({ error: "Produto não encontrado." });
      }
      return res.json(produtoEncontrado);
  
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar produto." });
    }
  };