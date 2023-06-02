require('dotenv').config();
const protheus = require('../../controllers/Protheus');
const db = require('../../infra/banco');

module.exports = {
    async gerarPedidosDeCompra(){
        return new Promise(async (resolve, reject) => {
            console.log("#4 - Gerando pedidos de compra");
            
            const lotesAPagar = await db.consultarLotesParaPagar();

            if(lotesAPagar.rowsAffected > 0){
                console.log(`   ${lotesAPagar.rowsAffected} lotes para pagar`);
                const lotes = lotesAPagar.recordset;                

                lotes.forEach(async (lote) => {
                    await db.consultarExamesDoLote(lote.codLotePrestadorSoc)
                    .then(async (exames) => {
                        if(exames.rowsAffected > 0){
                            lote.exames = exames.recordset;
                        
                            await protheus.criarPedidoDeCompras(lote)
                            .catch((error) => {
                                reject(error);
                            });                        
                        }              
                    })
                    .catch((error) => {
                        reject(error);
                    });
                });
            }else{
                reject('   Não existem lotes para pagar.');
            }

            resolve();
        });
    }
}