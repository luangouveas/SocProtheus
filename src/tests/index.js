const app = require('../agenda/app');

(async function() {

    await app.consumirSocGed() 
        .then(async () => await app.consumirLotesPendentes())
        .then(async () => await app.consumirExamesDosLotes())
        .then(async () => await app.gerarPedidosDeCompras())
        .then(async () => {
            console.log("");
            console.log("Finalizou a aplicação com sucesso.");
        })
        .catch((error)=>{
            console.log("");
            console.log("Finalizou a aplicação com erro: ", error);
        });     

})();