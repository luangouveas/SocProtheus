const express = require('express');

const apiController = require('./controllers/apiController');

const routes = express.Router()

routes.post('/consumirArquivos', apiController.baixarArquivos)

routes.get('/status', (req, res) => {
    res.status(200).json({Status: "API online"})
})

module.exports = routes