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