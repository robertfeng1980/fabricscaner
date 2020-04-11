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



var mysql = require('../db/mysqlservice')

//mysql.openconnection()


//==========    saveRow() ===========


/*
var columnvalue = {

    'name':'texing 1321234 12341234'

}

mysql.saveRow('bc_company',columnvalue).then( insertid=>{

    console.log( `the insert is ${insertid}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )

*/


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


mysql.getRowByPkOne(`select * from blocks where id >0`).then( row=>{

    console.log( ` the getRowByPkOne is ${JSON.stringify(row)}  ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )



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



/////// ===========================================   getSQL2Map  =================================================

/*
mysql.getSQL2Map4Arr( 'select * from bc_company where id = 389','id'  ).then( updaterows=>{

    console.log( `the getSQL2Map4Arr is ${ JSON.stringify(updaterows.get(389)) } ` )

}).then(()=>{

    mysql.closeconnection()

}).catch( err=>{

    console.log(err)
    mysql.closeconnection()

} )
*/

