const axios = require('axios');
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

        const options = {
            headers : {
                'Accept-Encoding':'gzip,deflate',
                'SOAPAction':'',
                'Content-Type':'text/xml;charset=Utf-8'
            }
        }

        await axios.post(process.env.URL_SERVICE_EXPORTA_DADOS, montarXml(parametros), options)
            .then(function (response){
                //tratar esse data e devolver o objeto json com os arquivos a serem baixados
                const arquivos = response.data
                return arquivos;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    
}