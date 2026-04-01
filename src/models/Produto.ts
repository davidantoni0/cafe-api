import { pool } from "../db.js";

export interface IProduto {
    id?: number;
    nome: string;
    preco: number;
    estoque: number;
}

export const ProdutoModel = {
    async listarTodos(): Promise<IProduto[]> {
        const {rows} = await pool.query("SELECT * FROM produtos");
        return rows;
    },
    async criar(dados:IProduto): Promise<IProduto> {
        const query = "INSERT INTO produtos (nome, preco, estoque) VALUES ($1, $2, $3) RETURNING *";
        const values = [dados.nome, dados.preco, dados.estoque];
        const result = await pool.query(query, values);
        return result.rows[0]
    }
}