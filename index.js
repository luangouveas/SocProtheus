const db = require('./infra/db')
const api = require('./api')

db.conectar();

module.exports = {db, api}