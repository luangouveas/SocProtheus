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

async function consultarLotesParaPagar(){
    return new Promise(async (resolve, reject) => {
        try {
            var strSql = `SELECT distinct l.codLotePrestadorSoc, l.codPrestador, CONVERT(VARCHAR, l.DtPagamento, 103) AS DtPagamento, l.NumeroLote
            , REPLACE(REPLACE(REPLACE(l.CNPJPrestador,'.',''),'/',''),'-','') AS CNPJPrestador , CONVERT(VARCHAR, l.DtEmissaoDoc, 103) AS DtEmissaoDoc 
            , CAST(isnull((select sum(s.valorGlosado) as vlrGlosado from SocProtheus_servicoLotePrestadorSoc s where s.codLotePrestadorSoc = l.codLotePrestadorSoc),0) AS DECIMAL(10,2)) as valorGlosado 
            , p.estado as UFPrestador
            , l.codigoLote
            , CASE WHEN s.codServicoLotePrestadorSoc IS NOT NULL THEN 'SPM' ELSE 'SPS' END AS dscTipoSP
            , l.NumeroDoc as numNF 
            , CASE WHEN l.TipoPagamento = 1 THEN 'CREDITO EM CONTA' WHEN l.TipoPagamento = 2 THEN 'BOLETO' ELSE '' END AS dscTipoPagamento
            FROM SocProtheus_LotePrestadorSoc l 
            LEFT JOIN prestadorSoc p on p.codigoSoc = l.codPrestador 
            LEFT JOIN SocProtheus_servicoLotePrestadorSoc s on s.codServicoLotePrestadorSoc = ( SELECT TOP 1 codServicoLotePrestadorSoc FROM SocProtheus_servicoLotePrestadorSoc  
              WHERE codLotePrestadorSoc = l.codLotePrestadorSoc 
              AND codigoExame IS NOT NULL) 
            WHERE l.codPedidoComprasProtheus is null
            AND l.DtEmissaoDoc is not null
            AND l.DtPagamento is not null`;
            
            //console.log(strSql);

            const result = await sql.query(strSql);
            resolve(result);
        } catch (error) {
            reject('Erro ao buscar dados no banco: ' + error);
        }
    });
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
                        DtEmissaoDoc            : lote.DtEmissaoDoc  == '' ? null : lote.DtEmissaoDoc,
                        ValorDoc                : lote.ValorDoc      ,
                        DtPostagem              : lote.DtPostagem    == '' ? null : lote.DtPostagem,
                        DtRecebimento           : lote.DtRecebimento == '' ? null : lote.DtRecebimento,
                        PagarAte                : lote.PagarAte      == '' ? null : lote.PagarAte,
                        TipoPagamento           : lote.TipoPagamento ,
                        NumeroLote              : lote.NumeroLote    ,
                        StatusLote              : lote.StatusLote    ,
                        DtCriacaoLote           : lote.DtCriacaoLote == '' ? null : lote.DtCriacaoLote,
                        PagAntecipado           : lote.PagAntecipado ,
                        CPFPrestador            : lote.CPFPrestador  ,
                        CNPJPrestador           : lote.CNPJPrestador ,
                        CodigoBanco             : lote.CodigoBanco   ,
                        Banco                   : lote.Banco         ,
                        CodigoAgencia           : lote.CodigoAgencia ,
                        ContaCorrente           : lote.ContaCorrente ,
                        DtPagamento             : lote.DtPagamento   == '' ? null : lote.DtPagamento,
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

async function salvarExamesServicosLote(servico, codLotePrestadorSoc){
    return new Promise(async (resolve, reject) => {
        try {

            const now = new Date();
            const codigoLote = `${servico.COD_PRESTADOR}-${servico.NOME_LOTE}`;
            
            await db('SocProtheus_ServicoLotePrestadorSoc')
            .select()
            .where('nomeLote', codigoLote)
            .andWhere('codLotePrestadorSoc', codLotePrestadorSoc)
            .andWhere(function () {
                this.where(function () {
                    this.where('codigoExame', servico.COD_EXAME)
                    .andWhere('codSequencialFicha', servico.COD_SEQUENCIAL_FICHA);
                }).orWhere(function () {
                    this.where('codigoServico', servico.CODIGO_SERVICO)
                    .andWhere('condicao4', 'valor');
                });
            })

            .then(async function(rows){
                if(rows.length === 0){
                    await db('SocProtheus_LotePrestadorSoc')
                    .insert({           
                        codLotePrestadorSoc     :       codLotePrestadorSoc,
                        codPrestador            :       servico.COD_PRESTADOR,
                        CNPJPrestador           :       servico.CNPJ_PRESTADOR,
                        nomePrestador           :       servico.NOME_PRESTADOR,
                        DtEmissaoNF             :       servico.DATA_EMISSAO_NF,
                        DtPagamento             :       servico.DATA_PAGAMENTO,
                        numNF                   :       servico.NUMERO_NF,
                        dscObs                  :       servico.OBSERVACAO,
                        nomeLote                :       codigoLote,
                        numTaxaAdm              :       servico.TAXA_ADM,
                        codEmpresa              :       servico.COD_EMPRESA,
                        nomeEmpresa             :       servico.NOME_EMPRESA,
                        funcionario             :       servico.FUNCIONARIO,
                        codSequencialFicha      :       servico.COD_SEQUENCIAL_FICHA,
                        codigoExame             :       servico.COD_EXAME,
                        nomeExame               :       servico.NOME_EXAME,
                        DtResultadoExame        :       servico.DATA_RESULTADO_EXAME,
                        valorExame              :       servico.VALOR_EXAME,
                        valorGlosado            :       servico.VALOR_GLOSADO,
                        codigoServico           :       servico.CODIGO_SERVICO,
                        nomeServico             :       servico.NOME_SERVICO,
                        valorServico            :       servico.VALOR_SERVICO,
                        grupoFatura             :       servico.GRUPO_FATURA,
                        datInclusaoRegistro     :       now
                    })
                    /*.then(function(){
                        console.log("inseriu!");
                    })*/
                    .catch(function(ex) {
                        //console.log(servico)
                        reject("Erro: " + ex.message);
                    });  
                }
            })
            .catch((error) => {
                reject('Erro: ' + error);
            });  
        } catch (error) {
            reject('Erro ao tentar inserir dado no banco: ' + error);
        }  
    })
}

module.exports ={
    buscarDocumentosLoteSoc,
    inserirArquivoDigitalizadoAmazon,
    atualizarArquivoImportado,
    salvarArquivoGed,
    salvarLote,
    consultarLotesParaPagar,
    salvarExamesServicosLote
}