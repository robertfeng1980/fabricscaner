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


var mysql = require('../db/mysqlservice4pool')

//mysql.openconnection()


//==========    saveRow() ===========


/*async  function  save() {

    var sys_users = {

        'loginname':'texing 1321234 12341234'

    }

    await  mysql.saveRow('sys_users',sys_users);
}

save();*/





// ===========   ======================

/*
var columnvalue = {

    'name':'tesgt121341234'

}


mysql.updateRowByPk('bc_company',columnvalue,'id',381).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    //mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


/*

var columnvalue = {

    'name':'tesgt121341234'

}

var searchparm = {

    'id':'123',
    'name':'3333'

}


mysql.updateRow('bc_company',columnvalue,searchparm).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/



//=======================  updateBySql  ======

/*
mysql.updateBySql(`update bc_company set name = 'ddddddd' where id = 380  `).then( updaterows=>{

    console.log( `the updaterows is ${updaterows}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


// =================== getRowByPk  ===============

/*
mysql.getRowByPk('bc_company','','id',333).then( row=>{

    console.log( ` the updaterows is ${JSON.stringify(row)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/


//=============================== getRowByPkOne  =========================


/*
mysql.getRowByPkOne(`select * from blocks where id >0`).then( row=>{

    console.log( ` the getRowByPkOne is ${JSON.stringify(row)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )

*/


//=================================  getRowsBySQl  =============================


/*


var columnvalue = {
    'name':'tesgt121341234'
}

var searchparm = {
    'id':311
}


mysql.getRowsBySQl('select * from bc_company',searchparm,'').then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )




*/


//////=========================getRowsBySQlNoCondtion==========================

/*mysql.getRowsBySQlNoCondtion( 'select name from bc_company where id = 389'  ).then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



//////////////=====================  getRowsBySQlCase   ==============================////

/*mysql.getRowsBySQlCase( 'select name from bc_company where id = 389'  ).then( updaterows=>{

    console.log( `the updaterows is ${JSON.stringify(updaterows)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



/////// ===================   getSQL2Map  ===================

/*
mysql.getSQL2Map( 'select * from bc_company where id = 389','id'  ).then( updaterows=>{

    console.log( `the getSearchMap is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/



/////// ===================   getSQL2Map  ===================
/*
mysql.getSQL2Map4Arr( 'select * from  channel_ref_instantiatedcc ','chaincodename'  ).then( updaterows=>{

    console.log( `the getSQL2Map4Arr is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*//*
mysql.getSQL2Map4Arr( 'select * from  channel_ref_instantiatedcc ','chaincode_name'  ).then( updaterows=>{

    console.log( `the getSQL2Map4Arr is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )*/



/*
async  function  getSQL2Map4Arr() {


    let result =   await  mysql.getSQL2Map4Arr('select * from  channel_ref_instantiatedcc ','chaincode_name');

    console.log( `the getSQL2Map4Arr is ${ JSON.stringify(result) } ` )

}


getSQL2Map4Arr();*/




async  function  parsertxs() {


    //let txs = await mysql.getRowsByFullSQl(` select pkid , tx_detail from transactions `);
    let txs = await mysql.getRowsByFullSQl(` select pkid , txhash ,tx_detail from transactions where chaincode_name = 'lscc' `);


    for( let ind = 0 ; ind<txs.length;ind++){

        let tx = txs[ind];

        if( tx['tx_detail'] === '' || tx['tx_detail'] === undefined  )
            continue;

        let json_detail_de = new Buffer(tx['tx_detail'], 'base64').toString();


        let fn = require('funclib');
        //fn.log(jsonstr, 'Persons');
        let jsonstr =JSON.parse(json_detail_de)
        let jsonformat = fn.pretty(jsonstr);

        //let cc = jsonstr.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.chaincode_id;
        let cc_results = jsonstr.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset;
        //let cc_results_length = jsonstr.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
        let cc_tx_timestamp = jsonstr.transactionEnvelope.payload.header.channel_header.timestamp;
        let cc_tx_channel = jsonstr.transactionEnvelope.payload.header.channel_header.channel_id;
        let cc_lanage = jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.typeString;
        //let cc_tx_version = cc.version;


        let lscc_ns ;

        cc_results.forEach(function(item,index,arr){
                let  namespace = item.namespace;
                lscc_ns = item;
                if(namespace === 'lscc') return;
        });


        let rwset = lscc_ns.rwset;

        let rwset_reads = rwset.reads;
        let wrset_writes  = rwset.writes

        let rwset_reads_key = rwset_reads[0].key;
        let rwset_writers_key= wrset_writes[0].key ;

        let tx_info =  wrset_writes[0].value;

        var arr = tx_info.toString().split("\n");
        let cc_info = arr[1];

        let split_start = rwset_reads_key.length;
        let split_end = cc_info.indexOf("escc");

        let cc_instance_version = cc_info.substring(split_start+3, split_end-2).trim();


        //console.info(cc_info+ '------' +cc_instance_version);


        //console.log(  `${ tx['pkid'] + '  ' + jsonstr.transactionEnvelope.payload.header.channel_header.typeString }`  );
        //console.log(  `${ tx['pkid'] + '  ' + jsonstr.transactionEdatanvelope.payload.data }`  );
        //console.log(  `${ tx['pkid'] + '  ' + jsonstr.transactionEnvelope.payload.data.actions.length }`  );
        //console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id)
        //console.log( tx['pkid']+"--------"+ JSON.stringify(cc) );  //发起本笔交易的cc
        //console.log( tx['pkid']+"--------" + JSON.stringify(cc_results) );  //
        //console.log( tx['pkid']+"--------"+ cc_results_length );  //发起本笔交易的cc
        //console.log( tx['pkid']+"--------"+ JSON.stringify( lscc_ns  ) );  //发起本笔交易的cc
        //console.log( tx['pkid']+"--------"+ JSON.stringify( rwset ) );  //发起本笔交易的cc
        //console.log( tx['pkid']+"--------"+ JSON.stringify( rwset_reads_key ) );  //发起本笔交易的cc
        //console.log( tx['pkid']+"--------"+ JSON.stringify( rwset_writers_key ) );  //发起本笔交易的cc
        //console.log( tx['txhash']+"--------"+ JSON.stringify( tx_info ) );  //发起本笔交易的cc
         console.log( tx['pkid']+ ' --------------  '  + cc_tx_channel + '-----------'+rwset_reads[0].key + '---------'+ cc_lanage + '-------------' + cc_instance_version + "--------"+cc_tx_timestamp );  //发起本笔交易的cc
        //console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.typeString); //当前交易的语言类型

    }




    //console.log( jsonformat );

}






async  function  parsertx() {




    let tx = await mysql.getRowByPk('transactions', '*', 'pkid',10121 );

    let json_detail_de = new Buffer(tx['tx_detail'], 'base64').toString();


    var fn = require('funclib');
    //fn.log(jsonstr, 'Persons');
    var jsonstr =JSON.parse(json_detail_de)
    var jsonformat = fn.pretty(jsonstr);


      // console.log( jsonstr.transactionEnvelope.payload.data.actions[0]);   //这个代码可以获取交易的创建者

    // console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.action);   //获取交易中的操作步骤

   /* console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.typeString); //cc 类型
      console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input);   // cc instance时的参数
      console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id); //cc 相关信息
    */


    //console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec);

    console.log( jsonstr.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.chaincode_id);
    //console.log( jsonformat );

}


//parsertx();
parsertxs();
