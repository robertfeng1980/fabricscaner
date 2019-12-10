/**

 @Name：前端就开发框架控制器代码模版
 @desc: 原则上面一个模块一个控制器，一个控制器对应json文件夹下面一个静态示例文件
 @Author：robertfeng

 */


layui.define(['table', 'form', 'laytpl', 'adminutil', 'laydate','fabricstudioutil','fabricnode','channel'], function (exports) {


    let $ = layui.$
        , table = layui.table
        , form = layui.form
        , admin = layui.admin
        , adminutil = layui.adminutil
        , element = layui.element
        , fabricstudioutil = layui.fabricstudioutil
        , fabricnode = layui.fabricnode
        , channel = layui.channel

        , fabricnetwork =
        {

            name: 'name'



            /**
             *  ================================== fabric网络结构图 ( fabricnetwork/fabricnetwork_struct.html )=========================
             *
             */
            , fabricnetwork_struct: function () {


                // ==========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');

                // ==========  fabric网络拓扑图明细  ===============

                admin.ajaxreq({

                    url: layui.setter.base + '../json/fabricnetwork/fabricnetwork_struct.json'
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        let pic_struct = response.pic_struct;

                        //显示统计数据

                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementorderer').html(count_info['orderer']);
                        $('#divelementfabric_ca').html(count_info['fabric_ca']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementchannel').html(count_info['channel']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);


                        //显示统计图
                        fabricstudioutil.network_struct_pic_detail(pic_struct,'pic_struct');
                    }

                });





                // 绑定tab事件
                /**element.render();

                 element.on('tab(component-tabs-brief)', function (obj) {
                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index == 0) {

                        fabricstudiotpl.indexTab0( obj , this );

                    }else if( obj.index == 1 ){

                        fabricstudiotpl.indexTab1( obj , this );

                    }

                });*/

            }





            /**
             *  ================================== 组织列表 ( fabricnetwork/organization_list.html )==============================
             *
             *  fabric 网络结构图
             *
             */

            , organization_list: function (searchparm='') {



                let tablesearchurl = layui.setter.base + '../json/fabricnetwork/organization_list.json';

                if(  null != searchparm && searchparm !== '' && searchparm !== undefined  )
                    tablesearchurl = tablesearchurl+"?"+searchparm;


                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-organization-list'
                    , url: tablesearchurl  /**模拟接口*/
                    , cols: [[

                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'name', title: '名称'}
                        , {field: 'commitss', edit: 'text',title: '注释'}
                        , {field: 'mspid', title: 'MPSID'}
                        , {field: 'fabric_ca', title: 'FABRIC-CA'}
                        , {field: 'peers', title: 'PEERS'}
                        , {field: 'channels', title: 'CHANNELS'}
                        , {field: 'chaincodes', title: 'CHAINCODES'}
                        , {field: 'txcount', title: '交易'}
                        , {field: 'keysets', title: 'keyset'}
                        , {field: 'account_certs', title: '签名'}
                        , {title: '操作', width:80, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: false
                    , title: "网络中的服务器表"
                    , text: {none: '暂无相关数据'}
                });



                ////====================================================================================================


                //监听单元格编辑
                table.on('edit(LAY-organization-list)', function(obj){
                    var value = obj.value //得到修改后的值
                        ,data = obj.data //得到所在行所有键值
                        ,field = obj.field; //得到字段




                    admin.ajaxreq({

                        url: layui.setter.base + '../json/manager/com_update.json?pkid=' + data.pkid+"&fildvalue="+value+"&module=org"
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



                ////====================================================================================================


                //绑定表格中的按钮事件
                table.on('tool(LAY-organization-list)', function (obj) {


                    let data = obj.data;
                    let mspid = data.mspid;
                    let msppkid = data.pkid;

                    if (obj.event === 'detail') {


                        //parent.layui.index.openTabsPage('fabricnetwork/organization_detail.html?mspid=' + data.mspid, '组织 [ ' + mspid + ' ] 详情');

                        layer.open({
                            type: 2
                            , title:  '组织 [ ' + mspid + ' ] 详情'
                            , content: 'organization_detail.html?mspid=' + data.mspid+"&msppkid="+msppkid
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


                /**监听网络中的服务器类表查询条件表单*/
                form.on('submit(LAY-organization-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-organization-list', {
                        where: field
                    });
                });


            }




            /**
             *
             * fabric网络节点数据拓扑图
             *
             */
            /*, org_struct_pic: function () {


                // ==========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');

                // ==========  fabric网络拓扑图明细  ===============

                admin.ajaxreq({

                    url: layui.setter.base + '../json/fabricnetwork/fabricnetwork_struct.json?jsonparm=1'
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {
                        let data = response.data;
                        fabricstudioutil.network_struct_pic_detail(data,'pic_struct');
                    }

                });



            }*/

            /**
             * ============================================组织详情(fabricnetwork/organization_detail.html)=================================================
             *
             *
             */
            , organization_detail: () => {



                // 获取组织编号
                let mspid = adminutil.getUrlParam("mspid");
                let mpspkid = adminutil.getUrlParam("msppkid");


                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                fabricnetwork.organization_detail_struct_pic(mspid);


                //====================绑定获取组织证书详细信息按钮的事件====================

                $('.layui-btn.layuiadmin-btn-list.layui-btn-sm').on('click', function () {

                    let type = $(this).data('type');
                    let jsonparm = mpspkid + ',' + mspid+","+type;

                    //layer.msg(" the org data id is  "+mspid);

                    layer.open({
                        type: 2
                        , title: 'json的详情'
                        , content: '../json.html?c=fabricnetwork&m=organization_cert_json&jsonviewparm=' + jsonparm

                        , area: ['850px', '550px']
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

                    if (obj.index == 0) {

                        fabricnetwork.organization_detail_struct_pic(mspid);

                    } else if (obj.index == 1) {

                        fabricnetwork.organization_detail_orderer(mspid);

                    }else if (obj.index == 2) {


                        fabricnetwork.organization_detail_fabricca(mspid);



                    }else if (obj.index == 3) {


                        fabricnetwork.organization_detail_peer(mspid);



                    }else if (obj.index == 4) {

                        fabricnetwork.organization_detail_channel(mspid);




                    }else if (obj.index == 5) {


                        fabricnetwork.organization_detail_chaincode(mspid);



                    }else if (obj.index == 6) {


                        fabricnetwork.organization_detail_tx(mspid);



                    }else if (obj.index == 7) {

                        fabricnetwork.organization_detail_key(mspid);



                    }else if (obj.index == 8) {


                        fabricnetwork.organization_detail_cert(mspid);


                    }

                });


            }


            /**
             *
             * 当前组织的拓扑图(同时当前组织的详细信息)
             *
             */
            , organization_detail_struct_pic: (mspid) => {


                // ==========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');

                // ==========  fabric网络拓扑图明细  ===============

                admin.ajaxreq({

                    url: layui.setter.base + '../json/fabricnetwork/organization_detail.json?mspid='+mspid
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //let data = response.data;
                        let pic_struct = response.pic_struct;

                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementorg').html(count_info['org']);
                        $('#divelementorderer').html(count_info['orderer']);
                        $('#divelementfabric_ca').html(count_info['fabric_ca']);
                        $('#divelementpeer').html(count_info['peer']);
                        $('#divelementchannel').html(count_info['channel']);
                        $('#divelementblocks').html(count_info['blocks']);
                        $('#divelementchaincodes').html(count_info['chaincodes']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);




                        $('#org_name_divelement').html(count_info['org_name']);
                        $('#mspid_div_element').html(count_info['mspid_dive']);


                        fabricstudioutil.network_struct_pic_detail(pic_struct,'pic_struct');
                    }

                });

            }


            /**
             * 组织中的orderer
             * @param mspid
             */
            , organization_detail_orderer: (mspid) => {

                //layer.msg(" the org  organization_detail_orderer  data id is  ");
                fabricnode.orderer_list(`mspid=${mspid}`);

            }



            /**
             * 组织中的fabricca
             * @param mspid
             */
            , organization_detail_fabricca: (mspid) => {

                //layer.msg(" the org  organization_detail_orderer  data id is  ");
                fabricnode.fabricca_list(`mspid=${mspid}`);

            }




            /**
             * 组织中的orderer
             * @param mspid
             */
            , organization_detail_fabricca: (mspid) => {

                //layer.msg(" the org  organization_detail_orderer  data id is  ");
                fabricnode.fabricca_list(`mspid=${mspid}`);

            }


            /**
             * 组织中的
             * @param mspid
             */
            , organization_detail_peer: (mspid) => {

                //layer.msg(" the org   organization_detail_peer   data id is  ");
                fabricnode.peer_list(`mspid=${mspid}`);

            }


            /**
             * 组织中的channel
             * @param mspid
             */
            , organization_detail_channel: (mspid) => {

                //layer.msg(" the org  organization_detail_channel    data id is  ");
                channel.channel_list(`mspid=${mspid}`);

            }


            /**
             * 组织中的channel
             * @param mspid
             */
            , organization_detail_chaincode: (mspid) => {


                channel.chaincodes_list(`mspid=${mspid}`);
            }


            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , organization_detail_tx: (mspid) => {

                //layer.msg(" the org   organization_detail_tx   data id is  ");
                channel.transaction_list(`mspid=${mspid}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , organization_detail_key: (mspid) => {

                //layer.msg(" the org   organization_detail_key   data id is  ");
                channel.keyset_list(`mspid=${mspid}`);


            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , organization_detail_cert: (mspid) => {

                //layer.msg(" the org   organization_detail_cert   data id is  ");
                channel.accounts_list(`mspid=${mspid}`);

            }



            ,syntaxHighlight:(json)=> {

                if (typeof json != 'string') {
                    json = JSON.stringify(json, undefined, 2);
                }
                json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
                    var cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }


            /**
             *
             * 显示企业证书的JSON格式详细信息
             *
             */
            , showCertJsonDetail: () => {


                let controller = adminutil.getUrlParam('c');
                let methord = adminutil.getUrlParam('m');
                let postvalue = adminutil.getUrlParam('jsonviewparm');

                admin.ajaxreq({

                    url: layui.setter.base + '../json/' + controller + '/' + methord + '.json?jsonviewparm=' + postvalue
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        let data = response.data;
                        let responsestr=JSON.stringify(data);

                        //$('#Canvas1').html(formatdata);
                        //$("#RawJson").text(responsestr);
                        //$("#Canvas").text(formatdata);
                        //alert(JSON.stringify(formatdata, null, 4));
                        //alert(data);
                        //window.QuoteKeys = false;
                        Process(data);

                    }

                });


            }

            /**
             *  ==================================下面是同模块中其他的子模块的基本代码建议保留注释=========================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  =====================================================================================================================
             *




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


    exports('fabricnetwork', fabricnetwork);


});