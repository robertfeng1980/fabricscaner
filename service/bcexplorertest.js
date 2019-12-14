/*
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
 */


var bcexplorerservice = require('./bcexplorerservice');


/*
var orgnamemap = bcexplorerservice.ORGNAMEMAP;

console.info(  JSON.stringify( orgnamemap ) );*/


//bcexplorerservice.testfunc('org1');

//bcexplorerservice.parserOrg('Org1MSP');
//bcexplorerservice.startUp();

bcexplorerservice.parserDefaultOrg();
//bcexplorerservice.get_fabric_channel_struct('mytestchannel4org1andorg21');

//bcexplorerservice.get_fabric_network_struct();



//注册异常处理器
process.on('unhandledRejection', function (err) {
    console.error(err.stack);
});

process.on(`uncaughtException`, console.error);