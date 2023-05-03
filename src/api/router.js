const express = require('express');

const apiController = require('../controllers/apiController');

const routes = express.Router()

routes.get('/buscarArquivosMalote', apiController.buscarArquivosMalote)
routes.get('/testeUpload', apiController.testeUpload)
routes.get('/testeRecuperarUrl', apiController.testeRecuperarUrl)
routes.get('/testeUploadGetUrl', apiController.testeUploadGetUrl)

routes.get('/status', (req, res) => {
    res.status(200).json({Status: "API online"})
})

module.exports = routes