import { pool } from "../../db.js";

export interface IProduto {
  id?: number;
  nome: string;
  preco: number;
  categoria: string;
}

export const ProdutoModel = {
  async listarTodos(): Promise<IProduto[]> {
    const result = await pool.query("SELECT * FROM produtos");
    return result.rows;
  },

  async criar(dados: IProduto): Promise<IProduto> {
    const query =
      "INSERT INTO produtos (nome, preco, categoria) VALUES ($1, $2, $3) RETURNING *";
    const values = [dados.nome, dados.preco, dados.categoria];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async buscarPorId(id: number): Promise<IProduto | null> {
    const result = await pool.query("SELECT * FROM produtos WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },
};