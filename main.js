var express = require("express");
var app = express();
var http= require('http').Server(app);
var bodyParser = require('body-parser');

var config = require('./config.json');
var log4js = require('log4js');
log4js.configure(config.log4jsconfig);
var logger = log4js.getLogger('console');
var schedule = require("node-schedule");

//app.use(express.static(path.join(__dirname,'page/src/views')));


/**
 *
 * /staticpage/src/json  目录中的代码是前端开发时候模拟数据，注释这段代码系统将切换到后台
 *
 * 在这里处理前后台切换的开发，
 *
 */

//app.use('/staticpage/src/json',express.static('staticpage/src/json'));

app.use('/staticpage/src/source',express.static('staticpage/src/source'));
app.use('/staticpage/src/uim',express.static('staticpage/src/uim'));
app.use('/staticpage/src/views',express.static('staticpage/src/views'));


//app.use('/staticpage',express.static('staticpage'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



var channelsRouter=require('./controllers/channel.js');
app.use('/staticpage/src/json/channel',channelsRouter)

var managerRouter=require('./controllers/manager.js');
app.use('/staticpage/src/json/manager',managerRouter)

var fabricnodeRouter=require('./controllers/fabricnode.js');
app.use('/staticpage/src/json/fabricnode',fabricnodeRouter)

var organizationRouter=require('./controllers/fabricnetwork.js');
app.use('/staticpage/src/json/fabricnetwork',organizationRouter)


var config = require('./config.json');


var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;


var server = http.listen(port, function() {
    console.log(`Please open Internet explorer to access ：http://${host}:${port}/staticpage/src/views`);
});





Date.prototype.Format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


//系统定时任务，每隔一段时间自动收集fabric网络的相关数据
/*var org_schedule     = new schedule.RecurrenceRule();
var timessplit    = [1,6,11,16,21,26,31,36,41,46,51,56];
org_schedule.second  = timessplit;
schedule.scheduleJob(org_schedule, function(){


   logger.debug((new Date()).Format("yyyy-MM-dd hh:mm:ss"));
    var bcexplorerservice = require('./service/bcexplorerservice.js');
    bcexplorerservice.parserDefaultOrg();


});*/

if( config.ifautospider ){

    let spide = require('./service/timer');
}



//注册异常处理器
/*
process.on('unhandledRejection', function (err) {
    console.error(err.stack);
});
process.on(`uncaughtException`, console.error);
*/


