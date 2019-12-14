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
var log4js = require('log4js');
var express = require('express');
var router = express.Router();

var config = require('../config.json');

log4js.configure(config.log4jsconfig);
var logger = log4js.getLogger('console');
var mysql = require('../db/mysqlservice4pool')
//var mysql = require('../db/mysqlservice')





/**
 * =============================================================================================================================================================
 * ====================   网络中的服务器相关的操作的基础org_struct.json代码
 * =============================================================================================================================================================
 * servers  servers  remark  ipaddress,docker_service_port,name  网络中的服务器*/


/**
 * 列表
 * page=1&limit=10
 */
router.get('/servers_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/
    if(  req.query.ipaddress != undefined && req.query.ipaddress != '' ){
        searchparm['ipaddress'] = req.query.ipaddress;
        where = where +  `and ipaddress = '${req.query.ipaddress}' `;
    }
    if(  req.query.docker_service_port != undefined && req.query.docker_service_port != '' ){
        searchparm['docker_service_port'] = req.query.docker_service_port;
        where = where +  `and docker_service_port = '${req.query.docker_service_port}' `;
    }
    if(  req.query.name != undefined && req.query.name != '' ){
        searchparm['name'] = req.query.name;
        where = where +  `and name = '${req.query.name}' `;
    }
    if(  req.query.remark != undefined && req.query.remark != '' ){
        searchparm['remark'] = req.query.remark;
        where = where +  `and remark = '${req.query.remark}' `;
    }
    if(  req.query.createdt != undefined && req.query.createdt != '' ){
        searchparm['createdt'] = req.query.createdt;
        where = where +  `and createdt = '${req.query.createdt}' `;
    }


    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,ipaddress,docker_service_port,name,createdt from servers  `;
    let sql_count = ` select count(pkid) as nums from  servers  where ${where} `;

    let servers_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let servers = await mysql.getRowsBySQl(sql , searchparm,'',`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": servers_counts
        , "data": servers});

});


/**
 *
 * 新增记录
 *
 * http://localhost/busenv/page/src/uim/json/manager/servers_add.js?s=1
 *
 */

router.get('/servers_add.json' ,async function(req, res) {

    logger.debug(req.query);

    res.send({
        "code": 0
        ,"msg": ""
        ,"count": "100"
        ,"data": {}
    });
});

/**
 *
 * 编辑记录
 * http://localhost/busenv/page/src/uim/json/manager/servers_edit.js?id=121&s=4
 *
 */
router.get('/servers_edit.json' ,async function(req, res) {


    logger.debug(req.query);

    var pkid = req.query.id;

    let edit_servers = await mysql.getRowByPk('servers', '*', 'pkid', pkid);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": edit_servers});
});


/**
 *
 * 保存记录
 *
 * http://localhost/busenv/page/src/uim/json/manager/servers_save.js
 *
 */
router.post('/servers_save.json' ,async function(req, res) {


    logger.debug(req.body);


    var servers = {

        'ipaddress':req.body.ipaddress,

        'docker_service_port':req.body.docker_service_port,

        'name':req.body.name,

        'remark':req.body.remark


    }

    var pkid = req.body.pkid;

    if( pkid == undefined || pkid == '' ) {

        let updateresutl = await mysql.saveRow('servers', servers);

    }else{

        let updateresutl = await mysql.updateRowByPk('servers', servers, 'pkid', pkid);

    }


    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});


/**
 *
 * 删除单条记录
 * http://localhost/busenv/page/src/uim/json/manager/servers_del.js?id=1
 * id
 *
 *
 */
router.get('/servers_del.json' ,async function(req, res) {

    logger.debug(req.query);

    var pkid = req.query.id;
    let delresult = mysql.updateBySql(`delete from servers where pkid = ${pkid}`);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});

/**
 *
 * 批量删除记录
 * http://localhost/busenv/page/src/uim/json/manager/servers_batchdel.js
 */
router.post('/servers_batchdel.json' ,async function(req, res) {


    var  batchdelids = req.body.batchdelids;

    let delresult = mysql.updateBySql( `delete from servers where pkid in ( ${batchdelids} ) `);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });


});





/**
 * =============================================================================================================================================================
 * ==============================  网络中的服务器基础代码结束  =======================================================================================
 * =============================================================================================================================================================
 * == end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end ======
 */


/**
 * =============================================================================================================================================================
 * ====================   其他部分相关操作相关的操作的基础代码
 * =============================================================================================================================================================
 */






/*router.get('/tpl.json', async function (req, res) {

    //logger.debug(req.query);
    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";

    if(  req.query.names != undefined && req.query.names != '' ){
        searchparm['names'] = req.query.names;
        where = where +  `and names = '${req.query.names}' `;
    }

    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  * from servers `;
    let sql_count = ` select count(pkid) as nums from  servers where ${where} `;

    let servers_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let servers = await mysql.getRowsBySQl(sql , searchparm,'',`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": servers_counts
        , "data": servers
    });

});



router.get('/servers_add.json' ,async function(req, res) {

    logger.debug(req.query);

    res.send({
        "code": 0
        ,"msg": ""
        ,"count": "100"
        ,"data": {}
        });
});


router.get('/servers_edit.json' ,async function(req, res) {


    logger.debug(req.query);

    var pkid = req.query.id;

    let servers = await mysql.getRowByPk('servers', '*', 'pkid', pkid);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": servers
         });
});



router.post('/servers_save.json' ,async function(req, res) {


    logger.debug(req.body);


    var servers = { 'ipaddress':req.body.ipaddress,
                    'docker_service_port':req.body.docker_service_port,
                    'name':req.body.name,
                    'remark':req.body.remark}

    var pkid = req.body.pkid;

    if( pkid == undefined || pkid == '' ) {

        let updateresutl = await mysql.saveRow('servers', servers);

    }else{

        let updateresutl = await mysql.updateRowByPk('servers', servers, 'pkid', pkid);

    }


    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });
});



router.get('/servers_del.json' ,async function(req, res) {

    logger.debug(req.query);

    var pkid = req.query.id;
    let delresult = mysql.updateBySql(`delete from servers where pkid = ${pkid}`);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});


router.post('/servers_batchdel.json' ,async function(req, res) {


    var  batchdelids = req.body.batchdelids;

    let delresult = mysql.updateBySql( `delete from servers where pkid in ( ${batchdelids} ) `);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });



});*/


/**
 *
 * 通用的数据更新接口，更新备注信息
 *
 */

router.get('/com_update.json' ,async function(req, res) {


    var pkid = req.query.pkid;
    var fildvalue = req.query.fildvalue;
    var module = req.query.module;

    let sql_update = '';

    if( module === 'org' ){

        sql_update =   ` update organization set comments= '${fildvalue}' where pkid = ${pkid} `;

    }else if(  module === 'ledge'  ){

        sql_update =   ` update channel set comments= '${fildvalue}' where pkid = ${pkid} `;


    }else if (module === 'cc') {

        sql_update =   ` update chaincodes set comments= '${fildvalue}' where pkid = ${pkid}  `;

    }else if (module === 'account') {

        sql_update =   ` update accounts set comments= '${fildvalue}' where pkid = ${pkid}  `;

    }


    logger.debug(req.query);
    logger.debug(sql_update);

    if (sql_update !== '' && sql_update !== 'undefined' && sql_update != null) {

        let updateresult = await mysql.updateBySql( sql_update );

    }



    res.send({
        "code": 0
        ,"msg": ""
        ,"count": "100"
        ,"data": {}
    });

});




module.exports = router;