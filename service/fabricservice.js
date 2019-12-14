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
var path = require('path');
var fs = require('fs');
var fsansyc = require('fs-extra');
var util = require('util');

var config = require('../config.json');
var log4js = require('log4js');
log4js.configure(config.log4jsconfig);
var logger = log4js.getLogger('console');


var hfc = require('fabric-client');

//var channelid = "roberttestchannel12";

//var tempdir = "/project/ws_nodejs/fabric_sdk_node_studynew/fabric-client-kvs";
var tempdir = "";
var admin_key = "";
var admin_sert = "";

var client = new hfc();

var channelmap = {};
var peermap = {};
var channelpeer = {};
var orderermap = {};
var channelorderer = {};

/*
var channel = getchannel(channelid
;var order = client.newOrderer('grpc://192.168.23.212:7050');
channel.addOrderer(order);

var  peer = client.newPeer('grpc://192.168.23.212:7051');
setupchannel(channel,peer,channelid,peerRequest);
*/

/*var  peer188 = client.newPeer('grpc://172.16.10.188:7051');
channel.addPeer(peer188);*/


/**
 *
 * @param _tempdir
 * @param _admin_key
 * @param _admin_sert
 */
var inits = function ( _tempdir , _admin_key , _admin_sert ) {
    tempdir  = _tempdir;
    admin_key = _admin_key;
    admin_sert = _admin_sert;
}


/**
 *
 * @param channelid
 * @param peerRequest
 * @returns {Promise<TResult>}
 */
var getBlockChainInfo = function( channelid , peerRequest ){

    let channel = getchannel(channelid);
    let  peer = getpeer(peerRequest);

    setupchannel(channel,peer,channelid,peerRequest);

    return getOrgUser4Local(peerRequest['mspid']).then((user)=>{

         return channel.queryInfo(peer);

     } ,(err)=>{

         console.log( 'error' , err );
    } )

}

/**
 *  根据区块链的编号获取区块的详细信息
 *
 * @param blocknum
 * @returns {Promise.<TResult>}
 *
 */
var getblockInfobyNum = function (channelid , peerRequest ,blocknum) {


    logger.debug(` the channel is ${channelid} `);
    console.info(` the channel is ${channelid} `);


    let channel = getchannel(channelid);
    let  peer = getpeer(peerRequest);


    setupchannel(channel,peer,channelid,peerRequest);


    return getOrgUser4Local(peerRequest['mspid']).then((user)=>{

        return channel.queryBlock(blocknum, peer,null);

    } ,(err)=>{
        console.log( 'error' , err);
    } )

}

/**
 *  根据区块链的哈希值获取区块的详细信息
 *
 * @param blocknum
 * @returns {Promise.<TResult>}
 *
 */
var getblockInfobyHash = function ( channelid , peerRequest , blockHash ) {



    let channel = getchannel(channelid);

    let  peer = getpeer(peerRequest);

    setupchannel(channel,peer,channelid,peerRequest);

    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{

        return channel.queryBlockByHash(new Buffer(blockHash,"hex"),peer)

    } ,(err)=>{

       // console.error('error', err);
        logger.error('error', err);

    } )

}



/**
 *
 *  获取当前Peer节点加入的通道信息
 *
 *  @param blocknum
 *  @returns {Promise.<TResult>}
 *
 */
var getPeerChannel = function ( peerRequest  ) {


    let  peer = getpeer(peerRequest);


    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{

        return client.queryChannels(peer)

    } ,(err)=>{

        console.log('error', err);
    } )

}

/**
 *
 *  查询指定peer节点已经install的chaincode
 *
 *  @param blocknum
 *  @returns {Promise.<TResult>}
 *
 */
var getPeerInstallCc = function (  peerRequest  ) {

    let  peer = getpeer(peerRequest);
    //let  peer1 = client.newPeer("grpc://192.168.23.212:7051");

    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{

        return client.queryInstalledChaincodes(peer)

    } ,(err)=>{

        console.log('error', err);
    } )

}



/**
 *
 *  查询指定channel中已经实例化的Chaincode
 *
 *  @param blocknum
 *  @returns {Promise.<TResult>}
 *
 */
var getPeerInstantiatedCc = function ( channelid , peerRequest ) {

    let channel = getchannel(channelid);
    let  peer = getpeer(peerRequest);
    setupchannel(channel,peer,channelid,peerRequest);

    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{

        return channel.queryInstantiatedChaincodes( peer )

    } ,(err)=>{

        console.log('error', err);

    } )

}


/**
 *
 *  获取Channel中包含的其他Org
 *
 *  @param blocknum
 *  @returns {Promise.<TResult>}
 *
 */
var getChannelConfing = function ( channelid , peerRequest , orderers ) {


    let channel = getchannel(channelid);
    let  peer = getpeer(peerRequest);

    setupchannel(channel,peer,channelid,peerRequest);
    setupchannel4Orderer(channel,channelid,orderers);


    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{

        return channel.getChannelConfig();

    } ,(err)=>{

        console.log('error', err);

    } )

}



var  getTransaction = function (channelid , peerRequest ,transhash) {

    let channel = getchannel(channelid);
    let  peer = getpeer(peerRequest);
    setupchannel(channel,peer,channelid,peerRequest);

    return getOrgUser4Local(peerRequest['mspid']).then( (user)=>{

        return channel.queryTransaction(transhash, peer);

    },(err)=>{
        console.log('error',err);
    })

}




/**
 * 查询交易
 * @param chaincodeid
 * @param func
 * @param chaincode_args
 * @returns {Promise<TResult>}
 */
var queryCc = function (chaincodeid , func , chaincode_args ) {


    return getOrgUser4Local(peerRequest['mspid']).then(( user )=>{



        tx_id = client.newTransactionID();
        var request = {
            chaincodeId: chaincodeid,
            txId: tx_id,
            fcn: func,
            args: chaincode_args
        };

        return   channel.queryByChaincode( request , peer );

    } ,(err)=>{

        console.log('error', err);

    } ).then(( sendtransresult )=>{

        return sendtransresult;

    },(err)=>{
        console.log('error', err);
    });


}


/**
 *  发起一笔交易
 *
 *  @returns {Promise.<TResult>}
 */
var sendTransaction = function ( chaincodeid , func , chaincode_args   ) {


    var tx_id = null;

    return getOrgUser4Local(peerRequest['mspid']).then((user)=>{

        tx_id = client.newTransactionID();
        var request = {

            chaincodeId: chaincodeid,
            fcn: func,
            args: chaincode_args,
            chainId: channelid,
            txId: tx_id
        };


        return channel.sendTransactionProposal(request);

    } ,(err)=>{

        console.log('error', err);

    } ).then((chaincodeinvokresult )=>{


        var proposalResponses = chaincodeinvokresult[0];
        var proposal = chaincodeinvokresult[1];
        var header = chaincodeinvokresult[2];
        var all_good = true;


        for (var i in proposalResponses) {

            let one_good = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                one_good = true;
                console.info('transaction proposal was good');
            } else {
                console.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }


        if (all_good) {

            console.info(util.format(

                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));


            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();

            return channel.sendTransaction(request);


        }



    },(err)=>{

        console.log('error', err);
    }).then(( sendtransresult )=>{

        return sendtransresult;

    },(err)=>{
        console.log('error', err);
    });

}


/**
 *
 * 根据cryptogen模块生成的账号通过Fabric接口进行相关的操作
 *
 * @returns {Promise.<TResult>}
 *
 */
function getOrgUser4Local(peermspid) {

    //测试通过CA命令行生成的证书依旧可以成功的发起交易
    /*let keyPath = "/project/opt_fabric/fabricconfig/crypto-config/peerOrganizations/org1.robertfabrictest.com/users/Admin@org1.robertfabrictest.com/msp/keystore";
    let keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
    let certPath = "/project/opt_fabric/fabricconfig/crypto-config/peerOrganizations/org1.robertfabrictest.com/users/Admin@org1.robertfabrictest.com/msp/signcerts";
    let certPEM = readAllFiles(certPath)[0].toString();
*/
    let keyPath = admin_key;
    let keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
    let certPath = admin_sert;
    let certPEM = readAllFiles(certPath)[0].toString();

    let mspid = peermspid;


    return hfc.newDefaultKeyValueStore({

        path:tempdir

    }).then((store) => {
        client.setStateStore(store);

        return client.createUser({
            username: 'Admin',
            mspid: mspid,
            cryptoContent: {
                privateKeyPEM: keyPEM,
                signedCertPEM: certPEM
            }
        });
    });
};



function readAllFiles(dir) {
    var files = fs.readdirSync(dir);
    var certs = [];
    files.forEach((file_name) => {
        let file_path = path.join(dir,file_name);
        let data = fs.readFileSync(file_path);
        certs.push(data);
    });
    return certs;
}



function getchannel( channel_id ) {


    if( channelmap[channel_id] == null){
        let channel = client.newChannel(channel_id);
        channelmap[channel_id]=channel;
    }

    return channelmap[channel_id];
}


function getpeer(peerRequest) {

    let requesturl = peerRequest['requests'];
    //let requesturl_pro = getpeer

    if( peermap[requesturl] == null){


        let  peer ;

        if( requesturl.indexOf("grpc://") === 0 ){

            peer = client.newPeer(requesturl);

        }else if( requesturl.indexOf("grpcs://") === 0 ){

            let tls_cacerts_content = fsansyc.readFileSync(peerRequest['tls_cacerts']);

            let opt = {
                pem: Buffer.from(tls_cacerts_content).toString(),
                'ssl-target-name-override': peerRequest['serverhostname']
            }
            peer = client.newPeer(requesturl,opt);


        }



        peermap[requesturl]=peer;
    }

    return peermap[requesturl];

}


function getOrderer( orderer ) {

    let orderurl = orderer['url'];

    if( orderermap[orderurl] == null){

        let order;

        if( orderurl.indexOf("grpc://") === 0 ){

            order = client.newOrderer(orderurl);


        }else if(orderurl.indexOf("grpcs://") === 0 ){

            let tls_cacerts_content = fsansyc.readFileSync(orderer['tls_cacerts']);

            let opt = {
                         pem: Buffer.from(tls_cacerts_content).toString(),
                        'ssl-target-name-override': orderer['serverhostname']
                    }
            order = client.newOrderer(orderurl,opt);


        }



        orderermap[orderurl]=order;
    }

    return orderermap[orderurl];



}

function setupchannel( channel1, peer , channel_id , peer_request ) {

    let pkey = channel_id + peer['requests'];

    if( channelpeer[pkey] == null ){
        channel1.addPeer(peer);
        channelpeer[pkey] = peer;
    }


}


function setupchannel4Orderer( channel1 , channel_id , orderers ) {


    for( let ind = 0 ; ind<orderers.length ; ind++ ){

        let orderer = orderers[ind];
        let pkey = channel_id + orderer['url'];


        if(  channelorderer[pkey] == null ){
            let fabricorderer = getOrderer(orderer);
            channel1.addOrderer(fabricorderer);
            channelorderer[pkey] = fabricorderer;

        }
    }

}



/**
 * 提取交易中的背书账号信息
 */
var parserEndorserAccount4Tx = ( tx )=>{

    let endorsements = tx['transactionEnvelope']['payload']['data']['actions'][0]['payload']['action']['endorsements'];

    let accounts = [];


    for ( let ind = 0 ; ind<endorsements.length; ind++){

        let endorsement = endorsements[ind];
        let mspid = endorsement['endorser']['Mspid'];
        let cert = endorsement['endorser']['IdBytes'];

        var md5 = require('md5-node');

        let cert_md5 = md5(cert);

        var x509 = require('x509');
        //var subject = x509.getSubject(cert);
        var certs_json = x509.parseCert(cert);

        let account = {

            "mspid": mspid,
            "certs": cert,
            "certs_md5": cert_md5,
            "certs_json": JSON.stringify(certs_json),
            "account_type": 0,
            "effective_dt":certs_json['notBefore'],
            "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']
        }

        accounts.push(account);

        //logger.debug(` the mspid is  ${mspid}    ==    cert is  ${cert}   ===  cert md5 is ${cert_md5} === subject is ${JSON.stringify(subject)} === cert is : ${JSON.stringify(cert_ojb)}`  );
    }

    return accounts;


}


/**
 * 提取交易中的背书账号信息
 */
var parserCreateAccount4Tx = ( tx )=>{

    let creator = tx['transactionEnvelope']['payload']['data']['actions'][0]['header']['creator'];


    let mspid = creator['Mspid'];
    let cert = creator['IdBytes'];

    var md5 = require('md5-node');

    let cert_md5 = md5(cert);

    var x509 = require('x509');
    //var subject = x509.getSubject(cert);
    var certs_json = x509.parseCert(cert);

    let account = {

        "mspid": mspid,
        "certs": cert,
        "certs_md5": cert_md5,
        "certs_json": JSON.stringify(certs_json),
        "account_type": 1,
        "effective_dt":certs_json['notBefore'],
        "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']

    }

    return account;

}





/**
 * 提取交易中的签名证书
 */
var parserSignatureAccount4Tx = ( tx )=>{

    let signature_header = tx['transactionEnvelope']['payload']['header']['signature_header']['creator'];


    let mspid = signature_header['Mspid'];
    let cert = signature_header['IdBytes'];

    var md5 = require('md5-node');
    let cert_md5 = md5(cert);

    var x509 = require('x509');
    //var subject = x509.getSubject(cert);
    var certs_json = x509.parseCert(cert);

    let account = {

        "mspid": mspid,
        "certs": cert,
        "certs_md5": cert_md5,
        "certs_json": JSON.stringify(certs_json),
        "account_type": 2,
        "effective_dt":certs_json['notBefore'],
        "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']
    }

    return account;

}



/**
 * =====================================================================================================================
 *
 * 后台获取交易信息的时候通常会直接通过区块来获取交易的信息
 *
 * =====================================================================================================================
 */



/**
 * 提取区块数据结构中交易的背书账号信息
 */
var parserEndorserAccount4BlockTx = ( tx )=>{

    let endorsements = '';
    let accounts = [];

    if( tx['payload']['data']['actions'] != '' && tx['payload']['data']['actions'] != undefined ){

        endorsements = tx['payload']['data']['actions'][0]['payload']['action']['endorsements'];





        for ( let ind = 0 ; ind<endorsements.length; ind++){

            let endorsement = endorsements[ind];
            let mspid = endorsement['endorser']['Mspid'];
            let cert = endorsement['endorser']['IdBytes'];

            var md5 = require('md5-node');

            let cert_md5 = md5(cert);

            var x509 = require('x509');
            //var subject = x509.getSubject(cert);
            var certs_json = x509.parseCert(cert);

            let account = {

                "mspid": mspid,
                "certs": cert,
                "certs_md5": cert_md5,
                "certs_json": JSON.stringify(certs_json),
                "account_type": 0,
                "effective_dt":certs_json['notBefore'],
                "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']
            }

            accounts.push(account);

            //logger.debug(` the mspid is  ${mspid}    ==    cert is  ${cert}   ===  cert md5 is ${cert_md5} === subject is ${JSON.stringify(subject)} === cert is : ${JSON.stringify(cert_ojb)}`  );
        }


    }


    return accounts;


}


/**
 * 提取区块数据结构中交易中的背书账号信息
 */
var parserCreateAccount4BlockTx = ( tx )=>{



    if( tx['payload']['data']['actions'] != '' && tx['payload']['data']['actions']!=undefined ){

        let creator = tx['payload']['data']['actions'][0]['header']['creator'];


        let mspid = creator['Mspid'];
        let cert = creator['IdBytes'];

        var md5 = require('md5-node');

        let cert_md5 = md5(cert);

        var x509 = require('x509');
        //var subject = x509.getSubject(cert);
        var certs_json = x509.parseCert(cert);

        let account = {

            "mspid": mspid,
            "certs": cert,
            "certs_md5": cert_md5,
            "certs_json": JSON.stringify(certs_json),
            "account_type": 1,
            "effective_dt":certs_json['notBefore'],
            "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']
        }

        return account;
    }else{
        return {};
    }



}





/**
 * 提取区块数据结构中交易中的签名证书
 */
var parserSignatureAccount4BlockTx = ( tx )=>{

    let signature_header = tx['payload']['header']['signature_header']['creator'];


    let mspid = signature_header['Mspid'];
    let cert = signature_header['IdBytes'];

    var md5 = require('md5-node');
    let cert_md5 = md5(cert);

    var x509 = require('x509');
    //var subject = x509.getSubject(cert);
    var certs_json = x509.parseCert(cert);

    let account = {

        "mspid": mspid,
        "certs": cert,
        "certs_md5": cert_md5,
        "certs_json": JSON.stringify(certs_json),
        "account_type": 2,
        "effective_dt":certs_json['notBefore'],
        "invalid_dt":certs_json['notAfter'],
            "name":certs_json['subject']['commonName']
    }

    return account;

}




///////////////========================/////////////////////





exports.inits = inits;
exports.getBlockChainInfo = getBlockChainInfo;
exports.getblockInfobyNum = getblockInfobyNum;
exports.getblockInfobyHash = getblockInfobyHash;
exports.getPeerChannel = getPeerChannel;
exports.getPeerInstallCc = getPeerInstallCc;
exports.getPeerInstantiatedCc = getPeerInstantiatedCc;
exports.getTransaction = getTransaction;
exports.sendTransaction = sendTransaction;
exports.queryCc = queryCc;
exports.getChannelConfing = getChannelConfing;
exports.parserEndorserAccount4Tx = parserEndorserAccount4Tx;
exports.parserCreateAccount4Tx = parserCreateAccount4Tx;
exports.parserSignatureAccount4Tx=parserSignatureAccount4Tx;

exports.parserEndorserAccount4BlockTx=parserEndorserAccount4BlockTx;
exports.parserCreateAccount4BlockTx=parserCreateAccount4BlockTx;
exports.parserSignatureAccount4BlockTx=parserSignatureAccount4BlockTx;