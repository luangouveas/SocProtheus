const express = require('express');

const apiController = require('./controllers/apiController');

const routes = express.Router()

routes.get('/buscarArquivosMalote', apiController.buscarArquivosMalote)

routes.get('/status', (req, res) => {
    res.status(200).json({Status: "API online"})
})

module.exports = routes