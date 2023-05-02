require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

module.exports = {

    async uploadAmazon(pathFile){
        console.log('#6 - realizando o upload do arquivo para a amazon')
        const uuid = uuidv4()
        const codGuidArqDigitalizadoAmazon = 'arquivos/' + uuid     
        console.log("codGuidArqDigitalizadoAmazon: " + codGuidArqDigitalizadoAmazon)
    },

    async recuperarLinkAmazon(uuid){

    }

}