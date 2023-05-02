const db = require('./db');

async function buscarDocumentosLoteSoc(malote){
    //const request = new db.Request()

    var strQuery = `select g.*, u.codArqDigitalizadoAmazon
     from gerenciador_Integracao.dbo.arquivoGed g
     left join MovimentoCredenciadoDocumentoDigitalizado u on u.codArquivoGed = g.codArquivoGed
     inner join gerenciador_integracao.dbo.lotePrestadorSoc l on l.codigoLote = g.NM_GED
     where g.NM_GED = '${malote}'`

    const result = await db.query(strQuery)
    
    //console.log(result.recordset)
    return result.recordset
}

module.exports = { buscarDocumentosLoteSoc }