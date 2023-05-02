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
        /*  
            precisa consultar a lista de arquivos desse lote
            realizar um loop para cada arquivo
            validar se o arquivo ja existe na amazon
                senao 
                    baixar o arquivo
                    upload para a amazon
            recuperar o link do arquivo na amazon
            incrementar a lista de retorno com nome e link de cada arquivo
            retornar lista de arquivos            
        */

        const arquivos = []

        return new Promise (async (resolve, reject) => {
            try {
            
                const documentos = await leitura.buscarDocumentosLoteSoc(malote);
                //console.log(documentos)
    
                for (let i = 0; i < documentos.length; i++) {
                    const doc = documentos[i];
                    //console.log(doc)
                
                    if (!doc.codArqDigitalizadoAmazon){ //console.log('nao ta na amazon')
                        
                        const nomeAtualArquivo = doc.NM_ARQUIVOS_GED;
                        const ext = nomeAtualArquivo.split('.').pop();;
                        const nomeFinalArquivo = doc.CD_GED + doc.CD_ARQUIVO_GED + '.' + ext;
    
                        const arquivoExtraido = pathDestino + nomeFinalArquivo
    
                        console.log('#0 - gerando xml')
                        const xml = await montarXml(doc);
                        
                        console.log('#1 - chamando web service')
                        await baixarArquivoSocGed(xml)
                        .then(async () => await Util.salvarNovoZipTratado(pathFile, novoPathFile))
                        .then(async () => await Util.extrairArquivoDoZip(novoPathFile, nomeAtualArquivo, arquivoExtraido))
                        //.then(async () => await amazon.uploadAmazon(arquivoExtraido))
                        .catch((error)=>{
                            reject(error)
                        })
    
                        //...inserir o arquivo digitalizado na tabela ArquivoDigitalizadoAmazon
                        //...inserir o arquivo na tabela MovimentoCredenciadoDocumentoDigitalizado
                        //await limparPastaTemporaria()
    
                    }else{ //console.log('ta na amazon');
                        
                    }
    
                    // const linkArquivoAmazon = await amazon.recuperarLinkAmazon(doc.codArqDigitalizadoAmazon)
            
                    arquivos.push({
                        nome : doc.NM_ARQUIVOS_GED,
                        caminho : 'linkArquivoAmazon'
                    })           
                }
                
                resolve(arquivos);
            } catch (error) {
                reject("Houve um erro inesperado!");
            }
        });
        
        

        
    }

}