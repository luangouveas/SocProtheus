require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const unzipper = require('unzipper');
const leitura = require('../../infra/leituraBanco');
const amazon = require('../amazon');

const pathFile = './temp/arquivo.zip';
const novoPathFile = './temp/arquivo1.zip';
const pathDestino = './temp/';

const montarXml = async function(doc){

    var xmlHeader = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://services.soc.age.com/">`;

    await axios.get('https://www.rhmed.com.br/evidamed/web/soc/index.asp?action=gerarheader')
    .then(async (response) => {
        xmlHeader = xmlHeader + response.data;
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

    return xml
} 

const baixarArquivoSocGed = async function(doc){
    var xml = await montarXml(doc);
    //console.log(xml)
    const options = {
        headers : {
            'Accept-Encoding':'gzip,deflate',
            'SOAPAction':'',
            'Content-Type':'text/xml;charset=Utf-8'
        }
    }

    axios({
        url: process.env.URL_SERVICE_DOWNLOAD_ARQUIVOS,
        method: 'POST',
        data: xml,
        headers: options.headers,
        responseType: 'stream',
    }).then( async (response) => {
        response.data.pipe(fs.createWriteStream(pathFile));

        //trocar para que execute o restante apenas quando o arquivo estiver criado
        setTimeout(async function() {
            await salvarNovoZipTratado(pathFile, novoPathFile);

            const nomeAtualArquivo = doc.NM_ARQUIVOS_GED;
            const ext = nomeAtualArquivo.split('.').pop();;
            const nomeFinalArquivo = doc.CD_GED + doc.CD_ARQUIVO_GED + '.' + ext;

            await extrairArquivoDoZip(novoPathFile, pathDestino, nomeAtualArquivo, nomeFinalArquivo)

            const arquivoBaixado = pathDestino + nomeFinalArquivo
            console.log(arquivoBaixado)

            return arquivoBaixado
        }, 3000);  

    }).catch((error) => {
        console.error(error);
    }); 
}

const salvarNovoZipTratado = async function(pathFile, novoPathFile){
    // leia o arquivo zip como um buffer
    const buffer = fs.readFileSync(pathFile);
            
    // encontre a posição do início da assinatura PK
    const index = buffer.indexOf(Buffer.from('504b0304', 'hex'));

    // crie um novo buffer a partir da posição encontrada
    const newBuffer = buffer.slice(index);

    // salve o novo buffer como um novo arquivo zip
    await fs.writeFileSync(novoPathFile, newBuffer);
}

const extrairArquivoDoZip = async function(pathFile, pathDestino, nomeAtualArquivo, nomeFinalArquivo){
   // Extrai o arquivo zip
   await fs.createReadStream(pathFile)
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

const limparPastaTemporaria = async function(){
   // await fs.unlink(pathFile)
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
        const documentos = await leitura.buscarDocumentosLoteSoc(malote);
        //console.log(documentos)

        for (let i = 0; i < documentos.length; i++) {
            const doc = documentos[i];
            //console.log(doc)
        
            if (!doc.codArqDigitalizadoAmazon){
                //console.log('nao ta na amazon')

                const arquivoBaixado = await baixarArquivoSocGed(doc)
                
                doc.codArqDigitalizadoAmazon = await amazon.uploadAmazon(pathFile, arquivoBaixado)

                //...inserir o arquivo digitalizado na tabela ArquivoDigitalizadoAmazon
                //...inserir o arquivo na tabela MovimentoCredenciadoDocumentoDigitalizado
                //await limparPastaTemporaria()

            }else{
                //console.log('ta na amazon');
            }

            /*
            const linkArquivoAmazon = await amazon.recuperarLinkAmazon(doc.codArqDigitalizadoAmazon)
            */

            
            arquivos.push({
                nome : doc.NM_ARQUIVOS_GED,
                caminho : 'linkArquivoAmazon'
            })
           
        }

        return arquivos
    }

}