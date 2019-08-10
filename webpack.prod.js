const merge = require('webpack-merge');
const dev = require('./webpack.dev');

module.exports = merge(dev, {
    mode: 'production'
});