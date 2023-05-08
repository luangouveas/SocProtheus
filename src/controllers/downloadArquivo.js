require('dotenv').config();
const downloadArquivoWs = require('./SOC/downloadArquivoWs');
const db = require('../infra/banco');
const amazon = require('./amazon');
const Util = require('../Util/Util');

const caminhoArquivo = process.env.PATH_FILE;
const caminhoNovoArquivo = process.env.NOVO_PATH_FILE;
const caminhoTemp = process.env.PATH_TEMP;

module.exports = {

    async buscarArquivosMalote(malote){
        return new Promise (async (resolve, reject) => {
            try {
                const arquivos = [];
                const documentos = await db.buscarDocumentosLoteSoc(malote);
                const amz = new amazon();
    
                for (let i = 0; i < documentos.length; i++) {
                    const doc = documentos[i];

                    console.log(doc.NM_ARQUIVOS_GED);
                
                    if (!doc.codArqDigitalizadoAmazon){ //console.log('nao ta na amazon')
                        
                        const nomeAtualArquivo = doc.NM_ARQUIVOS_GED;
                        const ext = nomeAtualArquivo.split('.').pop();;
                        const nomeFinalArquivo = doc.CD_GED + doc.CD_ARQUIVO_GED + '.' + ext;
    
                        const arquivoFinal = caminhoTemp + nomeFinalArquivo;
    
                        console.log('#0 - Gerando xml')
                        const xml = await downloadArquivoWs.montarXml(doc);
                        
                        console.log('#1 - Chamando web service')

                        await downloadArquivoWs.baixarArquivoSocGed(xml)
                        .then(async () => await Util.salvarNovoZipTratado(caminhoArquivo, caminhoNovoArquivo))
                        .then(async () => await Util.extrairArquivoDoZip(caminhoNovoArquivo, nomeAtualArquivo, arquivoFinal))
                        .then(async () => await amz.upload(arquivoFinal))
                        .then(async (uuid) => { 
                            
                            const url = await amz.getUrlArquivo(uuid);
                            
                            arquivos.push({
                                nome : doc.NM_ARQUIVOS_GED,
                                caminho : url
                            });

                            const codArqDigitalizadoAmazon = await db.inserirArquivoDigitalizadoAmazon(uuid);
                            const result = await db.atualizarArquivoImportado(doc, codArqDigitalizadoAmazon);
                        })
                        .then(async () => await Util.limparPastaTemporaria())
                        .catch((error) => {
                            reject(error);
                        });
                    }else{ //console.log('ta na amazon');
                        const url = await amz.getUrlArquivo(doc.codGuidArqDigitalizadoAmazon);
                        
                        arquivos.push({
                            nome : doc.NM_ARQUIVOS_GED,
                            caminho : url
                        });
                    }       
                }
                
                resolve(arquivos);

            } catch (error) {
                console.log(error);
                reject("Houve um erro inesperado!");
            }
        });
    }

}