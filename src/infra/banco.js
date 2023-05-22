const sql = require('./conectarDB');
const { db } = require('./knex');

async function buscarDocumentosLoteSoc(malote){
    //const request = new db.Request()

    var strQuery = `select g.*, amz.codGuidArqDigitalizadoAmazon
    from SocProtheus_ArquivoGed g 
    left join ArquivoDigitalizadoAmazon amz on amz.codArqDigitalizadoAmazon = g.codArqDigitalizadoAmazon
    where g.NM_GED = '${malote}'`

    const result = await sql.query(strQuery)
    
    //console.log(result.recordset)
    return result.recordset
}

async function inserirArquivoDigitalizadoAmazon(codGuidArqDigitalizadoAmazon){
    var strSql = ` insert into ArquivoDigitalizadoAmazon(datInclusao, codGuidArqDigitalizadoAmazon)
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

async function salvarArquivoGed(arquivoGed){
    return new Promise(async (resolve, reject) => {
        try {
            const now = new Date();

            await db('SocProtheus_ArquivoGed')
            .select()
            .where('CD_GED', arquivoGed.CD_GED)
            .andWhere('CD_ARQUIVO_GED', arquivoGed.CD_ARQUIVO_GED)
            .then(function(rows){
                if(rows.length === 0){
                    db('SocProtheus_ArquivoGed')
                    .insert({
                        CD_EMPRESA                  : arquivoGed.CD_EMPRESA,
                        CD_UNIDADE                  : arquivoGed.CD_UNIDADE,
                        CD_GED                      : arquivoGed.CD_GED,
                        NM_GED                      : arquivoGed.NM_GED,
                        DT_VALIDADE                 : arquivoGed.DT_VALIDADE,
                        DT_EMISSAO                  : arquivoGed.DT_EMISSAO,
                        IC_CRIADO_SOCNET            : arquivoGed.IC_CRIADO_SOCNET,
                        CD_FUNCIONARIO              : arquivoGed.CD_FUNCIONARIO,
                        DATAFICHA                   : arquivoGed.DATAFICHA,
                        TIPOFICHA                   : arquivoGed.TIPOFICHA,
                        CD_ARQUIVO_GED              : arquivoGed.CD_ARQUIVO_GED,
                        NM_ARQUIVOS_GED             : arquivoGed.NM_ARQUIVOS_GED,
                        IC_ASSINADO_DIGITALMENTE    : arquivoGed.IC_ASSINADO_DIGITALMENTE,
                        CD_TIPO_GED                 : arquivoGed.CD_TIPO_GED,
                        SEQUENCIAL_FICHA            : arquivoGed.SEQUENCIAL_FICHA,
                        NOME_FUNCIONARIO            : arquivoGed.NOME_FUNCIONARIO,
                        CPF_FUNCIONARIO             : arquivoGed.CPF_FUNCIONARIO,
                        MATRICULA_FUNCIONARIO       : arquivoGed.MATRICULA_FUNCIONARIO,
                        UNIDADE                     : arquivoGed.UNIDADE,
                        DT_UPLOAD_ARQUIVO           : arquivoGed.DT_UPLOAD_ARQUIVO,
                        OBSERVACAO                  : arquivoGed.OBSERVACAO,
                        HR_UPLOAD_ARQUIVO           : arquivoGed.HR_UPLOAD_ARQUIVO,
                        datInclusaoRegistro         : now,
                        codArqDigitalizadoAmazon    : null
                    })
                    .catch(function(ex) {
                        console.log("Erro: " + ex.message)
                        //reject("Erro: " + ex.message);
                    })
                }
            });

            resolve();

        } catch (error) {
            //console.error('Erro ao tentar inserir dado no banco: '+ error);
            reject('Erro ao tentar inserir dado no banco: ' + error);
        }
    }); 
    
}

async function salvarLote(lote){
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(lote);

            const now = new Date();
            const codigoLote = `${lote.CodPrestador}-${lote.NumeroLote}`;

            await db('SocProtheus_LotePrestadorSoc')
            .select()
            .where('codigoLote', codigoLote)
            .then(async function(rows){
                if(rows.length === 0){
                    await db('SocProtheus_LotePrestadorSoc')
                    .insert({           
                        codPrestador            : lote.CodPrestador  ,
                        nomePrestador           : lote.NomePrestador ,
                        RazaoSocial             : lote.RazaoSocial   ,
                        TipoPessoa              : lote.TipoPessoa    ,
                        EmailPrestador          : lote.EmailPrestador,
                        NumeroDoc               : lote.NumeroDoc     ,
                        DtEmissaoDoc            : lote.DtEmissaoDoc  ,
                        ValorDoc                : lote.ValorDoc      ,
                        DtPostagem              : lote.DtPostagem    ,
                        DtRecebimento           : lote.DtRecebimento ,
                        PagarAte                : lote.PagarAte      ,
                        TipoPagamento           : lote.TipoPagamento ,
                        NumeroLote              : lote.NumeroLote    ,
                        StatusLote              : lote.StatusLote    ,
                        DtCriacaoLote           : lote.DtCriacaoLote ,
                        PagAntecipado           : lote.PagAntecipado ,
                        CPFPrestador            : lote.CPFPrestador  ,
                        CNPJPrestador           : lote.CNPJPrestador ,
                        CodigoBanco             : lote.CodigoBanco   ,
                        Banco                   : lote.Banco         ,
                        CodigoAgencia           : lote.CodigoAgencia ,
                        ContaCorrente           : lote.ContaCorrente ,
                        DtPagamento             : lote.DtPagamento   ,
                        datInclusaoRegistro     : now,
                        codStatusAprovacaoFluig : 1,
                        codigoLote              : codigoLote
                    })
                    /*.then(function(){
                        console.log("inseriu!");
                    })*/
                    .catch(function(ex) {
                        //console.log("Erro ao inserir o " + lote.NumeroLote + ': ' + ex.message)
                        //console.log(lote)
                        reject("Erro: " + ex.message);
                    });
                }

                resolve();
            })
            .catch((error) => {
                reject('Erro: ' + error);
            });          

        } catch (error) {
            reject('Erro ao tentar inserir dado no banco: ' + error);
        }
    });
}

module.exports = { 
    buscarDocumentosLoteSoc,
    inserirArquivoDigitalizadoAmazon,
    atualizarArquivoImportado,
    salvarArquivoGed,
    salvarLote
}