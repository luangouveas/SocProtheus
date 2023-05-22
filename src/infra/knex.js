require('dotenv').config()
const createConnection = require('knex');
const { EventEmitter } = require('events');

const { DB_USER, DB_PWD, DB_NAME, DB_HOST } = process.env;

const config = {
    client: 'mssql',
    connection: {
      host: DB_HOST,
      user: DB_USER,
      password: DB_PWD,
      database: DB_NAME,
      timezone: 'America/Sao_Paulo'
    },
    useNullAsDefault: true 
};

const emitter = new EventEmitter();
emitter.setMaxListeners(20); // aumenta o limite de ouvintes para 20

const db = createConnection(config)

module.exports = { db }