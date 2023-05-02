const downloadArquivoWsController = require('./SOC/downloadArquivoWsController');

module.exports = {

    async buscarArquivosMalote(req, res){
        const malote = req.query.malote;
        await downloadArquivoWsController.buscarArquivosMalote(malote)
            .then((Arquivos) => {
                res.status(200).json(Arquivos)
            })
            .catch((Erro) => {
                res.status(500).json({Erro})
                //console.log(err)
            })
    }
}