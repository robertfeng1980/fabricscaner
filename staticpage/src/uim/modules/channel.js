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

/**

 @Name：前端就开发框架控制器代码模版
 @desc: 原则上面一个模块一个控制器，一个控制器对应json文件夹下面一个静态示例文件
 @Author：robertfeng

 */


layui.define(['table', 'form', 'laytpl', 'adminutil', 'laydate','fabricstudioutil','element', 'laytpl'], function (exports) {


    let $ = layui.$
        , table = layui.table
        , form = layui.form
        , adminutil = layui.adminutil
        , admin = layui.admin
        , laydate = layui.laydate
        , element = layui.element
        , fabricstudioutil = layui.fabricstudioutil
        , laytpl = layui.laytpl

        , channel =
        {

            name: 'name'

            /**
             *  ===========================================通道（账本）列表所需要的代码把看，(views/channel/channel_list.html)=======================================
             *  ================================================================================================================================================
             *  ================================================================================================================================================
             *  ================================================================================================================================================
             *  ================================================================================================================================================
             *  ================================================================================================================================================
             */

            , channel_list: function (searchparm='') {

                /***
                 *  =========================================通道（账本）管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                let tablesearchurl = layui.setter.base + '../json/channel/channel_list.json';
                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;


                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-channel-list'
                    , url: tablesearchurl /**表格访问接口模拟接口*/
                    , cols: [[
                        {field: 'pkid', title: 'PKID',hide: true}
                        ,{field: 'channel_id', title: '账本名称',width:'22%'}
                        ,{field: 'comments', edit: 'text',title: '注释*',width:'23%'}
                        ,{field: 'originate_dt', title: '创建时间',width:'15%'}
                        ,{field: 'countblocks', title: '区块数',width:'7%'}
                        ,{field: 'chaincodes', title: '链码',width:'7%'}
                        ,{field: 'txcount', title: '交易数',width:'7%'}
                        ,{field: 'keysets', title: 'KEY',width:'7%'}
                        ,{field: 'account_certs', title: '证书',width:'7%'}
                        ,{title: '操作', width:'6%' ,align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "通道（账本）表"
                    , text: {none: '暂无相关数据'}
                });



                //编辑列表的字段
                table.on('edit(LAY-channel-list)', function(obj){
                    var value = obj.value //得到修改后的值
                        ,data = obj.data //得到所在行所有键值
                        ,field = obj.field; //得到字段



                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/manager/com_update.json?pkid=' + data.pkid+"&fildvalue="+value+"&module=ledge"
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            let data1 = response.data;
                            layer.msg('[ID: '+ data.pkid +'] ' + field + ' 字段更改为：'+ value, {offset: '15px'});


                        }

                    });



                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-channel-list)', function (obj) {

                    let data = obj.data;
                    let pkid = data.pkid;
                    let channel_id = data.channel_id
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                     if (obj.event === 'detail') {  /*其他表格中单行数据的操作*/

                         //parent.layui.index.openTabsPage('channel/channel_detail.html?pkid=' +pkid, '账本 [ ' + channel_id + ' ] 详情');

                         layer.open({
                             type: 2
                             , title: '账本 [ '+channel_id+' ] 详情'
                             , content: 'channel_detail.html?pkid='+pkid+'&channel_id='+channel_id
                             , maxmin: true
                             , area: ['650px', '650px']
                             , btn: [ '刷新','关闭']
                             , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                             ,success: function(layero,index){
                                 //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                 //通过layer.full方法将窗口放大。
                                 layer.full(index);
                             }
                         });


                    }

                });


                /*监听通道（账本）类表查询条件表单*/
                form.on('submit(LAY-channel-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-channel-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#searchdatarange'
                    , range: true
                });

                /*日期选择器*/
                laydate.render({
                    elem: '#deploydata'
                    , type: 'date' /*type 默认为 date，所以可不填*/
                });


                /** org查询条件下拉列表 */


                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });



            }


            /**
             *
             *  ===================================通道（账本) 详细信息 (/views/channel/channel_detail.html)=================================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , channel_detail: function () {


                // peer节点编号
                let channel_pkid = adminutil.getUrlParam("pkid");
                let channel_id = adminutil.getUrlParam("channel_id");


                //==========  当前channel时间线分布图  ==============
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_detail_blocktimeline.json?channel_id='+channel_id+'&pkid='+channel_pkid
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //区块时间线信息
                        let blockstimelinedata = response.blocks_timeline;
                        channel.channel_detail_timeline_pic(blockstimelinedata);

                    }

                });


                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                channel.channel_detail_struct_pic(channel_id);


                //====================绑定显示区块详细结构的弹出窗口的信息====================

                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = type + ',' + mspid;

                    //layer.msg(" the org data id is  "+mspid);
                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=json&jsonviewparm=' + jsonparm

                        , area: ['950px', '750px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {

                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index === 0) {

                        channel.channel_detail_struct_pic(channel_id);

                    } else if (obj.index === 1) {


                        let tablesearchurl = layui.setter.base + '../json/channel/channel_config_json.json?channel_id='+channel_id;
                        fabricstudioutil.dispaly_json(tablesearchurl);


                    }else if (obj.index === 2) {


                        channel.channel_detail_blocklist(channel_id);


                    }else if (obj.index === 3) {

                        channel.channel_detail_peer(channel_id);

                    }else if (obj.index === 4) {

                        channel.channel_detail_chaincode(channel_id);

                    }else if (obj.index === 5) {

                        channel.channel_detail_tx(channel_id);

                    }else if (obj.index === 6) {

                        channel.channel_detail_key(channel_id);

                    }else if (obj.index === 7) {

                        channel.channel_detail_cert(channel_id);
                    }


                });

            }

            /**
             * ========================================================channel中区块时间分布图=============================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             *
             * [

             {id: 524, content: 'block 524', start: '2019-04-20 10:01:35'},
             {id: 525, content: 'block 525', start: '2019-04-20 10:03:17'},
             {id: 526, content: 'block 526', start: '2019-04-21 10:14:20'},
             {id: 527, content: 'block 527', start: '2019-04-21 10:16:56'},
             {id: 528, content: 'block 528', start: '2019-04-21 10:22:01'},
             {id: 529, content: 'block 529', start: '2019-04-13 13:33:43'},
             {id: 530, content: 'block 530', start: '2019-05-13 13:34:57'},
             {id: 531, content: 'block 531', start: '2019-05-13 13:34:58'},
             {id: 532, content: 'block 532', start: '2019-05-13 13:34:03'},
             {id: 533, content: 'block 533', start: '2019-05-13 13:34:05'},
             {id: '534##channel_iding', content: '534 (TX:12)', start: '2019-05-13 13:34:59'}
             ]
             *
             *
             */
            ,channel_detail_timeline_pic : (timelinedata)=>{


                let vis = window.visobj;
                // DOM element where the Timeline will be attached
                let container = document.getElementById('blockteimeline');


                let lastdate = timelinedata.lastdt;
                let blockss = timelinedata.blocks;

                let blockarray = [];
                for( let bind = 0 ; bind < blockss.length ; bind++)
                {
                    let blockitem = blockss[bind];
                    let timeline_bookitem = {
                        id: blockitem['pkid'], content:"#" + blockitem['blocknum'], start: blockitem['blockcreatedt']
                    }
                    blockarray.push(timeline_bookitem);

                }

                let blocks = new vis.DataSet();
                blocks.add(blockarray);



                // Create a DataSet (allows two way data-binding)

                let curredate = new Date(lastdate);

                let start = new Date(curredate.getTime() - 20 * 60 * 1000);
                let end = new Date(curredate.getTime() + 1 * 60 * 1000);


                // Configuration for the Timeline
                let options = {


                    start: start,
                    end: end,

                    showCurrentTime: true,

                    format: {

                        minorLabels: {
                            millisecond: 'SSS',
                            second: 's',
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            weekday: 'ddd D',
                            day: 'D',
                            week: 'w',
                            month: 'MMM',
                            year: 'YYYY'
                        },
                        majorLabels: {
                            millisecond: 'HH:mm:ss',
                            second: 'D MMMM HH:mm',
                            minute: 'ddd D MMMM',
                            hour: 'ddd D MMMM',
                            weekday: 'MMMM YYYY',
                            day: 'MMMM YYYY',
                            week: 'MMMM YYYY',
                            month: 'YYYY',
                            year: ''
                        }
                    },


                };

                // 创建时间线对象
                let timeline = new vis.Timeline(container, blocks, options);


                timeline.on('doubleClick', function (properties) {

                    //alert('selected items: ' + properties.item);

                    let block_pkid = properties.item;
                    let datahash = "";

                    layer.open({
                        type: 2
                        , title: '区块 [ #' +block_pkid + ' ] 详情'
                        , content: 'block_detail.html?blockhash=' + datahash + "&pkid="+block_pkid
                        , maxmin: true
                        , area: ['650px', '650px']
                        , btn: [ '刷新','关闭']
                        , yes: function (index, layero) {

                            //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                            window['layui-layer-iframe' + index].location.reload();

                        }
                        ,success: function(layero,index){
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            layer.full(index);
                        }
                    });



                });

                timeline.on('rangechange', function (properties) {
                    //alert('rangechange: ' + fabricstudiotpl.stringifyObject(properties));
                });

                timeline.on('rangechanged', function (properties) {
                    //alert('rangechanged: ' + fabricstudiotpl.stringifyObject(properties));
                });


                timeline.on('itemout', function (properties) {
                    //alert('itemout'+ fabricstudiotpl.stringifyObject(properties));
                });


                timeline.on('timechange', function (properties) {
                    //alert('timechange'+ fabricstudiotpl.stringifyObject(properties));
                });

                timeline.on('timechange', function (properties) {
                    //alert('timechange'+ fabricstudiotpl.stringifyObject(properties));
                });



                $('#zoomIn').on('click', function () {

                    timeline.zoomIn(0.2);

                });


                $('#zoomOut').on('click', function () {

                    timeline.zoomOut(0.2);

                });


                $('#moveLeft').on('click', function () {

                    let percentage = 0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#moveRight').on('click', function () {

                    let percentage = -0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#toggleRollingMode').on('click', function () {

                    //timeline.toggleRollingMode();

                    let start = new Date(curredate.getTime() - 20 * 60 * 1000);
                    let end = new Date(curredate.getTime() + 1 * 60 * 1000);

                    timeline.setWindow({
                        start: start,
                        end: end
                    });


                });


            }



            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , channel_detail_struct_pic: (channel_id,flag) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_detail.json?channel_id='+channel_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);

                        //channel网络拓扑图数据结构
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.channel_detail_struct_pic( pic_struct , 'pic_struct' );

                        //channel详细信息
                        let channelinfo = response.channelinfo;
                        $('#channel_id_div_element').html( channelinfo['channel_id'] );
                        $('#channel_createdt_div_element').html(channelinfo['originate_dt']);



                        //共享channel的组织
                        let channel_share_rog = response.channel_share_org;
                        $('#channel_share_org').empty();
                        for (let ind = 0 ; ind<channel_share_rog.length ; ind++ ){

                            let share_org = channel_share_rog[ind];

                            $('#channel_share_org').append(`<button class="layui-btn layuiadmin-btn-list layui-btn-sm" data-type="${share_org['mspid']}">${share_org['comments']}</button>`);


                        }


                    }

                });

            }






            /**
             * channel 区块信息
             *
             * @param mspid
             */
            , channel_detail_blocklist: (channel_id) => {

                //layer.msg(" the org  channel_detail_orderer  data id is  ");
                channel.blocks_list(`channel_id=${channel_id}`);

            }


            /**
             * 组织中的
             * @param mspid
             */
            , channel_detail_peer: (channel_id) => {

                //layer.msg(" the org   channel_detail_peer   data id is  ");
                channel.peer_list(`channel_id=${channel_id}`);

            }


            /**
             * 组织中的channel
             * @param mspid
             */
            , channel_detail_chaincode: (channel_id) => {


                channel.chaincodes_list(`channel_id=${channel_id}`);
            }


            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , channel_detail_tx: (channel_id) => {

                //layer.msg(" the org   channel_detail_tx   data id is  ");
                channel.transaction_list(`channel_id=${channel_id}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , channel_detail_key: (channel_id) => {

                //layer.msg(" the org   channel_detail_key   data id is  ");
                channel.keyset_list(`channel_id=${channel_id}`);


            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , channel_detail_cert: (channel_id) => {

                //layer.msg(" the org   channel_detail_cert   data id is  ");
                channel.accounts_list(`channel_id=${channel_id}`);

            }



            /***
             *  ========================================================================  channel 详情况结束  ===========================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */


            /**
             *  ==================================链码(智能合约)列表所需要的代码把看，(views/channel/chaincodes_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , chaincodes_list: function (searchparm='') {

                /***
                 *  =========================================链码(智能合约)管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                let tablesearchurl = layui.setter.base + '../json/channel/chaincodes_list.json';
                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-chaincodes-list'
                    , url: tablesearchurl /*模拟接口*/
                    , cols: [[

                         {field: 'pkid', title: 'PKID', hide: true}
                       /* , {field: 'peer_name', title: 'peer节点'}
                        , {field: 'channel_id', title: '账本名称'}*/
                        , {field: 'name', title: '名称'}
                        , {field: 'languages', title: '开发语言'}
                        , {field: 'comments', edit: 'text',title: '注释*'}
                        , {field: 'version', title: '版本'}
                        , {field: 'path', title: '路径'}
                        , {field: 'txcount', title: '交易数'}
                        , {field: 'ccstatus', title: '状态',templet: '#ccstatusTpl'}
                        , {field: 'cccreatedt', title: '创建时间'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "链码(智能合约)表"
                    , text: {none: '暂无相关数据'}
                })


                //编辑单元格
                table.on('edit(LAY-chaincodes-list)', function(obj){
                    var value = obj.value //得到修改后的值
                        ,data = obj.data //得到所在行所有键值
                        ,field = obj.field; //得到字段



                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/manager/com_update.json?pkid=' + data.pkid+"&fildvalue="+value+"&module=cc"
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            let dataType = response.data;
                            layer.msg('[ID: '+ data.pkid +'] ' + field + ' 字段更改为：'+ value, {offset: '15px'});

                        }

                    });



                });



                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-chaincodes-list)', function (obj) {

                    let data = obj.data;
                    let pkid = data.pkid;
                    let cc_name = data.name;

                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event == 'detail') {  /*其他表格中单行数据的操作*/


                        //parent.layui.index.openTabsPage('channel/chaincode_detail.html?pkid=' +pkid, 'chaincode [ ' + cc_name + ' ] 详情');

                        layer.open({
                            type: 2
                            , title: '链码 [ ' + cc_name + ' ] 详情'
                            , content: 'chaincode_detail.html?pkid=' +pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: [ '刷新','关闭']
                            , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                            ,success: function(layero,index){
                                //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                //通过layer.full方法将窗口放大。
                                layer.full(index);
                            }
                        });

                    }

                });


                /*监听链码(智能合约)类表查询条件表单*/
                form.on('submit(LAY-chaincodes-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-chaincodes-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#cccreatedt'
                    , range: true
                });




                /**请求组织下来列表的数据*/
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });

                //绑定org select的事件
                form.on('select(channellist_org_select)', function (data) {

                    let mspid = data.value;

                    /*绑定批量删除和添加等按钮的操作事件*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + `../json/channel/block_org_channel_select.json?mspid=${mspid}`
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            var getTpl = $('#tpl_block_channellist_select').html();
                            laytpl(getTpl).render(response.data, function (html) {
                                $('#block_channellist_select').html(html);
                            });


                            form.render('select');

                        }

                    });



                });




            }


            /**
             *
             *  ===================================通道（账本) 详细信息 (/views/channel/chaincode_detail.html)=================================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , chaincodes_detail: function () {




                // peer节点编号
                let chaincodes_id = adminutil.getUrlParam("pkid");




                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                channel.chaincodes_detail_struct_pic(chaincodes_id);


                //====================绑定peer节点证书详细信息按钮的事件====================

                /*$('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = type + ',' + mspid;

                    //layer.msg(" the org data id is  "+mspid);
                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=json&jsonviewparm=' + jsonparm

                        , area: ['950px', '750px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });*/



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {

                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index === 0) {

                        channel.chaincodes_detail_struct_pic(chaincodes_id);

                    } else if (obj.index === 1) {


                        channel.chaincodes_detail_peer(chaincodes_id);



                    }else if (obj.index === 2) {

                        channel.chaincodes_detail_tx(chaincodes_id);


                    }else if (obj.index === 3) {


                        channel.chaincodes_detail_key(chaincodes_id);



                    }else if (obj.index === 4) {


                        channel.chaincodes_detail_cert(chaincodes_id);

                    }


                });

            }




            /**
             * ========================================================channel中区块时间分布图=============================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             */
            ,chaincodes_detail_timeline_pic : (timelinedata)=>{


                let vis = window.visobj;
                // DOM element where the Timeline will be attached
                let container = document.getElementById('blockteimeline');

                // Create a DataSet (allows two way data-binding)
                let blocks = new vis.DataSet([

                    {id: 524, content: 'block 524', start: '2019-04-20 10:01:35'},
                    {id: 525, content: 'block 525', start: '2019-04-20 10:03:17'},
                    {id: 526, content: 'block 526', start: '2019-04-21 10:14:20'},
                    {id: 527, content: 'block 527', start: '2019-04-21 10:16:56'},
                    {id: 528, content: 'block 528', start: '2019-04-21 10:22:01'},
                    {id: 529, content: 'block 529', start: '2019-04-13 13:33:43'},
                    {id: 530, content: 'block 530', start: '2019-05-13 13:34:57'},
                    {id: 531, content: 'block 531', start: '2019-05-13 13:34:58'},
                    {id: 532, content: 'block 532', start: '2019-05-13 13:34:03'},
                    {id: 533, content: 'block 533', start: '2019-05-13 13:34:05'},
                    {id: '534##chaincodes_iding', content: '534 (TX:12)', start: '2019-05-13 13:34:59'}
                ]);


                let start = new Date((new Date()).getTime() - 20 * 60 * 1000);
                let end = new Date((new Date()).getTime() + 1 * 60 * 1000);


                // Configuration for the Timeline
                let options = {


                    start: start,
                    end: end,

                    showCurrentTime: true,

                    format: {

                        minorLabels: {
                            millisecond: 'SSS',
                            second: 's',
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            weekday: 'ddd D',
                            day: 'D',
                            week: 'w',
                            month: 'MMM',
                            year: 'YYYY'
                        },
                        majorLabels: {
                            millisecond: 'HH:mm:ss',
                            second: 'D MMMM HH:mm',
                            minute: 'ddd D MMMM',
                            hour: 'ddd D MMMM',
                            weekday: 'MMMM YYYY',
                            day: 'MMMM YYYY',
                            week: 'MMMM YYYY',
                            month: 'YYYY',
                            year: ''
                        }
                    },


                };

                // 创建时间线对象
                let timeline = new vis.Timeline(container, blocks, options);


                timeline.on('doubleClick', function (properties) {
                    alert('selected items: ' + properties.item);
                });

                timeline.on('rangechange', function (properties) {

                    //alert('rangechange: ' + fabricstudiotpl.stringifyObject(properties));
                });

                timeline.on('rangechanged', function (properties) {
                    //alert('rangechanged: ' + fabricstudiotpl.stringifyObject(properties));

                });



                timeline.on('itemout', function (properties) {
                    alert('itemout'+ fabricstudiotpl.stringifyObject(properties));

                });



                timeline.on('timechange', function (properties) {
                    alert('timechange'+ fabricstudiotpl.stringifyObject(properties));
                });



                $('#zoomIn').on('click', function () {

                    timeline.zoomIn(0.2);

                });


                $('#zoomOut').on('click', function () {

                    timeline.zoomOut(0.2);

                });


                $('#moveLeft').on('click', function () {

                    let percentage = 0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#moveRight').on('click', function () {

                    let percentage = -0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#toggleRollingMode').on('click', function () {

                    //timeline.toggleRollingMode();

                    let start = new Date((new Date()).getTime() - 20 * 60 * 1000);
                    let end = new Date((new Date()).getTime() + 1 * 60 * 1000);

                    timeline.setWindow({
                        start: start,
                        end: end
                    });


                });



            }


            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , chaincodes_detail_struct_pic: (chaincodes_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/chaincodes_detail.json?chaincodes_pkid='+chaincodes_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        //$('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        //$('#divelementblocks').html(count_info['blocks']);
                        //$('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);

                        //chaincode统计图
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.chaincode_detail_struct_pic(pic_struct,'pic_struct');


                        //chaincode详细信息
                        let chaincode_info = response.chaincode_info;

                        $('#cc_name_div_element').html(chaincode_info['name']);
                        $('#cc_path_div_element').html(chaincode_info['path']);
                        $('#cc_channel_div_element').html(chaincode_info['channel_id']);
                        $('#cc_status__div_element').html(chaincode_info['ccstatus']);
                        //$('#cc_chare_org').html(chaincode_info['tx']);
                        //$('#cc_endorstor').html(chaincode_info['keyset']);


                    }

                });

            }



            /**
             * 组织中的
             * @param mspid
             */
            , chaincodes_detail_peer: (chaincodes_id) => {

                //layer.msg(" the org   chaincodes_detail_peer   data id is  ");
                channel.peer_list(`chaincodes_pkid=${chaincodes_id}`);

            }


            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , chaincodes_detail_tx: (chaincodes_id) => {

                //layer.msg(" the org   chaincodes_detail_tx   data id is  ");
                channel.transaction_list(`chaincodes_pkid=${chaincodes_id}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , chaincodes_detail_key: (chaincodes_id) => {

                //layer.msg(" the org   chaincodes_detail_key   data id is  ");
                channel.keyset_list(`chaincodes_pkid=${chaincodes_id}`);

            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , chaincodes_detail_cert: (chaincodes_id) => {

                //layer.msg(" the org   chaincodes_detail_cert   data id is  ");
                channel.accounts_list(`chaincodes_pkid=${chaincodes_id}`);

            }


            /***
             * =========================================chaincode详代码结束===================================================================
             * @param searchparm
             */


            /**
             *  ==================================交易列表所需要的代码把看，(views/channel/transaction_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , transaction_list: function (searchparm='') {

                /***
                 *  =========================================交易管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                let tablesearchurl = layui.setter.base + '../json/channel/transaction_list.json';
                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-transaction-list'
                    , url: tablesearchurl /*模拟接口*/
                    , cols: [[

                         {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'channel_id', title: '账本名称'}
                        , {field: 'blocknum', width:120, title: '区块编号'}
                        , {field: 'txhash', title: '交易哈希值'}
                        , {field: 'txcreatedt', title: '交易创建时间'}
                        , {field: 'chaincode_name', title: '链码名称'}
                        , {field: 'validationcode', title: '交易状态',templet: '#txvalidationcodeTpl'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "交易表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-transaction-list)', function (obj) {

                    let data = obj.data;
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/
                    if (obj.event == 'detail') {  /*其他表格中单行数据的操作*/

                        //

                        let data = obj.data;
                        let pkid = data.pkid;
                        let txhash = data.txhash;

                        /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                        if (obj.event == 'detail') {  /*其他表格中单行数据的操作*/

                            //parent.layui.index.openTabsPage('channel/transaction_detail.html?txhash=' +txhash, '交易 [ ' + txhash + ' ] 详情');

                            layer.open({
                                type: 2
                                , title:  '交易 [ ' + txhash + ' ] 详情'
                                , content: 'transaction_detail.html?txhash=' +txhash+"&pkid="+pkid
                                , maxmin: true
                                , area: ['650px', '650px']
                                , btn: [ '刷新','关闭']
                            , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                                ,success: function(layero,index){
                                    //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                    //通过layer.full方法将窗口放大。
                                    layer.full(index);
                                }
                            });

                        }

                    }

                });


                /*监听交易类表查询条件表单*/
                form.on('submit(LAY-transaction-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-transaction-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#txcreatedt'
                    , range: true
                });

                /**请求组织下拉列表的数据*/
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });

                //绑定org select的事件
                form.on('select(channellist_org_select)', function (data) {

                    let mspid = data.value;

                    /*绑定批量删除和添加等按钮的操作事件*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + `../json/channel/block_org_channel_select.json?mspid=${mspid}`
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            var getTpl = $('#tpl_block_channellist_select').html();
                            laytpl(getTpl).render(response.data, function (html) {
                                $('#block_channellist_select').html(html);
                            });


                            form.render('select');

                        }

                    });



                });


            }


            /**************************************************************************************************************************************************
             *
             *  ===================================通道（账本) 详细信息 (/views/channel/transaction_detail.html)==============================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             ***************************************************************************************************************************************************
             */
            , transaction_detail: function () {



                // peer节点编号
                let transaction_id = adminutil.getUrlParam("pkid");
                let transaction_hash = adminutil.getUrlParam("txhash");


                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                channel.transaction_detail_struct_pic(transaction_id);


                //====================绑定peer节点证书详细信息按钮的事件====================

                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = type + ',' + transaction_id;

                    //layer.msg(" the org data id is  "+mspid);
                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=json&jsonviewparm=' + jsonparm

                        , area: ['950px', '750px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {

                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index === 0) {

                        channel.transaction_detail_struct_pic(transaction_id);

                    } else if (obj.index === 1) {

                        let tablesearchurl = layui.setter.base + '../json/channel/txjson.json?txhash='+transaction_hash+"&pkid="+transaction_id;
                        fabricstudioutil.dispaly_json(tablesearchurl);


                    }else if (obj.index === 2) {


                        channel.transaction_detail_key(transaction_id);



                    }else if ( obj.index === 3 ) {


                        channel.transaction_detail_cert(transaction_id);

                    }


                });

            }

            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , transaction_detail_struct_pic: (transaction_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============


                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/transaction_detail.json?pkid='+transaction_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {


                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);


                        //let data = response.data;
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.transaction_detail_struct_pic(pic_struct,'pic_struct');


                        let txinform = response.txinfo;
                        $('#txhash_dev_element').html(txinform['txhash']);
                        $('#tx_channel_id_dev_element').html(txinform['channel_id']);
                        $('#tx_blocknum_dev_element').html(txinform['blocknum']);
                        $('#tx_chaincode_dev_element').html(txinform['chaincode_name']);
                        $('#tx_dt_dev_element').html(txinform['txcreatedt']);
                        $('#tx_validationcode').html(txinform['validationcode']);


                        let tx_share_rog = response.tx_share_org;
                        $('#tx_share_org').empty();
                        for (let ind = 0 ; ind<tx_share_rog.length ; ind++ ){

                            let share_org = tx_share_rog[ind];

                            $('#tx_share_org').append(`<button class="layui-btn layuiadmin-btn-list layui-btn-sm" data-type="${share_org['mspid']}">${share_org['comments']}</button>`);


                        }


                    }

                });

            }



            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , transaction_detail_key: (transaction_id) => {

                //layer.msg(" the org   transaction_detail_key   data id is  ");
                channel.keyset_list(`txpkid=${transaction_id}`);


            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , transaction_detail_cert: (transaction_id) => {

                //layer.msg(" the org   transaction_detail_cert   data id is  ");
                channel.accounts_list(`txpkid=${transaction_id}`);

            }




            /**
             *  ==================================账本中存储的key列表所需要的代码把看，(views/channel/keyset_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , keyset_list: function (searchparm='') {

                /***
                 *  =========================================账本中存储的key管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                let tablesearchurl = layui.setter.base + '../json/channel/keyset_list.json';
                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;

                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-keyset-list'
                    , url: tablesearchurl /*模拟接口*/
                    , cols: [[

                         {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'channel_id', title: '账本名称'}
                        , {field: 'blocknum', title: '区块编号'}
                        , {field: 'transactionhash', title: '交易哈希值'}
                        , {field: 'keyname', title: 'key名称'}
                        , {field: 'isdelete', title: '是否删除' , templet: '#isdeleteTpl',}
                        , {field: 'valuess', title: '值'}
                        , {field: 'chaincode_name', title: '链码'}
                        , {field: 'createdt', title: '创建时间'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "账本中存储的key表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-keyset-list)', function (obj) {


                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event == 'detail') {  /*其他表格中单行数据的操作*/

                        let data = obj.data;
                        let pkid = data.pkid;
                        let keyname = data.keyname;

                        /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                        if (obj.event == 'detail') {  /*其他表格中单行数据的操作*/

                            //parent.layui.index.openTabsPage('channel/keyset_detail.html?pkid=' +pkid, 'key [ ' + keyname + ' ] 详情');

                            layer.open({
                                type: 2
                                , title: 'key [ ' + keyname + ' ] 详情'
                                , content: 'keyset_detail.html?pkid=' +pkid
                                , maxmin: true
                                , area: ['650px', '650px']
                                , btn: [ '刷新','关闭']
                            , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                                ,success: function(layero,index){
                                    //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                    //通过layer.full方法将窗口放大。
                                    layer.full(index);
                                }
                            });

                        }
                    }

                });


                /*监听账本中存储的key类表查询条件表单*/
                form.on('submit(LAY-keyset-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-keyset-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#searchdatarange'
                    , range: true
                });

                /**请求组织下拉列表的数据*/
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });

                //绑定org select的事件
                form.on('select(channellist_org_select)', function (data) {

                    let mspid = data.value;

                    /*绑定批量删除和添加等按钮的操作事件*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + `../json/channel/block_org_channel_select.json?mspid=${mspid}`
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            var getTpl = $('#tpl_block_channellist_select').html();
                            laytpl(getTpl).render(response.data, function (html) {
                                $('#block_channellist_select').html(html);
                            });


                            form.render('select');

                        }

                    });



                });



            }


            /**
             *
             *  ===================================keyset详细信息 (/views/channel/keyset_detail.html)=================================================
             *  =====================================================================================================================================
             *  =====================================================================================================================================
             *
             */
            , keyset_detail: function () {




                // peer节点编号
                let keyset_id = adminutil.getUrlParam("pkid");



                //==========  当前keyset时间线分布图  ==============


               /* adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/keyset_detail_blocktimeline.json?keyset_id='+keyset_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //区块时间线信息
                        let blockstimelinedata = response.keyset_timeline;
                        channel.keyset_detail_timeline_pic(blockstimelinedata);

                    }

                });
                */

                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                channel.keyset_detail_struct_pic(keyset_id);


                //====================绑定peer节点证书详细信息按钮的事件====================

                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = type + ',' + mspid;

                    //layer.msg(" the org data id is  "+mspid);
                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=json&jsonviewparm=' + jsonparm

                        , area: ['950px', '750px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {

                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index === 0) {

                        channel.keyset_detail_struct_pic(keyset_id);

                    } else if (obj.index === 1) {

                        //layer.msg(obj.index + '：' + this.innerHTML+': ');
                        channel.keyset_history_detail_key(keyset_id);



                    }else if (obj.index === 2) {


                        channel.keyset_detail_cert(keyset_id);

                    }


                });

            }




            /**
             * ========================================================channel中区块时间分布图=============================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             * ===========================================================================================================================================
             */
            ,keyset_detail_timeline_pic : (timelinedata)=>{


                let vis = window.visobj;
                // DOM element where the Timeline will be attached
                let container = document.getElementById('blockteimeline');

                // Create a DataSet (allows two way data-binding)
                let blocks = new vis.DataSet([

                    {id: 524, content: 'block 524', start: '2019-04-20 10:01:35'},
                    {id: 525, content: 'block 525', start: '2019-04-20 10:03:17'},
                    {id: 526, content: 'block 526', start: '2019-04-21 10:14:20'},
                    {id: 527, content: 'block 527', start: '2019-04-21 10:16:56'},
                    {id: 528, content: 'block 528', start: '2019-04-21 10:22:01'},
                    {id: 529, content: 'block 529', start: '2019-04-13 13:33:43'},
                    {id: 530, content: 'block 530', start: '2019-05-13 13:34:57'},
                    {id: 531, content: 'block 531', start: '2019-05-13 13:34:58'},
                    {id: 532, content: 'block 532', start: '2019-05-13 13:34:03'},
                    {id: 533, content: 'block 533', start: '2019-05-13 13:34:05'},
                    {id: '534##keyset_iding', content: '534 (TX:12)', start: '2019-05-13 13:34:59'}
                ]);


                let start = new Date((new Date()).getTime() - 20 * 60 * 1000);
                let end = new Date((new Date()).getTime() + 1 * 60 * 1000);


                // Configuration for the Timeline
                let options = {


                    start: start,
                    end: end,

                    showCurrentTime: true,

                    format: {

                        minorLabels: {
                            millisecond: 'SSS',
                            second: 's',
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            weekday: 'ddd D',
                            day: 'D',
                            week: 'w',
                            month: 'MMM',
                            year: 'YYYY'
                        },
                        majorLabels: {
                            millisecond: 'HH:mm:ss',
                            second: 'D MMMM HH:mm',
                            minute: 'ddd D MMMM',
                            hour: 'ddd D MMMM',
                            weekday: 'MMMM YYYY',
                            day: 'MMMM YYYY',
                            week: 'MMMM YYYY',
                            month: 'YYYY',
                            year: ''
                        }
                    },


                };

                // 创建时间线对象
                let timeline = new vis.Timeline(container, blocks, options);


                timeline.on('doubleClick', function (properties) {
                    alert('selected items: ' + properties.item);
                });

                timeline.on('rangechange', function (properties) {

                    //alert('rangechange: ' + fabricstudiotpl.stringifyObject(properties));
                });

                timeline.on('rangechanged', function (properties) {
                    //alert('rangechanged: ' + fabricstudiotpl.stringifyObject(properties));

                });



                timeline.on('itemout', function (properties) {
                    alert('itemout'+ fabricstudiotpl.stringifyObject(properties));

                });



                timeline.on('timechange', function (properties) {
                    alert('timechange'+ fabricstudiotpl.stringifyObject(properties));
                });




                $('#zoomIn').on('click', function () {

                    timeline.zoomIn(0.2);

                });


                $('#zoomOut').on('click', function () {

                    timeline.zoomOut(0.2);

                });


                $('#moveLeft').on('click', function () {

                    let percentage = 0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#moveRight').on('click', function () {

                    let percentage = -0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#toggleRollingMode').on('click', function () {

                    //timeline.toggleRollingMode();

                    let start = new Date((new Date()).getTime() - 20 * 60 * 1000);
                    let end = new Date((new Date()).getTime() + 1 * 60 * 1000);

                    timeline.setWindow({
                        start: start,
                        end: end
                    });


                });



            }


            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , keyset_detail_struct_pic: (keyset_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/keyset_detail.json?pkid='+keyset_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);


                        //let data = response.data;
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.keyset_detail_struct_pic(pic_struct,'pic_struct');


                        let keysetinfo = response.keysetinfo;
                        $('#keyset_channel_div_element').html(keysetinfo['channel_id']);
                        $('#keyset_blocknum_div_element').html(keysetinfo['blocknum']);
                        $('#keyset_cc_div_element').html(keysetinfo['chaincode']);
                        $('#keyset_tx_hash_div_element').html(keysetinfo['transactionhash']);
                        $('#key_name_div_element').html(keysetinfo['keyname']);


                        let key_share_org = response.key_share_org;
                        $('#key_share_org').empty();

                        for (let ind = 0 ; ind<key_share_org.length ; ind++ ){

                            let share_org = key_share_org[ind];
                            $('#key_share_org').append(`<button class="layui-btn layuiadmin-btn-list layui-btn-sm" data-type="${share_org['mspid']}">${share_org['comments']}</button>`);

                        }




                    }

                });

            }




            /**
             * channel 区块信息
             *
             * @param mspid
             */
            , keyset_history_detail_key: (keyset_id) => {

                //layer.msg(" the org  keyset_detail_orderer  data id is  ");
                channel.keysethistory_list(`keysetpkid=${keyset_id}`);

            }




            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , keyset_detail_cert: (keyset_id) => {

                //layer.msg(" the org   keyset_detail_cert   data id is  ");
                channel.accounts_list(`keysetpkid=${keyset_id}`);

            }




            /**
             *  ==================================区块列表所需要的代码把看，(views/channel/blocks_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , blocks_list: function (searchparm='') {



                let tablesearchurl = layui.setter.base + '../json/channel/blocks_list.json'
                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;

                /***
                 *  =========================================区块管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                //let tablesearchurl = layui.setter.base + '../json/channel/blocks_list.json';

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-blocks-list'
                    , url: tablesearchurl /**模拟接口*/
                    , cols: [[

                         {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'channel_id', title: '账本名称'}
                        , {field: 'blocknum',  width: 100,title: '区块编号'}
                        , {field: 'datahash', title: '数据哈希'}
                        , {field: 'txcount',  width: 80 ,title: '交易数'}
                        , {field: 'blockcreatedt', title: '创建时间'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "区块表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-blocks-list)', function (obj) {


                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event === 'detail') {  /*其他表格中单行数据的操作*/


                        let data = obj.data;
                        let pkid = data.pkid;
                        let datahash = data.datahash;
                        let blocknum = data.blocknum

                        /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                        if (obj.event === 'detail') {  /*其他表格中单行数据的操作*/

                            //parent.layui.index.openTabsPage('channel/block_detail.html?pkid=' + pkid, '区块 [ ' + datahash + ' ] 详情');

                            layer.open({
                                type: 2
                                , title: '区块 [ #' +blocknum + " --  "+ datahash  +' ] 详情'
                                , content: 'block_detail.html?blockhash=' + datahash + "&pkid="+pkid+"&blocknum="+blocknum
                                , maxmin: true
                                , area: ['650px', '650px']
                                , btn: [ '刷新','关闭']
                            , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                                ,success: function(layero,index){
                                    //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                    //通过layer.full方法将窗口放大。
                                    layer.full(index);
                                }
                            });


                        }
                    }

                });


                /*监听区块类表查询条件表单*/
                form.on('submit(LAY-blocks-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-blocks-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#blockcreatedt'
                    , range: true
                });




                /*绑定批量删除和添加等按钮的操作事件*/
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });

                //绑定org select的事件
                form.on('select(channellist_org_select)', function (data) {

                    let mspid = data.value;

                    /*绑定批量删除和添加等按钮的操作事件*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + `../json/channel/block_org_channel_select.json?mspid=${mspid}`
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            var getTpl = $('#tpl_block_channellist_select').html();
                            laytpl(getTpl).render(response.data, function (html) {
                                $('#block_channellist_select').html(html);
                            });


                            form.render('select');

                        }

                    });



                });



            }



            /**
             *  ===============================================区块详情(/views/channel/block_detail.html)================================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */


            , block_detail: function () {


                // ============================== peer节点编号 ==============================
                let block_id = adminutil.getUrlParam("pkid");
                let block_hash = adminutil.getUrlParam("blockhash");
                let blocknum = adminutil.getUrlParam("blocknum");


                // ====================  显示图例和当前组织的网络图谱  ================================
                fabricstudioutil.display_struct_example('pic_example');
                channel.blocks_detail_struct_pic(block_id);



                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = '1' + ',' + 'Org1MSP'+","+type;

                    //layer.msg(" the org data id is  "+mspid);

                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=channel&m=block_struct_json&jsonviewparm=' + block_id

                        , area: ['850px', '550px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });



                //复制系统剪切板
              /*  $('.layui-btn.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let block_struct = $("#Canvasper").text();
                    //alert(block_struct);
                    //window.clipboardData.setData("text",block_struct);

                    var obj=$("#Canvasper");
                    obj.select();
                    document.execCommand("copy");



                });
*/



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {


                    if (obj.index === 0) {

                        channel.blocks_detail_struct_pic(block_id);

                    } else if (obj.index === 1) {

                        let tablesearchurl = layui.setter.base + '../json/channel/block_struct_json.json?pkid='+block_id;
                        fabricstudioutil.dispaly_json(tablesearchurl);

                    }else if (obj.index === 2) {

                        channel.blocks_detail_tx(block_id);

                    }else if (obj.index === 3) {

                        channel.blocks_detail_key(block_id);

                    }else if (obj.index === 4) {


                        channel.blocks_detail_cert(block_id);

                    }


                });

            }



            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , blocks_detail_struct_pic: (blocks_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/block_detail.json?pkid='+blocks_id
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {


                        //显示统计数据
                        let count_info = response.count_info;


                        $('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);


                        //let data = response.data;
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.block_detail_struct_pic(pic_struct,'pic_struct');


                        //block详细信息
                        let blockinfo = response.blockinfo;
                        $('#blocknum_div_element').html(blockinfo['blocknum']);
                        $('#blockhash_div_element').html(blockinfo['datahash']);
                        $('#blockcreatedt_div_element').html(blockinfo['blockcreatedt']);
                        $('#blockchannel_div_element').html(blockinfo['channel_id']);



                    }

                });

            }








            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , blocks_detail_tx: (blocks_id) => {

                //layer.msg(" the org   blocks_detail_tx   data id is  ");
                channel.transaction_list(`blockpkid=${blocks_id}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , blocks_detail_key: (blocks_id) => {

                //layer.msg(" the org   blocks_detail_key   data id is  ");
                channel.keyset_list(`blockpkid=${blocks_id}`);


            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , blocks_detail_cert: (blocks_id) => {

                //layer.msg(" the org   blocks_detail_cert   data id is  ");
                channel.accounts_list(`blockpkid=${blocks_id}`);

            }





            /**
             *  ================================================组织中的账号列表所需要的代码，(views/channel/accounts_list.html)======================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , accounts_list: function (searchparm='') {

                /***************************************************************************************************************
                 *  =========================================组织中的账号管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 *
                 ****************************************************************************************************************
                 */

                let tablesearchurl = layui.setter.base + '../json/channel/accounts_list.json';

                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-accounts-list'
                    , url: tablesearchurl /**模拟接口*/
                    , cols: [[
                          {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'mspid', title: '组织编号'}
                        , {field: 'name', title: '名称'}
                        , {field: 'comments', edit: 'text', title: '注释'}
                        , {field: 'account_type', title: '签名类型', templet:'#account_typeTpl'}
                        , {field: 'effective_dt', title: '生效时间'}
                        , {field: 'invalid_dt', title: '失效时间'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "组织中的账号表"
                    , text: {none: '暂无相关数据'}
                });



                //编辑列表的字段
                table.on('edit(LAY-accounts-list)', function(obj){
                    var value = obj.value //得到修改后的值
                        ,data = obj.data //得到所在行所有键值
                        ,field = obj.field; //得到字段



                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/manager/com_update.json?pkid=' + data.pkid+"&fildvalue="+value+"&module=account"
                        , type: 'GET'
                        , dataType: 'json'
                        //,data:JSON.stringify(data.field)
                        //,data: data.field

                        , error: function (e) {
                            layer.msg('系统错误');
                        }

                        , success: function (response) {

                            let data1 = response.data;
                            layer.msg('[ID: '+ data.pkid +'] ' + field + ' 字段更改为：'+ value, {offset: '15px'});


                        }

                    });



                });



                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-accounts-list)', function (obj) {

                    let data = obj.data;
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event === 'detail') {  /*其他表格中单行数据的操作*/


                        let data = obj.data;
                        let pkid = data.pkid;
                        let name = data.name;
                        let certs_md5 = data.certs_md5;

                        /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                        if (obj.event === 'detail') {  /*其他表格中单行数据的操作*/



                            //parent.layui.index.openTabsPage('channel/account_detail.html?pkid=' + pkid, '签名账号 [ ' + name + ' ] 详情');

                            layer.open({
                                type: 2
                                , title: '签名账号 [ ' + certs_md5 + ' ] 详情'
                                , content: 'account_detail.html?pkid=' + pkid+"&certsmd5="+certs_md5
                                , maxmin: true
                                , area: ['650px', '650px']
                                , btn: ['刷新', '关闭']
                                , yes: function (index, layero) {

                                    //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                    window['layui-layer-iframe' + index].location.reload();

                                }
                                , success: function (layero, index) {
                                    //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                    //通过layer.full方法将窗口放大。
                                    layer.full(index);
                                }
                            });


                        }



                    }

                });


                /*监听组织中的账号类表查询条件表单*/
                form.on('submit(LAY-accounts-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-accounts-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#searchdatarange'
                    , range: true
                });

                /**请求组织下拉列表的数据*/
                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/channel_org_select.json'
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        var getTpl = $('#tpl_channellist_org_select').html();
                        laytpl(getTpl).render(response.data, function (html) {
                            $('#channellist_org_select').html(html);
                        });


                        form.render('select');

                    }

                });



            }


            /**
             *
             *  ===================================keyset详细信息 (/views/channel/account_detail.html)=================================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , account_detail: function () {


                // peer节点编号
                let account_id = adminutil.getUrlParam("pkid");
                let certsmd5 = adminutil.getUrlParam("certsmd5");


                // ==========  显示图例和当前组织的网络图谱  ======================
                /*fabricstudioutil.display_struct_example('pic_example');
                channel.account_detail_struct_pic(account_id);*/




                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/account_detail.json?pkid='+account_id+"&certsmd5="+certsmd5
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        /*$('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);*/
                        $('#divelementchannel').html(count_info['channel']);
                        /*$('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);*/
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        //$('#divelementacccount').html(count_info['acccount']);

                        //let data = response.data;
                        let account_info = response.account_info;
                        $('#account_mspid_div_element').html( account_info['mspid']);
                        //$('#account_type_div_element').html( account_info['accounttype']);


                    }

                });



                //显示账号json结构
                let tablesearchurl = layui.setter.base + '../json/channel/account_detail_json.json?pkid='+account_id;
                fabricstudioutil.dispaly_json1(tablesearchurl);


                //====================绑定peer节点证书详细信息按钮的事件====================

                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = type + ',' + mspid;

                    //layer.msg(" the org data id is  "+mspid);
                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=json&jsonviewparm=' + jsonparm

                        , area: ['950px', '750px']
                        , btn: ['取消']
                        , success: function (layero, index) {
                            //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                            //通过layer.full方法将窗口放大。
                            //layer.full(index);
                        }
                    });

                });



                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {

                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    /*if (obj.index === 0) {

                        channel.account_detail_struct_pic(account_id);

                    } else*/

                    if (obj.index === 0) {

                        let tablesearchurl = layui.setter.base + '../json/channel/account_detail_json.json?pkid='+account_id;
                        fabricstudioutil.dispaly_json1(tablesearchurl);

                    }else if (obj.index === 1) {

                        channel.account_detail_channellist(account_id,certsmd5);

                    }else if (obj.index === 2) {

                        channel.account_detail_tx(account_id,certsmd5);

                    }else if (obj.index === 3) {

                        channel.account_detail_key(account_id,certsmd5);

                    }


                });

            }



            /**
             *
             * channel拓扑图(同时当前channel的详细信息和channel的区块链是时间线信息)
             *
             */
            , account_detail_struct_pic: (account_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/channel/account_detail.json?jsonparm=1'
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);

                        //let data = response.data;
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.account_detail_struct_pic(pic_struct,'pic_struct');

                    }

                });

            }



            /**
             * 账号关联的通道
             * @param account_id
             */
            ,account_detail_channellist:(account_id,certsmd5)=>{

                channel.channel_list(`accountpkid=${account_id}&certsmd5=${certsmd5}`);



            }




            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , account_detail_tx: (account_id,certsmd5) => {

                //layer.msg(" the org   account_detail_tx   data id is  ");
                channel.transaction_list(`accountpkid=${account_id}&certsmd5=${certsmd5}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , account_detail_key: (account_id,certsmd5) => {

                //layer.msg(" the org   account_detail_key   data id is  ");
                channel.keyset_list(`accountpkid=${account_id}&certsmd5=${certsmd5}`);


            }



            /**
             * 由于目前的web框架不支持双向依赖，所以临时采用这个方法
             */
            ,peer_list:(searchparm='')=>{


                /***
                 *  =========================================peer节点管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                let tablesearchurl = layui.setter.base + '../json/fabricnode/peer_list.json';

                if (null != searchparm && searchparm !== '' && searchparm !== undefined)
                    tablesearchurl = tablesearchurl + "?" + searchparm;


                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-peer-list'
                    , url: tablesearchurl /**模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'mspid', title: '组织编号'}
                        , {field: 'name', title: '名称'}
                        , {field: 'requests', title: '请求地址'}
                        , {field: 'events', title: '事件地址'}
                        , {field: 'serverhostname', title: 'peer服务器主机名'}
                        , {field: 'runtype', title: '运行方式'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "peer节点表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-peer-list)', function (obj) {

                    var data = obj.data;
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event == 'detail') {
                        /**peer节点详情*/

                        var data = obj.data;
                        var name = data.name;

                        parent.layui.index.openTabsPage('fabricnode/peer_detail.html?peerid=' + data.pkid, 'peer节点 [ ' + name + ' ] 详情');

                        /*layer.open({
                            type: 2
                            , title: 'peer节点 [ ' + name + ' ] 详情'
                            , content: 'peer_detail.html?peerid=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: [ '刷新','关闭']
                            , yes: function (index, layero) {

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                window['layui-layer-iframe' + index].location.reload();

                            }
                            ,success: function(layero,index){
                                //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                //通过layer.full方法将窗口放大。
                                layer.full(index);
                            }
                        });*/


                    }

                });


                /*监听peer节点类表查询条件表单*/
                form.on('submit(LAY-peer-search)', function (data) {

                    var field = data.field;

                    /*执行重载*/
                    table.reload('LAY-peer-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#searchdatarange'
                    , range: true
                });

                /*日期选择器*/
                laydate.render({
                    elem: '#deploydata'
                    , type: 'date' /*type 默认为 date，所以可不填*/
                });



            }

            /**
             *  ==================================账本中存储的key的历史记录列表所需要的代码把看，(views/channel/keysethistory_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */
            ,keysethistory_list: function (searchparm='') {

                /***
                 *  =========================================账本中存储的key的历史记录管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                //let tablesearchurl = adminutil.joinHtmlParm2Ajaxrequest(layui.setter.base + '../json/channel/keysethistory_list.json');

                let tablesearchurl = layui.setter.base + '../json/channel/keysethistory_list.json';

                if (null != searchparm && searchparm !== '' && searchparm !== undefined)
                    tablesearchurl = tablesearchurl + "?" + searchparm;



                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-keyset-history-list'
                    , url: tablesearchurl /*模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        ,{field: 'pkid', title: 'PKID',hide: true}
                        ,{field: 'channel_id', title: '账本名称'}
                        ,{field: 'blocknum', title: '区块编号'}
                        ,{field: 'transactionhash', title: '交易哈希值'}
                        ,{field: 'keyname', title: 'key名称'}
                        ,{field: 'valuess', title: '值'}

                        ,{field: 'chaincode_name', title: '链码'}
                        ,{field: 'txcreatedt_str', title: '创建时间'}
                        , {title: '操作', width: 80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "账本中存储的key的历史记录表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-keyset-history-list)', function (obj) {

                    let data = obj.data;   /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event == 'premodify') {  /*其他表格中单行数据的操作*/


                    }

                });


                /*监听账本中存储的key的历史记录类表查询条件表单*/
                form.on('submit(LAY-keyset-history-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-keyset-history-list', {
                        where: field
                    });
                });


                /*对查询条件中使用到的时间日期控件进行初始化*/
                laydate.render({
                    elem: '#searchdatarange'
                    ,range: true
                });

                /*日期选择器*/
                laydate.render({
                    elem: '#deploydata'
                    ,type: 'date' /*type 默认为 date，所以可不填*/
                });



            }



            /**
             *  ===================================================其他模块的代码=================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *
             */


        };


    //初始化，可以在此处放置初始化代码
    !function () {}


    exports('channel', channel);


});