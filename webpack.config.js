const discountCodeExample = require('./modules/discount-code/webpack.config');
const splitExample = require('./modules/discount-redemption-split/webpack.config');
const journeyLogger = require('./modules/journey-logger/webpack.config');

module.exports = function(env, argv) {
    return [
        discountCodeExample(env, argv),
        splitExample(env, argv),
        journeyLogger(env, argv)
    ];
};
