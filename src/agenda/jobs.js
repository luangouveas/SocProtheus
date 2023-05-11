
gerarPedidoDeComprasJob = {
    name: 'gerarPedidoDeCompras',
    frequencia: '10 seconds', //3600s = 1h
    command: async(app) => {

        await app.consumirSocGed() 
        .then(async () => await app.consumirLotesPendentes())
        //.then(async () => await app.consumirExamesDosLotes())
        //.then(async () => await app.gerarPedidosDeCompras())
        .catch((error)=>{
            console.log(error);
        });        
    }
}

module.exports = { gerarPedidoDeComprasJob };