require('dotenv').config();
const axios = require('axios');
const fs = require('fs');


const caminhoArquivo = process.env.PATH_FILE;

module.exports = {

    async montarXml(param){

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
                        <codigoEmpresaPrincipal>${param.CD_EMPRESA}</codigoEmpresaPrincipal>
                        <codigoResponsavel>199759</codigoResponsavel>
                        <codigoUsuario>1258906</codigoUsuario>
                    </identificacaoWsVo>
                    <codigoEmpresa>${param.CD_EMPRESA}</codigoEmpresa>
                    <codigosArquivosGed>${param.CD_ARQUIVO_GED}</codigosArquivosGed>
                    <codigoGed>${param.CD_GED}</codigoGed>
                    </downloadPorLote>
                </ser:downloadArquivosGedPorLote>
                </soapenv:Body>
            </soapenv:Envelope>`;
    
        return xml;
    },
    
    async baixarArquivoSocGed(xml){
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
                response.data.pipe(fs.createWriteStream(caminhoArquivo)).on('finish', () => {
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

}