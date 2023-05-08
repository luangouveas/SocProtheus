const sql = require('./conectarDB');

async function buscarDocumentosLoteSoc(malote){
    //const request = new db.Request()

    var strQuery = `select g.*, amz.codGuidArqDigitalizadoAmazon
    from SocProtheus_ArquivoGed g 
    left join SocProtheus_ArquivoDigitalizadoAmazon amz on amz.codArqDigitalizadoAmazon = g.codArqDigitalizadoAmazon
    where g.NM_GED = '${malote}'`

    const result = await sql.query(strQuery)
    
    //console.log(result.recordset)
    return result.recordset
}

async function inserirArquivoDigitalizadoAmazon(codGuidArqDigitalizadoAmazon){
    var strSql = ` insert into SocProtheus_ArquivoDigitalizadoAmazon(datInclusao, codGuidArqDigitalizadoAmazon)
    OUTPUT inserted.codArqDigitalizadoAmazon
    values(GETDATE(), '${codGuidArqDigitalizadoAmazon}')`

    //console.log(strSql);

    const result = await sql.query(strSql);

    return result.recordset[0].codArqDigitalizadoAmazon;
}

async function atualizarArquivoImportado(doc, codArqDigitalizadoAmazon){
    var strSql = ` update SocProtheus_ArquivoGed set codArqDigitalizadoAmazon = ${codArqDigitalizadoAmazon} 
    where codArquivoGed = ${doc.codArquivoGed}`

    const result = await sql.query(strSql);

    //console.log(result);
    return result;
}

module.exports = { 
    buscarDocumentosLoteSoc,
    inserirArquivoDigitalizadoAmazon,
    atualizarArquivoImportado
}