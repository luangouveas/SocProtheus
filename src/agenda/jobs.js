
gerarPedidoDeComprasJob = {
    name: 'gerarPedidoDeCompras',
    frequencia: '10 seconds', //3600s = 1h
    command: async(app) => {
        await app.consumirLotesPendentes();
    }
}

async function teste(){
    console.log('consumindo lotes...');
}

module.exports = { gerarPedidoDeComprasJob };