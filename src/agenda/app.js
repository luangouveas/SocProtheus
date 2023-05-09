const {consumirSocGed} = require('./usecases/consumir-socged');
const {consumirLotesPendentes} = require('./usecases/consumir-lotes-pendentes');

module.exports = {
    consumirSocGed : consumirSocGed,
    consumirLotesPendentes : consumirLotesPendentes
}