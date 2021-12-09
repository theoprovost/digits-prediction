const path = require('path')
const dfd = require('danfojs-node')
const tf = dfd.tf

class Model {
    constructor() { }

    async init() {
        this.CNN = await this.loadModel()
    }

    async loadModel() {
        const _path = path.resolve('../CNN/CNN_JS/model.json')
        return await tf.loadLayersModel('file://' + _path)
    }
}

module.exports = Model