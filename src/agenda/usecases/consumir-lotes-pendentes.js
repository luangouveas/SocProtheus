require('dotenv').config();
const exportaDadosWs = require('../../controllers/SOC/exportaDadosWs');

const { ED_LOTES_COD, ED_LOTES_CHAVE } = process.env;

//const parametros = "{'empresa':'414531','codigo':'"+ ED_LOTES_COD + "','chave':'"+ ED_LOTES_CHAVE + "','tipoSaida':'xml','codigoPrestador':'"+codigoPrestador+"','cnpjPrestador':'','cpfPrestador':'','numeroLote':'"+numeroLote+"'" +
//",'numeroDoc':'','dataInicial':'" + dataInicial + "', 'dataFinal':'"+ dataFinal.ToString("dd/MM/yyyy") + "','statusLote':'3'}";

module.exports = {

    async consumirLotesPendentes(){
        //await exportaDadosWs.consumirExportaDados(parametros);
    }

}