require('dotenv').config();

const axios = require('axios');
const fs = require('fs');

const leitura = require('../../infra/leituraBanco');
const amazon = require('../amazon');
const Util = require('../../Util/Util');

//variaveis
const pathFile = './src/temp/arquivo.zip';
const novoPathFile = './src/temp/arquivo1.zip';
const pathDestino = './src/temp/';

const montarXml = async function (doc){

    var xmlHeader = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.soc.age.com/">`;

    await axios.get('https://www.rhmed.com.br/evidamed/web/soc/index.asp?action=gerarheader')
    .then(async (response) => {
        xmlHeader = xmlHeader + response.data;
       // console.log(response)
    })  
    
    var xml = xmlHeader + `
            <soapenv:Body>
            <ser:downloadArquivosGedPorLote>
                <downloadPorLote>
                <identificacaoWsVo>
                    <codigoEmpresaPrincipal>${doc.CD_EMPRESA}</codigoEmpresaPrincipal>
                    <codigoResponsavel>199759</codigoResponsavel>
                    <codigoUsuario>1258906</codigoUsuario>
                </identificacaoWsVo>
                <codigoEmpresa>${doc.CD_EMPRESA}</codigoEmpresa>
                <codigosArquivosGed>${doc.CD_ARQUIVO_GED}</codigosArquivosGed>
                <codigoGed>${doc.CD_GED}</codigoGed>
                </downloadPorLote>
            </ser:downloadArquivosGedPorLote>
            </soapenv:Body>
        </soapenv:Envelope>`;

    return xml;
} 

async function baixarArquivoSocGed(xml){
    return new Promise((resolve, reject) => {

        const options = {
            headers : {
                'Accept-Encoding':'gzip,deflate',
                'SOAPAction':'',
                'Content-Type':'text/xml;charset=Utf-8'
            }
        }
        console.log('#2 - baixando o arquivo do webservice')
        axios({
            url: process.env.URL_SERVICE_DOWNLOAD_ARQUIVOS,
            method: 'POST',
            data: xml,
            headers: options.headers,
            responseType: 'stream'
        }).then((response) => {
            //console.log(response)
            response.data.pipe(fs.createWriteStream(pathFile)).on('finish', () => {
                setTimeout(() => {
                    resolve();
                }, 5000);
            })
        }).catch((error) => {
            //console.log(error);
            reject("Aconteceu um erro inesperado ao tentar baixar o arquivo do webservice SOC");
        }); 
    });
}

module.exports = {

    async buscarArquivosMalote(malote){
        return new Promise (async (resolve, reject) => {
            try {
                const arquivos = [];
                const documentos = await leitura.buscarDocumentosLoteSoc(malote);
                const amz = new amazon();
    
                for (let i = 0; i < documentos.length; i++) {
                    const doc = documentos[i];
                
                    if (!doc.codArqDigitalizadoAmazon){ //console.log('nao ta na amazon')
                        
                        const nomeAtualArquivo = doc.NM_ARQUIVOS_GED;
                        const ext = nomeAtualArquivo.split('.').pop();;
                        const nomeFinalArquivo = doc.CD_GED + doc.CD_ARQUIVO_GED + '.' + ext;
    
                        const arquivoExtraido = pathDestino + nomeFinalArquivo
    
                        console.log('#0 - Gerando xml')
                        const xml = await montarXml(doc);
                        
                        console.log('#1 - Chamando web service')

                        await baixarArquivoSocGed(xml)
                        .then(async () => await Util.salvarNovoZipTratado(pathFile, novoPathFile))
                        .then(async () => await Util.extrairArquivoDoZip(novoPathFile, nomeAtualArquivo, arquivoExtraido))
                        .then(async () => await amz.upload(arquivoExtraido))
                        .then(async (uuid) => { 
                            const url = await amz.getUrlArquivo(uuid);
                            
                            arquivos.push({
                                nome : doc.NM_ARQUIVOS_GED,
                                caminho : url
                            });

                            //...inserir o arquivo digitalizado na tabela ArquivoDigitalizadoAmazon
                            //...inserir o arquivo na tabela MovimentoCredenciadoDocumentoDigitalizado
                        })
                        .then(async () => {
                            await Util.excluirArquivosDaPasta(pathDestino);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    }//else{ //console.log('ta na amazon');
                     //   urlArquivo = await amz.getUrlArquivo(doc.codArqDigitalizadoAmazon)
                    //}       
                }
                
                resolve(arquivos);

            } catch (error) {
                console.log(error);
                reject("Houve um erro inesperado!");
            }
        });
        
        

        
    }

}