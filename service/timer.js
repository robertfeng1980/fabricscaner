var config = require('../config');
var bcexplorerservice = require('./bcexplorerservice');
// 创建web3对象
const {
    setIntervalAsync
} = require('set-interval-async/dynamic');




async function parserOrg(){


    bcexplorerservice.parserDefaultOrg();


}




setIntervalAsync(


    async () => {

        parserOrg();

    },

    config.spiderRate
)

