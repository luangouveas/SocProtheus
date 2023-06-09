require('dotenv').config()
const mssql = require('mssql')

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    } ,
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

async function conectar(){
    return new Promise(async (resolve, reject) => {
        try {
            await mssql.connect(sqlConfig);
            resolve();
        } catch (error) {
            reject(error);   
        }
    });
}

async function query(strQuery){
    //console.log(strQuery)
    await mssql.connect(sqlConfig)
    const result = await mssql.query(strQuery)
    return result
}

module.exports = { conectar, query }