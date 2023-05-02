const unzipper = require('unzipper');
const fs = require('fs');

module.exports = {
    
    async salvarNovoZipTratado(pathFile, novoPathFile){
        return new Promise(async (resolve, reject) => {
            try {
                console.log('#3 - salvando novo arquivo zip de ' + pathFile + ' para ' + novoPathFile)
                // leia o arquivo zip como um buffer
                const buffer = fs.readFileSync(pathFile);
                        
                // encontre a posição do início da assinatura PK
                const index = buffer.indexOf(Buffer.from('504b0304', 'hex'));
            
                // crie um novo buffer a partir da posição encontrada
                const newBuffer = buffer.slice(index);
            
                // salve o novo buffer como um novo arquivo zip
                await fs.writeFileSync(novoPathFile, newBuffer)
                resolve();
            } catch (error) {
                //console.log(error)
                reject("Aconteceu um erro ao gerar o novo arquivo zip");
            }
            
        });
    },

    async excluirArquivosDaPasta(pathFile){
        return await fs.unlink(pathFile)
    },

    async extrairArquivoDoZip(pathFile, nomeAtualArquivo, arquivoExtraido){
        return new Promise(async (resolve, reject) => {
            console.log('#4 - extraindo o arquivo do zip tratado');
            try {
                await fs.createReadStream(pathFile)
                .pipe(unzipper.Parse())
                .on('entry', function(entry){
                    const fileName = entry.path;
                    if(fileName == nomeAtualArquivo){
                        entry.pipe(fs.createWriteStream(arquivoExtraido))
                        .on('finish', () => {
                            console.log('#5 - Arquivo extraído e renomeado para ' + arquivoExtraido)
                            resolve();
                        })
                    }else {
                        entry.autodrain();
                    } 
                });        
            } catch (error) {
                reject("Aconteceu um erro ao tentar extrair o arquivo do zip")
            }
        });
    },
}