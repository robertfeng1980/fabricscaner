/*
 Copyright ONECHAIN 2018-2020 All Rights Reserved.

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

let bcconfig = require('../config.json');
let fabricservice = require('./fabricservice');
let sql = require('../db/mysqlservice4pool')
let mysql = require('../db/mysqlservice4pool')


let config = require('../config.json');
let log4js = require('log4js');
log4js.configure(config.log4jsconfig);
let logger = log4js.getLogger('console');


let orgnamemap = initConfig(0);
let orgmspidmap = initConfig(1);


function initConfig(types) {

    let orgs = bcconfig['orgs'];
    let orgnamemap = {};
    let peers = {};


    for (let ind = 0; ind < orgs.length; ind++) {

        let peermap = {};
        let org = orgs[ind];
        let peers = org['peers'];

        for (let pind = 0; pind < peers.length; pind++) {

            let peer = peers[pind];
            peermap[peer['name']] = peer;
        }


        org['peernamemap'] = peermap;


        if (types == 0) {
            let orgname = org['name'];
            orgnamemap[orgname] = org;
        } else if (types == 1) {

            let orgmspid = org['mspid'];
            orgnamemap[orgmspid] = org;

        }


    }

    return orgnamemap;
}


/**
 * 保存组织
 * @param org
 */
let saveOrg = async (org) => {

    let mspid = org['mspid'];

    let org_check = await sql.getRowByPkOne(` select pkid from organization where mspid = '${mspid}'  `)

    if (org_check == null) {

        let organization = {

            'name': org.name,
            'commitss': org.name,
            'mspid': org.mspid,
            'adminkey': org.admin.key,
            'admincert': org.admin.cert

        }

        let org_result = await sql.saveRow('organization', organization);

    }


}


let getPeerRequest = (peerrequest) => {

    if (bcconfig.enableTls) {
        return "grpcs://" + peerrequest;
    } else {

        return "grpc://" + peerrequest;
    }

}


/**
 * 根据OrgMspId的值获取Org中包含的Peer节点
 * @param orgmspid
 */
let getPeers4OrgMspId = function (orgmspid) {

    return orgmspidmap[orgmspid]['peers'];

}

/**
 * 根据OrgMspId的值获取Org中包含的Peer节点
 * @param orgmspid
 */
let getPeers4Org = function (orgname) {

    return orgnamemap[orgname]['peers'];

}


let getCurrOrgPeers = () => {

    let orgname = ledgerMgr.getCurrOrg();
    return getPeers4Org(orgname);

}


/**
 *
 * @param orgname
 * @param peername
 *
 */
let getPeer = function (orgname, peername) {

    return orgnamemap[orgname]['peernamemap'][peername];

}


/** ================  fabric service   ================**/


/**
 *
 * 获取fabric网络结构图
 *
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_network_struct = async ()=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;

    let sql_count = `select  fabric_cas as fabric_ca , peers as peer , channels as channel , blocks as blocks , chaincodes as chaincodes, txcount as tx, keysets as keyset, account_certs as acccount from fabricnetwork where pkid = 1 `;

    let sql_count_info = await mysql.getRowsByFullSQl(sql_count);

    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    let sql_ca = ` select pkid as id  , mspid,org_name,ca_name ,"fabric_ca" as flag from fabricca `;
    let sql_ca_info = await mysql.getRowsByFullSQl(sql_ca);

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");

    let sql_cc_install = `select pkid as id , "chaincodeinstall" as flag , commitss ,name, version ,peer_name from  chaincodes where ccstatus = 0  `;
    let sql_cc_install_map = await mysql.getSQL2Map4Arr(sql_cc_install,"peer_name");

    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);


    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions group by channel_id   `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");

    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset group by channel_id  `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    let count_info = sql_count_info[0];
    count_info['org'] = sql_org_info.length;
    count_info['orderer'] = sql_orderer_info == null ? 0 : sql_orderer_info.length;

    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;

                //设置peer的install状态chaincode属性。
                peer['installcc'] = sql_cc_install_map[peer_name];





            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};


    let http_reponse = {
        "code": 0
        , "msg": ""
        , "count_info":count_info
        , "pic_struct": pic_struct
    }

    logger.debug(JSON.stringify(http_reponse));
    return pic_struct;

}


/**
 *
 * 通道网络结构图
 *
 * @param channel_id
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_channel_struct = async ( channel_id )=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;


    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);


    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  where name in ( select peer_name from peer_ref_channel where channel_id = '${channel_id}' ) `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel where channel_id = '${channel_id}'  `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel where channel_id = '${channel_id}'   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");

    let sql_cc_install = `select pkid as id , "chaincodeinstall" as flag , commitss ,name, version ,peer_name from  chaincodes where ccstatus = 0 and channel_id = '${channel_id}' `;
    let sql_cc_install_map = await mysql.getSQL2Map4Arr(sql_cc_install,"peer_name");

    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1 and channel_id = '${channel_id}'  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);


    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions  where channel_id = '${channel_id}'  group by channel_id     `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");

    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset  where channel_id = '${channel_id}'  group by channel_id   `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            //let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;

                //设置peer的install状态chaincode属性。
                peer['installcc'] = sql_cc_install_map[peer_name];





            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};

    /*

        let http_reponse = {
            "code": 0
            , "msg": ""
            , "pic_struct": pic_struct
        }
    */

    logger.debug(JSON.stringify(pic_struct));
    return pic_struct;

}




/**
 *
 * 区块网络结构图
 *
 * @param channel_id
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_block_struct = async ( blockpkid )=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;

    let sql_block = ` select *,DATE_FORMAT(blockcreatedt,'%Y-%m-%d %H:%i:%S') as blockdtstr from blocks where pkid = '${blockpkid}' `;
    let sql_block_info = await mysql.getRowsBySQlCase(sql_block);
    let channel_id = sql_block_info['channel_id'];

    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  where name in ( select peer_name from peer_ref_channel where channel_id = '${channel_id}' ) `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel where channel_id = '${channel_id}'  `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel where channel_id = '${channel_id}'   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");

    let sql_cc_install = `select pkid as id , "chaincodeinstall" as flag , commitss ,name, version ,peer_name from  chaincodes where ccstatus = 0 and channel_id = '${channel_id}' `;
    let sql_cc_install_map = await mysql.getSQL2Map4Arr(sql_cc_install,"peer_name");

    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1 and channel_id = '${channel_id}'  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);

    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions  where channel_id = '${channel_id}'  group by channel_id     `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");
    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset  where channel_id = '${channel_id}'  group by channel_id   `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            //let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;

                //设置peer的install状态chaincode属性。
                peer['installcc'] = sql_cc_install_map[peer_name];





            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};

    /*

        let http_reponse = {
            "code": 0
            , "msg": ""
            , "pic_struct": pic_struct
        }
    */

    logger.debug(JSON.stringify(pic_struct));
    return pic_struct;

}



/**
 *
 * chaincode网络结构图
 *
 * @param channel_id
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_cc_struct = async ( chaincodes_pkid )=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;


    let sql_cc = ` select * from chaincodes where pkid = '${chaincodes_pkid}' `;
    let sql_cc_info = await mysql.getRowsBySQlCase(sql_cc);
    let channel_id = sql_cc_info['channel_id'];


    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  where name in ( select peer_name from peer_ref_channel where channel_id = '${channel_id}' ) `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel where channel_id = '${channel_id}'  `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel where channel_id = '${channel_id}'   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");

    let sql_cc_install = `select pkid as id , "chaincodeinstall" as flag , commitss ,name, version ,peer_name from  chaincodes where ccstatus = 0 and channel_id = '${channel_id}' `;
    let sql_cc_install_map = await mysql.getSQL2Map4Arr(sql_cc_install,"peer_name");

    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1 and channel_id = '${channel_id}'  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);

    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions  where channel_id = '${channel_id}'  group by channel_id     `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");
    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset  where channel_id = '${channel_id}'  group by channel_id   `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            //let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;

                //设置peer的install状态chaincode属性。
                peer['installcc'] = sql_cc_install_map[peer_name];





            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};

    /*

        let http_reponse = {
            "code": 0
            , "msg": ""
            , "pic_struct": pic_struct
        }
    */

    logger.debug(JSON.stringify(pic_struct));
    return pic_struct;

}



/**
 *
 * 交易网络结构图
 *
 * @param channel_id
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_tx_struct = async ( txpkid )=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;


    let sql_tx = ` select  pkid , channel_id ,txhash , chaincode_name from transactions where  pkid = ${txpkid}   `;
    let sql_tx_info = await mysql.getRowsBySQlCase(sql_tx);
    let channel_id = sql_tx_info['channel_id'];
    let transactionhash = sql_tx_info['txhash'];
    let chaincode_name = sql_tx_info['chaincode_name'];


    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  where name in ( select peer_name from peer_ref_channel where channel_id = '${channel_id}' ) `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel where channel_id = '${channel_id}'  `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel where channel_id = '${channel_id}'   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");


    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1 and channel_id = '${channel_id}' and name = '${chaincode_name}'  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);

    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions  where pkid = ${txpkid}   group by channel_id     `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");
    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset  where transactionhash = '${transactionhash}'  group by channel_id   `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            //let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;






            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};

    /*

        let http_reponse = {
            "code": 0
            , "msg": ""
            , "pic_struct": pic_struct
        }
    */

    logger.debug(JSON.stringify(pic_struct));
    return pic_struct;

}



///

/**
 *
 * 交易网络结构图
 *
 * @param channel_id
 * @returns {Promise<{orgs, orderers}>}
 *
 */
let get_fabric_keyset_struct = async ( keysetpkid )=>{

    //let sql_count = `select sum(fabric_cas) as fabric_ca ,sum(peers) as peer ,sum(channels) as channel ,sum(blocks) as block ,sum(chaincodes) as chaincodes,sum(txcount) as tx,sum(keysets) as keyset,sum(account_certs) as acccount from organization  `;


    let sql_tx = ` select  pkid , channel_id , transactionhash , chaincode_name from keyset where  pkid = ${keysetpkid} `;
    let sql_tx_info = await mysql.getRowsBySQlCase(sql_tx);
    let channel_id = sql_tx_info['channel_id'];
    let transactionhash = sql_tx_info['transactionhash'];
    let chaincode_name = sql_tx_info['chaincode_name'];


    let sql_org = ` select pkid as id ,name,mspid , commitss , "org" as flag from organization where  mspid in ( select mspid from org_ref_channel where channel_id = '${channel_id}' )  `;
    let sql_org_info = await mysql.getRowsByFullSQl(sql_org);

    let sql_orderer = `select  pkid as id ,orderer_mspid as name ,"orderer" as flag from  orderer  `;
    let sql_orderer_info = await mysql.getRowsByFullSQl(sql_orderer);

    let sql_peer = ` select  pkid as id ,mspid,name ,"peer" as flag from  peer  where name in ( select peer_name from peer_ref_channel where channel_id = '${channel_id}' ) `;
    let sql_peer_map = await mysql.getSQL2Map4Arr(sql_peer,"mspid");

    let sql_channel = ` select  peer_name,channel_id,"channel" as flag from  peer_ref_channel where channel_id = '${channel_id}'  `;
    let sql_channel_map = await mysql.getSQL2Map4Arr(sql_channel,"peer_name");

    let sql_channelinfo = ` select blocks, pkid as id , commitss  ,channel_id,originate_dt,"channel" as flag from  channel where channel_id = '${channel_id}'   `;
    let sql_channelinfo_map = await mysql.getSQL2Map(sql_channelinfo,"channel_id");


    let sql_cc_instance = ` select pkid as id , "chaincodeinstance" as flag , commitss ,name, version , channel_id,peer_name  from  chaincodes where ccstatus = 1 and channel_id = '${channel_id}' and name = '${chaincode_name}'  `;
    let sql_cc_instance_info = await mysql.getRowsByFullSQl(sql_cc_instance);

    let sql_tx_count = `select channel_id , count(pkid) as txnums from transactions  where txhash = '${transactionhash}'   group by channel_id     `;
    let sql_tx_count_map = await mysql.getSQL2Map(sql_tx_count,"channel_id");
    //=====

    let sql_keyset_count = `select channel_id , count(pkid) as keysetnums from keyset  where transactionhash = '${transactionhash}'  group by channel_id   `;
    let sql_keyset_count_map = await mysql.getSQL2Map(sql_keyset_count,"channel_id");




    //将chaincode 按照peer 和 channel分成数组
    let cc_instance_map = {};

    if( sql_cc_instance_info !== null && sql_cc_instance_info!== '' || sql_cc_instance_info !== undefined ){


        for( let ccinstanceind = 0 ; ccinstanceind < sql_cc_instance_info.length;ccinstanceind++ ){

            let cc_instance = sql_cc_instance_info[ccinstanceind];
            let cc_peer = cc_instance['peer_name'];
            let cc_channel_id = cc_instance['channel_id'];

            let cc_peer_channels = cc_instance_map[cc_peer];

            if( cc_peer_channels === '' || cc_peer_channels === '' || cc_peer_channels === undefined  ){
                cc_peer_channels = {};

            }

            let cc_peer_channels_cc = cc_peer_channels[cc_channel_id];

            if( cc_peer_channels_cc === '' || cc_peer_channels_cc === '' || cc_peer_channels_cc === undefined  ){
                cc_peer_channels_cc = [];

            }

            cc_peer_channels_cc.push(cc_instance);
            cc_peer_channels[cc_channel_id] = cc_peer_channels_cc;

            cc_instance_map[cc_peer] = cc_peer_channels;

        }


    }



    /*let sql_chaincodeinfo = `select  peer_name,channel_id,languages,name,version,path,ccstatus from  chaincodes`;
    let sql_chaincodeinfo_info = await mysql.getRowsBySQl( sql_chaincodeinfo , '' , '' , '');*/


    logger.debug(JSON.stringify(sql_channelinfo_map));


    for( let oind = 0 ; oind < sql_org_info.length;oind++){

        let curr_orgmspid = sql_org_info[oind]['mspid'];
        let org_peers = sql_peer_map[curr_orgmspid];
        if( org_peers !== null && org_peers!=='' && org_peers!==undefined ){


            //设置每个peer的channel
            for( let pind = 0 ; pind<org_peers.length ;  pind++ ){

                let peer_name = org_peers[pind]['name'];
                let peer_channels = sql_channel_map[peer_name];
                let peer = org_peers[pind];


                //绑定peer节点中包含的channel中的chaincode信息
                if( peer_channels !== null && peer_channels!=='' && peer_channels!==undefined ) {

                    //设置每个peer的channel
                    for (let channelind = 0; channelind < peer_channels.length; channelind++) {

                        let channel = peer_channels[channelind];
                        let channel_id = channel['channel_id']

                        let channel_instace_cc;

                        if( cc_instance_map[peer_name] !== null && cc_instance_map[peer_name] !== undefined ){

                            //let dd  = cc_instance_map[peer_name];
                            channel_instace_cc = cc_instance_map[peer_name][channel_id];
                            channel['instanceccs'] = channel_instace_cc;

                        }


                        let channel_detail = sql_channelinfo_map[channel_id];
                        channel['id'] = channel_detail['id'];
                        channel['blocknumbers'] = channel_detail['blocks'];
                        channel['commitss'] = channel_detail['commitss'];

                        channel['txnums'] = sql_tx_count_map[channel_id]['txnums'];

                        let parm_channel_id =  sql_keyset_count_map[channel_id];
                        if( parm_channel_id !== null && parm_channel_id !== '' && parm_channel_id !== undefined  )
                            channel['keysetnums'] = parm_channel_id['keysetnums'];


                    }
                }

                //设置peer的channel属性
                peer['channels']=peer_channels;






            }

            sql_org_info[oind]['peers'] = org_peers;


        }

    }


    let pic_struct = {'orgs': sql_org_info, "orderers": sql_orderer_info};

    /*

        let http_reponse = {
            "code": 0
            , "msg": ""
            , "pic_struct": pic_struct
        }
    */

    logger.debug(JSON.stringify(pic_struct));
    return pic_struct;

}



/**  /////////////////////////=======================================================================================================================================//////////////////////// */



let testfunc = async (orgname) => {

    let org = orgnamemap[orgname];
    let tempdir = bcconfig['keyValueStore'];
    let adminkey = org['admin']['key'];
    let admincert = org['admin']['cert'];

    fabricservice.inits(tempdir, adminkey, admincert);


    let peerrequest = {
        "requests": "grpc://10.211.55.5:7051",
        "serverhostname": "peer0.org1.robertfabrictest.com",
        "tls_cacerts": "/project/opt_fabric/fabricconfig/crypto-config/peerOrganizations/org1.robertfabrictest.com/peers/peer0.org1.robertfabrictest.com/tls/ca.crt",
        "mspid": "Org1MSP"
    }


    //let orderers = getOrdersRequestInfo(bcconfig['orderer']);


    /* let orderers = getOrdersRequestInfo(bcconfig['orderer']);
     let channelcontainorg = await fabricservice.getChannelConfing('fabrictestchannel',peerrequest,orderers) ;
     console.info(channelcontainorg['config']['channel_group'])*/
    //console.info(JSON.stringify(channelcontainorg['config']['channel_group']))

    /*
        let channeljoinorgs = channelcontainorg['config']['channel_group']['groups']['map']['Application']['value']['groups']['map'];
        let join_groups = [];

        for( orgkey in channeljoinorgs ){
            join_groups.push(orgkey);
        }
    */

    /*let orderers = getOrdersRequestInfo(bcconfig['orderer']);
   let join_groups = await getChannelJoinOrg('fabrictestchannel',peerrequest,orderers,fabricservice)
   console.info( join_groups );*/


    // 重新获取所有的交易的信息
    /*let trans = await sql.getRowsByFullSQl(` select * from  transaction where txhash !== '' `);

    for (let ind = 0; ind < trans.length; ind++) {

        let tran = trans[ind];
        let txpkid = tran['pkid'];

        let txhash = tran['txhash'];
        let channel = tran['channel_id'];

        let transobject = await fabricservice.getTransaction(channel, peerrequest, txhash);

        let transobject_createdt =  transobject['transactionEnvelope']['payload']['header']['channel_header']['timestamp'];

        let mysql_date = getDateStr4Date(new Date(transobject_createdt),'yyyy-MM-dd h:m:s');

        await sql.updateBySql(` update transaction set txcreatedt = '${mysql_date}' where pkid =  ${txpkid}`);

        //let acctount4tran = fabricservice.parseraccount4Tx(transobject);

        //saveAccount4Tx(transobject);


    }*/

    //重置区块的生成时间


    let blocks = await sql.getRowsByFullSQl(` select * from  blocks  `);

    for (let ind = 0; ind < blocks.length; ind++) {

        let block = blocks[ind];

        let channel_id = block['channel_id'];
        let block_num = block['blocknum'];
        let pkid = block['pkid'];


        let blockinfo = await fabricservice.getblockInfobyNum(channel_id, peerrequest, block_num);

        let blockcreatedt = blockinfo['data']['data'][0]['payload']['header']['channel_header']['timestamp'];
        let mysql_date = getDateStr4Date(new Date(blockcreatedt), 'yyyy-MM-dd hh:mm:ss.S');

        sql.updateBySql(` update blocks set blockcreatedt='${mysql_date}' where pkid = ${pkid} `);

    }

    /* let peerchannel = await fabricservice.getPeerChannel( peerrequest );
     console.info(JSON.stringify(peerchannel));*/

    //console.info(JSON.stringify(peerchannel));
    /*let blockchaininfo = await fabricservice.getBlockChainInfo('roberttestchannel', peerrequest);
    console.info(JSON.stringify(blockchaininfo));*/


    //for (let ind = 30; ind < 179; ind++) {


    /* let blockinfo = await fabricservice.getblockInfobyNum('roberttestchannel', peerrequest, 94);

     console.info(JSON.stringify(blockinfo['data']['data'][0]['payload']['header']['channel_header']['tx_id']));
     console.info(JSON.stringify(blockinfo['data']['data'][0]['payload']['header']['channel_header']['timestamp']));
     console.info(JSON.stringify(blockinfo['data']['data'][0]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']));*/


    //console.info((JSON.stringify(getkeyset4Transaction(blockinfo['data']['data'][0]))));
    //console.info((JSON.stringify(getkeyset4Transaction(blockinfo['data']['data'][0]))));


    //}
    //let peerchannels = await fabricservice.getPeerChannel('grpc://10.211.55.5:7051');
    //let peerchannels = await fabricservice.getPeerChannel('grpc://172.16.10.186:7051');
    /*let peerchannels = await fabricservice.getPeerChannel('grpc://172.16.10.187:7051');
    console.info(  JSON.stringify( peerchannels) );*/
    //{"channels":[{"channel_id":"roberttestchannel"},{"channel_id":"roberttestchannelnew"}]}


    /* let installcc = await fabricservice.getPeerInstallCc(peerrequest);

     console.info(JSON.stringify(installcc));*/
    //let instancecc = await fabricservice.getPeerInstantiatedCc('roberttestchannel12','grpc://10.211.55.5:7051');


    //let transinfo = await fabricservice.getTransaction('roberttestchannel','grpc://10.211.55.5:7051','56f51f9a54fb4755fd68c6c24931234a59340f7c98308374e9991d276d7d4a96')

    //获取被调用chaincode  和 keyset 的代码
    //console.info(  JSON.stringify( transinfo['transactionEnvelope']['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset']) );

    //获取被调用chaincode背书节点的信息
    //console.info(  JSON.stringify( transinfo['transactionEnvelope']['payload']['data']['actions'][0]['payload']['action']['endorsements']) );


    //测试数据库

    /*let testsqlresult = await sql.saveRow('blocks',{
        'channel_id':'roberttestchannel',
        'blocknum':
        'datahash':'ddddddddddd',
        'perhash':'dddddddd',
        'txcount':13,
        'remark':'ddd',
    });


    console.info(  JSON.stringify( testsqlresult) );*/


    /*
        let channels = await sql.getRowsBySQl('select * from channel ','','');
        console.info(  JSON.stringify( channels) )
    */

    //sql.closeconnection();

}


/**
 *
 * 获取当前的通道加入的组织
 *
 *
 * @param channelid
 * @param peer
 * @param orderers
 * @returns {Promise<void>}
 *
 *
 */
let getChannelJoinOrg = async (channelid, peer, orderers, fabricservice) => {

    let channelcontainorg = await fabricservice.getChannelConfing(channelid, peer, orderers);

    // logger.debug(channelcontainorg['config']['channel_group']['groups']['map']['Application']['value']['groups']);
    let channeljoinorgs = channelcontainorg['config']['channel_group']['groups']['map']['Application']['value']['groups']['map'];
    let join_groups = [];

    for (orgkey in channeljoinorgs) {
        join_groups.push(orgkey);
    }


    return join_groups

}


/**
 * 系统启动时第一次调用
 */
let startUp = () => {

    let orgs = bcconfig['orgs'];

    for (let ind = 0; ind < orgs.length; ind++) {

        let peermap = {};
        let org = orgs[ind];

        saveOrg(org);
    }

}


/**
 * 数据统计
 */
let static_count = async () => {



    // chaincode 统计
    let chaincode_sql = `UPDATE chaincodes cc
                            SET 
                            peers = ( select count(pkid) from peer_ref_chaincode prefcc where prefcc.chaincode_name = cc.name ),
                            txcount = ( SELECT count( pkid ) FROM transactions ts where ts.chaincode_name = cc.name ),
                            keysets = ( SELECT count( pkid ) FROM keyset ks where ks.chaincode_name = cc.name ),
                            account_certs = ( SELECT count( DISTINCT(account_cert_md5) ) FROM trans_ref_account trefacc where trefacc.chaincode_name = cc.name) `;

    await sql.updateBySql(chaincode_sql);



    // channel 统计
    let channel_sql = `UPDATE channel c 
                        SET chaincodes = ( SELECT count( DISTINCT ( name ) ) FROM chaincodes cc WHERE cc.channel_id = c.channel_id ),
                        txcount = ( SELECT count( pkid ) FROM transactions tt WHERE tt.channel_id = c.channel_id ),
                        keysets = ( SELECT count( pkid ) FROM keyset ks WHERE ks.channel_id = c.channel_id ),
                        account_certs = ( SELECT count( DISTINCT(account_cert_md5) ) FROM trans_ref_account  trefacc where trefacc.channel_id = c.channel_id )`;

    await sql.updateBySql(channel_sql);



    // peer 统计
    let peer_sql = `UPDATE peer p
                    SET 
                    channels = ( SELECT count( pkid ) FROM peer_ref_channel prefc where peer_name = p.name  ),
                    blocks = (select sum(countblocks+1) from channel  cl where cl.channel_id in ( select channel_id from peer_ref_channel prefc where prefc.peer_name = p.name   ) ),
                    chaincodes = ( SELECT count( pkid ) FROM peer_ref_chaincode perfcc where perfcc.peer_name = p.name ),
                    txcount = ( select sum(txcount) from channel  cl where cl.channel_id in ( select channel_id from peer_ref_channel prefc where prefc.peer_name = p.name   ) ),
                    keysets = ( select sum(keysets) from channel  cl where cl.channel_id in ( select channel_id from peer_ref_channel prefc where prefc.peer_name = p.name   ) ),
                    account_certs = ( select count(DISTINCT(account_cert_md5)) from trans_ref_account  rrefacc where rrefacc.channel_id in ( select channel_id from peer_ref_channel prefc where prefc.peer_name = p.name  ) )`;

    await sql.updateBySql( peer_sql );




    // org 统计
    let org_sql = `UPDATE organization org
                    SET fabric_cas = ( SELECT count( pkid ) FROM fabricca ca where ca.mspid = org.mspid ),
                    peers = ( SELECT count( pkid ) FROM peer p where p.mspid = org.mspid ),
                    channels = ( SELECT count( pkid ) FROM org_ref_channel orgrc where orgrc.mspid = org.mspid ),
                    chaincodes = ( SELECT count( DISTINCT(name)) FROM chaincodes cc  where cc.channel_id in ( select channel_id from org_ref_channel  orefc  where orefc.mspid = org.mspid ) ),
                    txcount = ( SELECT count( pkid ) FROM transactions tx  where tx.channel_id in ( select channel_id from org_ref_channel  orefc  where orefc.mspid = org.mspid ) ),
                    keysets = ( SELECT count( DISTINCT (keyname) ) FROM keyset ks where  ks.channel_id in ( select channel_id from org_ref_channel  orefc  where orefc.mspid = org.mspid )),
                    account_certs = ( SELECT count( DISTINCT(account_cert_md5) ) FROM trans_ref_account accs  where accs.channel_id in ( select channel_id from org_ref_channel  orefc  where orefc.mspid = org.mspid ) )  where org.admincert != '' and org.adminkey != ''`;

    await sql.updateBySql( org_sql );




    //更新整个网络的统计数
    let fabric_network_sql = `UPDATE fabricnetwork 
                                SET orgs = ( SELECT count( pkid ) FROM organization ),
                                orderers = ( SELECT count( pkid ) FROM orderer ),
                                fabric_cas = ( SELECT count( pkid ) FROM fabricca ),
                                peers = ( SELECT count( pkid ) FROM peer ),
                                channels = ( SELECT count( pkid ) FROM channel ),
                                blocks = ( SELECT count( pkid ) FROM blocks ),
                                chaincodes = ( SELECT count( DISTINCT(name)) FROM chaincodes ),
                                txcount = ( SELECT count( pkid ) FROM transactions ),
                                keysets = ( select count(DISTINCT(keyname)) from keyset ),
                                account_certs = ( SELECT count( pkid ) FROM accounts )`;


    await sql.updateBySql(fabric_network_sql);



}


/**
 * 解析所有的默认组织
 */
let parserDefaultOrg = async () => {

    //await mysql.openconnection();

    logger.info(`   ================== *************** ${getDateStr4Date(new Date(), 'yyyy-MM-dd hh:mm:ss.S')}  ***************** =====================   `);

    let orgs = await sql.getRowsByFullSQl(`select * from organization `);

    for (let ind = 0; ind < orgs.length; ind++) {

        let org = orgs[ind];
        let mspid = org['mspid'];
        await parserOrg(mspid);

    }


    //更新完成之后计算统计信息
    await static_count();

    //更新整个网络的统计数
    /*let fabric_network_sql = `UPDATE fabricnetwork
                                SET orgs = ( SELECT count( pkid ) FROM organization ),
                                orderers = ( SELECT count( pkid ) FROM orderer ),
                                fabric_cas = ( SELECT count( pkid ) FROM fabricca ),
                                peers = ( SELECT count( pkid ) FROM peer ),
                                channels = ( SELECT count( pkid ) FROM channel ),
                                blocks = ( SELECT count( pkid ) FROM blocks ),
                                chaincodes = ( SELECT count( pkid ) FROM chaincodes ),
                                txcount = ( SELECT count( pkid ) FROM transactions ),
                                keysets = ( SELECT count( pkid ) FROM keyset ),
                                account_certs = ( SELECT count( pkid ) FROM accounts )
                                WHERE
                                    pkid = 1`;

    await sql.updateBySql(fabric_network_sql);*/

    /*  Object.keys(orgmspidmap).forEach((key)=>{

          //let v = orgmspidmap[k]

          logger.debug( "key ===   " + key  );
         // logger.debug(  v  );

          parserOrg(key);

      })*/

    //ßßßßawait mysql.closeconnection();
    //await mysql.closeconnection();


    logger.info(`   ================== ***************  ${getDateStr4Date(new Date(), 'yyyy-MM-dd hh:mm:ss.S')}   ***************** =====================   `);

}

/**
 * 提取指定MSPID的组织中的所有数据
 * @param orgname
 * @returns {Promise<void>}
 */
let parserOrg = async (orgname) => {


    let org = await sql.getRowsBySQlCase(`select * from organization where mspid = '${orgname}'`);

    let orgpeers = await sql.getRowsByFullSQl(`select * from peer where mspid = '${orgname}'`);

    let peers = orgpeers;


    let channelpeermap = {};
    let peerjoinchannels = [];
    let channelcontiantpeers = {};

    let tempdir = bcconfig['keyValueStore'];
    /*let adminkey = org['admin']['key'];
    let admincert = org['admin']['cert'];*/
    let adminkey = org['adminkey'];
    let admincert = org['admincert'];


    if (admincert != '' && admincert != undefined && adminkey != '' && adminkey != undefined) {


        fabricservice.inits(tempdir, adminkey, admincert);


        for (let ind = 0; ind < peers.length; ind++) {

            let peer = peers[ind];


            let peerchannel = await fabricservice.getPeerChannel(getPeerRequestInfo(peer));

            //console.info(  JSON.stringify( peerchannels) );
            logger.debug(peerchannel);
            let peerchannels = peerchannel['channels'];

            peer['channels'] = peerchannels;

            peerjoinchannels.push(peer);


            for (let cind = 0; cind < peerchannels.length; cind++) {

                let channel_id = peerchannels[cind]['channel_id'];

                if (channelpeermap[channel_id] == null)
                    channelpeermap[channel_id] = peer;


                if (channelcontiantpeers[channel_id] == null) {

                    let peernamemap = {};
                    peernamemap[peer['name']] = peer;
                    channelcontiantpeers[channel_id] = peernamemap;

                } else {

                    let peernamemap = channelcontiantpeers[channel_id];
                    peernamemap[peer['name']] = peer;
                    channelcontiantpeers[channel_id] = peernamemap;
                }


            }


        }


        //更新channel 以及  channel和peer的关系
        await modifypeers(peerjoinchannels);


        //更新每个peer上面的chaincode
        await modify_install_chaincode(peerjoinchannels, fabricservice);

        //更新channel上面的数据信息 区块链 交易 keyset
        await modify_channels(channelpeermap, fabricservice);


        //更新peer上面的状态为 install的 chaincode信息
        await modify_instantiated_chaincode(peerjoinchannels, tempdir, adminkey, admincert);
        /***/

        //sql.closeconnection();

    }


}


let getkeyset4Transaction = (transaction) => {


    let actions = transaction['payload']['data']['actions'];

    if (actions != null && actions[0]['payload'] != null) {

        let ns_rwset = transaction['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'];
        //console.info(JSON.stringify(blockinfo['data']['data'][0]['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['results']['ns_rwset'][1]['rwset']['writes']));

        let lsccflag = false;

        let keyset = {}

        for (let ind = 0; ind < ns_rwset.length; ind++) {

            let keysettemp = ns_rwset[ind];

            let namespace = keysettemp['namespace'];


            /*if (namespace !== 'lscc') {

                keyset = keysettemp;
                break;

            }else{

                keyset = keysettemp
                break;

            }*/

            keyset = keysettemp;
            break;

        }

        if (keyset != null && keyset['rwset'] != null)
            return {'chaincode': keyset['namespace'], 'writes': keyset['rwset']['writes']}
        else
            return {};


    } else
        return {};

}


let modify_install_chaincode = async (peers, fabricservice) => {


    for (let ind = 0; ind < peers.length; ind++) {

        let peer = peers[ind];
        let requests = peer['requests'];
        let peer_request = getPeerRequest(requests);
        let peer_name = peer['name'];

        //peer['requests'] = getPeerRequest(peer['requests']);

        let installcc = await fabricservice.getPeerInstallCc(getPeerRequestInfo(peer))

        let installccs = installcc['chaincodes'];


        for (let iind = 0; iind < installccs.length; iind++) {

            let installcctemp = installccs[iind];

            let name = installcctemp['name'];
            let version = installcctemp['version'];
            let path = installcctemp['path'];
            let escc = installcctemp['escc'];
            let vscc = installcctemp['vscc'];


            let chaincodes = {

                'peer_name': peer_name,
                'channel_id': '',
                'name': name,
                'commitss': name,
                'version': version,
                'path': path,
                'escc': escc,
                'vscc': vscc,
                'txcount': 0,
                'ccstatus': 0,
                'remark': '',

            };


            //保存chaincode
            let installccheck = await sql.getRowByPkOne(` select pkid from chaincodes where peer_name = '${peer_name}' and  name = '${name}' and version = '${version}'  `)

            if (installccheck == null) {
                let installinserresult = await sql.saveRow('chaincodes', chaincodes);
            } else {

                let cc_update_result = await sql.updateBySql(`update chaincodes set ccstatus = 0 where peer_name = '${peer_name}' and  name = '${name}' and version = '${version}'`);
            }


            //保存peer和chaincode之间的关系
            let peer_ref_chaincode_check = await sql.getRowByPkOne(` select pkid from peer_ref_chaincode where peer_name = '${peer_name}' and  peer_name = '${peer_name}' and chaincode_name = '${name}'  `)

            if (peer_ref_chaincode_check == null) {

                let peer_ref_chaincode = {
                    'peer_name': peer_name,
                    'chaincode_name': name,
                    'ccstatus': 0
                };

                let peer_ref_cc_result = await sql.saveRow('peer_ref_chaincode', peer_ref_chaincode);

            } else {

                let updatesql = `update peer_ref_chaincode set ccstatus = 0  where peer_name = '${peer_name}' and  peer_name = '${peer_name}' and chaincode_name = '${name}'  `;
                let update_resut = await sql.updateBySql(updatesql);
            }


        }

        //console.info(  JSON.stringify( installcc['chaincodes']) );


    }

}

let modifypeers = async (peers) => {


    for (let ind = 0; ind < peers.length; ind++) {

        let peer = peers[ind];
        let channels = peer['channels'];

        let mspid = peer['mspid']
        let peer_name = peer['name'];


        for (let cind = 0; cind < channels.length; cind++) {

            let channel = channels[cind];

            let channel_id = channel['channel_id'];

            await save_channel(channel_id);

            await save_peer_ref_channel(channel_id, peer_name);

            await save_org_channel(mspid, channel_id);


        }


    }


}


/**
 *
 * 保存组织和通道的关系
 * @param mspid
 * @param channel_id
 * @returns {Promise<void>
 *
 */
let save_org_channel = async (mspid, channel_id) => {


    let org_channels = await sql.getRowByPkOne(` select pkid from org_ref_channel where channel_id = '${channel_id}' and mspid = '${mspid}' `)

    if (org_channels == null) {

        let org_ref_channel = {
            'channel_id': channel_id,
            'mspid': mspid
        };

        await sql.saveRow('org_ref_channel', org_ref_channel);
    }


}


/**
 * 保存组织的信息
 * @param channel_id
 * @returns {Promise<void>}
 */
let save_channel = async (channel_id) => {


    let channels = await sql.getRowByPkOne(` select pkid from channel where channel_id = '${channel_id}' `)

    if (channels == null) {

        let channel = {
            'channel_id': channel_id,
            'commitss': channel_id,
            'blocks': 0,
            'txcount': 0,
            'remark': '',
        };

        await sql.saveRow('channel', channel);
    }


}


let save_peer_ref_channel = async (channel_id, peer_name) => {


    let peerrefchannels = await sql.getRowByPkOne(` select pkid from peer_ref_channel where peer_name = '${peer_name}' and  channel_id = '${channel_id}'  `)

    if (peerrefchannels == null) {

        let peer_ref_channel = {

            'peer_name': peer_name,
            'channel_id': channel_id,

        };


        await sql.saveRow('peer_ref_channel', peer_ref_channel);

    }


}

/**
 *
 * 更新channel信息
 *
 * @param channelpeermap
 * @param fabricservice
 * @returns {Promise<void>}
 *
 */
let modify_channels = async (channelpeermap, fabricservice) => {


    for (let key in channelpeermap) {

        let channel_id = key;
        let peer = channelpeermap[channel_id];

        //peer['requests'] = getPeerRequest(peer['requests']);

        await modify_channel_block(channel_id, peer, fabricservice);
        await modify_channel_contant_orgs(channel_id, peer, fabricservice);


    }


}


/**
 *
 * @param channel_id
 * @param peer
 * @param fabricservice
 * @returns {Promise<void>}
 */
let modify_channel_contant_orgs = async (channel_id, peer, fabricservice) => {


    let ordererstemp = getOrdersRequestInfo(bcconfig['orderer']);
    let join_orgs = await getChannelJoinOrg(channel_id, getPeerRequestInfo(peer), ordererstemp, fabricservice);


    for (let ind = 0; ind < join_orgs.length; ind++) {

        let orgmsp = join_orgs[ind];

        logger.debug(`======  the ohter org is :  ${orgmsp}`);


        //保存新发现的org信息
        let org_check = await sql.getRowByPkOne(` select pkid from organization where mspid = '${orgmsp}'  `)

        if (org_check == null) {

            let organization = {
                'mspid': orgmsp,
            }

            let org_result = await sql.saveRow('organization', organization);
        }


        //更新当前新发现的org和channel之间的关系
        await save_org_channel(orgmsp, channel_id);


        //channel的0号区块链中获取当前相关组织的证书信息
        let blockInfo = await fabricservice.getblockInfobyNum(channel_id, getPeerRequestInfo(peer), 0);
        let orgmspidmap = blockInfo['data']['data'][0]['payload']['data']['config']['channel_group']['groups']['Application']['groups'];


        let x509 = require('x509');

        Object.keys(orgmspidmap).forEach((key) => {

            let orgmspinfo = orgmspidmap[key]
            //console.info(` ${JSON.stringify(v)}`);

            let mspid = key;

            let cacerts = orgmspinfo['values']['MSP']['value']['config']['root_certs'][0];
            let cacerts_json = JSON.stringify(x509.parseCert(cacerts));

            let admins_scert = orgmspinfo['values']['MSP']['value']['config']['admins'][0];
            let admins_scert_json = JSON.stringify(x509.parseCert(admins_scert));

            let tls_root_certs = orgmspinfo['values']['MSP']['value']['config']['tls_root_certs'][0];
            let tls_root_certs_json = JSON.stringify(x509.parseCert(tls_root_certs));


            let columnAndValue = {

                'cacerts': cacerts,
                'admins_scert': admins_scert,
                'tls_root_certs': tls_root_certs,

                'cacerts_json': cacerts_json,
                'admins_scert_json': admins_scert_json,
                'tls_root_certs_json': tls_root_certs_json

            }


            //let updateresult =  sql.updateRowByPk('organization', columnAndValue, 'mspid', mspid);
            let updateresult = sql.updateRow('organization', columnAndValue, {'mspid': mspid});

            //console.info(`  ====   ${mspid}   =======   \n   cacerts -> ${cacerts}  \n   admins_scert  -> ${admins_scert}    \n    tls_root_certs -> ${tls_root_certs} \n *********  `);


        })


    }


}


let modify_channel_byId = async (channel_id, channelpeermap, fabricservice) => {

    let peer = channelpeermap[channel_id];
    await modify_channel_block(channel_id, peer, fabricservice);

}


let modify_channel = async (channels) => {


}


/*let modify_channel_cc = async ( channel_id,peer,fabricservice )=> {


    let peer_request = getPeerRequest(peer['requests']);

    let instancecc = await fabricservice.getPeerInstantiatedCc(channel_id,peer_request);


    let channel = await  sql.getRowByPkOne(`  select * from channel where channel_id = '${channel_id}'  `);
    //let channel = channels[0];

    let channelid = channel['pkid'];


}*/

let modify_channel_block = async (channel_id, peer, fabricservice) => {


    //let peer_request = getPeerRequest(peer['requests']);
    let blockchaininfo = await fabricservice.getBlockChainInfo(channel_id, getPeerRequestInfo(peer));
    let blockjsonstr = JSON.stringify(blockchaininfo);
    logger.debug(blockjsonstr);
    //logger.debug(JSON.stringify(blockchaininfo));

    if( channel_id === 'mytestchannelprolic0702' )
        logger.debug(`ddddddd`)


    let channel = await sql.getRowByPkOne(`  select * from channel where channel_id = '${channel_id}'  `);
    //let channel = channels[0];

    let channelid = channel['pkid'];

    let blockheight = blockchaininfo['height']['low'];

    let updageresult = await sql.updateBySql(` update channel set blocks = ${blockheight-1},countblocks=${blockheight} where pkid = ${channelid}  `);
    // console.info(JSON.stringify(blockchaininfo['height']['low']));

    let countblocks = channel['countblocks'];
    let blocks = channel['blocks'];



    if( blockheight > countblocks  ||  blockheight === 1 ) {




        let checkfalg = true;

        if(     blockheight === 1   )  {

            let blockcheck = await sql.getRowByPkOne(`  select * from blocks where blocknum =0 and channel_id = '${channel_id}'  `);

            if (blockcheck !== null && blockcheck !== '' && blockcheck !== undefined) {
                checkfalg = false;
            }

        }


        //for( ; countblocks <=blockheight && checkfalg ; countblocks++ ){


        if( countblocks >1  ) countblocks = countblocks+1;

        while (blockheight >= countblocks && checkfalg ) {




            //if(countblocks===0) continue;

            logger.info(` ==========   ${channelid} ===  ${countblocks}   =======  `)

            let blockinfo = await fabricservice.getblockInfobyNum(channel_id, getPeerRequestInfo(peer), countblocks-1);

            let blocknum = blockinfo['header']['number'];
            let datahash = blockinfo['header']['data_hash'];
            let perhash = blockinfo['header']['previous_hash'];

            let blockcreatedt = blockinfo['data']['data'][0]['payload']['header']['channel_header']['timestamp'];
            let mysql_date = getDateStr4Date(new Date(blockcreatedt), 'yyyy-MM-dd hh:mm:ss.S');

            let txcount = 0;

            let trans = blockinfo['data']['data'];

            if (trans != null) {
                txcount = trans.length;
            }


            logger.info(`  ${channel_id}   ---   ${blockheight} ----  ${countblocks}   -- ${blocknum}  `);


            let block = {
                'channel_id': channel_id,
                'blocknum': blocknum,
                'datahash': datahash,
                'perhash': perhash,
                'txcount': txcount,
                'remark': '',
                'block_detail':base64_encode(JSON.stringify(blockinfo)),
                'blockcreatedt': mysql_date,
                'blockcreatedt_year':getDateStr4Date(new Date(blockcreatedt), 'yyyy'),
                'blockcreatedt_month':getDateStr4Date(new Date(blockcreatedt), 'MM'),
                'blockcreatedt_day':getDateStr4Date(new Date(blockcreatedt), 'dd'),
                'blockcreatedt_h':getDateStr4Date(new Date(blockcreatedt), 'hh'),
                'blockcreatedt_m':getDateStr4Date(new Date(blockcreatedt), 'mm'),
                'blockcreatedt_s':getDateStr4Date(new Date(blockcreatedt), 'ss')
            };

            await sql.saveRow('blocks', block);

            await modify_channel_block_trans(channel_id, peer, blockinfo, fabricservice)
            // 新交易

            //let updageresult = await sql.utpdateBySql(` update channel set countblocks = countblocks+1 where pkid = ${channelid}  `);

            //更新通道的创建时间
            if(blocknum === '0'){
                let updageresult = await sql.updateBySql(` update channel set originate_detail= '${base64_encode(JSON.stringify(blockinfo))}' ,originate_dt = '${mysql_date}' where pkid = ${channelid}  `);


            }


            countblocks++;
            //blocks++;



        }





    }







}


/**
 *
 * 更新通道中的区块和交易
 *
 * @param channel_id
 * @param peer
 * @param blockinfo
 * @param fabricservice
 * @returns {Promise<void>}
 *
 */
let modify_channel_block_trans = async (channel_id, peer, blockinfo, fabricservice) => {


    let trans = blockinfo['data']['data'];

    if (trans != null) {


        let blocknum = blockinfo['header']['number'];
        let blockhash = blockinfo['header']['data_hash'];
        //let perhash =  blockinfo['header']['previous_hash'];


        for (let ind = 0; ind < trans.length; ind++) {

            let transaction = trans[ind];

            let txhash = transaction['payload']['header']['channel_header']['tx_id'];
            let timestamp = transaction['payload']['header']['channel_header']['timestamp'];

            logger.debug(JSON.stringify(transaction));

            let tx_language = '';
            let tx_cc_version = '';

            if (transaction['payload']['data']['actions'] != '' && transaction['payload']['data']['actions'] != undefined) {
                tx_language = transaction['payload']['data']['actions'][0]['payload']['chaincode_proposal_payload']['input']['chaincode_spec']['typeString'];
                tx_cc_version = transaction['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['version'];

            }


            //let channel_id = transaction['payload']['header']['channel_header']['channel_id'];
            //let tx_timestamp = transaction['payload']['header']['channel_header']['timestamp'];
            let mysql_date = getDateStr4Date(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss.S');

            //await sql.updateBySql(` update transaction set txcreatedt = '${mysql_date}' where pkid =  ${txpkid}`);


            let keyset = getkeyset4Transaction(transaction);

            let chaincodename = '';

            if (keyset != null)
                chaincodename = keyset['chaincode'];


            /** 为了获取tx viliationCode 需要重新从账本中获取交易的详细数据 */


            let validationcode = '-1';
            let tx_detail_base64 = '';


            if (txhash !== null && txhash !== '' && txhash !== undefined) {


                let tx_detail = await fabricservice.getTransaction(channel_id, getPeerRequestInfo(peer), txhash);
                validationcode = tx_detail['validationCode'];
                tx_detail_base64 = base64_encode(JSON.stringify(tx_detail));

            }



            let transactions = {

                'channel_id': channel_id,
                'blocknum': blocknum,
                'blockhash': blockhash,
                'txhash': txhash,
                'tx_detail':tx_detail_base64,
                'txcreatedt_str': timestamp,
                'txcreatedt': mysql_date,
                'txcreatedt_year':getDateStr4Date(new Date(timestamp), 'yyyy'),
                'txcreatedt_month':getDateStr4Date(new Date(timestamp), 'MM'),
                'txcreatedt_day':getDateStr4Date(new Date(timestamp), 'dd'),
                'txcreatedt_h':getDateStr4Date(new Date(timestamp), 'hh'),
                'txcreatedt_m':getDateStr4Date(new Date(timestamp), 'mm'),
                'txcreatedt_s':getDateStr4Date(new Date(timestamp), 'ss'),
                'chaincode_name': chaincodename,
                'chaincodeversion': tx_cc_version,
                'txlanguage': tx_language,
                'remark': '',
                'validationcode':validationcode

            };


            let sql_update_cc_lanage = ` update chaincodes set languages = '${tx_language}' where name = '${chaincodename}' and version = '${tx_cc_version}' `;
            await sql.updateBySql(sql_update_cc_lanage);


            let transcheck = await sql.getRowByPkOne(` select pkid from transactions where txhash = '${txhash}' and  channel_id = '${channel_id}'  `)
            if (transcheck == null)
                await sql.saveRow('transactions', transactions);


            // ==  保存交易中包含的签名账号信息 ====
            await savetransactionAccountRef(transaction);


            //提取交易中包含的keyset信息并保存
            let keyset_writer = keyset['writes'];

            if (keyset_writer != null) {

                for (let kind = 0; kind < keyset_writer.length; kind++) {


                    let keysettemp = keyset_writer[kind];
                    let keyname = keysettemp['key'];
                    let is_delete = keysettemp['is_delete'];
                    let value = keysettemp['value'];

                    let is_delete_v = 0;

                    if (is_delete)
                        is_delete_v = 1;


                    let keyset = {

                        'channel_id': channel_id,
                        'blocknum': blocknum,
                        'blockhash': blockhash,
                        'transactionhash': txhash,
                        'keyname': keyname,
                        'isdelete': is_delete_v,
                        'chaincode_name': chaincodename,
                        'trandtstr': timestamp,
                        'valuess': base64_encode(value),
                        'remark': '',
                        'txcreatedt_str': timestamp,
                        'txcreatedt': mysql_date,
                    };


                    let keysetcheck = await sql.getRowByPkOne(` select pkid from keyset where keyname = '${keyname}' and  channel_id = '${channel_id}' and  chaincode_name = '${chaincodename}' `)

                    if (keysetcheck == null) {

                        keyset['keyset_createdt'] = mysql_date;

                        let keysetresult = await sql.saveRow('keyset', keyset);

                    } else {

                        let updatesql = ` update keyset set txcreatedt_str = '${timestamp}' , txcreatedt = '${mysql_date}' ,valuess = '${base64_encode(value)}' , trandtstr = '${timestamp}' where keyname = '${keyname}' and  channel_id = '${channel_id}' and  chaincode_name = '${chaincodename}'  `;
                        let updateresult = await sql.updateBySql(updatesql);


                    }


                    let keyset_history = {

                        'channel_id': channel_id,
                        'blocknum': blocknum,
                        'blockhash': blockhash,
                        'transactionhash': txhash,
                        'keyname': keyname,
                        'valuess': base64_encode(value),
                        'trandtstr': timestamp,
                        'chaincode_name': chaincodename,
                        'remark': '',
                        'txcreatedt_str': timestamp,
                        'txcreatedt': mysql_date,
                    };

                    let keysetresult1 = await sql.saveRow('keyset_history', keyset_history);


                }

                //保存账号和证书之间的关系
                await savekeysetAccountRef(transaction,keyset_writer);




            }


        }


    }

}


/************************************************************************************************************************************************
 *
 *  保存从区块中提取的交易中账号签名信息
 *
 ************************************************************************************************************************************************
 */
let savetransactionAccountRef = async (tx) => {


    let tx_cc_name = '';
    let tx_cc_version = '';


    if (tx['payload']['data']['actions'] !== '' && tx['payload']['data']['actions'] !== undefined) {
        tx_cc_name = tx['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['name'];
        tx_cc_version = tx['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['version'];
    }

    let channel_id = tx['payload']['header']['channel_header']['channel_id'];
    let txhash = tx['payload']['header']['channel_header']['tx_id'];

    //提取并保存背书证书的信息
    let endorser_accounts = fabricservice.parserEndorserAccount4BlockTx(tx);

    for (let ind = 0; ind < endorser_accounts.length; ind++) {

        await saveAccount(endorser_accounts[ind]);

        await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, endorser_accounts[ind]['certs_md5'], endorser_accounts[ind]['account_type']);

    }


    //提取并保存交易创建者证书的信息
    let crater_acctount = fabricservice.parserCreateAccount4BlockTx(tx);
    await saveAccount(crater_acctount);
    await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, crater_acctount['certs_md5'], crater_acctount['account_type']);


    //提取并保存交易签名证书的信息
    let signature_acctount = fabricservice.parserSignatureAccount4BlockTx(tx);
    await saveAccount(signature_acctount);
    await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, signature_acctount['certs_md5'], signature_acctount['account_type']);


}



/****************************************************************************************************************************************
 *
 *  保存从区块中提取的交易中的keyset和交易签名之间的关系。
 *
 ****************************************************************************************************************************************
 */
let savekeysetAccountRef = async (tx,keyset_writer) => {


    let tx_cc_name = '';
    let tx_cc_version = '';


    if (tx['payload']['data']['actions'] !== '' && tx['payload']['data']['actions'] !== undefined) {
        tx_cc_name = tx['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['name'];
        tx_cc_version = tx['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['version'];
    }

    let channel_id = tx['payload']['header']['channel_header']['channel_id'];
    //let txhash = tx['payload']['header']['channel_header']['tx_id'];

    //提取并保存背书证书的信息
    let endorser_accounts = fabricservice.parserEndorserAccount4BlockTx(tx);


    for (let kind = 0; kind < keyset_writer.length; kind++) {

        let keysettemp = keyset_writer[kind];
        let keyname = keysettemp['key'];

        //await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, endorser_accounts[ind]['certs_md5'], endorser_accounts[ind]['account_type']);


        for (let ind = 0; ind < endorser_accounts.length; ind++) {


            if (endorser_accounts[ind]['certs_md5'] !== undefined &&  endorser_accounts[ind]['account_type'] !== undefined) {


                let org_check = await sql.getRowByPkOne(` select pkid from keyset_ref_account where keyset_name = '${keyname}'  and  account_cert_md5 = '${endorser_accounts[ind]['certs_md5']}' and account_types = ${endorser_accounts[ind]['account_type']} `);

                if (org_check == null && endorser_accounts[ind]['certs_md5'] !== undefined && endorser_accounts[ind]['account_type'] !== undefined) {

                    let trans_ref_account = {

                        'channel_id': channel_id,
                        'chaincode_name': tx_cc_name,
                        'cc_version': tx_cc_version,
                        'keyset_name':keyname ,
                        'account_cert_md5': endorser_accounts[ind]['certs_md5'],
                        'account_types': endorser_accounts[ind]['account_type']

                    }

                    let org_result = await sql.saveRow('keyset_ref_account', trans_ref_account);

                }


            }



        }


        //提取并保存交易创建者证书的信息
        let crater_acctount = fabricservice.parserCreateAccount4BlockTx(tx);
        //await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, crater_acctount['certs_md5'], crater_acctount['account_type']);


        if ( crater_acctount['certs_md5'] !== undefined && crater_acctount['account_type'] !== undefined) {


            let org_check = await sql.getRowByPkOne(` select pkid from keyset_ref_account where keyset_name = '${keyname}'  and  account_cert_md5 = '${crater_acctount['certs_md5']}' and account_types = ${crater_acctount['account_type']} `);

            if (org_check == null &&  crater_acctount['certs_md5'] !== undefined && crater_acctount['account_type'] !== undefined) {

                let trans_ref_account = {

                    'channel_id': channel_id,
                    'chaincode_name': tx_cc_name,
                    'cc_version': tx_cc_version,
                    'keyset_name':keyname ,
                    'account_cert_md5': crater_acctount['certs_md5'],
                    'account_types': crater_acctount['account_type']

                }

                let org_result = await sql.saveRow('keyset_ref_account', trans_ref_account);

            }

        }



        //提取并保存交易签名证书的信息
        let signature_acctount = fabricservice.parserSignatureAccount4BlockTx(tx);
        //await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, signature_acctount['certs_md5'], signature_acctount['account_type']);

        if (signature_acctount['certs_md5'] !== undefined && signature_acctount['account_type'] !== undefined) {


            let org_check = await sql.getRowByPkOne(` select pkid from keyset_ref_account where keyset_name = '${keyname}'  and  account_cert_md5 = '${signature_acctount['certs_md5']}' and account_types = ${signature_acctount['account_type']} `);

            if (org_check == null && signature_acctount['certs_md5'] !== undefined &&  signature_acctount['account_type'] !== undefined) {

                let trans_ref_account = {

                    'channel_id': channel_id,
                    'chaincode_name': tx_cc_name,
                    'cc_version': tx_cc_version,
                    'keyset_name':keyname ,
                    'account_cert_md5': signature_acctount['certs_md5'],
                    'account_types': signature_acctount['account_type']

                }

                let org_result = await sql.saveRow('keyset_ref_account', trans_ref_account);

            }

        }


    }

}



let modify_keyset = () => {


}


/**
 *
 * 提取交易中的背书账号信息并保存
 *
 */
let saveAccount4Tx = async (tx) => {

    //let tx_language = tx['transactionEnvelope']['payload']['data']['actions'][0]['payload']['chaincode_proposal_payload']['input']['chaincode_spec']['typeString'];
    let tx_cc_name = tx['transactionEnvelope']['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['name'];
    let tx_cc_version = tx['transactionEnvelope']['payload']['data']['actions'][0]['payload']['action']['proposal_response_payload']['extension']['chaincode_id']['version'];
    let channel_id = tx['transactionEnvelope']['payload']['header']['channel_header']['channel_id'];
    //let tx_timestamp = tx['transactionEnvelope']['payload']['header']['channel_header']['timestamp'];
    let txhash = tx['transactionEnvelope']['payload']['header']['channel_header']['tx_id'];

    //提取并保存背书证书的信息
    let endorser_accounts = fabricservice.parserEndorserAccount4Tx(tx);

    for (let ind = 0; ind < endorser_accounts.length; ind++) {

        await saveAccount(endorser_accounts[ind]);

        await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, endorser_accounts[ind]['certs_md5'], endorser_accounts[ind]['account_type']);

    }


    //提取并保存交易创建者证书的信息
    let crater_acctount = fabricservice.parserCreateAccount4Tx(tx);
    await saveAccount(crater_acctount);
    await (channel_id, tx_cc_name, tx_cc_version, txhash, crater_acctount['certs_md5'], crater_acctount['account_type']);


    //提取并保存交易签名证书的信息
    let signature_acctount = fabricservice.parserSignatureAccount4Tx(tx);
    await saveAccount(signature_acctount);
    await saveTxAccountRef(channel_id, tx_cc_name, tx_cc_version, txhash, signature_acctount['certs_md5'], signature_acctount['account_type']);


}


/**
 *
 * 保存交易中的账号信息
 *
 * @param account
 * @returns {Promise<void>}
 *
 */
let saveAccount = async (account) => {


    let certs_md5 = account['certs_md5'];
    let mspid = account['mspid'];

    let org_check = await sql.getRowByPkOne(` select pkid from accounts where certs_md5 = '${certs_md5}'  `)

    account['effective_dt'] = getDateStr4Date(new Date(account['effective_dt']), 'yyyy-MM-dd hh:mm:ss.S');
    account['invalid_dt'] = getDateStr4Date(new Date(account['invalid_dt']), 'yyyy-MM-dd hh:mm:ss.S');


    if (org_check == null && (mspid !== '' && mspid !== null && mspid !== undefined)) {

        let org_result = await sql.saveRow('accounts', account);

    }

    return org_check;


}


/**
 *
 * 保存交易中涉及到的用户
 *
 * @param channel_id
 * @param cc_name
 * @param cc_version
 * @param transhash
 * @param account_cert_md5
 * @param account_types
 * @returns {Promise<void>}
 *
 */
let saveTxAccountRef = async (channel_id, cc_name, cc_version, transhash, account_cert_md5, account_types) => {


    if (account_cert_md5 !== undefined && account_types !== undefined) {


        let org_check = await sql.getRowByPkOne(` select pkid from trans_ref_account where transhash = '${transhash}'  and  account_cert_md5 = '${account_cert_md5}' and account_types = ${account_types} `);

        if (org_check == null && account_cert_md5 !== undefined && account_types !== undefined) {

            let trans_ref_account = {

                'channel_id': channel_id,
                'chaincode_name': cc_name,
                'cc_version': cc_version,
                'transhash': transhash,
                'account_cert_md5': account_cert_md5,
                'account_types': account_types

            }

            let org_result = await sql.saveRow('trans_ref_account', trans_ref_account);

        }


    }


}


/**
 *  更新状态为INS
 * @param peers
 * @param tempdir
 * @param adminkey
 * @param admincert
 * @returns {Promise<void>}
 */
let modify_instantiated_chaincode = async (peers, tempdir, adminkey, admincert) => {


    for (let ind = 0; ind < peers.length; ind++) {

        let peer = peers[ind];
        let channels = peer['channels'];

        let peer_name = peer['name'];
        let peer_request = getPeerRequest(peer['requests']);

        for (let cind = 0; cind < channels.length; cind++) {

            let channel = channels[cind];
            let channel_id = channel['channel_id'];

            let fabricservice1 = require('./fabricservice');
            fabricservice1.inits(tempdir, adminkey, admincert);


            //peer['requests'] = getPeerRequest(peer['requests']);
            let instancecc = await fabricservice1.getPeerInstantiatedCc(channel_id, getPeerRequestInfo(peer));


            let instanceccs = instancecc['chaincodes'];


            for (let iind = 0; iind < instanceccs.length; iind++) {

                let instancecctemp = instanceccs[iind];

                let name = instancecctemp['name'];
                let version = instancecctemp['version'];
                let path = instancecctemp['path'];
                let escc = instancecctemp['escc'];
                let vscc = instancecctemp['vscc'];


                //将当前版本的chaincode状态更新为1（已经实例化，目前唯一可用状态）
                //let updatecc = ` update  chaincodes set channel_id = '${channel_id}' , ccstatus = 1  ,escc = '${escc}' , vscc = '${vscc}'   where peer_name = '${peer_name}' and  name = '${name}' and version = '${version}'  `;
                let updatecc = ` update  chaincodes set  ccstatus = 1  ,escc = '${escc}' , vscc = '${vscc}'   where peer_name = '${peer_name}' and  name = '${name}' and version = '${version}'  `;
                let installccheck = await sql.updateBySql(updatecc);


                //将其他的版本的chaincode状态设置为0（此时其他版本已经不可调用）
               /* let updatesql_oldversion = `update chaincodes set ccstatus = 0  where peer_name = '${peer_name}'  and  name = '${name}' and version <> '${version}'  `;
                let update_resutoldversion = await sql.updateBySql(updatesql_oldversion);*/


                //let peer_ref_chaincode_check = await sql.getRowByPkOne(` select pkid from peer_ref_chaincode where peer_name = '${peer_name}' and  peer_name = '${peer_name}' and chaincode_name = '${name}'  `)
                let updatesql = `update peer_ref_chaincode set ccstatus = 1  where peer_name = '${peer_name}' and  peer_name = '${peer_name}' and chaincode_name = '${name}'  `;
                let update_resut = await sql.updateBySql(updatesql);



                //由于同一个chaincode实例可以同时对两个channel进行操作，因此需要建立
                let channel_ref_instantiatedcc_check = await sql.getRowByPkOne(` select pkid from channel_ref_instantiatedcc where  channel_id = '${channel_id}' and chaincode_name = '${name}'  `)

                if (channel_ref_instantiatedcc_check == null) {

                    let peer_ref_chaincode = {
                        'chaincode_version': version ,
                        'chaincode_name': name ,
                        'channel_id':channel_id
                    };

                    let peer_ref_cc_result = await sql.saveRow('channel_ref_instantiatedcc', peer_ref_chaincode);

                }else{

                    let updatesql_cc_instance_newversion = `update channel_ref_instantiatedcc set chaincode_version = '${version}'  where channel_id = '${channel_id}' and chaincode_name = '${name}'  `;
                    let upuresut = await sql.updateBySql(updatesql_cc_instance_newversion);


                }




            }

            //console.info(JSON.stringify(instancecc));


        }


    }


}


let getCurrOrgFabricservice = () => {

    let orgname = ledgerMgr.getCurrOrg();
    return getFabricService4OrgName(orgname);

}


/**
 *
 * 根据org名称获取fabric服务组件
 *
 * @param orgname
 *
 */
let getFabricService4OrgName = (orgname) => {

    let org = orgnamemap[orgname];

    let tempdir = bcconfig['keyValueStore'];
    let adminkey = org['admin']['key'];
    let admincert = org['admin']['cert'];


    let currrogservice = require('./fabricservice');
    currrogservice.inits(tempdir, adminkey, admincert);

    return currrogservice;
}


function getPeerRequestInfo(peer) {

    let peerurl = getPeerRequest(peer['requests']);

    return {

        "requests": peerurl,
        "events": peer['events'],
        "serverhostname": peer['serverhostname'],
        "tls_cacerts": peer['tls_cacerts'],
        "mspid": peer['mspid']

    };


}


function getOrderRequestInfo(orderer) {

    let orderurl = getPeerRequest(orderer['url']);

    return {
        "url": orderurl,
        "serverhostname": orderer['serverhostname'],
        "tls_cacerts": orderer['tls_cacerts']
    };


}


function getOrdersRequestInfo(orderers) {


    let requestorderers = [];

    for (let ind = 0; ind < orderers.length; ind++) {

        let orderer = orderers[ind];

        let orderurl = getPeerRequest(orderer['url']);

        let orderertemp = {
            "url": orderurl,
            "serverhostname": orderer['serverhostname'],
            "tls_cacerts": orderer['tls_cacerts']
        };

        requestorderers.push(orderertemp);

    }


    return requestorderers;

}


let getCurrPeerJoinChannels = async () => {


    let currp = ledgerMgr.getCurrpeer();
    let peername = currp['name'];

    let sqlresult = await sql.getRowsBySQl(` select count(*) as nums from peer_ref_channel `, {'peer_name': peername}, '');

    return sqlresult[0]['nums'];


}


let getCurrPeerContaitCc = async () => {

    let currp = ledgerMgr.getCurrpeer();
    let peername = currp['name'];

    let sqlresult = await sql.getRowsBySQl(` select count(distinct(name)) as nums from chaincodes `, {'peer_name': peername}, '');

    return sqlresult[0]['nums'];


}


let getOrgStatus = async () => {

    let currorg = ledgerMgr.getCurrOrg();
    let peers = getCurrOrgPeers();

    let searchSql = `select pkid from channel `;
    let channelss = await sql.getRowsBySQlNoCondtion(searchSql);

    let searchCcSql = ' select count(distinct(name)) as nums from chaincodes ';
    let chaincodess = await sql.getRowsBySQlNoCondtion(searchCcSql);


    let peer_num = peers.length;
    let channel_num = channelss.length;
    let chaincode_num = chaincodess[0]['nums'];


    return {
        'peerCount': peer_num,
        'channelCount': channel_num,
        'latestBlock': 0,
        'chaincodeCount': chaincode_num,
        'txCount': 0
    };

}


let getChannelStatus = () => {


}


let getPeerStatus = async () => {


    let currp = ledgerMgr.getCurrpeer();
    let peername = currp['name'];

    let searchSql = `select pkid from channel where channel_id in ( select channel_id from peer_ref_channel where peer_name = '${peername}' ) `;
    let rows = await sql.getRowsBySQlNoCondtion(searchSql);

    let searchsql1 = ` select pkid from chaincodes where peer_name in ( select peer_name from peer_ref_channel where peer_name = '${peername}' )  `;
    let chaincodelist = await sql.getRowsBySQlNoCondtion(searchsql1);


    let channels = rows.length;
    let chaincodess = chaincodelist.length;

    return {'peerCount': 0, 'channelCount': channels, 'latestBlock': 0, 'chaincodeCount': chaincodess, 'txCount': 0};

}


/**
 * 转换时间
 * @param date
 * @param formatstring
 * @returns {*}
 *
 * let date = new Date("2019-02-01T04:09:13.000Z");
 *
 */
let getDateStr4Date = (date, formatstring) => {


    Date.prototype.format = function (format) {
        let date = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (let k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    }


    return date.format(formatstring);


}


/**
 * base编码
 * @param string
 */
let base64_encode = (string)=>{

    let b = new Buffer(string);
    let s = b.toString('base64');

    return s;

}


/**
 * base64 解码
 * @param base64_string
 */
let base64_decode = (base64_string)=>{

    let b = new Buffer(base64_string, 'base64')
    let s = b.toString();

    return s;

}


exports.getPeerStatus = getPeerStatus;
exports.getOrgStatus = getOrgStatus;
exports.getCurrPeerJoinChannels = getCurrPeerJoinChannels;
exports.getCurrPeerContaitCc = getCurrPeerContaitCc;
exports.getCurrOrgPeers = getCurrOrgPeers;
exports.getPeerRequestInfo = getPeerRequestInfo;
exports.parserDefaultOrg = parserDefaultOrg;
exports.getCurrOrgFabricservice = getCurrOrgFabricservice;
exports.getFabricService4OrgName = getFabricService4OrgName;
exports.testfunc = testfunc;
exports.getPeers4Org = getPeers4Org;
exports.getPeer = getPeer;
exports.parserOrg = parserOrg;
exports.getPeerRequest = getPeerRequest;
exports.startUp = startUp;
exports.base64_encode = base64_encode;
exports.base64_decode = base64_decode;


exports.get_fabric_network_struct = get_fabric_network_struct;
exports.get_fabric_channel_struct = get_fabric_channel_struct;
exports.get_fabric_block_struct = get_fabric_block_struct;
exports.get_fabric_cc_struct = get_fabric_cc_struct;
exports.get_fabric_tx_struct = get_fabric_tx_struct;
exports.get_fabric_keyset_struct = get_fabric_keyset_struct;





