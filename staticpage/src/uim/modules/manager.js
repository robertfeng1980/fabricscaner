/**

 @Name：前端就开发框架控制器代码模版
 @desc: 原则上面一个模块一个控制器，一个控制器对应json文件夹下面一个静态示例文件
 @Author：robertfeng

 */


layui.define(['table', 'form', 'laytpl', 'adminutil','laydate'], function (exports) {


    var $ = layui.$
        , table = layui.table
        , form = layui.form
        , admin = layui.admin
        , adminutil = layui.adminutil
        , laydate = layui.laydate

        , manager =
        {

            name:'name'

            /**
             *  ==================================网络中的服务器列表所需要的代码把看，(views/manager/servers_list.html)==============================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  ========================================================================================================================================================================================================
             *  =========================================================================================================================================================================================================
             */

            ,servers_list: function () {

                /***
                 *  =========================================网络中的服务器管理 ==================================================
                 *    , sort: true, hide: true ,toolbar: true  width: 100
                 */

                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-servers-list'
                    , url: layui.setter.base + '../json/manager/servers_list.json' /*模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        ,{field: 'pkid', title: 'PKID',hide: true}
                        ,{field: 'ipaddress', title: 'IP地址'}
                        ,{field: 'docker_service_port', title: 'docker服务端口'}
                        ,{field: 'name', title: '服务器名称'}
                        , {title: '操作', width: 120, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "网络中的服务器表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听工具条事件（绑定表格内针对某一条数据的具体操作，比如：编辑或者改变状态，该事见中会自动传入当前操作的数据，所以和通常所见的通过?id=xxx的方式不一样）*/
                table.on('tool(LAY-servers-list)', function (obj) {

                    var data = obj.data;   /*获取当前操作的数据记录，注意，这里获取的是整个记录的数据*/

                    if (obj.event === 'del') {


                        layer.confirm('确定删除此网络中的服务器？', function (index) {


                            obj.del();

                            /*批量删除已经选中的数据 data:data.field*/
                            admin.ajaxreq({

                                url: layui.setter.base + '../json/manager/servers_del.json?id=' + data.pkid, /*模拟批量删除接口接口,*/
                                type: 'GET',
                                dataType: 'json',
                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-servers-list');
                                    layer.close(index);


                                }

                            });


                            layer.close(index);


                        });


                    } else if (obj.event === 'edit') {

                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/manager/servers_form.html?id=' + data.pkid
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {
                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-servers-form-submit");
                                submit.click();
                            }
                            ,success: function(layero,index){
                                /*在回调方法中的第2个参数“index”表示的是当前弹窗的索引。*/
                                /*通过layer.full方法将窗口放大。*/
                                layer.full(index);
                            }
                        });


                    }  else if (obj.event == 'premodify') {  /*其他表格中单行数据的操作*/


                    }

                });


                /*监听网络中的服务器类表查询条件表单*/
                form.on('submit(LAY-servers-search)', function (data) {
                    var field = data.field;
                    /*执行重载*/
                    table.reload('LAY-servers-list', {
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




                /*绑定批量删除和添加等按钮的操作事件*/

                var active = {

                    batchdel: function () {

                        var checkStatus = table.checkStatus('LAY-servers-list')
                            , checkData = checkStatus.data; /*得到选中的数据*/

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
                            admin.ajaxreq({

                                url: layui.setter.base + '../json/manager/servers_batchdel.json', /*模拟批量删除接口接口,*/
                                type: 'POST',
                                dataType: 'json',
                                data: {batchdelids: optids},
                                /*data:data.field,*/

                                error: function (e) {
                                    alert('error');
                                },

                                success: function (data) {

                                    /*判断操作是否成功 TODO*/
                                    table.reload('LAY-servers-list');
                                    layer.close(index);


                                }

                            });


                        });
                    },


                    add: function () {
                        layer.open({
                            type: 2
                            , title: false
                            , content: '../../views/manager/servers_form.html'
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['保存', '取消']
                            , yes: function (index, layero) {

                                /*点击确认触发 iframe 内容中的按钮提交*/
                                var submit = layero.find('iframe').contents().find("#layuiadmin-servers-form-submit");
                                submit.click();
                            }
                            ,success: function(layero,index){
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
             *  ====================网络中的服务器表单相关方法(/views/manager/servers_form.html)=====================
             *  ===========================================================================================================================================
             *  ===========================================================================================================================================
             *
             */
            ,servers_form: function () {

                /*监听表单的提交*/
                form.on('submit(layuiadmin-servers-form-submit)', function (data) {
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
                    admin.ajaxreq({

                        url: layui.setter.base + '../json/manager/servers_save.json',
                        type: 'POST',
                        dataType: 'json',
                        data: data.field,

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {
                            layer.msg('保存成功');
                            /*重载表格*/
                            parent.layui.table.reload('LAY-servers-list');
                            /*再执行关闭*/
                            parent.layer.close(index);
                        }

                    });



                });


                var formid = adminutil.getUrlParam("id");
                var testname = adminutil.getUrlParam("name");

                var formrenderurl = '';

                if (formid == null || formid == '') {  /*添加新记录时候执行*/


                    formrenderurl = layui.setter.base + '../json/manager/servers_add.json';


                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    admin.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',

                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            form.val('LAY-servers-form', data.data);  /*这个好像也是一种写法*/

                            /*form.val('LAY-servers-form', {
                            "title": data.data.title
                            , "author": "robertfeng"
                            });*/






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


                } else{  /*修改已有记录时执行*/


                    formrenderurl = layui.setter.base + '../json/manager/servers_edit.json?id=' +formid + '&s=4';

                    /*从服务器初始化代码,这里根据具体的需求来判断是否需要向服务器传递参数*/
                    /*
                    data:JSON.stringify(data.field),
                    data:data.field,
                    */
                    admin.ajaxreq({

                        url: formrenderurl,
                        type: 'GET',
                        dataType: 'json',


                        error: function (e) {
                            alert('error');
                        },

                        success: function (data) {

                            /*绑定表单数据的一种写法*/
                            form.val('LAY-servers-form', data.data);

                            /* form.val('LAY-servers-form', {
                             "title": data.data.title
                            ,"author": "robertfeng"
                            });*/



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
             *  ===================================================其他模块的代码=================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *  ================================================================================================================================
             *
             */



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


    exports('manager', manager);


});