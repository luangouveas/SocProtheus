const axios = require('axios');
const { HOST_PEDIDO_COMPRAS, USER_PROTHEUS, PASS_PROTHEUS } = process.env;

const montarXml = function(lote){
    var xml = ``;

    return xml
} 

module.exports = {

    async criarPedidoDeCompras(lote){
        return new Promise(async(resolve, reject) => {

            const auth = "";

            const options = {
                headers : {
                    'SOAPAction': HOST_PEDIDO_COMPRAS + 'INCLUIPED',
                    'Connection':'Keep-Alive',
                    'Content-Type':'text/xml;charset=Utf-8',
                    'User-Agent':'Apache-HttpClient/4.1.1 (java 1.5)',
                    'Authorization':'Basic ' + auth
                }
            }

            await axios.post(HOST_PEDIDO_COMPRAS, montarXml(lote), options)
                .then((response) => {
                    console.log(response);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

}

