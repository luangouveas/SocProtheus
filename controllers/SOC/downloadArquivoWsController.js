const axios = require('axios');
const fs = require('fs');
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

const  salvarNovoZipTratado = function(pathFile, novoPathFile){
    // leia o arquivo zip como um buffer
    const buffer = fs.readFileSync(pathFile);
            
    // encontre a posição do início da assinatura PK
    const index = buffer.indexOf(Buffer.from('504b0304', 'hex'));

    // crie um novo buffer a partir da posição encontrada
    const newBuffer = buffer.slice(index);

    // salve o novo buffer como um novo arquivo zip
    fs.writeFileSync(novoPathFile, newBuffer);
}

const extrairArquivoDoZip = function(pathFile, pathDestino, nomeAtualArquivo, nomeFinalArquivo){
   // Extrai o arquivo zip
   fs.createReadStream(pathFile)
    .pipe(unzipper.Parse())
    .on('entry', function(entry){
        const fileName = entry.path;
        if(fileName == nomeAtualArquivo){
            entry.pipe(fs.createWriteStream(pathDestino + nomeFinalArquivo))
            .on('finish', () => console.log('Arquivo extraído e renomeado para ' + nomeFinalArquivo))
        }else {
            entry.autodrain();
        }
    });
}

const uploadAmazon = function(){

}

module.exports = {

    async baixarArquivos(malote){
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
        var xml = montarXml(req);

        const options = {
            headers : {
                'Accept-Encoding':'gzip,deflate',
                'SOAPAction':'',
                'Content-Type':'text/xml;charset=Utf-8'
            }
        }

        let pathFile = './files/arquivo.zip';
        let novoPathFile = './files/arquivo1.zip';
        let pathDestino = './files/';

        axios({
            url: process.env.URL_SERVICE_DOWNLOAD_ARQUIVOS,
            method: 'POST',
            data: xml,
            headers: options.headers,
            responseType: 'stream',
        }).then((response) => {
            response.data.pipe(fs.createWriteStream(pathFile));
        }).catch((error) => {
            console.error(error);
        });

        salvarNovoZipTratado(pathFile, novoPathFile);

        const nomeAtualArquivo = 'Pedido_de_Exame_Ariane_Nun_12022019.pdf';
        const nomeFinalArquivo = 'nome_novo.pdf';

        extrairArquivoDoZip(novoPathFile, pathDestino, nomeAtualArquivo, nomeFinalArquivo)

        
        return 'arquivos'
    }

}