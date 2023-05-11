require('dotenv').config();
const { format } = require('date-fns');
const exportaDadosWs = require('../../controllers/SOC/exportaDadosWs');
const db = require('../../infra/banco');
const { ED_LOTES_COD, ED_LOTES_CHAVE, ED_EMPRESA_PRINCIPAL } = process.env;

module.exports = {

    async consumirLotesPendentes(){
        return new Promise(async (resolve, reject) => {    
            const df = new Date();
            const di = subDays(df, 15);

            const dataFinal = format(df, 'dd/MM/yyyy');
            const dataInicial = format(di, 'dd/MM/yyyy');

            const parametros = `{'empresa':'${ED_EMPRESA_PRINCIPAL}','codigo':'${ED_LOTES_COD}','chave':'${ED_LOTES_CHAVE}','tipoSaida':'json','codigoPrestador':'','cnpjPrestador':'','cpfPrestador':'','numeroLote':'','numeroDoc':'','dataInicial':'${dataInicial}', 'dataFinal':'${dataFinal}','statusLote':'3'}`;

            const retorno = await exportaDadosWs.consumirExportaDados(parametros);

            if(retorno){
                retorno.forEach(async (lote) => {
                    //console.log('inserindo : ' + lote);
                    
                    await db.salvarLote(lote)
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    
                });
            }
        });
    }
}