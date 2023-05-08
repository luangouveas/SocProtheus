const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

const caminhoTemp = process.env.PATH_TEMP;

module.exports = {
    
    async salvarNovoZipTratado(caminhoArquivo, caminhoNovoArquivo){
        return new Promise(async (resolve, reject) => {
            try {
                console.log('#3 - salvando novo arquivo zip de ' + caminhoArquivo + ' para ' + caminhoNovoArquivo)
                // leia o arquivo zip como um buffer
                const buffer = fs.readFileSync(caminhoArquivo);
                        
                // encontre a posição do início da assinatura PK
                const index = buffer.indexOf(Buffer.from('504b0304', 'hex'));
            
                // crie um novo buffer a partir da posição encontrada
                const newBuffer = buffer.slice(index);
            
                // salve o novo buffer como um novo arquivo zip
                await fs.writeFileSync(caminhoNovoArquivo, newBuffer)
                resolve();
            } catch (error) {
                //console.log(error)
                reject("Aconteceu um erro ao gerar o novo arquivo zip");
            }
            
        });
    },

    async limparPastaTemporaria(){
        console.log('Limpando pasta temporaria: ' + caminhoTemp);

        return new Promise(async (resolve, reject) => {
            try {  
            
                fs.readdir(caminhoTemp, async (err, arquivos) => {
                    for (const arquivo of arquivos) {
                      await fs.unlink(path.join(caminhoTemp, arquivo), err => {
                        console.log(`Arquivo ${arquivo} removido com sucesso!`);
                      });
                    }
                });

                resolve();   
    
            } catch (error) {
                //console.log('ERRO:' + error);
                reject('Aconteceu um erro ao tentar limpar a pasta temporaria.');
            }  
        });       
    },

    async extrairArquivoDoZip(caminhoArquivoA, nomeAtualArquivo, arquivoFinal){
        return new Promise(async (resolve, reject) => {
            console.log('#4 - extraindo o arquivo do zip tratado');
            try {
                await fs.createReadStream(caminhoArquivoA)
                .pipe(unzipper.Parse())
                .on('entry', function(entry){
                    const fileName = entry.path;
                    if(fileName == nomeAtualArquivo){
                        entry.pipe(fs.createWriteStream(arquivoFinal))
                        .on('finish', () => {
                            console.log('#5 - Arquivo extraído e renomeado para ' + arquivoFinal)
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