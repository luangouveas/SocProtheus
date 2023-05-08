const downloadArquivo = require('../controllers/downloadArquivo');

module.exports = {

    async buscarArquivosMalote(req, res){
        const malote = req.query.malote;
        await downloadArquivo.buscarArquivosMalote(malote)
            .then((Arquivos) => {
                res.status(200).json(Arquivos)
            })
            .catch((Erro) => {
                res.status(500).json({Erro})
            })
    },

    async testeUpload(req, res){
        const urlArquivo = req.query.urlArquivo;
        const amazon = require('../controllers/amazon');
        const amz = new amazon()
        const uuid = await amz.upload(urlArquivo); 

        res.status(200).json({uuid:uuid});
    },

    async testeRecuperarUrl(req, res){
        const uuid = req.query.uuid;
        const amazon = require('../controllers/amazon');
        const amz = new amazon();
        const url = await amz.getUrlArquivo(uuid);

        res.status(200).json({link:url});
    },

    async testeUploadGetUrl(req, res){
        const urlArquivo = req.query.urlArquivo;
        const amazon = require('../controllers/amazon');
        const amz = new amazon()
        const uuid = await amz.upload(urlArquivo); 
        const url = await amz.getUrlArquivo(uuid);

        res.status(200).json({link:url});
    }
}