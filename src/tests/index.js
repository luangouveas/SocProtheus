const app = require('../agenda/app');

(async function() {

    await app.consumirSocGed() 
        .then(async () => await app.consumirLotesPendentes())
        .then(async () => await app.consumirExamesDosLotes())
        //.then(async () => await app.gerarPedidosDeCompras())
        .catch((error)=>{
            console.log(error);
        });     

})();