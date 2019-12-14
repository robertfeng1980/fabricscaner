/**

 Copyright ONECHAIN 2019-2021 All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 @Name：fabricscaner
 @Author：robert.feng(老冯)
 @Site：http://www.fabricscaner.com  https://www.blockchainbrother.com/
 @License：APACHE2.0

 */


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

