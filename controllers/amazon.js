require('dotenv').config()
const { S3 } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'sa-east-1'
});

module.exports = {

    async uploadAmazon(pathFile){
        const uuid = uuidv4()
        const codGuidArqDigitalizadoAmazon = 'arquivos/' + uuid

        console.log('codGuidArqDigitalizadoAmazon: ', codGuidArqDigitalizadoAmazon)
        console.log('pathFile: ', pathFile)

        /*const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: codGuidArqDigitalizadoAmazon,
            Body: fs.readFileSync(pathFile)
          };
          
          S3.upload(params, function(err, data) {
            if (err) {
              console.log('Erro ao fazer upload do arquivo: ', err);
            } else {
              console.log('Upload do arquivo concluído. Localização: ', data.Location);
              return codGuidArqDigitalizadoAmazon
            }
          });*/
          
        
    },

    async recuperarLinkAmazon(uuid){

    }

}