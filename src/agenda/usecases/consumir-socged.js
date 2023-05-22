require('dotenv').config();
const { format } = require('date-fns');
const exportaDadosWs = require('../../controllers/SOC/exportaDadosWs');
const db = require('../../infra/banco');
const { ED_GED_COD, ED_GED_CHAVE, ED_EMPRESA_PRINCIPAL } = process.env;

module.exports = {

    async consumirSocGed(){
        return new Promise(async (resolve, reject) => {
            console.log("#1 - Consumindo SocGed de lotes");
            const dataAtual = new Date();
            const dataAtualFormatada = format(dataAtual, 'dd/MM/yyyy');
            const parametros = `{'empresa':'${ED_EMPRESA_PRINCIPAL}','codigo':'${ED_GED_COD}','chave':'${ED_GED_CHAVE}','tipoSaida':'json','tipoBusca':'0','sequencialFicha':'','cpfFuncionario':'','filtraPorTipoSocged':'true','codigoTipoSocged':'39','dataInicio':'${dataAtualFormatada}','dataFim':'${dataAtualFormatada}','dataEmissaoInicio':'','dataEmissaoFim':''}`;

            const retorno = await exportaDadosWs.consumirExportaDados(parametros);

            if(retorno){
                retorno.forEach(async (arqGed) => {
                    //console.log('inserindo : ' + arqGed.NM_GED);
                    
                    await db.salvarArquivoGed(arqGed)
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