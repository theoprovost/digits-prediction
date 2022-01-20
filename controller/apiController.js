const Prediction = require('../Prediction')

const apiController = {
    init: async (req, res) => {
        ({ pred_type, image_data = null } = req.body)

        pred = new Prediction(pred_type, image_data)
        await pred.init();

        pred = await pred.make()
        res.send(pred)
    },

    store: async (req, res) => {
        const user_pred = req.body.prediction.user_pred

        // Check is the user prediction is a valid one
        if (user_pred in [0, 1] || user_pred == -1) {
            const history = req.body
            history.prediction.pred_correct = history.prediction.y_pred == history.prediction.user_pred ? true : false

            // Save the prediction
            await Prediction.save(JSON.stringify(history))

            res.json({
                'status': 200,
                'message': 'OK'
            }).status(200)
        }
    }
}

module.exports = apiController