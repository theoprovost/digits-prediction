const Prediction = require('../Prediction')

const mainController = {
    index: (_, res) => {
        res.render('index')
    },

    stats: async (_, res) => {
        const data = await Prediction.fetch()
        console.log(data)
        res.render('stats', { data })
    },

    notFound: (_, res) => {
        res.send('404 - Not found')
    }
}

module.exports = mainController