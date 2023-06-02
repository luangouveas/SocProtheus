require('dotenv').config();
const { format, subDays } = require('date-fns');
const exportaDadosWs = require('../../controllers/SOC/exportaDadosWs');
const db = require('../../infra/banco');
const { ED_FATURAMENTO_COD, ED_FATURAMENTO_CHAVE, ED_EMPRESA_PRINCIPAL } = process.env;

module.exports = {

    async consumirExamesDosLotes(){
        return new Promise(async (resolve, reject) => {
            console.log("#3 - Consumindo exames/serviços dos lotes pendentes de pagamento");

            const lotesPendentes = await db.consultarLotesParaPagar();

            if(lotesPendentes.rowsAffected > 0){
                console.log(`   ${lotesPendentes.rowsAffected} lotes para pagar`);
                console.log('   Consumindo seus exames e serviços');
                
                const lotes = lotesPendentes.recordset;

                lotes.forEach(async (lote) => {
                    const parametros = `{'empresa':'${ED_EMPRESA_PRINCIPAL}','codigo':'${ED_FATURAMENTO_COD}','chave':'${ED_FATURAMENTO_CHAVE}','tipoSaida':'json','codigoPrestador':'${lote.codPrestador}','dataInicio':'${lote.DtPagamento}','dataFim':'${lote.DtPagamento}'}`;
                    //console.log(''  + parametros);
                    await exportaDadosWs.consumirExportaDados(parametros)
                    .then((retorno) => {
                        if(retorno.length > 0){
                                retorno.forEach(async (servico) => {
                                    await db.salvarExamesServicosLote(servico, lote.codLotePrestadorSoc)
                                    .catch((error) => {
                                        reject(error);  
                                    });  
                                });
                        }else{
                            reject('   Sem exames/serviços para consumir');
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