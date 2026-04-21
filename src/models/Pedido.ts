import type { promises } from "node:dns";
import { pool } from "../db.js";


export interface IItemPedido{
    id: number;
    pedido_id:number;
    produto_id: number;
    quantidade: number;
    nome: string;
    preco_un: number
    
}

export interface IPedido{
    id: number;
    data_criacao:Date;
    status: string;
    itens: IItemPedido[]
}

export interface IPedidoRow{
    pedido_id: number;
    data_criacao: Date;
    status:string;
    item_id: number | null;
    produto_id: number | null;
    quantidade: number | null;
    produto_nome: string | null;
    produto_preco: number | null
}

export type INovoItemPedido = Pick<IItemPedido, "produto_id" | "quantidade">;// type é o mesmo que interface, mais usado quando for digitar em uma única linha

export const PedidoModel = {
    async criar(itens: INovoItemPedido[]): Promise<{id:number}>{
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const pedido =  await client.query(
                "INSERT INTO pedidos (status) values ('pendente') RETURNING ID")

            const pedidoId = pedido.rows[0].id;
            for(const item of itens){
                const produtoSelecionado = await client.query(
                    "SELECT estoque, preco, nome FROM produtos WHERE id = $1", [item.produto_id]);

                if (!produtoSelecionado.rows[0]){
                    throw new Error((
                        `Produto de id:${item.produto_id} não foi encontrado.`))

                }
                if( produtoSelecionado.rows[0].estoque< item.quantidade){
                    throw new Error((
                        `Estoque insuficiente para o produto: 
                        ${produtoSelecionado.rows[0].nome}.`))

                }
                await client .query(
                    "UPDATE produtos SET estoque = estoque - $1 WHERE id = $2", 
                    [item.quantidade, item.produto_id])

                await client.query("INSERT INTO itens_pedido(pedido_id, produto_id, quantidade, preco_un) VALUES ($1, $2, $3, $4)", 
                    [pedidoId, item.produto_id, item.quantidade, produtoSelecionado.rows[0].preco])

            }
            await client.query(
                "COMMIT");

            return{id: pedidoId}
        } catch (error) {
            await client.query(
                "ROLLBACK");

            throw error
        } finally{
            client.release();
        }
    },

    async listarTodos(): Promise<IPedido[]>{
        const query = `SELECT 
        p.id AS pedido_id, p.data_criacao, p.status, ip.id as item_id, ip.quantidade, pr.nome AS produto_nome,ip.produto_id, pr.preco as produto_preco FROM pedidos p 
        LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id 
        LEFT JOIN  produtos pr ON ip.produto_id = pr.id
        ORDER BY p.data_criacao DESC`;
        const {rows} = await pool.query<IPedidoRow>(query);
        const listaDePedidos : IPedido[] = []

        for (const row of rows){
            let pedidoExistente = listaDePedidos.find((p) =>p.id === row.pedido_id);
            if(!pedidoExistente){
                pedidoExistente = {
                id: row.pedido_id,
                data_criacao: row.data_criacao,
                status: row.status,
                itens: []
                }
                listaDePedidos.push(pedidoExistente)
            }
            if(row.item_id){
                pedidoExistente.itens.push({
                    id: row.item_id,
                    produto_id : row.produto_id!,
                    pedido_id : row.pedido_id!,
                    quantidade: row.quantidade!,
                    nome: row.produto_nome!,
                    preco_un: row.produto_preco!

                });
            }
        }
        return listaDePedidos

    },

    async deletar(id: number): Promise<boolean>{
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            const queryItems = 
            "SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = $1";
            const {rows} = await client.query(queryItems, [id]);
            for (const row of rows){
                await client.query(
                    "UPDATE produtos SET estoque = estoque + $1 WHERE id = $2",
                    [row.quantidade, row.produto_id]);
            }
            const result = await client.query("DELETE FROM pedidos WHERE id =$1", [id]);
            await client.query(
                "COMMIT");

            return (result.rowCount ?? 0) > 0

        } catch (error) {
            await client.query(
                "ROLLBACK");

            throw error
        } finally{
            client.release();
        }
    },

    async mudarStatus(id: number, novoStatus: string): Promise<boolean> {
        const query = "UPDATE pedidos SET status = $1 WHERE id = $2";
        const result = await pool.query(query, [novoStatus, id]);
        return (result.rowCount ?? 0) > 0;
    },

    async atualizarPedido(id: number, novoItem: INovoItemPedido[]): Promise<boolean> {
        const client = await pool.connect();
    
        try {
            await client.query("BEGIN");
    
            const { rows: itensAntigos } = await client.query(
                "SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = $1",
                [id]);
    
            if (itensAntigos.length === 0) {
                throw new Error("Pedido não encontrado ou sem itens");
            }
    
            for (const item of itensAntigos) {
                await client.query(
                    "UPDATE produtos SET estoque = estoque + $1 WHERE id = $2",
                    [item.quantidade, item.produto_id]);
            }
    
            await client.query(
                "DELETE FROM itens_pedido WHERE pedido_id = $1",
                [id]);
    

            for (const item of novoItem) {

                const { rows: produto } = await client.query(
                    "SELECT estoque, nome, preco FROM produtos WHERE id = $1",
                    [item.produto_id]);
                    console.log(produto)
                if (!produto[0]) {
                    throw new Error("Produto não encontrado");
                }
    
                if (produto[0].estoque < item.quantidade) {
                    throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
                }
    
                await client.query(
                    "UPDATE produtos SET estoque = estoque - $1 WHERE id = $2",
                    [item.quantidade, item.produto_id]);
    
                await client.query(
                    "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_un) VALUES ($1, $2, $3, $4)",
                    [id, item.produto_id, item.quantidade, produto[0].preco]);
            }
    
            await client.query("COMMIT");
            return true;
    
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
    
        } finally {
            client.release();
        }
    },

    async getFaturamentoTotal(): Promise<number> {
        const query = `SELECT SUM(ip.quantidade * ip.preco_un) AS faturamento_total
        FROM pedidos p
        JOIN itens_pedido ip ON p.id = ip.pedido_id
        WHERE p.status = 'finalizado'`;
        const { rows } = await pool.query<{ faturamento_total: number }>(query);
        return rows[0]?.faturamento_total ?? 0;
    },
    
    async cancelPedido(id: number): Promise<boolean>{
            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                const { rows: pedido } = await client.query(
                    "SELECT status FROM pedidos WHERE id = $1",
                    [id]
                );
                if (pedido.length === 0) {
                    throw new Error("Pedido não encontrado");
                }
                if (pedido[0].status !== "pendente") {
                    throw new Error("Somente pedidos pendentes podem ser cancelados");
                }
                await client.query(
                    "UPDATE pedidos SET status = 'cancelado' WHERE id = $1",
                    [id]
                );
                const { rows: itens } = await client.query(
                    "SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = $1",
                    [id]
                );
                for (const item of itens) {
                    await client.query(
                        "UPDATE produtos SET estoque = estoque + $1 WHERE id = $2",
                        [item.quantidade, item.produto_id]
                    );
                }
                await client.query("COMMIT");
                return true;

            } catch (error) {
                await client.query("ROLLBACK");
            throw error;
            } finally {
                client.release();
            }
    }
}
    


