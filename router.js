const { Router } = require('express')
router = Router()

const mainController = require('./controller/mainController')
const apiController = require('./controller/apiController')

// Main
router.get('/', mainController.index)
router.get('/stats', mainController.stats)

// API
router.post('/init', apiController.init)
router.post('/store', apiController.store)

// Default fallback
router.get('*', mainController.notFound)

module.exports = router