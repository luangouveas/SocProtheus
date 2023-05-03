require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path')
const mime = require('mime')
const { S3Client, AbortMultipartUploadCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class amazon{
    constructor(){
        this.S3 = new S3Client({
            region : process.env.AWS_REGION,
            credentials: {
                accessKeyId : process.env.AWS_ACCESS_KEY,
                secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        this.bucket = process.env.AWS_BUCKET;
    }

    async upload(pathFile){
        return new Promise(async (resolve, reject) => {
            try {
                console.log('#6 - Realizando o upload do arquivo para a amazon');
        
                const uuid = uuidv4();
                const caminhoArquivoAmazon = 'arquivos/' + uuid;    
                const originalPath = path.resolve(__dirname, '..', '..', pathFile) ;
                const conteudoArquivo = await fs.promises.readFile(originalPath); 
                const contentType = mime.getType(originalPath);    
                
                // console.log('   uuid: ' + uuid);
                // console.log('   caminhoArquivoAmazon: ' + caminhoArquivoAmazon);
                // console.log('   originalPath: ' + originalPath);
                // console.log('   contentType: ' + contentType);

                const command = new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: caminhoArquivoAmazon,
                    Body: Buffer.from(conteudoArquivo),
                    ContentType: contentType
                });

                await this.S3.send(command).then(()=>{
                    resolve(uuid);
                });
                
            } catch (error) {
                //console.log(error)
                reject("Aconteceu um erro ao tentar realizar upload do arquivo para a Amazon.")
            }
        });
    }

    async getUrlArquivo(codGuidArqDigitalizadoAmazon){
        return new Promise(async(resolve, reject) => {
            try {
                console.log('#7 - Recuperando a url do arquivo na amazon');

                const caminhoArquivoAmazon = `arquivos/${codGuidArqDigitalizadoAmazon}`
                console.log('   caminhoArquivoAmazon: ' + caminhoArquivoAmazon);
                const command = new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: caminhoArquivoAmazon
                });
                
                await getSignedUrl(this.S3, command, { expiresIn: 3600 })
                .then((url)=>{
                    resolve(url);
                });
            } catch (error) {
                console.log(error);
                reject("Aconteceu um erro ao tentar recuperar a URL do arquivo");
            }
        });
        
    }
}

module.exports = amazon;