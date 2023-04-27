const exportaDadosWsController = require('./SOC/exportaDadosWsController');
const downloadArquivoWsController = require('./SOC/downloadArquivoWsController');

/*
function consumirArquivoSocGed(req, res){
    var parametros = `{'empresa':'492088', 'codigo':'148366', 'chave':'cd65f911b95ae949b8b7','tipoSaida':'json','tipoBusca':'0','sequencialFicha':'','filtraPorTipoSocged':'true','codigoTipoSocged':'1','dataInicio':'','dataFim':'','dataEmissaoInicio':'','dataEmissaoFim':''}`
    const listaArquivos = exportaDadosWsController.consumirExportaDados(parametros);
    return listaArquivos;
}
*/

module.exports = {

    async baixarArquivos(req, res){
        /* consumir os dados do soc ged*/
        //const listaArquivos = consumirArquivoSocGed(req, res);
        const arquivos = downloadArquivoWsController.baixarArquivos(req.malote);

        //res.status(200).json(arquivos)
        res.status(200).json({status:"ok"})
    }

}