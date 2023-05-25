const {consumirSocGed} = require('./usecases/consumir-socged');
const {consumirLotesPendentes} = require('./usecases/consumir-lotes-pendentes');
const {consumirExamesDosLotes} = require('./usecases/consumir-exames-dos-lotes');

module.exports = {
    consumirSocGed          : consumirSocGed,
    consumirLotesPendentes  : consumirLotesPendentes,
    consumirExamesDosLotes  : consumirExamesDosLotes
}