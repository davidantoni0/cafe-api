import { pool } from "../db.js";


export interface IItemPedido{
    id: number;
    pedido_id:number;
    produto_id: number;
    quantidade: number;
    preco_un: number
    
}

export interface IPedido{
    id: number;
    data_criacao:Date;
    status: string;
    itens: IItemPedido[]
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
    }
}

