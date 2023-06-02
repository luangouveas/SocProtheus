const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const montarXml = function(parametros){
    var xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.soc.age.com/">
            <soapenv:Header/>
            <soapenv:Body>
            <ser:exportaDadosWs>
                <arg0>
                    <parametros>
                        ${parametros}
                    </parametros>
                </arg0>
            </ser:exportaDadosWs>
        </soapenv:Body>
        </soapenv:Envelope>`;

    return xml
} 

module.exports = {
    
    async consumirExportaDados(parametros){

        return new Promise( async(resolve, reject) => {
            const options = {
                headers : {
                    'Accept-Encoding':'gzip,deflate',
                    'SOAPAction':'',
                    //'Content-Type':'text/xml;charset=Utf-8'
                }
            }
            
            await axios.post(process.env.URL_SERVICE_EXPORTA_DADOS + parametros, options)
                .then(function (response){
                    //xml2js.parseString(response.data, (err, result) => {
                        //const ret = result['soap:Envelope']['soap:Body'][0]['ns2:exportaDadosWsResponse'][0]['return'][0]['retorno'][0];
                        //console.log(response.data);
                        resolve(response.data);
                    //});                    
                })
                .catch(function (error) {
                    reject("Ocorreu um erro ao tentar processar exporta dados: " + parametros + ": " + error);
                })
        });
        
    }
    
}