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
            //console.log(lotesPendentes);
            if(lotesPendentes.rowsAffected > 0){
                console.log(`   ${lotesPendentes.rowsAffected} lotes para pagar`);
                console.log('   Consumindo seus exames e serviços');
                //console.log(lotesPendentes);
                
                const lotes = lotesPendentes.recordset;

                lotes.forEach(async (lote) => {
                    const parametros = `{'empresa':'${ED_EMPRESA_PRINCIPAL}','codigo':'${ED_FATURAMENTO_COD}','chave':'${ED_FATURAMENTO_CHAVE}','tipoSaida':'json','codigoPrestador':'${lote.codPrestador}','dataInicio':'${lote.DtPagamento}','dataFim':'${lote.DtPagamento}'}`;
                    //console.log(''  + parametros);
                    
                    await exportaDadosWs.consumirExportaDados(parametros)
                    .then((retorno) => {
                        if(retorno.length > 0){
                                retorno.forEach(async (servico) => {
                                    await db.salvarExamesServicosLote(servico, lote.codLotePrestadorSoc);  
                                    //console.log(servico);                          
                                });
                        }else{
                            console.log('   Sem exames/serviços para consumir');
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                });
            }else{
                console.log('   Não existem lotes para pagar.');
            }

            resolve();
        });
    }

}