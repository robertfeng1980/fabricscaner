var log4js = require('log4js');
var express = require('express');
var router = express.Router();

var config = require('../config.json');

log4js.configure(config.log4jsconfig);
var logger = log4js.getLogger('console');
var mysql = require('../db/mysqlservice4pool')

//var bsexplorerservice = require('../service/bcexplorerservice');
var bcexplorerservice = require('../service/bcexplorerservice');

/**
 ******************************************************************************************************************
 * account_detail.json
 ******************************************************************************************************************
 */
router.get('/account_detail.json', async function (req, res) {


    let pkid = req.query.pkid;
    let certsmd5 = req.query.certsmd5;

    let account_info = await mysql.getRowByPk('accounts', '*', 'pkid', pkid);

    let sql_account_count = ` select count(DISTINCT(channel_id)) as channel , count(DISTINCT(transhash)) as tx from trans_ref_account where account_cert_md5 =  '${certsmd5}'  `;
    let sql_account_count_info = await mysql.getRowByPkOne(sql_account_count);


    let sql_keyset_count = ` select count(DISTINCT(keyset_name)) as keyset from keyset_ref_account where account_cert_md5 =  '${certsmd5}'  `;
    let sql_keyset_count_info = await mysql.getRowByPkOne(sql_keyset_count);



    res.send({
            "code": 0,
            "msg": "",
            "account_info": { "mspid":account_info['mspid'] , "accounttype":account_info['account_type']},
            "count_info":{"channel":sql_account_count_info['channel'],"tx":sql_account_count_info['tx'],"keyset":sql_keyset_count_info['keyset']},
            "pic_struct": {}
        }



    );



});



/**
 ******************************************************************************************************************
 *
 * account_detail.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/account_detail_json.json', async function (req, res) {



    let pkid = req.query.pkid;


    let sql_account = ` select certs_json from accounts where pkid = '${pkid}' `;
    let sql_account_info = await mysql.getRowsBySQlCase(sql_account);

    //let json_detail_de = new Buffer(sql_tx_info['certs_json'], 'base64').toString();

    res.send({
        "code": 0
        , "msg": ""
        , "data": sql_account_info['certs_json']

    });


});




/**
 ******************************************************************************************************************
 *
 * accounts_list.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/accounts_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/


    /** key页面中发送来的需要查询和交易关联的accounts的请求消息 */
    let keysetpkid = req.query.keysetpkid;

    if (keysetpkid !== undefined && keysetpkid !== '' && keysetpkid !=='-1') {

      /*  let tx = await mysql.getRowByPk('transactions', 'txhash', 'pkid', keysetpkid);
        let txhash = tx['txhash'];
        where = where + `  and certs_md5 in (select DISTINCT(account_cert_md5) from trans_ref_account where transhash  = '${txhash}' ) `;
*/

        let keyset = await mysql.getRowByPk( 'keyset', 'transactionhash,channel_id,chaincode_name', 'pkid', keysetpkid );
        let txhash = keyset['transactionhash'];
        let channel_id = keyset['channel_id'];
        let chaincode_name = keyset['chaincode_name'];

        where = where +  ` and   certs_md5 in  (  select account_cert_md5  from  trans_ref_account where   transhash in (   select  transactionhash from keyset_history  where  transactionhash = '${txhash}' and chaincode_name = '${chaincode_name}' and channel_id = '${channel_id}'  )  )`;




    }


    /** 交易页面中发送来的需要查询和交易关联的accounts的请求消息 */
    let txpkid = req.query.txpkid;

    if (txpkid !== undefined && txpkid !== '' && txpkid !=='-1') {

        let tx = await mysql.getRowByPk('transactions', 'txhash', 'pkid', txpkid);
        let txhash = tx['txhash'];
        where = where + `  and certs_md5 in (select DISTINCT(account_cert_md5) from trans_ref_account where transhash  = '${txhash}' ) `;


    }


    /**
     * 从通道页面发送过来的消息
     */
    if (req.query.channel_id != undefined && req.query.channel_id != '') {
        where = where + `and certs_md5 in (select DISTINCT(account_cert_md5) from trans_ref_account where channel_id = '${req.query.channel_id}' ) `;
    }


    if (req.query.mspid !== undefined && req.query.mspid !== '' && req.query.mspid !== '-1' ) {
        searchparm['mspid'] = req.query.mspid;
        where = where + `and mspid = '${req.query.mspid}' `;
    }


    //chaincode发起的相关签名
    if (req.query.chaincodes_pkid !== undefined && req.query.chaincodes_pkid !== '' && req.query.chaincodes_pkid !== '-1' ) {

        ///////////////????????????

        logger.debug(`${req.query.chaincodes_pkid}`);
        let chaincode = await mysql.getRowByPk('chaincodes', '*', 'pkid', req.query.chaincodes_pkid );
        let chaincode_name = chaincode['name'];


        where = where + `and certs_md5 in (select DISTINCT(account_cert_md5) from trans_ref_account where chaincode_name = '${chaincode_name}' ) `;


    }



    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,mspid,name,account_type,certs_md5, DATE_FORMAT(createdt,'%Y-%m-%d %H:%i:%S') as createdt , DATE_FORMAT(effective_dt,'%Y-%m-%d %H:%i:%S') as effective_dt , DATE_FORMAT(invalid_dt,'%Y-%m-%d %H:%i:%S') as invalid_dt from accounts  where ${where} `;
    let sql_count = ` select count(pkid) as nums from  accounts  where ${where} `;

    let accounts_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let accounts = await mysql.getRowsBySQl(sql, searchparm, '', `${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": accounts_counts
        , "data": accounts
    });

});


/**
 ******************************************************************************************************************
 *
 * block_detail.json
 *
 ******************************************************************************************************************
 */
router.get('/block_detail.json', async function (req, res) {


    let pkid = req.query.pkid;

    let sql_block = ` select *,DATE_FORMAT(blockcreatedt,'%Y-%m-%d %H:%i:%S') as blockdtstr from blocks where pkid = '${pkid}' `;
    let sql_block_info = await mysql.getRowsBySQlCase(sql_block);

    let blocknum = sql_block_info['blocknum'];
    let channel_id = sql_block_info['channel_id'];

    let sql_block_count = ` select COUNT(DISTINCT(transactionhash)) as tx , COUNT(DISTINCT(keyname)) as keyset from keyset where blocknum = ${blocknum} and channel_id = '${channel_id}'`;
    let sql_block_count_info = await mysql.getRowsBySQlCase(sql_block_count);

    let org_count_info = await mysql.getRowsBySQlCase(` select count(pkid) as org from org_ref_channel where channel_id = '${channel_id}'`);
    let peer_count_info = await mysql.getRowsBySQlCase(`select count(pkid) as peer from peer_ref_channel where channel_id = '${channel_id}'`)

    let pic_struct = await bcexplorerservice.get_fabric_block_struct(pkid);


    res.send({
            "code": 0,
            "msg": "",
            "blockinfo": {"pkid":"121","channel_id": sql_block_info['channel_id'],"blocknum": sql_block_info['blocknum'],"datahash": sql_block_info['datahash'],"blockcreatedt":sql_block_info['blockdtstr']},
            "count_info":{"org":org_count_info['org'],"peer":peer_count_info['peer'],"tx":sql_block_info['txcount'],"keyset":sql_block_count_info['keyset']},
            "pic_struct": pic_struct
        }


    );


});


/**
 ******************************************************************************************************************
 *  区块链的详细结构
 ******************************************************************************************************************
 */
router.get('/block_struct_json.json', async function (req, res) {

    let pkid = req.query.pkid;

    if (pkid === '' || pkid === undefined) {
        pkid = req.query.jsonviewparm;
    }


    let sql_block = ` select block_detail from blocks where pkid = '${pkid}' `;
    let sql_block_info = await mysql.getRowsBySQlCase(sql_block);

    let json_detail_de = new Buffer(sql_block_info['block_detail'], 'base64').toString();

    var fn = require('funclib');
    //fn.log(jsonstr, 'Persons');
    var jsonstr =JSON.parse(json_detail_de)
    var jsonformat = fn.pretty(jsonstr);

    //var jsonformat1 = jsonformat.replace(/\n/g, '<br/>');

    res.send({
        "code": 0
        , "msg": ""
        , "data": jsonformat

    });


});




/**
 ******************************************************************************************************************
 *
 * blocks_list.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/blocks_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/
    if (req.query.channel_id != undefined && req.query.channel_id != '') {
        searchparm['channel_id'] = req.query.channel_id;
        where = where + `and channel_id = '${req.query.channel_id}' `;
    }
    if (req.query.blocknum != undefined && req.query.blocknum != '') {
        searchparm['blocknum'] = req.query.blocknum;
        where = where + `and blocknum = '${req.query.blocknum}' `;
    }
    if (req.query.datahash != undefined && req.query.datahash != '') {
        searchparm['datahash'] = req.query.datahash;
        where = where + `and datahash = '${req.query.datahash}' `;
    }

    if (req.query.blockcreatedt != undefined && req.query.blockcreatedt != '') {

        let blockcreatedt = req.query.blockcreatedt;

        let datearr = blockcreatedt.split(" - ");

        //2019-05-01+-+2019-06-27
        let startdt = datearr[0];
        let enddt = datearr[1];

        where = where + `and DATE_FORMAT(blockcreatedt,'%Y-%m-%d') >= '${startdt}' and  DATE_FORMAT(blockcreatedt,'%Y-%m-%d') <= '${enddt}' `;
    }


    logger.debug(searchparm);
    logger.debug(where);


    let sql = `select  pkid,channel_id,blocknum,datahash,perhash,txcount,keysets,account_certs, DATE_FORMAT(blockcreatedt,'%Y-%m-%d %H:%i:%S') as blockcreatedt from blocks where ${where} `;
    let sql_count = ` select count(pkid) as nums from  blocks  where ${where} `;

    let blocks_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let blocks = await mysql.getRowsBySQl(sql, '', '', `${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": blocks_counts
        , "data": blocks
    });

});


/**
 * 根据mspi选择channel
 */
router.get('/block_org_channel_select.json', async function (req, res) {


    let mspid = req.query.mspid;

    let sql_channel = ` select channel_id from channel where channel_id in ( select channel_id from org_ref_channel where mspid = '${mspid}' )  `;
    let sql_channel_info = await mysql.getRowsByFullSQl(sql_channel);


    res.send({
        "code": 0
        , "msg": ""
        , "data": sql_channel_info

    });

});


/**
 ******************************************************************************************************************
 *
 * chaincodes_detail.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/chaincodes_detail.json', async function (req, res) {






    let chaincodes_pkid = req.query.chaincodes_pkid;

    let sql_cc = ` select * from chaincodes where pkid = '${chaincodes_pkid}' `;
    let sql_cc_info = await mysql.getRowsBySQlCase(sql_cc);

    let channel_id = sql_cc_info['channel_id'];
    let cc_name = sql_cc_info['name'];


    let peer_count_info = await mysql.getRowsBySQlCase(`select count(pkid) as peer from peer_ref_chaincode where chaincode_name = '${cc_name}'`)



    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);


    let pic_struct = await bcexplorerservice.get_fabric_cc_struct(chaincodes_pkid);



    res.send({
            "code": 0,
            "msg": "",
            "chaincode_info": {"pkid":"121","channel_id": sql_cc_info['channel_id'],"languages": sql_cc_info[''],"name": sql_cc_info['name'],"version": sql_cc_info['version'],"path": sql_cc_info['path'],"escc":sql_cc_info['escc'],"vscc":sql_cc_info['vscc'],"txcount":sql_cc_info['txcount'],"ccstatus":sql_cc_info['ccstatus']},
            "count_info":{"peer":peer_count_info['peer'],"tx":sql_cc_info['txcount'],"keyset":121,"acccount":7},
            "pic_struct":pic_struct
        }


    );


});


/**
 ******************************************************************************************************************
 *
 * chaincodes_list.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/chaincodes_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/




    if (req.query.peer_name !== undefined && req.query.peer_name !== '') {
        searchparm['peer_name'] = req.query.peer_name;
        where = where + `and peer_name = '${req.query.peer_name}' `;
    }

    if (req.query.languages !== undefined && req.query.languages !== '') {
        searchparm['languages'] = req.query.languages;
        where = where + `and languages = '${req.query.languages}' `;
    }
    if (req.query.name !== undefined && req.query.name !== '') {
        searchparm['name'] = req.query.name;
        where = where + `and name = '${req.query.name}' `;
    }
    if (req.query.version !== undefined && req.query.version !== '') {
        searchparm['version'] = req.query.version;
        where = where + `and version = '${req.query.version}' `;
    }
    if (req.query.path !== undefined && req.query.path !== '') {
        searchparm['path'] = req.query.path;
        where = where + `and path = '${req.query.path}' `;
    }
    if (req.query.escc !== undefined && req.query.escc !== '') {
        searchparm['escc'] = req.query.escc;
        where = where + `and escc = '${req.query.escc}' `;
    }
    if (req.query.vscc !== undefined && req.query.vscc !== '') {
        searchparm['vscc'] = req.query.vscc;
        where = where + `and vscc = '${req.query.vscc}' `;
    }
    if (req.query.peers !== undefined && req.query.peers !== '') {
        searchparm['peers'] = req.query.peers;
        where = where + `and peers = '${req.query.peers}' `;
    }
    if (req.query.txcount !== undefined && req.query.txcount !== '') {
        searchparm['txcount'] = req.query.txcount;
        where = where + `and txcount = '${req.query.txcount}' `;
    }
    if (req.query.keysets !== undefined && req.query.keysets !== '') {
        searchparm['keysets'] = req.query.keysets;
        where = where + `and keysets = '${req.query.keysets}' `;
    }
    if (req.query.account_certs !== undefined && req.query.account_certs !== '') {
        searchparm['account_certs'] = req.query.account_certs;
        where = where + `and account_certs = '${req.query.account_certs}' `;
    }
    if (req.query.ccstatus !== undefined && req.query.ccstatus !== '') {
        searchparm['ccstatus'] = req.query.ccstatus;
        where = where + `and ccstatus = '${req.query.ccstatus}' `;
    }
    if (req.query.createdt !== undefined && req.query.createdt !== '') {
        searchparm['createdt'] = req.query.createdt;
        where = where + `and createdt = '${req.query.createdt}' `;
    }
    if (req.query.remark !== undefined && req.query.remark !== '') {
        searchparm['remark'] = req.query.remark;
        where = where + `and remark = '${req.query.remark}' `;
    }

    logger.debug(` ================================= ${req.query.mspid} `);

    if(  req.query.mspid !== undefined && req.query.mspid !== '' && req.query.mspid !== '-1' ){
        where = where +  `and  and name in ( select chaincode_name from channel_ref_instantiatedcc where channel_id in ( select channel_id from org_ref_channel where  mspid = '${req.query.mspid}' )  )  `;
    }

    if (req.query.channel_id !== undefined && req.query.channel_id !== '' && req.query.channel_id !== '-1') {

        where = where + `and name in ( select chaincode_name from channel_ref_instantiatedcc where channel_id = '${req.query.channel_id}' )  `;

    }

    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid, commitss,DATE_FORMAT(cccreatedt,'%Y-%m-%d %H:%i:%S') as  cccreatedt, peer_name,channel_id,languages,name,version,path,escc,vscc,peers,txcount,keysets,account_certs,ccstatus from chaincodes where  ${where}  `;
    let sql_count = ` select count(pkid) as nums from  chaincodes  where ${where} `;

   /* if(  req.query.mspid != undefined && req.query.mspid != ''  && req.query.mspid !== '-1'){

        sql  = sql +  `where channel_id in ( select channel_id from org_ref_channel where  mspid = '${req.query.mspid}' ) `;
    }
*/

    let chaincodes_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let chaincodes = await mysql.getRowsBySQl(sql, searchparm, '', `${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": chaincodes_counts
        , "data": chaincodes
    });


});

/**
 * =============================================================================================================================================================
 * ====================   交易相关的操作的基础代码
 * =============================================================================================================================================================
 * transactions  transactions  remark  channel_id,blocknum,blockhash,txhash,txcreatedt,txcreatedt_str,txlanguage,chaincode_name,chaincodeversion,createdt  交易*/


/**
 * 列表
 * page=1&limit=10
 */
router.get('/transaction_list.json', async function (req, res) {


    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /** 根据客户端发送的查询参数，拼接查询条件 */

    if (req.query.mspid !== undefined && req.query.mspid !== '' && req.query.mspid !=='-1') {

        searchparm['mspid'] = req.query.channel_id;
        let mspid = req.query.mspid;
        where = where + `and channel_id in ( select channel_id from org_ref_channel where mspid = '${mspid}') `;

    }



    if (req.query.blockpkid !== undefined && req.query.blockpkid !== '' && req.query.blockpkid !=='-1') {

        let blockitem = await mysql.getRowByPk('blocks', '*', 'pkid', req.query.blockpkid );
        let blocknum = blockitem['blocknum'];
        let channel_id = blockitem['channel_id'];


        where = where + `and channel_id = '${channel_id}' and blocknum = ${blocknum} `;


    }



    //在chaincode详情中获取由当前chaincode发起的交易
    if (req.query.chaincodes_pkid !== undefined && req.query.chaincodes_pkid !== '' && req.query.chaincodes_pkid !=='-1') {

        let chaincode = await mysql.getRowByPk('chaincodes', '*', 'pkid', req.query.chaincodes_pkid );
        let chaincode_name = chaincode['name'];
        let channel_id = chaincode['channel_id'];

        where = where + `and channel_id = '${channel_id}' and chaincode_name = '${chaincode_name}' `;

    }


    /** 证书页面发送过来的查询条件 */
    let certsmd5 = req.query.certsmd5;
    if (certsmd5 !== undefined && certsmd5 !== '') {

        where = where + `and txhash in  (select transhash from trans_ref_account where account_cert_md5 = '${certsmd5}' ) `;
    }


    if (req.query.channel_id !== undefined && req.query.channel_id !== '' && req.query.channel_id !== '-1') {
        searchparm['channel_id'] = req.query.channel_id;
        where = where + `and channel_id = '${req.query.channel_id}' `;
    }

    if (req.query.txhash !== undefined && req.query.txhash !== '') {
        searchparm['txhash'] = req.query.txhash;
        where = where + `and txhash = '${req.query.txhash}' `;
    }
    if (req.query.txcreatedt !== undefined && req.query.txcreatedt !== '') {
        searchparm['txcreatedt'] = req.query.txcreatedt;
        where = where + `and txcreatedt = '${req.query.txcreatedt}' `;


        let blockcreatedt = req.query.txcreatedt;

        let datearr = blockcreatedt.split(" - ");

        //2019-05-01+-+2019-06-27
        let startdt = datearr[0];
        let enddt = datearr[1];

        where = where + `and DATE_FORMAT(txcreatedt,'%Y-%m-%d') >= '${startdt}' and  DATE_FORMAT(txcreatedt,'%Y-%m-%d') <= '${enddt}' `;


    }

    if (req.query.txlanguage !== undefined && req.query.txlanguage !== '') {
        searchparm['txlanguage'] = req.query.txlanguage;
        where = where + `and txlanguage = '${req.query.txlanguage}' `;
    }

    if (req.query.chaincode_name !== undefined && req.query.chaincode_name !== '') {
        searchparm['chaincode_name'] = req.query.chaincode_name;
        where = where + `and chaincode_name = '${req.query.chaincode_name}' `;
    }


    if (req.query.chaincodeversion !== undefined && req.query.chaincodeversion !== '') {
        searchparm['chaincodeversion'] = req.query.chaincodeversion;
        where = where + `and chaincodeversion = '${req.query.chaincodeversion}' `;
    }


    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,channel_id,blocknum,blockhash,txhash,DATE_FORMAT(txcreatedt,'%Y-%m-%d %H:%i:%S') as txcreatedt,txcreatedt_str,txlanguage,chaincode_name,chaincodeversion,createdt,validationcode from transactions  where ${where}   `;
    let sql_count = ` select count(pkid) as nums from  transactions  where ${where} `;

    let transactions_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let transactions = await mysql.getRowsBySQl(sql, '', '  txcreatedt desc  ', `${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": transactions_counts
        , "data": transactions
    });

});

/**
 * 交易详情
 * page=1&limit=10
 */
router.get('/transaction_detail.json', async function (req, res) {


    let pkid = req.query.pkid;

    let sql_tx = ` select  pkid,channel_id,blocknum,blockhash,txhash,DATE_FORMAT(txcreatedt,'%Y-%m-%d %H:%i:%S') as txcreatedt,txcreatedt_str,txlanguage,chaincode_name,chaincodeversion,createdt,validationcode from transactions where  pkid = ${pkid}   `;
    let sql_tx_info = await mysql.getRowsBySQlCase(sql_tx);

    let txhash = sql_tx_info['txhash'];

    let sql_orgs = `select * from  organization  where  mspid in ( select mspid from accounts where certs_md5 in ( select account_cert_md5 from trans_ref_account where account_types = 0 and   transhash = '${txhash}'))`;
    let sql_orgs_inf = await mysql.getRowsByFullSQl(sql_orgs);


    let pic_struct = await bcexplorerservice.get_fabric_tx_struct(pkid);


    res.send({
            "code": 0,
            "msg": "",
            "txinfo": sql_tx_info,
            "tx_share_org": sql_orgs_inf,
            "count_info": {"org": 3, "peer": 3, "channel": 2, "blocks": 20, "chaincodes": 12, "tx": 113, "keyset": 121, "acccount": 7},
            "pic_struct": pic_struct
            });



    /**
     * {
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
                                        "blocknums": 110,
                                        "blocks": [
                                            {
                                                "id": 11,
                                                "flag": "block",
                                                "blocknum": 13,
                                                "blockhansh": "qewrsdasfwqerewiucuiqcnriqouneru81-247un1234choifnunu38",
                                                "transactions": [{
                                                    "id": 13,
                                                    "name":"1234;lkj1234kj12l123l4kj12lk34j",
                                                    "flag": "transaction",
                                                    "txhash": "",
                                                    "chaincode": {
                                                        "id": 3,
                                                        "flag": "chaincodeinstance",
                                                        "name": "fb14_c2c_study",
                                                        "version": "1.0"
                                                    }
                                                }]
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
                ],
                "orderers": [
                    {
                        "id": 3,
                        "flag": "orderer",
                        "name": "ordererorg1"
                    }
                ]
            }
     */

});



/******************************************************************************************************************************
 * 交易详细结构
 * ***************************************************************************************************************************
 */
router.get('/txjson.json', async function (req, res) {


    let pkid = req.query.pkid;


    let sql_tx = ` select tx_detail from transactions where pkid = '${pkid}' `;
    let sql_tx_info = await mysql.getRowsBySQlCase(sql_tx);

    let json_detail_de = new Buffer(sql_tx_info['tx_detail'], 'base64').toString();


    var fn = require('funclib');
    //fn.log(jsonstr, 'Persons');
    var jsonstr =JSON.parse(json_detail_de)
    var jsonformat = fn.pretty(jsonstr);



    res.send({
        "code": 0
        , "msg": ""
        , "data": jsonformat

    });

});


/**
 * =============================================================================================================================================================
 * ==============================  交易基础代码结束  =======================================================================================
 * =============================================================================================================================================================
 * == end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end end ======
 */


/**
 * =============================================================================================================================================================
 * ====================   其他部分相关操作相关的操作的基础代码
 * =============================================================================================================================================================
 */


/**
 ******************************************************************************************************************
 *
 * 账本列表
 *
 ******************************************************************************************************************
 */
router.get('/channel_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/

    let mspid = req.query.mspid;
    if (mspid !== undefined && mspid !== '') {

        where = where + `and channel_id in  (select channel_id from org_ref_channel where mspid = '${mspid}' ) `;
    }

    /** 证书页面发送过来的查询条件 */
    let certsmd5 = req.query.certsmd5;
    if (certsmd5 !== undefined && certsmd5 !== '') {

        where = where + `and channel_id in  (select channel_id from trans_ref_account where account_cert_md5 = '${certsmd5}' ) `;
    }



    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select   pkid,channel_id, commitss,DATE_FORMAT(originate_dt,'%Y-%m-%d %H:%i:%S') as originate_dt,blocks,countblocks,chaincodes,txcount,keysets,account_certs,createdt from channel where ${where}  `;
    let sql_count = ` select count(pkid) as nums from  channel  where ${where} `;

    let channel_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let channel = await mysql.getRowsBySQl(sql, searchparm, '', `${page},${limit}`);

    /*let sql_org = ` select mspid , name from organization  ` ;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);*/


    res.send({
        "code": 0
        , "msg": ""
        , "count": channel_counts
        , "data": channel

    });

});


/**
 ******************************************************************************************************************
 *
 * 账本页面中组织下拉列表
 *
 ******************************************************************************************************************
 */

router.get('/channel_org_select.json', async function (req, res) {

    let sql_org = ` select commitss , mspid , name from organization  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    res.send({
        "code": 0
        , "msg": ""
        , "data": sql_org_info

    });

});


/**
 ******************************************************************************************************************
 *
 * 账本详情
 *
 ******************************************************************************************************************
 */
router.get('/channel_detail.json', async function (req, res) {

    let channel_id = req.query.channel_id;

    let channelinfo = await mysql.getRowByPkOne(`select pkid,channel_id, DATE_FORMAT(originate_dt,'%Y-%m-%d %H:%i:%S') as originate_dt,countblocks ,chaincodes ,txcount ,keysets ,account_certs  from channel where channel_id = '${channel_id}' `);

    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);


    let pic_struct = await bcexplorerservice.get_fabric_channel_struct(channel_id);


    let result = {
        "code": 0,
        "msg": "",
        "channelinfo":channelinfo,
        "count_info":{"org":3,"peer":3,"blocks":channelinfo['countblocks'],"chaincodes":channelinfo['chaincodes'],"tx":channelinfo['txcount'],"keyset":channelinfo['keysets'],"acccount":channelinfo['account_certs']},
        "channel_share_org": sql_org_info,
        "pic_struct": pic_struct
    }


    res.send(result);


});


/**
 ******************************************************************************************************************
 *  账本中的区块链时间线列表
 ******************************************************************************************************************
 */
router.get('/channel_detail_blocktimeline.json', async function (req, res) {

    let channel_id = req.query.channel_id;

    let sql_block_maxdt = `select max(blockcreatedt) as blockcreatedt  from blocks where channel_id = '${channel_id}'`;
    let sql_block_maxdt_info = await mysql.getRowsByFullSQl(sql_block_maxdt);
    let sql_block = `select * from blocks where channel_id = '${channel_id}'`;
    let sql_block_info = await mysql.getRowsByFullSQl(sql_block);

    let result = {
        "code": 0,
        "msg": "",
        "blocks_timeline": {

            "lastdt": sql_block_maxdt_info[0]['blockcreatedt'],

            "blocks": sql_block_info
        }
    }

    res.send(result);

});


/**
 *
 */
router.get('/channel_config_json.json', async function (req, res) {

    let channel_id = req.query.channel_id;

    let sql_channel = ` select * from channel where channel_id = '${channel_id}' `;
    let sql_channel_info = await mysql.getRowsBySQlCase(sql_channel);

    let json_detail_de = new Buffer(sql_channel_info['originate_detail'], 'base64').toString();

    var fn = require('funclib');
    //fn.log(jsonstr, 'Persons');
    var jsonstr =JSON.parse(json_detail_de)
    var jsonformat = fn.pretty(jsonstr);




    res.send({
        "code": 0
        , "msg": ""
        , "data": jsonformat

    });


});





/**
 ******************************************************************************************************************
 *
 * keyset_detail.json
 *
 * 账本中key的明细
 *
 ******************************************************************************************************************
 */
router.get('/keyset_detail.json', async function (req, res) {



    let keyset_pkid = req.query.pkid;
    let sql_keyset = ` select * from keyset where pkid = ${keyset_pkid}`;
    let sql_keyset_info = await mysql.getRowsBySQlCase(sql_keyset);


    let pic_struct = await bcexplorerservice.get_fabric_keyset_struct(keyset_pkid);


    res.send({
                "code": 0,
                "msg": "",
                "keysetinfo": {"pkid":"121","channel_id": sql_keyset_info['channel_id'],"blocknum": sql_keyset_info['blocknum'],"transactionhash":sql_keyset_info['transactionhash'],"keyname": sql_keyset_info['keyname'],"isdelete": sql_keyset_info['isdelete'],"valuess": sql_keyset_info['valuess'],"chaincode": sql_keyset_info['chaincode'],"trandtstr": sql_keyset_info['trandtstr']},
                "count_info": {"org": 3, "orderer": 1, "fabric_ca": 1, "peer": 3, "channel": 2, "blocks": 20, "chaincodes": 12, "tx": 113, "keyset": 121, "acccount": 7},
                "pic_struct": pic_struct
            });


    /**
     * {
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
                                        "blocknums": 110,
                                        "blocks": [
                                            {
                                                "id": 11,
                                                "flag": "block",
                                                "blocknum": 13,
                                                "blockhansh": "qewrsdasfwqerewiucuiqcnriqouneru81-247un1234choifnunu38",
                                                "transactions": [
                                                    {
                                                        "id": 13,
                                                        "name": "1234;lkj1234kj12l123l4kj12lk34j",
                                                        "flag": "transaction",
                                                        "txhash": "",
                                                        "keysets": [
                                                            {
                                                                "id": 11,
                                                                "flag": "keyset",
                                                                "name": "fb14_c2c_study2_keyc2c"
                                                            }
                                                        ],
                                                        "chaincode": {
                                                            "id": 3,
                                                            "flag": "chaincodeinstance",
                                                            "name": "fb14_c2c_study",
                                                            "version": "1.0"
                                                        }
                                                    }
                                                ]
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
                ],
                "orderers": [
                    {
                        "id": 3,
                        "flag": "orderer",
                        "name": "ordererorg1"
                    }
                ]
            }
     */

});


/**
 ******************************************************************************************************************
 *
 * keyset_list.json
 *
 * 账本中的keyset明细列表
 *
 ******************************************************************************************************************
 */
router.get('/keyset_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/


    /** 查询某个证书签名过的交易 */
    let certsmd5 = req.query.certsmd5;
    if (certsmd5 !== undefined && certsmd5 !== '') {
        where = where + `and keyname in (select keyname from keyset_history where  transactionhash in  (select transhash from trans_ref_account where account_cert_md5 = '${certsmd5}' ) ) `;
    }



    /** 交易页面中发送来的需要查询和交易关联的key的请求消息 */
    let txpkid = req.query.txpkid;

    if (txpkid !== undefined && txpkid !== '' && txpkid !=='-1') {

        let tx = await mysql.getRowByPk('transactions', 'txhash', 'pkid', txpkid);
        let txhash = tx['txhash'];
        where = where + `and transactionhash = '${txhash}' `;

    }

    if (req.query.mspid !== undefined && req.query.mspid !== '' && req.query.mspid !=='-1') {

        searchparm['mspid'] = req.query.channel_id;
        let mspid = req.query.mspid;
        where = where + `and channel_id in ( select channel_id from org_ref_channel where mspid = '${mspid}') `;

    }


    if (req.query.blockpkid !== undefined && req.query.blockpkid !== '' && req.query.blockpkid !=='-1') {

        let blockitem = await mysql.getRowByPk('blocks', '*', 'pkid', req.query.blockpkid );
        let blocknum = blockitem['blocknum'];
        let channel_id = blockitem['channel_id'];


        where = where + `and channel_id = '${channel_id}' and blocknum = ${blocknum} `;


    }

    //在chaincode详情中获取由当前chaincode发起的key
    if (req.query.chaincodes_pkid !== undefined && req.query.chaincodes_pkid !== '' && req.query.chaincodes_pkid !=='-1') {

        let chaincode = await mysql.getRowByPk('chaincodes', '*', 'pkid', req.query.chaincodes_pkid );
        let chaincode_name = chaincode['name'];
        let channel_id = chaincode['channel_id'];


        where = where + `and channel_id = '${channel_id}' and chaincode_name = '${chaincode_name}' `;


    }


    if (req.query.channel_id != undefined && req.query.channel_id != '') {
        searchparm['channel_id'] = req.query.channel_id;
        where = where + `and channel_id = '${req.query.channel_id}' `;
    }
    if (req.query.blocknum != undefined && req.query.blocknum != '') {
        searchparm['blocknum'] = req.query.blocknum;
        where = where + `and blocknum = '${req.query.blocknum}' `;
    }
    if (req.query.blockhash != undefined && req.query.blockhash != '') {
        searchparm['blockhash'] = req.query.blockhash;
        where = where + `and blockhash = '${req.query.blockhash}' `;
    }
    if (req.query.transactionhash != undefined && req.query.transactionhash != '') {
        searchparm['transactionhash'] = req.query.transactionhash;
        where = where + `and transactionhash = '${req.query.transactionhash}' `;
    }
    if (req.query.keyname != undefined && req.query.keyname != '') {
        searchparm['keyname'] = req.query.keyname;
        where = where + `and keyname = '${req.query.keyname}' `;
    }
    if (req.query.isdelete != undefined && req.query.isdelete != '') {
        searchparm['isdelete'] = req.query.isdelete;
        where = where + `and isdelete = '${req.query.isdelete}' `;
    }
    if (req.query.valuess != undefined && req.query.valuess != '') {
        searchparm['valuess'] = req.query.valuess;
        where = where + `and valuess = '${req.query.valuess}' `;
    }
    if (req.query.chaincode_name != undefined && req.query.chaincode_name != '') {
        searchparm['chaincode_name'] = req.query.chaincode_name;
        where = where + `and chaincode_name = '${req.query.chaincode_name}' `;
    }
    if (req.query.trandtstr != undefined && req.query.trandtstr != '') {
        searchparm['trandtstr'] = req.query.trandtstr;
        where = where + `and trandtstr = '${req.query.trandtstr}' `;
    }
    if (req.query.transnums != undefined && req.query.transnums != '') {
        searchparm['transnums'] = req.query.transnums;
        where = where + `and transnums = '${req.query.transnums}' `;
    }
    if (req.query.createdt != undefined && req.query.createdt != '') {
        searchparm['createdt'] = req.query.createdt;
        where = where + `and createdt = '${req.query.createdt}' `;
    }
    if (req.query.remark != undefined && req.query.remark != '') {
        searchparm['remark'] = req.query.remark;
        where = where + `and remark = '${req.query.remark}' `;
    }


    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,channel_id,blocknum,blockhash,transactionhash,keyname,isdelete,valuess,chaincode_name,trandtstr,transnums,DATE_FORMAT(keyset_createdt,'%Y-%m-%d %H:%i:%S') as createdt from keyset  where ${where} `;
    let sql_count = ` select count(pkid) as nums from  keyset  where ${where} `;

    let keyset_counts = await mysql.getRowCount4Sql(sql_count, 'nums');
    let keyset = await mysql.getRowsBySQl(sql, searchparm, '', `${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": keyset_counts
        , "data": keyset
    });

});


/**
 ******************************************************************************************************************
 *
 * keysethistory_list.json
 *
 *
 ******************************************************************************************************************
 */
router.get('/keysethistory_list.json', async function (req, res) {

    logger.debug(req.query);

    let page = (req.query.page - 1) * (req.query.limit);
    let limit = req.query.limit;

    logger.debug({page: page, limit: limit})

    let searchparm = {};
    let where = " (1=1) ";


    /**根据客户端发送的查询参数，拼接查询条件*/

    let keysetpkid = req.query.keysetpkid;

    if (keysetpkid !== undefined && keysetpkid !== '' && keysetpkid !=='-1') {

        let keyset = await mysql.getRowByPk( 'keyset', 'transactionhash,channel_id,chaincode_name', 'pkid', keysetpkid );
        let txhash = keyset['transactionhash'];
        let channel_id = keyset['channel_id'];
        let chaincode_name = keyset['chaincode_name'];

        where = where + `and transactionhash = '${txhash}' and chaincode_name = '${chaincode_name}' and channel_id = '${channel_id}' `;

    }


    /** 通用查询条件*/
    if(  req.query.channel_id !== undefined && req.query.channel_id !== '' ){
        searchparm['channel_id'] = req.query.channel_id;
        where = where +  `and channel_id = '${req.query.channel_id}' `;
    }
    if(  req.query.blocknum !== undefined && req.query.blocknum !== '' ){
        searchparm['blocknum'] = req.query.blocknum;
        where = where +  `and blocknum = '${req.query.blocknum}' `;
    }
    if(  req.query.blockhash !== undefined && req.query.blockhash !== '' ){
        searchparm['blockhash'] = req.query.blockhash;
        where = where +  `and blockhash = '${req.query.blockhash}' `;
    }
    if(  req.query.transactionhash !== undefined && req.query.transactionhash !== '' ){
        searchparm['transactionhash'] = req.query.transactionhash;
        where = where +  `and transactionhash = '${req.query.transactionhash}' `;
    }
    if(  req.query.keyname !== undefined && req.query.keyname !== '' ){
        searchparm['keyname'] = req.query.keyname;
        where = where +  `and keyname = '${req.query.keyname}' `;
    }
    if(  req.query.valuess !== undefined && req.query.valuess !== '' ){
        searchparm['valuess'] = req.query.valuess;
        where = where +  `and valuess = '${req.query.valuess}' `;
    }
    if(  req.query.trandtstr !== undefined && req.query.trandtstr !== '' ){
        searchparm['trandtstr'] = req.query.trandtstr;
        where = where +  `and trandtstr = '${req.query.trandtstr}' `;
    }
    if(  req.query.chaincode_name !== undefined && req.query.chaincode_name !== '' ){
        searchparm['chaincode_name'] = req.query.chaincode_name;
        where = where +  `and chaincode_name = '${req.query.chaincode_name}' `;
    }
    if(  req.query.createdt !== undefined && req.query.createdt !== '' ){
        searchparm['createdt'] = req.query.createdt;
        where = where +  `and createdt = '${req.query.createdt}' `;
    }
    if(  req.query.remark !== undefined && req.query.remark !== '' ){
        searchparm['remark'] = req.query.remark;
        where = where +  `and remark = '${req.query.remark}' `;
    }
    if(  req.query.txcreatedt_str !== undefined && req.query.txcreatedt_str !== '' ){
        searchparm['txcreatedt_str'] = req.query.txcreatedt_str;
        where = where +  `and txcreatedt_str = '${req.query.txcreatedt_str}' `;
    }
    if(  req.query.txcreatedt !== undefined && req.query.txcreatedt !== '' ){
        searchparm['txcreatedt'] = req.query.txcreatedt;
        where = where +  `and txcreatedt = '${req.query.txcreatedt}' `;
    }




    logger.debug(searchparm);
    logger.debug(where);

    let sql = `select  pkid,channel_id,blocknum,blockhash,transactionhash,keyname,valuess,trandtstr,chaincode_name,createdt, DATE_FORMAT(txcreatedt,'%Y-%m-%d %H:%i:%S') as txcreatedt_str,DATE_FORMAT(txcreatedt,'%Y-%m-%d %H:%i:%S') as txcreatedt from keyset_history  where ${where} `;
    let sql_count = ` select count(pkid) as nums from  keyset_history  where ${where} `;

    let keyset_history_counts = await mysql.getRowCount4Sql(sql_count,'nums');
    let keyset_history = await mysql.getRowsBySQl(sql , searchparm ,'',`${page},${limit}`);


    res.send({
        "code": 0
        , "msg": ""
        , "count": keyset_history_counts
        , "data": keyset_history});

});




module.exports = router;