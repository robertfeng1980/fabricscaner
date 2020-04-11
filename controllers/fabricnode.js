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

var bcexplorerservice = require('../service/bcexplorerservice');


/***  ====================================   peer  ============================================ */

/**
 * =============================================================================================================================================================
 * ====================   peer节点相关的操作的基础代码
 * =============================================================================================================================================================
 * peer  peer  tls_cacerts,docker_images_config,remark  mspid,name,requests,events,serverhostname,peer_config,createdt,runtype,docker_images,server_ipaddress,docker_ipaddress  peer节点*/


/**
 * 列表
 * page=1&limit=10
 */
router.get('/peer_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/


    let chaincodes_pkid = req.query.chaincodes_pkid;


    if (chaincodes_pkid !== undefined && chaincodes_pkid !== '') {

        let chaincode = await mysql.getRowByPk('chaincodes', '*', 'pkid', chaincodes_pkid);
        let chaincode_name = chaincode['name']
        where = where +  `and name in ( select peer_name from peer_ref_chaincode where chaincode_name = '${chaincode_name }'  ) `;

    }




    if (req.query.channel_id != undefined && req.query.channel_id != '') {


        where = where +  `and name in ( select peer_name from peer_ref_channel where channel_id = '${req.query.channel_id }'  ) `;


    }


    if(  req.query.mspid != undefined && req.query.mspid != '' ){
        searchparm['mspid'] = req.query.mspid;
        where = where +  `and mspid = '${req.query.mspid}' `;
    }
    if(  req.query.name != undefined && req.query.name != '' ){
        searchparm['name'] = req.query.name;
        where = where +  `and name = '${req.query.name}' `;
    }
    if(  req.query.requests != undefined && req.query.requests != '' ){
        searchparm['requests'] = req.query.requests;
        where = where +  `and requests = '${req.query.requests}' `;
    }
    if(  req.query.events != undefined && req.query.events != '' ){
        searchparm['events'] = req.query.events;
        where = where +  `and events = '${req.query.events}' `;
    }
    if(  req.query.serverhostname != undefined && req.query.serverhostname != '' ){
        searchparm['serverhostname'] = req.query.serverhostname;
        where = where +  `and serverhostname = '${req.query.serverhostname}' `;
    }
    if(  req.query.tls_cacerts != undefined && req.query.tls_cacerts != '' ){
        searchparm['tls_cacerts'] = req.query.tls_cacerts;
        where = where +  `and tls_cacerts = '${req.query.tls_cacerts}' `;
    }
    if(  req.query.peer_config != undefined && req.query.peer_config != '' ){
        searchparm['peer_config'] = req.query.peer_config;
        where = where +  `and peer_config = '${req.query.peer_config}' `;
    }
    if(  req.query.createdt != undefined && req.query.createdt != '' ){
        searchparm['createdt'] = req.query.createdt;
        where = where +  `and createdt = '${req.query.createdt}' `;
    }
    if(  req.query.runtype != undefined && req.query.runtype != '' ){
        searchparm['runtype'] = req.query.runtype;
        where = where +  `and runtype = '${req.query.runtype}' `;
    }
    if(  req.query.docker_images != undefined && req.query.docker_images != '' ){
        searchparm['docker_images'] = req.query.docker_images;
        where = where +  `and docker_images = '${req.query.docker_images}' `;
    }
    if(  req.query.docker_images_config != undefined && req.query.docker_images_config != '' ){
        searchparm['docker_images_config'] = req.query.docker_images_config;
        where = where +  `and docker_images_config = '${req.query.docker_images_config}' `;
    }
    if(  req.query.server_ipaddress != undefined && req.query.server_ipaddress != '' ){
        searchparm['server_ipaddress'] = req.query.server_ipaddress;
        where = where +  `and server_ipaddress = '${req.query.server_ipaddress}' `;
    }
    if(  req.query.docker_ipaddress != undefined && req.query.docker_ipaddress != '' ){
        searchparm['docker_ipaddress'] = req.query.docker_ipaddress;
        where = where +  `and docker_ipaddress = '${req.query.docker_ipaddress}' `;
    }
    if(  req.query.remark != undefined && req.query.remark != '' ){
        searchparm['remark'] = req.query.remark;
        where = where +  `and remark = '${req.query.remark}' `;
    }



    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,mspid,name,comments,requests,events,serverhostname,peer_config,createdt,runtype,docker_images,server_ipaddress,docker_ipaddress from peer  where ${where} `;
    let sql_count = ` select count(pkid) as nums from  peer  where ${where} `;

    logger.debug(sql_count);

    let peer_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let peer = await mysql.getRowsBySQl(sql , searchparm,'',`${page},${limit}`);


    res.send({
          "code": 0
        , "msg": ""
        , "count": peer_counts
        , "data": peer});

});


/**
 *
 * 新增记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/peer_add.js?s=1
 *
 */

router.get('/peer_add.json' ,async function(req, res) {

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/peer_edit.js?id=121&s=4
 *
 */
router.get('/peer_edit.json' ,async function(req, res) {


    logger.debug(req.query);

    var pkid = req.query.id;

    let edit_peer = await mysql.getRowByPk('peer', '*', 'pkid', pkid);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": edit_peer});
});


/**
 *
 * 保存记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/peer_save.js
 *
 */
router.post('/peer_save.json' ,async function(req, res) {


    logger.debug(req.body);


    var peer = {

        'mspid':req.body.mspid,

        'name':req.body.name,

        'comments':req.body.comments,

        'requests':req.body.requests,

        'events':req.body.events,

        'serverhostname':req.body.serverhostname,

        'tls_value':req.body.tls_value,

        'tls_cacerts':req.body.tls_cacerts,

        'peer_config':req.body.peer_config,

        'createdt':req.body.createdt,

        'runtype':req.body.runtype,

        'docker_images':req.body.docker_images,

        'docker_images_config':req.body.docker_images_config,

        'server_ipaddress':req.body.server_ipaddress,

        'docker_ipaddress':req.body.docker_ipaddress,

        'remark':req.body.remark


    }

    var pkid = req.body.pkid;

    if( pkid == undefined || pkid == '' ) {

        let updateresutl = await mysql.saveRow('peer', peer);

    }else{

        let updateresutl = await mysql.updateRowByPk('peer', peer, 'pkid', pkid);

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/peer_del.js?id=1
 * id
 *
 *
 */
router.get('/peer_del.json' ,async function(req, res) {

    logger.debug(req.query);

    var pkid = req.query.id;
    let delresult = mysql.updateBySql(`delete from peer where pkid = ${pkid}`);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});

/**
 *
 * 批量删除记录
 * http://localhost/busenv/page/src/uim/json/fabricnode/peer_batchdel.js
 */
router.post('/peer_batchdel.json' ,async function(req, res) {


    var  batchdelids = req.body.batchdelids;

    let delresult = mysql.updateBySql( `delete from peer where pkid in ( ${batchdelids} ) `);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });



});


/**
 * peer节点详情
 */
router.get('/peer_detail.json', async function(req, res) {


    //=========  =============
    var peerid = req.query.peerid;

    var peer_info = await mysql.getRowByPk('peer', '*', 'pkid', peerid);


    res.send({
        "code": 0,
        "msg": "",
        "peer_info": {"peerid":peer_info['serverhostname'],"name": peer_info['name'] , "requests":peer_info['requests'] , "events":peer_info['events'],"tls":peer_info['tls_value']},
        "count_info":{"org":3,"orderer":1,"fabric_ca":1,"peer":3,"channel":2,"blocks":20,"chaincodes_install":12,"chaincodes_instance":14,"tx":113,"keyset":121,"acccount":7},
        "pic_struct": {
            "orgs": [
                {
                    "id": 3,
                    "flag": "org",
                    "name": "org1",
                    "mspid": "Org1Msp",
                    "peers": [
                        {
                            "id": 1,
                            "flag": "peer",
                            "name": "peer0",
                            "peerid": "peer0.org1.qklszzn.com",
                            "channels": [
                                {
                                    "id": 3,
                                    "flag": "channel",
                                    "channel_id": "fabrictestchannel",
                                    "blocks": 110,
                                    "instanceccs": [
                                        {
                                            "id": 3,
                                            "flag": "chaincodeinstance",
                                            "name": "fb14_c2c_study",
                                            "version": "1.0"
                                        }
                                    ]
                                },
                                {
                                    "id": 3,
                                    "flag": "channel",
                                    "channel_id": "mytestchannel",
                                    "blocks": 110,
                                    "instanceccs": [
                                        {
                                            "id": 3,
                                            "flag": "chaincodeinstance",
                                            "name": "fb14_c2c_study1",
                                            "version": "1.0"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": 2,
                    "flag": "org",
                    "name": "org2",
                    "mspid": "Org2Msp"
                },
                {
                    "id": 3,
                    "flag": "org",
                    "name": "org3",
                    "mspid": "Org3Msp"
                }
            ]
        }
    });

});


/**
 * =============================================================================================================================================================
 * ==============================  peer节点基础代码结束  =======================================================================================
 * =============================================================================================================================================================
 * == end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end ======
 */



/***  ====================================   orderer  ============================================ */

/**
 * =============================================================================================================================================================
 * ====================   orderer节点打包服务相关的操作的基础代码
 * =============================================================================================================================================================
 * orderer  orderer  orderer_config,tls_cacerts,docker_images_config,remark  createdt,url,runtype,docker_images,server_ipaddress,docker_ipaddress  orderer节点打包服务*/


/**
 * 列表
 * page=1&limit=10
 */
router.get('/orderer_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/
    if(  req.query.orderer_config != undefined && req.query.orderer_config != '' ){
        searchparm['orderer_config'] = req.query.orderer_config;
        where = where +  `and orderer_config = '${req.query.orderer_config}' `;
    }
    if(  req.query.createdt != undefined && req.query.createdt != '' ){
        searchparm['createdt'] = req.query.createdt;
        where = where +  `and createdt = '${req.query.createdt}' `;
    }
    if(  req.query.url != undefined && req.query.url != '' ){
        searchparm['url'] = req.query.url;
        where = where +  `and url = '${req.query.url}' `;
    }
    if(  req.query.tls_cacerts != undefined && req.query.tls_cacerts != '' ){
        searchparm['tls_cacerts'] = req.query.tls_cacerts;
        where = where +  `and tls_cacerts = '${req.query.tls_cacerts}' `;
    }
    if(  req.query.runtype != undefined && req.query.runtype != '' ){
        searchparm['runtype'] = req.query.runtype;
        where = where +  `and runtype = '${req.query.runtype}' `;
    }
    if(  req.query.docker_images != undefined && req.query.docker_images != '' ){
        searchparm['docker_images'] = req.query.docker_images;
        where = where +  `and docker_images = '${req.query.docker_images}' `;
    }
    if(  req.query.docker_images_config != undefined && req.query.docker_images_config != '' ){
        searchparm['docker_images_config'] = req.query.docker_images_config;
        where = where +  `and docker_images_config = '${req.query.docker_images_config}' `;
    }
    if(  req.query.server_ipaddress != undefined && req.query.server_ipaddress != '' ){
        searchparm['server_ipaddress'] = req.query.server_ipaddress;
        where = where +  `and server_ipaddress = '${req.query.server_ipaddress}' `;
    }
    if(  req.query.docker_ipaddress != undefined && req.query.docker_ipaddress != '' ){
        searchparm['docker_ipaddress'] = req.query.docker_ipaddress;
        where = where +  `and docker_ipaddress = '${req.query.docker_ipaddress}' `;
    }
    if(  req.query.remark != undefined && req.query.remark != '' ){
        searchparm['remark'] = req.query.remark;
        where = where +  `and remark = '${req.query.remark}' `;
    }


    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  comments,orderer_name,pkid,createdt,url,runtype,docker_images,server_ipaddress,docker_ipaddress from orderer  `;
    let sql_count = ` select count(pkid) as nums from  orderer  where ${where} `;

    let orderer_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let orderer = await mysql.getRowsBySQl(sql , searchparm,'',`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": orderer_counts
        , "data": orderer});

});


/**
 *
 * 新增记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/orderer_add.js?s=1
 *
 */

router.get('/orderer_add.json' ,async function(req, res) {

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/orderer_edit.js?id=121&s=4
 *
 */
router.get('/orderer_edit.json' ,async function(req, res) {


    logger.debug(req.query);

    var pkid = req.query.id;

    let edit_orderer = await mysql.getRowByPk('orderer', '*', 'pkid', pkid);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": edit_orderer});
});


/**
 *
 * 保存记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/orderer_save.js
 *
 */
router.post('/orderer_save.json' ,async function(req, res) {


    logger.debug(req.body);


    var orderer = {

        'orderer_name':req.body.orderer_name,
        'orderer_config':req.body.orderer_config,
        'comments':req.body.comments,
        'url':req.body.url,
        'tls_cacerts':req.body.tls_cacerts,
        'runtype':req.body.runtype,
        'docker_images':req.body.docker_images,
        'docker_images_config':req.body.docker_images_config,
        'server_ipaddress':req.body.server_ipaddress,
        'docker_ipaddress':req.body.docker_ipaddress,
        'remark':req.body.remark

    }

    var pkid = req.body.pkid;

    if( pkid == undefined || pkid == '' ) {

        /*orderer[''] = bcexplorerservice.getDateStr4Date(new Date(), 'yyyy-MM-dd hh:mm:ss.S');*/
        let updateresutl = await mysql.saveRow('orderer', orderer);

    }else{

        let updateresutl = await mysql.updateRowByPk('orderer', orderer, 'pkid', pkid);

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/orderer_del.js?id=1
 * id
 *
 *
 */
router.get('/orderer_del.json' ,async function(req, res) {

    logger.debug(req.query);

    var pkid = req.query.id;
    let delresult = mysql.updateBySql(`delete from orderer where pkid = ${pkid}`);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});

/**
 *
 * 批量删除记录
 * http://localhost/busenv/page/src/uim/json/fabricnode/orderer_batchdel.js
 */
router.post('/orderer_batchdel.json' ,async function(req, res) {


    var  batchdelids = req.body.batchdelids;

    let delresult = mysql.updateBySql( `delete from orderer where pkid in ( ${batchdelids} ) `);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });



});





/**
 * =============================================================================================================================================================
 * ==============================  orderer节点打包服务基础代码结束  =======================================================================================
 * =============================================================================================================================================================
 * == end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end ======
 */



/***  ====================================   fabric-ca  ============================================ */

/**
 * =============================================================================================================================================================
 * ====================   组织中的CA服务器相关的操作的基础代码
 * =============================================================================================================================================================
 * fabricca  fabricca  docker_images_config,remark  org_name,ca_name,ca_request,ca_config_path,createdt,runtype,docker_images,server_ipaddress,docker_ipaddress  组织中的CA服务器*/


/**
 * 列表
 * page=1&limit=10
 */
router.get('/fabricca_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/
    if(  req.query.mspid !== undefined && req.query.mspid !== '' ){
        searchparm['mspid'] = req.query.mspid;
        where = where +  `and mspid = '${req.query.mspid}' `;
    }
    if(  req.query.org_name !== undefined && req.query.org_name !== '' ){
        searchparm['org_name'] = req.query.org_name;
        where = where +  `and org_name = '${req.query.org_name}' `;
    }
    if(  req.query.ca_name !== undefined && req.query.ca_name !== '' ){
        searchparm['ca_name'] = req.query.ca_name;
        where = where +  `and ca_name = '${req.query.ca_name}' `;
    }
    if(  req.query.ca_request !== undefined && req.query.ca_request !== '' ){
        searchparm['ca_request'] = req.query.ca_request;
        where = where +  `and ca_request = '${req.query.ca_request}' `;
    }
    if(  req.query.ca_config_path !== undefined && req.query.ca_config_path !== '' ){
        searchparm['ca_config_path'] = req.query.ca_config_path;
        where = where +  `and ca_config_path = '${req.query.ca_config_path}' `;
    }
    if(  req.query.createdt !== undefined && req.query.createdt !== '' ){
        searchparm['createdt'] = req.query.createdt;
        where = where +  `and createdt = '${req.query.createdt}' `;
    }
    if(  req.query.runtype !== undefined && req.query.runtype !== '' ){
        searchparm['runtype'] = req.query.runtype;
        where = where +  `and runtype = '${req.query.runtype}' `;
    }
    if(  req.query.docker_images !== undefined && req.query.docker_images !== '' ){
        searchparm['docker_images'] = req.query.docker_images;
        where = where +  `and docker_images = '${req.query.docker_images}' `;
    }
    if(  req.query.docker_images_config !== undefined && req.query.docker_images_config !== '' ){
        searchparm['docker_images_config'] = req.query.docker_images_config;
        where = where +  `and docker_images_config = '${req.query.docker_images_config}' `;
    }
    if(  req.query.server_ipaddress !== undefined && req.query.server_ipaddress !== '' ){
        searchparm['server_ipaddress'] = req.query.server_ipaddress;
        where = where +  `and server_ipaddress = '${req.query.server_ipaddress}' `;
    }
    if(  req.query.docker_ipaddress !== undefined && req.query.docker_ipaddress !== '' ){
        searchparm['docker_ipaddress'] = req.query.docker_ipaddress;
        where = where +  `and docker_ipaddress = '${req.query.docker_ipaddress}' `;
    }
    if(  req.query.remark !== undefined && req.query.remark !== '' ){
        searchparm['remark'] = req.query.remark;
        where = where +  `and remark = '${req.query.remark}' `;
    }




    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,mspid,org_name,ca_name,comments,ca_request,ca_config_path,createdt,runtype,docker_images,server_ipaddress,docker_ipaddress from fabricca  `;
    let sql_count = ` select count(pkid) as nums from  fabricca  where ${where} `;

    let fabricca_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let fabricca = await mysql.getRowsBySQl(sql , searchparm,'',`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": fabricca_counts
        , "data": fabricca})

});


/**
 *
 * 新增记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/fabricca_add.js?s=1
 *
 */

router.get('/fabricca_add.json' ,async function(req, res) {

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/fabricca_edit.js?id=121&s=4
 *
 */
router.get('/fabricca_edit.json' ,async function(req, res) {


    logger.debug(req.query);

    var pkid = req.query.id;

    let edit_fabricca = await mysql.getRowByPk('fabricca', '*', 'pkid', pkid);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": edit_fabricca});
});


/**
 *
 * 保存记录
 *
 * http://localhost/busenv/page/src/uim/json/fabricnode/fabricca_save.js
 *
 */
router.post('/fabricca_save.json' ,async function(req, res) {


    logger.debug(req.body);


    var fabricca = {

        'org_name':req.body.org_name,
        'ca_name':req.body.ca_name,
        'ca_request':req.body.ca_request,
        'ca_config_path':req.body.ca_config_path,
        'createdt':req.body.createdt,
        'runtype':req.body.runtype,
        'docker_images':req.body.docker_images,
        'docker_images_config':req.body.docker_images_config,
        'server_ipaddress':req.body.server_ipaddress,
        'docker_ipaddress':req.body.docker_ipaddress,
        'remark':req.body.remark

    }

    var pkid = req.body.pkid;

    if( pkid == undefined || pkid == '' ) {

        let updateresutl = await mysql.saveRow('fabricca', fabricca);

    }else{

        let updateresutl = await mysql.updateRowByPk('fabricca', fabricca, 'pkid', pkid);

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
 * http://localhost/busenv/page/src/uim/json/fabricnode/fabricca_del.js?id=1
 * id
 *
 *
 */
router.get('/fabricca_del.json' ,async function(req, res) {

    logger.debug(req.query);

    var pkid = req.query.id;
    let delresult = mysql.updateBySql(`delete from fabricca where pkid = ${pkid}`);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });

});

/**
 *
 * 批量删除记录
 * http://localhost/busenv/page/src/uim/json/fabricnode/fabricca_batchdel.js
 */
router.post('/fabricca_batchdel.json' ,async function(req, res) {


    var  batchdelids = req.body.batchdelids;

    let delresult = mysql.updateBySql( `delete from fabricca where pkid in ( ${batchdelids} ) `);

    res.send({
        "code": 0
        ,"msg": ""
        ,"data": []
    });



});





/**
 * =============================================================================================================================================================
 * ==============================  组织中的CA服务器基础代码结束  =======================================================================================
 * =============================================================================================================================================================
 * == end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end ======
 */


/**
 * =============================================================================================================================================================
 * ====================   其他部分相关操作相关的操作的基础代码
 * =============================================================================================================================================================
 */






module.exports = router;