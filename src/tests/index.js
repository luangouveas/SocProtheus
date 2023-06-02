const app = require('../agenda/app');
const db = require('../infra/conectarDB');

(async function() {

    await db.conectar()
        .then(async () => {
            //console.log("Conectou");
            //.then(async () => { await app.consumirExamesDosLotes() })
            //.then(async () => { await app.consumirExamesDosLotes() })
            await app.gerarPedidosDeCompra()
            .then(async () => {
                console.log("");
                console.log("Finalizou a aplicação com sucesso.");
            })
            .catch((error)=>{
                console.log("");
                console.log("Finalizou a aplicação com erro: ", error);
            });     
        })
        .catch((error) => {
            console.log("Erro de conexão no banco.");
        })    

})();