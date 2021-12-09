const dfd = require('danfojs-node')
const tf = dfd.tf
const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const { v4: uuidv4 } = require('uuid')

const Model = require('./Model')
const db = require('./database/database')

class Prediction {
    constructor(pred_type, image_data) {
        this.id = uuidv4()
        this.pred_type = pred_type
        this.image_data = image_data || null

        this.DATASET_SHAPE = [100, 784]
        this.IMAGE_WIDTH = 28
        this.IMAGE_HEIGHT = 28
        this.IMAGE_CHANNELS = 1
    }

    async init() {
        const model = new Model()
        await model.init()
        this.model = model.CNN
    }

    generateRandomInt() {
        return Math.round(Math.random() * this.DATASET_SHAPE[0])
    }

    getDatum(image_index) {
        const _path = path.resolve(process.env.DATA_PATH) || path.resolve('../data/test.csv')

        return new Promise(function (resolve, _) {
            fs.createReadStream(_path)
                .pipe(csv.parse({
                    skipLines: image_index - 1,
                    maxRows: 1
                }))
                .on('data', data => {
                    resolve(data)
                })
        })
    }

    reshapeImage(array_1D) {
        const tmp = []
        while (array_1D.length) tmp.push(array_1D.splice(0, this.IMAGE_WIDTH))
        return tmp
    }

    async make() {
        let X, random_int, image_data_1D

        if (this.image_data === null) { // If not image provided
            random_int = this.generateRandomInt()
            await this.getDatum(random_int).then(data => {
                X = tf.tensor(data, [1, 28, 28, 1], 'float32')
                image_data_1D = data
            })

        } else { // If free drawing image is provided
            X = tf.tensor(this.image_data).reshape([1, 28, 28, 1])
            image_data_1D = null
        }

        const y_pred_tensor = this.model.predict(X),
            y_pred = y_pred_tensor.dataSync().indexOf(1)

        console.log(`Prediction [${this.id} of type ${this.pred_type}] - y_pred = ${y_pred}`)

        return {
            'image': {
                'id': random_int || this.id,
                'data': {
                    '1D': image_data_1D
                },
                'width': this.IMAGE_WIDTH,
                'height': this.IMAGE_HEIGHT
            },
            'prediction': {
                'id': this.id,
                'pred_type': this.pred_type,
                'y_pred': y_pred,
                'user_pred': null
            }
        }
    }

    static async save(history) {
        const query = await db.query(`INSERT INTO records(record) VALUES ($1);`,
            [history])

        if (query.rowCount) {
            return true
        } else return false
    }

    static async fetch() {
        const data = await db.query('SELECT * FROM records')

        if (data.rowCount) {
            return data.rows
        } else return false
    }
}

module.exports = Prediction