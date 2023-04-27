const express = require('express')
const routes = require('./router')

const app = express()
app.use(routes)
app.listen(3000)  

module.exports = app