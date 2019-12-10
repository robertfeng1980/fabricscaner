var log4js = require('log4js');
//var logger = log4js.getLogger('controllers');
var express = require('express');
var router = express.Router();

var config = require('../config.json');

log4js.configure(config.log4jsconfig);
var logger = log4js.getLogger('console');
var mysql = require('../db/mysqlservice4pool')


var bcexplorerservice = require('../service/bcexplorerservice');

/**
 ******************************************************************************************************************
 *
 * fabric网络结构
 *
 ******************************************************************************************************************
 */
router.get('/fabricnetwork_struct.json', async function (req, res) {

    logger.debug(req.query);


    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;

    let sql_count = `select  fabric_cas as fabric_ca , peers as peer , channels as channel , blocks as blocks , chaincodes as chaincodes, txcount as tx, keysets as keyset, account_certs as acccount from fabricnetwork where pkid = 1 `;

    let sql_count_info = await mysql.getRowsByFullSQl(sql_count);

    let sql_org = ` select pkid as id ,name,mspid , "org" as flag from organization   `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    /*let sql_ca = ` select pkid as id  , mspid,org_name,ca_name ,"fabric_ca" as flag from fabricca `;
    let sql_ca_info = await mysql.getRowsByFullSQl(sql_ca);



    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  `;
    let sql_peer_info = await mysql.getRowsByFullSQl(sql_peer);

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel `;
    let sql_channel_info = await mysql.getRowsByFullSQl(sql_channel);

    let sql_channelinfo = ` select  pkid as id ,channel_id,originate_dt,"channel" as flag from  channel   `;
    let sql_channelinfo_info = await mysql.getRowsByFullSQl(sql_channelinfo);

    let sql_chaincode = `select  peer_name,chaincode_name,ccstatus , "chaincode" as flag from  peer_ref_chaincode`;
    let sql_chaincode_info = await mysql.getRowsByFullSQl(sql_chaincode);
*/
    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    //logger.debug(JSON.stringify(sql_peer_info));

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer`;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);


    let count_info = sql_count_info[0];
    count_info['org'] = sql_org_info.length;
    count_info['orderer'] = sql_orderer_info == null ? 0 : sql_orderer_info.length;

    let pic_struct = await bcexplorerservice.get_fabric_network_struct();

    res.send({
        "code": 0
        , "msg": ""
        , "count_info": count_info
        , "pic_struct": pic_struct
    });


});


/**
 ******************************************************************************************************************
 *
 * 组织列表
 *
 ******************************************************************************************************************
 */
router.get('/organization_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/
    if (req.query.orgname != undefined && req.query.orgname != '') {
        where = where + `and name like '%${req.query.orgname}%' `;
    }

    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,commitss,name,mspid,createdt,fabric_cas,peers,channels,blocks,chaincodes,txcount,keysets,account_certs from organization where ${where} `;
    let sql_count = ` select count(pkid) as nums from  organization  where ${where} `;

    let organization_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let organization = await mysql.getRowsBySQlNoCondtion(sql,`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": organization_counts
        , "data": organization
    });

});


/**
 ******************************************************************************************************************
 *
 * 组织详情
 *
 ******************************************************************************************************************
 */
router.get('/organization_detail.json', async function (req, res) {


    logger.debug(req.query);

    let mspid = req.query.mspid;

    let sql_orq = ` select  fabric_cas as fabric_ca , peers as peer , channels as channel , blocks as block , chaincodes as chaincodes, txcount as tx, keysets as keyset, account_certs as acccount from organization where mspid = '${mspid}' `;
    let sql_org_info = await mysql.getRowByPkOne(sql_orq);


    let count_info = sql_org_info;

    let pic_struct = await bcexplorerservice.get_fabric_network_struct();


    res.send({
        "code": 0
        , "msg": ""
        , "count_info": count_info
        , "pic_struct": pic_struct
    });

});

/**
 ******************************************************************************************************************
 *
 * 组织相关证书
 *
 ******************************************************************************************************************
 */

router.get('/organization_cert_json.json', async function (req, res) {


    logger.debug(req.query);

    let jsonviewparm = req.query.jsonviewparm;

    let regex = /\s+|,|@|##/;
    let parm_arr = jsonviewparm.split(regex);

    let mspid = parm_arr[1];
    let eventtype = parm_arr[2];

    let sql_org = ` select * from organization where mspid = '${mspid}' `
    let sql_org_info = await  mysql.getRowsByFullSQl(sql_org);


    sql_org_info = sql_org_info[0];

    logger.debug(parm_arr);
    logger.debug(` the event is  ${eventtype} `);

    let cert_json;
    if( eventtype !== '' && eventtype === 'view_org_cert' ){
        cert_json = sql_org_info['cacerts_json'];
    }else if( eventtype !== '' && eventtype === 'view_admin_cert' ){
        cert_json = sql_org_info['admins_scert_json'];
    }else if( eventtype !== '' && eventtype === 'view_tls_cert' ){
        cert_json = sql_org_info['tls_root_certs_json'];
    }


    logger.debug(cert_json);


    res.send({
        "code": 0
        , "msg": ""
        , "data": cert_json
    });

});


module.exports = router;