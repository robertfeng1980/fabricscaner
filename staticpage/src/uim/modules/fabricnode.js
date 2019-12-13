/**

 @Name：前端就开发框架控制器代码模版
 @desc: 原则上面一个模块一个控制器，一个控制器对应json文件夹下面一个静态示例文件
 @Author：robertfeng

 */


layui.define(['table', 'form', 'laytpl', 'adminutil', 'laydate','channel','fabricstudioutil','element'], function (exports) {


    var $ = layui.$
        , table = layui.table
        , form = layui.form
        , admin = layui.admin
        , adminutil = layui.adminutil
        , laydate = layui.laydate
        , element = layui.element
        , fabricstudioutil = layui.fabricstudioutil
        , channel = layui.channel

        , fabricnode =
        {

            name: 'name'

            /**
             *  ==================================peer节点列表所需要的代码把看，(views/fabricnode/peer_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , peer_list: function (searchparm = '') {

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
                        , {field: 'runtype', title: '运行方式' , templet:'#runtypeTpl'}
                        , {title: '操作', width: 160, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
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

                    if (obj.event === 'del') {


                        layer.confirm('确定删除此peer节点？', function (index) {


                            obj.del();

                            /**批量删除已经选中的数据 data:data.field*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/peer_del.json?id=' + data.pkid, /*模拟批量删除接口接口,*/
                                type: 'GET',
                                dataType: 'json',
                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-peer-list');
                                    layer.close(index);


                                }

                            });


                            layer.close(index);


                        });


                    } else if (obj.event === 'edit') {

                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/peer_form.html?id=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {
                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-peer-form-submit");
                                submit.click();

                                //在这里可刷新窗口，放在其他事件里面就不行了，还是比较奇怪的，暂时先这样吧，么有多余的时间搞这个事情了
                                //window['layui-layer-iframe' + layerIndex].location.reload();

                            }

                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }

                        });


                    } else if (obj.event == 'detail') {
                        /**peer节点详情*/

                        var data = obj.data;
                        var name = data.name;

                        //parent.layui.index.openTabsPage('fabricnode/peer_detail.html?peerid=' + data.pkid, 'peer节点 [ ' + name + ' ] 详情');

                        layer.open({
                            type: 2
                            , title: 'peer节点 [ ' + name + ' ] 详情'
                            , content: 'peer_detail.html?peerpkid=' + data.pkid
                            , maxmin: true
                            , area: ['850px', '850px']
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


                /*绑定批量删除和添加等按钮的操作事件*/

                var active = {

                    batchdel: function () {

                        var checkStatus = table.checkStatus('LAY-peer-list')
                            , checkData = checkStatus.data;
                        /*得到选中的数据*/

                        if (checkData.length === 0) {
                            return layer.msg('请选择数据');
                        }


                        var ids = new Array(checkData.length);
                        for (i = 0; i < checkData.length; i++) {
                            ids[i] = checkData[i].pkid;
                        }

                        var optids = ids.join(',');

                        layer.confirm('确定删除已经选中的' + checkData.length + '条记录吗？', function (index) {


                            /*批量删除已经选中的数据*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/peer_batchdel.json', /*模拟批量删除接口接口,*/
                                type: 'POST',
                                dataType: 'json',
                                data: {batchdelids: optids},
                                /*data:data.field,*/

                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-peer-list');
                                    layer.close(index);


                                }

                            });


                        });
                    },


                    add: function () {
                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/peer_form.html'
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {

                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-peer-form-submit");
                                submit.click();
                            }
                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });
                    }
                };

                $('.layui-btn.layuiadmin-btn-list').on('click', function () {
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });

            }


            /**
             *  ====================peer节点表单相关方法(/views/fabricnode/peer_form.html)=====================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , peer_form: function () {

                /*监听表单的提交*/
                form.on('submit(layuiadmin-peer-form-submit)', function (data) {


                    /*获取提交的字段*/
                    var field = data.field;
                    /*先得到当前iframe层的索引*/
                    var index = parent.layer.getFrameIndex(window.name);


                    /* 这是集成富文本编辑框的一个方法，比较奇怪为何这样做，但是这样确实能把相关的值取出来。*/
                    /*window.editor.sync();
                    richcontent = $('#content_msg').val();
                    data.field.content_msg = richcontent;*/


                    /**
                     layer.msg(JSON.stringify(data.field));
                     layer.msg(field);
                     提交 Ajax 成功后，关闭当前弹层并重载表格
                     $.ajax({});
                     */

                    /*data:JSON.stringify(data.field),*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/fabricnode/peer_save.json',
                        type: 'POST',
                        dataType: 'json',
                        data: data.field,

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {
                            layer.msg('保存成功');
                            /*重载表格*/
                            parent.layui.table.reload('LAY-peer-list');
                            /*再执行关闭*/
                            parent.layer.close(index);
                        }

                    });


                });


                var formid = adminutil.getUrlParam("id");
                var testname = adminutil.getUrlParam("name");

                var formrenderurl = '';

                if (formid == null || formid == '') {  /*添加新记录时候执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/peer_add.json';


                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            form.val('LAY-peer-form', data.data);

                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                            });


                        }

                    });


                } else {  /*修改已有记录时执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/peer_edit.json?id=' + formid + '&s=4';

                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',


                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            /*绑定表单数据的一种写法*/
                            form.val('LAY-peer-form', data.data);

                            /* form.val('LAY-peer-form', {
                             "title": data.data.title
                            ,"author": "robertfeng"
                            });*/


                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                                , value: data.data.createdt
                            });


                        }

                    });

                }

                /*绑定事件，通常用于select联级等操作。*/

                form.on('select(LAY-APP-LISTFORM-SELECT1)', function (data) {

                    layer.msg('这是事件1');

                });

            }




            /**********************************************************************************************************************************************
             *
             *  =============================================peer详细信息 (/views/channel/peer_detail.html)=================================================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *******************************************************************************************************************************************
             */
            , peer_detail: function () {


                // peer节点编号
                let peer_id = adminutil.getUrlParam("peerpkid");



                // ==========  显示图例和当前组织的网络图谱  ======================
                fabricstudioutil.display_struct_example('pic_example');
                fabricnode.peer_detail_struct_pic(peer_id);


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

                        fabricnode.peer_detail_struct_pic(peer_id);

                    } else if (obj.index === 1) {


                        fabricnode.peer_detail_channel(peer_id);


                    }else if (obj.index === 2) {


                        fabricnode.peer_detail_blocklist(peer_id);



                    }else if (obj.index === 3) {

                        fabricnode.peer_detail_chaincode(peer_id);

                    }else if (obj.index === 4) {

                        fabricnode.peer_detail_tx(peer_id);


                    }else if (obj.index === 5) {

                        //layer.msg(obj.index + '：' + this.innerHTML+': ');
                        fabricnode.peer_detail_key(peer_id);


                    }else if (obj.index === 6) {

                        fabricnode.peer_detail_cert(peer_id);

                    }


                });

            }



            , peer_detail_struct_pic: (peer_id) => {


                // ===========  显示图例  ======================
                fabricstudioutil.display_struct_example('pic_example');
                // ==========  fabric网络拓扑图明细  ===============

                adminutil.ajaxreq({

                    url: layui.setter.base + '../json/fabricnode/peer_detail.json?jsonparm=1'
                    , type: 'GET'
                    , dataType: 'json'
                    , error: function (e) {
                        layer.msg('系统错误');
                    }
                    , success: function (response) {

                        //显示统计数据
                        let count_info = response.count_info;

                        $('#divelementchannel').html(count_info['channel']);
                        $('#divelementchaincodes_install').html(count_info['chaincodes_install']);
                        $('#divelementchaincodes_instance').html(count_info['chaincodes_instance']);
                        $('#divelementtx').html(count_info['tx']);
                        $('#divelementkeyset').html(count_info['keyset']);
                        $('#divelementacccount').html(count_info['acccount']);

                        //let data = response.data;
                        let pic_struct = response.pic_struct;
                        fabricstudioutil.peer_detail_struct_pic(pic_struct,'pic_struct');

                        //peer详细信息
                        let peer_info = response.peer_info;

                        $('#peer_org_div_element').html( peer_info['mspid']);
                        $('#peer_name_div_element').html( peer_info['name']);
                        $('#peer_nodeid_div_element').html( peer_info['peerid']);
                        $('#peer_request_div_element').html( peer_info['requests']);
                        $('#peer_event_div_element').html( peer_info['events']);
                        $('#peer_tls_div_element').html( peer_info['tls']);


                    }

                });

            }



            /**
             * peer节点加入的账本
             * @param peer_id
             */
            ,peer_detail_channel:(peer_id)=>{
                channel.channel_list(`mspid=${peer_id}`);

            }


            /**
             * peer 区块信息
             *
             * @param mspid
             */
            , peer_detail_blocklist: (peer_id) => {

                //layer.msg(" the org  peer_detail_orderer  data id is  ");
                channel.blocks_list(`mspid=${peer_id}`);

            }


            /**
             * 组织中的channel
             * @param mspid
             */
            , peer_detail_chaincode: (peer_id) => {


                channel.chaincodes_list(`mspid=${peer_id}`);
            }


            /**
             *
             *  组织中的tx
             * @param mspid
             *
             */
            , peer_detail_tx: (peer_id) => {

                //layer.msg(" the org   peer_detail_tx   data id is  ");
                channel.transaction_list(`mspid=${peer_id}`);

            }


            /**
             *
             * 组织中的key
             * @param mspid
             *
             */
            , peer_detail_key: (peer_id) => {

                //layer.msg(" the org   peer_detail_key   data id is  ");
                channel.keyset_list(`mspid=${peer_id}`);


            }


            /**
             *
             * 组织中的account
             * @param mspid
             *
             */
            , peer_detail_cert: (peer_id) => {

                //layer.msg(" the org   peer_detail_cert   data id is  ");
                channel.accounts_list(`mspid=${peer_id}`);

            }



            /**
             *  ==================================orderer节点打包服务列表所需要的代码把看，(views/fabricnode/orderer_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , orderer_list: function (searchparm = '') {


                let tablesearchurl = layui.setter.base + '../json/fabricnode/orderer_list.json';

                if (null != searchparm && searchparm !== '' && searchparm !== undefined)
                    tablesearchurl = tablesearchurl + "?" + searchparm;

                /***
                 *  =========================================orderer节点打包服务管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-orderer-list'
                    , url: tablesearchurl /**模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'url', title: '访问地址'}
                        , {field: 'runtype', title: '运行方式'}
                        , {field: 'docker_images', title: 'docker镜像名称'}
                        , {field: 'server_ipaddress', title: '运行服务器'}
                        , {field: 'docker_ipaddress', title: 'content地址'}
                        , {title: '操作', width: 120, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "orderer节点打包服务表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-orderer-list)', function (obj) {

                    var data = obj.data;
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event === 'del') {


                        layer.confirm('确定删除此orderer节点打包服务？', function (index) {


                            obj.del();

                            /*批量删除已经选中的数据 data:data.field*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/orderer_del.json?id=' + data.pkid, /*模拟批量删除接口接口,*/
                                type: 'GET',
                                dataType: 'json',
                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-orderer-list');
                                    layer.close(index);


                                }

                            });


                            layer.close(index);


                        });


                    } else if (obj.event === 'edit') {

                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/orderer_form.html?id=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {
                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-orderer-form-submit");
                                submit.click();
                            }
                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });


                    } else if (obj.event == 'premodify') {  /*其他表格中单行数据的操作*/


                    }

                });


                /*监听orderer节点打包服务类表查询条件表单*/
                form.on('submit(LAY-orderer-search)', function (data) {
                    var field = data.field;
                    /*执行重载*/
                    table.reload('LAY-orderer-list', {
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


                /*绑定批量删除和添加等按钮的操作事件*/

                var active = {

                    batchdel: function () {

                        var checkStatus = table.checkStatus('LAY-orderer-list')
                            , checkData = checkStatus.data;
                        /*得到选中的数据*/

                        if (checkData.length === 0) {
                            return layer.msg('请选择数据');
                        }


                        var ids = new Array(checkData.length);
                        for (i = 0; i < checkData.length; i++) {
                            ids[i] = checkData[i].pkid;
                        }

                        var optids = ids.join(',');

                        layer.confirm('确定删除已经选中的' + checkData.length + '条记录吗？', function (index) {


                            /*批量删除已经选中的数据*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/orderer_batchdel.json', /*模拟批量删除接口接口,*/
                                type: 'POST',
                                dataType: 'json',
                                data: {batchdelids: optids},
                                /*data:data.field,*/

                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-orderer-list');
                                    layer.close(index);


                                }

                            });


                        });
                    },


                    add: function () {
                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/orderer_form.html'
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {

                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-orderer-form-submit");
                                submit.click();
                            }
                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });
                    }
                };

                $('.layui-btn.layuiadmin-btn-list').on('click', function () {
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });

            }


            /**
             *  ====================orderer节点打包服务表单相关方法(/views/fabricnode/orderer_form.html)=====================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , orderer_form: function () {

                /*监听表单的提交*/
                form.on('submit(layuiadmin-orderer-form-submit)', function (data) {
                    /*获取提交的字段*/
                    var field = data.field;
                    /*先得到当前iframe层的索引*/
                    var index = parent.layer.getFrameIndex(window.name);


                    /* 这是集成富文本编辑框的一个方法，比较奇怪为何这样做，但是这样确实能把相关的值取出来。*/
                    /*window.editor.sync();
                    richcontent = $('#content_msg').val();
                    data.field.content_msg = richcontent;*/


                    /**
                     layer.msg(JSON.stringify(data.field));
                     layer.msg(field);
                     提交 Ajax 成功后，关闭当前弹层并重载表格
                     $.ajax({});
                     */

                    /*data:JSON.stringify(data.field),*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/fabricnode/orderer_save.json',
                        type: 'POST',
                        dataType: 'json',
                        data: data.field,

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {
                            layer.msg('保存成功');
                            /*重载表格*/
                            parent.layui.table.reload('LAY-orderer-list');
                            /*再执行关闭*/
                            parent.layer.close(index);
                        }

                    });


                });


                var formid = adminutil.getUrlParam("id");
                var testname = adminutil.getUrlParam("name");

                var formrenderurl = '';

                if (formid == null || formid == '') {  /*添加新记录时候执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/orderer_add.json';


                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            form.val('LAY-orderer-form', data.data);
                            /*这个好像也是一种写法*/

                            /*form.val('LAY-orderer-form', {
                            "title": data.data.title
                            , "author": "robertfeng"
                            });*/


                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                            });


                            /*初始表单，两种模式客户端模版合成，服务器端模版合成代码*/
                            /* var getTpl = $('#select1Tpl').html();
                            laytpl(getTpl).render(data.select1, function (html) {
                            $('#LAY-SELECT-LEVEL1').html(html);
                            });*/

                            /*下拉列表的服务器端合成HTML代码*/
                            /* $('#LAY-SELECT-LEVEL2').html(data.select2);*/


                            /*日期时间选择器*/
                            /* laydate.render({
                            elem: '#onlinedatetime'
                            , type: 'datetime'
                            ,value : data.data.deploydata
                            });*/

                            /*日期选择器*/
                            /*  laydate.render({
                            elem: '#deploydata'
                            ,type: 'date'
                            ,value : data.data.onlinedatetime
                            });


                            form.render('select');*/


                        }

                    });


                    /*日期时间选择器
                    laydate.render({
                    elem: '#onlinedatetime'
                    , type: 'datetime'
                    });
                    */
                    /*日期选择器
                    laydate.render({
                    elem: '#deploydata'
                    ,type: 'date'
                    });
                    */


                } else {  /*修改已有记录时执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/orderer_edit.json?id=' + formid + '&s=4';

                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',


                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            /*绑定表单数据的一种写法*/
                            form.val('LAY-orderer-form', data.data);

                            /* form.val('LAY-orderer-form', {
                             "title": data.data.title
                            ,"author": "robertfeng"
                            });*/


                            window.editor_orderer_config.html(data.data.orderer_config);
                            $('#orderer_config').val(data.data.orderer_config);


                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                                , value: data.data.createdt
                            });


                            /*初始表单，两种模式客户端模版合成，服务器端模版合成代码*/
                            /* var getTpl = $('#select1Tpl').html();
                            laytpl(getTpl).render(data.select1, function (html) {
                            $('#LAY-SELECT-LEVEL1').html(html);
                            });*/

                            /*服务器端合成HTML代码*/
                            /*$('#LAY-SELECT-LEVEL2').html(data.select2);*/


                            /*日期时间选择器*/
                            /* laydate.render({
                            elem: '#onlinedatetime'
                            , type: 'datetime'
                            ,value : data.data.deploydata
                            });*/

                            /*日期选择器*/
                            /*laydate.render({
                            elem: '#deploydata'
                            ,type: 'date'
                            ,value : data.data.onlinedatetime
                            });
                            */

                            /*
                            window.editor.html('dddd地方的辅导费发地方地方');
                            $('#content_msg').val( 'dddd地方的辅导费发地方地方');
                            form.render('select');
                            */
                        }

                    });

                }

                /** 绑定事件，通常用于select联级等操作 */

                form.on('select(LAY-APP-LISTFORM-SELECT1)', function (data) {

                    layer.msg('这是事件1');

                });

            }

            /**
             *  ==================================组织中的CA服务器列表所需要的代码把看，(views/fabricnode/fabricca_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            , fabricca_list: function (searchparm = '') {


                let tablesearchurl = layui.setter.base + '../json/fabricnode/fabricca_list.json';

                if (null != searchparm && searchparm !== '' && searchparm !== undefined)
                    tablesearchurl = tablesearchurl + "?" + searchparm;


                /***
                 *  =========================================组织中的CA服务器管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                /**绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-fabricca-list'
                    , url: tablesearchurl /**模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'org_name', title: '组织名称'}
                        , {field: 'ca_name', title: 'ca名称'}
                        , {field: 'ca_request', title: 'ca请求路径'}
                        , {field: 'ca_config_path', title: 'ca配置文件'}
                        , {field: 'createdt', title: '创建时间'}
                        , {field: 'runtype', title: '运行方式'}
                        , {title: '操作',width: 120, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "组织中的CA服务器表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-fabricca-list)', function (obj) {

                    var data = obj.data;
                    /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event === 'del') {


                        layer.confirm('确定删除此组织中的CA服务器？', function (index) {


                            obj.del();

                            /*批量删除已经选中的数据 data:data.field*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/fabricca_del.json?id=' + data.pkid, /*模拟批量删除接口接口,*/
                                type: 'GET',
                                dataType: 'json',
                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-fabricca-list');
                                    layer.close(index);


                                }

                            });


                            layer.close(index);


                        });


                    } else if (obj.event === 'edit') {

                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/fabricca_form.html?id=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {
                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-fabricca-form-submit");
                                submit.click();
                            }
                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });


                    } else if (obj.event == 'detail') {  /*fabric-ca详情*/

                        var data = obj.data;
                        var name = data.name;

                        parent.layui.index.openTabsPage('fabricnode/fabricca_detail.html?caid=' + data.pkid, 'peer节点 [ ' + name + ' ] 详情');

                        /*layer.open({
                            type: 2
                            , title: '组织 [ '+mspid+' ] 明细'
                            , content: 'organization_detail.html?&pkid=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: [ '取消']
                            ,success: function(layero,index){
                                //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                //通过layer.full方法将窗口放大。
                                layer.full(index);
                            }
                        });*/


                    }

                });


                /*监听组织中的CA服务器类表查询条件表单*/
                form.on('submit(LAY-fabricca-search)', function (data) {
                    var field = data.field;
                    /*执行重载*/
                    table.reload('LAY-fabricca-list', {
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


                /*绑定批量删除和添加等按钮的操作事件*/

                var active = {

                    batchdel: function () {

                        var checkStatus = table.checkStatus('LAY-fabricca-list')
                            , checkData = checkStatus.data;
                        /*得到选中的数据*/

                        if (checkData.length === 0) {
                            return layer.msg('请选择数据');
                        }


                        var ids = new Array(checkData.length);
                        for (i = 0; i < checkData.length; i++) {
                            ids[i] = checkData[i].pkid;
                        }

                        var optids = ids.join(',');

                        layer.confirm('确定删除已经选中的' + checkData.length + '条记录吗？', function (index) {


                            /*批量删除已经选中的数据*/
                            adminutil.ajaxreq({

                                url: layui.setter.base + '../json/fabricnode/fabricca_batchdel.json', /*模拟批量删除接口接口,*/
                                type: 'POST',
                                dataType: 'json',
                                data: {batchdelids: optids},
                                /*data:data.field,*/

                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-fabricca-list');
                                    layer.close(index);


                                }

                            });


                        });
                    },


                    add: function () {
                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/fabricnode/fabricca_form.html'
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {

                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-fabricca-form-submit");
                                submit.click();
                            }
                            , success: function (layero, index) {
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });
                    }
                };

                $('.layui-btn.layuiadmin-btn-list').on('click', function () {
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });

            }


            /**
             *  ====================组织中的CA服务器表单相关方法(/views/fabricnode/fabricca_form.html)=====================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , fabricca_form: function () {

                /*监听表单的提交*/
                form.on('submit(layuiadmin-fabricca-form-submit)', function (data) {
                    /*获取提交的字段*/
                    var field = data.field;
                    /*先得到当前iframe层的索引*/
                    var index = parent.layer.getFrameIndex(window.name);


                    /* 这是集成富文本编辑框的一个方法，比较奇怪为何这样做，但是这样确实能把相关的值取出来。*/
                    /*window.editor.sync();
                    richcontent = $('#content_msg').val();
                    data.field.content_msg = richcontent;*/


                    /**
                     layer.msg(JSON.stringify(data.field));
                     layer.msg(field);
                     提交 Ajax 成功后，关闭当前弹层并重载表格
                     $.ajax({});
                     */

                    /*data:JSON.stringify(data.field),*/
                    adminutil.ajaxreq({

                        url: layui.setter.base + '../json/fabricnode/fabricca_save.json',
                        type: 'POST',
                        dataType: 'json',
                        data: data.field,

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {
                            layer.msg('保存成功');
                            /*重载表格*/
                            parent.layui.table.reload('LAY-fabricca-list');
                            /*再执行关闭*/
                            parent.layer.close(index);
                        }

                    });


                });


                var formid = adminutil.getUrlParam("id");
                var testname = adminutil.getUrlParam("name");

                var formrenderurl = '';

                if (formid == null || formid == '') {  /*添加新记录时候执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/fabricca_add.json';


                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            form.val('LAY-fabricca-form', data.data);
                            /*这个好像也是一种写法*/

                            /*form.val('LAY-fabricca-form', {
                            "title": data.data.title
                            , "author": "robertfeng"
                            });*/


                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                            });


                            /*初始表单，两种模式客户端模版合成，服务器端模版合成代码*/
                            /* var getTpl = $('#select1Tpl').html();
                            laytpl(getTpl).render(data.select1, function (html) {
                            $('#LAY-SELECT-LEVEL1').html(html);
                            });*/

                            /*下拉列表的服务器端合成HTML代码*/
                            /* $('#LAY-SELECT-LEVEL2').html(data.select2);*/


                            /*日期时间选择器*/
                            /* laydate.render({
                            elem: '#onlinedatetime'
                            , type: 'datetime'
                            ,value : data.data.deploydata
                            });*/

                            /*日期选择器*/
                            /*  laydate.render({
                            elem: '#deploydata'
                            ,type: 'date'
                            ,value : data.data.onlinedatetime
                            });


                            form.render('select');*/


                        }

                    });


                    /*日期时间选择器
                    laydate.render({
                    elem: '#onlinedatetime'
                    , type: 'datetime'
                    });
                    */
                    /*日期选择器
                    laydate.render({
                    elem: '#deploydata'
                    ,type: 'date'
                    });
                    */


                } else {  /*修改已有记录时执行*/


                    formrenderurl = layui.setter.base + '../json/fabricnode/fabricca_edit.json?id=' + formid + '&s=4';

                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    adminutil.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',


                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            /*绑定表单数据的一种写法*/
                            form.val('LAY-fabricca-form', data.data);

                            /* form.val('LAY-fabricca-form', {
                             "title": data.data.title
                            ,"author": "robertfeng"
                            });*/


                            laydate.render({
                                elem: '#createdt'
                                , type: 'datetime'
                                , value: data.data.createdt
                            });


                            /*初始表单，两种模式客户端模版合成，服务器端模版合成代码*/
                            /* var getTpl = $('#select1Tpl').html();
                            laytpl(getTpl).render(data.select1, function (html) {
                            $('#LAY-SELECT-LEVEL1').html(html);
                            });*/

                            /*服务器端合成HTML代码*/
                            /*$('#LAY-SELECT-LEVEL2').html(data.select2);*/


                            /*日期时间选择器*/
                            /* laydate.render({
                            elem: '#onlinedatetime'
                            , type: 'datetime'
                            ,value : data.data.deploydata
                            });*/

                            /*日期选择器*/
                            /*laydate.render({
                            elem: '#deploydata'
                            ,type: 'date'
                            ,value : data.data.onlinedatetime
                            });
                            */

                            /*
                            window.editor.html('dddd地方的辅导费发地方地方');
                            $('#content_msg').val( 'dddd地方的辅导费发地方地方');
                            form.render('select');
                            */
                        }

                    });

                }

                /*绑定事件，通常用于select联级等操作。*/

                form.on('select(LAY-APP-LISTFORM-SELECT1)', function (data) {

                    layer.msg('这是事件1');

                });

            }


            /**
             *  ====================组织中的CA服务器表单相关方法(/views/fabricnode/fabricca_detail.html)=====================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            , fabricca_detail: () => {


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
    !function () {
    }


    exports('fabricnode', fabricnode);


});