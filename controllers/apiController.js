const exportaDadosWsController = require('./SOC/exportaDadosWsController');
const downloadArquivoWsController = require('./SOC/downloadArquivoWsController');

module.exports = {

    async buscarArquivosMalote(req, res){
        const malote = req.query.malote;
        const arquivos = await downloadArquivoWsController.buscarArquivosMalote(malote);

        //trocar para que responda quando receber as informações dos arquivos
        setTimeout(async function() {
            res.status(200).json(arquivos)
        }, 3000)
    }

}