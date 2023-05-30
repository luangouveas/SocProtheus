require('dotenv').config();
const db = require('../../infra/banco');

module.exports = {
    async gerarPedidosDeCompra(){
        return new Promise(async (resolve, reject) => {
            console.log("#4 - Gerando pedidos de compra");
            

            resolve();
        });
    }
}