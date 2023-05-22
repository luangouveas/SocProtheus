require('dotenv').config();
const { format, subDays } = require('date-fns');
const exportaDadosWs = require('../../controllers/SOC/exportaDadosWs');
const db = require('../../infra/banco');
const { ED_FATURAMENTO_COD, ED_FATURAMENTO_CHAVE, ED_EMPRESA_PRINCIPAL } = process.env;

module.exports = {

    async consumirExamesDosLotes(){
        return new Promise((resolve, reject) => {
            console.log("#3 - Consumindo exames/serviços dos lotes pendentes de pagamento");
            const parametros = ``;

            await ret = 


        });
    }

}