/**

 @Name：前端就开发框架控制器代码模版
 @desc: 原则上面一个模块一个控制器，一个控制器对应json文件夹下面一个静态示例文件
 @Author：robertfeng

 */


layui.define(['table', 'form', 'laytpl', 'adminutil', 'laydate'], function (exports) {


    let $ = layui.$
        , table = layui.table
        , form = layui.form
        , element = layui.element

        , fabricstudiotpl =
        {

            name: 'name'

            /**
             *  ==================================一个页面对应的方法( 此处填写调用当前方法的html页面的路径 )==============================
             *
             *  这是典型的一个数据库表能对应列表和表单页
             *
             */

            , tpl: function () {



                //绑定表格
                fabricstudiotpl.table_list();


                //系统统计图
                fabricstudiotpl.struct_pic();


                //区块时间线统计图
                fabricstudiotpl.teimeline_pic();


                //区块分组时间图
                fabricstudiotpl.gropup_teimeline_pic();


                //通过模板合成表格


                /*admin.ajaxreq({

                    url: layui.setter.base + '../json/template/tpl.json',
                    type: 'GET',
                    dataType: 'json',
                    //data:JSON.stringify(data.field),
                    //data:data.field,

                    error: function (e) {
                        alert('error');
                    },

                    success: function (data) {

                        //初始表单，两种模式客户端模版合成，服务器端模版合成代码
                        let getTpl = $('#tabletplid').html();
                        laytpl(getTpl).render(data.data, function (html) {
                            $('#tablediv').html(html);
                        });



                    }

                });


                //绑定模板合成表格的事件

                */


                // 绑定tab事件
                element.render();

                element.on('tab(component-tabs-brief)', function (obj) {
                    //layer.msg(obj.index + '：' + this.innerHTML+': ');

                    if (obj.index == 0) {

                        fabricstudiotpl.indexTab0(obj, this);

                    } else if (obj.index == 1) {


                        fabricstudiotpl.indexTab1(obj, this);


                    }

                });


            }




            /** 第一个tab的响应事件 */
            , indexTab0: function (obj, element) {

                layer.msg(obj.index + '：' + element.innerHTML + ': ');
            }



            /**
             * 第二个table
             * @param obj
             * @param element
             */
            , indexTab1: function (obj, element) {

                layer.msg(obj.index + '：' + element.innerHTML + ': ');

                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-servers-list1'
                    , url: layui.setter.base + '../json/manager/tpl.json' /*模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'ipaddress', title: 'IP地址'}
                        , {field: 'docker_service_port', title: 'docker服务端口'}
                        , {field: 'name', title: '服务器名称'}
                        , {title: '操作', minWidth: 150, align: 'center', fixed: 'right', toolbar: '#table-content-list1'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "网络中的服务器表"
                    , text: {none: '暂无相关数据'}
                });


                /*监听网络中的服务器类表查询条件表单*/
                form.on('submit(LAY-servers-search1)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-servers-list1', {
                        where: field
                    });
                });

            }


            /** 绑定表格 */
            , table_list: function () {

                /*绑定列表的数据显示格式*/
                table.render({
                    elem: '#LAY-servers-list'
                    , url: layui.setter.base + '../json/manager/tpl.json' /*模拟接口*/
                    , cols: [[
                        {type: 'checkbox', fixed: 'left'}
                        , {field: 'pkid', title: 'PKID', hide: true}
                        , {field: 'ipaddress', title: 'IP地址'}
                        , {field: 'docker_service_port', title: 'docker服务端口'}
                        , {field: 'name', title: '服务器名称'}
                        , {title: '操作', minWidth: 150, align: 'center', fixed: 'right', toolbar: '#table-content-list'}
                    ]]
                    , page: true
                    , limit: 10
                    , limits: [10, 15, 20, 25, 30]
                    , title: "网络中的服务器表"
                    , text: {none: '暂无相关数据'}
                });


                //绑定表格中的按钮事件
                table.on('tool(LAY-servers-list)', function (obj) {


                    let data = obj.data;

                    if (obj.event === 'view') {


                        layer.open({
                            type: 2
                            , title: 'peer[ peer0 ]详细信息'
                            , content: 'tpl.html?name=testname&id=' + data.id
                            , maxmin: true
                            , area: ['650px', '650px']
                            , btn: ['取消']
                            , success: function (layero, index) {
                                //在回调方法中的第2个参数“index”表示的是当前弹窗的索引。
                                //通过layer.full方法将窗口放大。
                                layer.full(index);
                            }
                        });


                    }

                });


                /*监听网络中的服务器类表查询条件表单*/
                form.on('submit(LAY-servers-search)', function (data) {
                    let field = data.field;
                    /*执行重载*/
                    table.reload('LAY-servers-list', {
                        where: field
                    });
                });


            }



            //统计图
            , teimeline_pic: () => {


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
                    {id: '534##channel_iding', content: '534 (TX:12)', start: '2019-05-13 13:34:59'}
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




                /*timeline.on('timechange', function (event) {

                    document.getElementById("customTime").innerHTML = "Custom Time: " + event.time;

                    let item = blocks.get(534);

                    if (event.time > item.start) {
                        item.end = new Date(event.time);
                        let now = new Date();
                        if (event.time < now) {
                            item.content = "Dynamic event (past)";
                            item.className = 'past';
                        }
                        else if (event.time > now) {
                            item.content = "Dynamic event (future)";
                            item.className = 'future';
                        }
                        else  {
                            item.content = "Dynamic event (now)";
                            item.className = 'now';
                        }

                        blocks.update(item);
                    }


                    let end_time = timeline.getWindow().end.valueOf();

                    if( event.time>end_time ){
                        let percentage = -0.2;
                        let range = timeline.getWindow();
                        let interval = range.end - range.start;

                        timeline.setWindow({
                            start: range.start.valueOf() - interval * percentage,
                            end:   range.end.valueOf()   - interval * percentage
                        });
                    }


                });

                // set a custom range from -2 minute to +3 minutes current time
                let start = new Date((new Date()).getTime() - 2 * 60 * 1000);
                let end   = new Date((new Date()).getTime() + 3 * 60 * 1000);
                timeline.setWindow(start, end, {animation: true});*/


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


            , stringifyObject: (object) => {
                if (!object) return;
                let replacer = function (key, value) {
                    if (value && value.tagName) {
                        return "DOM Element";
                    } else {
                        return value;
                    }
                }
                return JSON.stringify(object, replacer)
            }



            /**
             * 分组区块时间线图
             */
            , gropup_teimeline_pic: () => {


                let vis = window.visobj;

                let groupCount = 2;


                // create a data set with groups
                let names = ['fabrictestchannel', 'mytestchannel'];
                let groups = new vis.DataSet();
                for (let g = 0; g < groupCount; g++) {
                    groups.add({id: g, content: names[g]});
                }

                // create a dataset with items
                let blocks = new vis.DataSet([
                    {id: 426, group: 0, content: 'item 426', start: '2019-02-01 12:09:13'},
                    {id: 427, group: 0, content: 'item 427', start: '2019-02-01 12:11:56'},
                    {id: 428, group: 0, content: 'item 428', start: '2019-02-01 13:11:41'},
                    {id: 429, group: 0, content: 'item 429', start: '2019-02-01 13:40:15'},
                    {id: 430, group: 0, content: 'item 430', start: '2019-02-13 00:33:46'},
                    {id: 431, group: 0, content: 'item 431', start: '2019-02-13 00:35:27'},
                    {id: 432, group: 0, content: 'item 432', start: '2019-02-13 00:35:49'},
                    {id: 433, group: 0, content: 'item 433', start: '2019-02-13 00:36:52'},
                    {id: 434, group: 0, content: 'item 434', start: '2019-02-13 00:36:55'},
                    {id: 435, group: 0, content: 'item 435', start: '2019-02-13 00:36:57'},
                    {id: 436, group: 0, content: 'item 436', start: '2019-02-13 00:49:37'},
                    {id: 437, group: 0, content: 'item 437', start: '2019-02-13 00:49:39'},
                    {id: 438, group: 0, content: 'item 438', start: '2019-02-13 00:49:42'},
                    {id: 439, group: 0, content: 'item 439', start: '2019-04-13 15:01:57'},
                    {id: 440, group: 0, content: 'item 440', start: '2019-04-13 15:02:00'},
                    {id: 441, group: 0, content: 'item 441', start: '2019-04-13 15:02:04'},
                    {id: 442, group: 0, content: 'item 442', start: '2019-04-13 15:12:01'},
                    {id: 443, group: 0, content: 'item 443', start: '2019-04-13 15:12:06'},
                    {id: 444, group: 0, content: 'item 444', start: '2019-04-13 15:13:33'},
                    {id: 445, group: 0, content: 'item 445', start: '2019-04-13 15:13:47'},
                    {id: 446, group: 0, content: 'item 446', start: '2019-04-13 15:13:52'},
                    {id: 447, group: 0, content: 'item 447', start: '2019-04-13 15:15:01'},
                    {id: 448, group: 0, content: 'item 448', start: '2019-04-13 15:15:04'},
                    {id: 449, group: 0, content: 'item 449', start: '2019-04-13 15:19:47'},
                    {id: 450, group: 0, content: 'item 450', start: '2019-04-13 15:19:51'},
                    {id: 451, group: 0, content: 'item 451', start: '2019-04-13 15:19:54'},
                    {id: 452, group: 0, content: 'item 452', start: '2019-04-13 15:20:22'},
                    {id: 453, group: 0, content: 'item 453', start: '2019-04-13 15:24:13'},
                    {id: 454, group: 0, content: 'item 454', start: '2019-04-13 15:26:56'},
                    {id: 455, group: 0, content: 'item 455', start: '2019-04-13 15:27:00'},
                    {id: 456, group: 0, content: 'item 456', start: '2019-04-13 15:27:05'},
                    {id: 457, group: 0, content: 'item 457', start: '2019-04-13 15:28:20'},
                    {id: 458, group: 0, content: 'item 458', start: '2019-04-13 15:28:26'},
                    {id: 459, group: 0, content: 'item 459', start: '2019-04-13 15:29:07'},
                    {id: 460, group: 0, content: 'item 460', start: '2019-04-13 15:31:17'},
                    {id: 461, group: 0, content: 'item 461', start: '2019-04-13 15:31:20'},
                    {id: 462, group: 0, content: 'item 462', start: '2019-04-13 15:33:52'},
                    {id: 463, group: 0, content: 'item 463', start: '2019-04-13 15:33:54'},
                    {id: 464, group: 0, content: 'item 464', start: '2019-04-13 15:57:46'},
                    {id: 465, group: 0, content: 'item 465', start: '2019-04-13 15:57:48'},
                    {id: 466, group: 0, content: 'item 466', start: '2019-04-13 15:57:51'},
                    {id: 467, group: 0, content: 'item 467', start: '2019-04-13 16:03:09'},
                    {id: 468, group: 0, content: 'item 468', start: '2019-04-13 16:03:12'},
                    {id: 469, group: 0, content: 'item 469', start: '2019-04-13 16:03:14'},
                    {id: 470, group: 0, content: 'item 470', start: '2019-04-13 16:03:43'},
                    {id: 471, group: 0, content: 'item 471', start: '2019-04-13 16:09:09'},
                    {id: 472, group: 0, content: 'item 472', start: '2019-04-13 16:09:12'},
                    {id: 473, group: 0, content: 'item 473', start: '2019-04-13 16:13:02'},
                    {id: 474, group: 0, content: 'item 474', start: '2019-04-13 16:13:07'},
                    {id: 475, group: 0, content: 'item 475', start: '2019-04-13 16:13:29'},
                    {id: 476, group: 0, content: 'item 476', start: '2019-04-13 16:14:53'},
                    {id: 477, group: 0, content: 'item 477', start: '2019-04-13 17:40:36'},
                    {id: 478, group: 0, content: 'item 478', start: '2019-04-13 17:55:23'},
                    {id: 479, group: 0, content: 'item 479', start: '2019-04-13 17:57:23'},
                    {id: 480, group: 0, content: 'item 480', start: '2019-04-13 17:58:30'},
                    {id: 481, group: 0, content: 'item 481', start: '2019-04-13 18:00:03'},
                    {id: 482, group: 0, content: 'item 482', start: '2019-04-13 18:03:32'},
                    {id: 483, group: 0, content: 'item 483', start: '2019-04-13 18:03:55'},
                    {id: 484, group: 0, content: 'item 484', start: '2019-04-13 18:18:57'},
                    {id: 485, group: 0, content: 'item 485', start: '2019-04-13 18:19:07'},
                    {id: 486, group: 0, content: 'item 486', start: '2019-04-13 18:33:48'},
                    {id: 487, group: 0, content: 'item 487', start: '2019-04-14 14:12:18'},
                    {id: 488, group: 0, content: 'item 488', start: '2019-04-14 14:14:05'},
                    {id: 489, group: 0, content: 'item 489', start: '2019-04-14 14:15:13'},
                    {id: 490, group: 0, content: 'item 490', start: '2019-04-14 14:35:48'},
                    {id: 491, group: 0, content: 'item 491', start: '2019-04-14 14:59:31'},
                    {id: 492, group: 0, content: 'item 492', start: '2019-04-15 19:08:47'},
                    {id: 493, group: 0, content: 'item 493', start: '2019-04-15 19:09:24'},
                    {id: 494, group: 0, content: 'item 494', start: '2019-04-16 13:33:01'},
                    {id: 495, group: 0, content: 'item 495', start: '2019-04-16 13:59:28'},
                    {id: 496, group: 0, content: 'item 496', start: '2019-04-16 14:00:48'},
                    {id: 497, group: 0, content: 'item 497', start: '2019-04-16 14:01:45'},
                    {id: 498, group: 0, content: 'item 498', start: '2019-04-16 14:02:09'},
                    {id: 499, group: 0, content: 'item 499', start: '2019-04-16 14:12:18'},
                    {id: 500, group: 0, content: 'item 500', start: '2019-04-16 14:16:45'},
                    {id: 501, group: 0, content: 'item 501', start: '2019-04-16 15:39:05'},
                    {id: 502, group: 0, content: 'item 502', start: '2019-04-17 10:20:38'},
                    {id: 503, group: 0, content: 'item 503', start: '2019-04-17 10:32:42'},
                    {id: 504, group: 0, content: 'item 504', start: '2019-04-17 10:33:26'},
                    {id: 505, group: 0, content: 'item 505', start: '2019-04-17 10:34:48'},
                    {id: 506, group: 0, content: 'item 506', start: '2019-04-17 10:36:29'},
                    {id: 507, group: 0, content: 'item 507', start: '2019-04-17 10:36:41'},
                    {id: 508, group: 0, content: 'item 508', start: '2019-04-17 10:40:01'},
                    {id: 509, group: 0, content: 'item 509', start: '2019-04-17 17:22:14'},
                    {id: 510, group: 0, content: 'item 510', start: '2019-04-17 17:24:12'},
                    {id: 511, group: 0, content: 'item 511', start: '2019-04-17 17:26:34'},
                    {id: 512, group: 0, content: 'item 512', start: '2019-04-17 17:26:49'},
                    {id: 513, group: 0, content: 'item 513', start: '2019-04-17 17:27:27'},
                    {id: 514, group: 0, content: 'item 514', start: '2019-04-17 17:27:55'},
                    {id: 515, group: 0, content: 'item 515', start: '2019-04-19 11:10:50'},
                    {id: 516, group: 0, content: 'item 516', start: '2019-04-19 11:12:13'},
                    {id: 517, group: 0, content: 'item 517', start: '2019-04-19 11:18:51'},
                    {id: 518, group: 0, content: 'item 518', start: '2019-04-19 12:18:53'},
                    {id: 519, group: 0, content: 'item 519', start: '2019-04-19 12:37:41'},
                    {id: 520, group: 0, content: 'item 520', start: '2019-04-19 15:32:43'},
                    {id: 521, group: 0, content: 'item 521', start: '2019-04-19 18:44:50'},
                    {id: 522, group: 0, content: 'item 522', start: '2019-04-19 18:47:48'},
                    {id: 523, group: 0, content: 'item 523', start: '2019-04-19 18:48:08'},
                    {id: 524, group: 0, content: 'item 524', start: '2019-04-20 10:01:35'},
                    {id: 525, group: 0, content: 'item 525', start: '2019-04-20 10:03:17'},
                    {id: 526, group: 0, content: 'item 526', start: '2019-04-21 10:14:20'},
                    {id: 527, group: 0, content: 'item 527', start: '2019-04-21 10:16:56'},
                    {id: 528, group: 0, content: 'item 528', start: '2019-04-21 10:22:01'},
                    {id: 529, group: 0, content: 'item 529', start: '2019-04-30 23:33:43'},
                    {id: 530, group: 0, content: 'item 530', start: '2019-05-06 21:09:57'},
                    {id: 531, group: 0, content: 'item 531', start: '2019-05-06 21:21:58'},
                    {id: 532, group: 0, content: 'item 532', start: '2019-05-06 21:22:08'},
                    {id: 533, group: 0, content: 'item 533', start: '2019-05-06 21:34:33'},
                    {id: 534, group: 0, content: 'item 534', start: '2019-05-06 21:57:37'},
                    {id: 535, group: 1, content: 'item 535', start: '2019-01-23 17:26:21'},
                    {id: 536, group: 1, content: 'item 536', start: '2019-01-23 17:30:26'},
                    {id: 537, group: 1, content: 'item 537', start: '2019-01-23 17:34:46'},
                    {id: 538, group: 1, content: 'item 538', start: '2019-01-23 17:35:18'},
                    {id: 539, group: 1, content: 'item 539', start: '2019-01-23 17:35:44'},
                    {id: 540, group: 1, content: 'item 540', start: '2019-01-28 20:32:54'},
                    {id: 541, group: 1, content: 'item 541', start: '2019-01-28 20:33:21'},
                    {id: 542, group: 1, content: 'item 542', start: '2019-01-31 17:13:32'},
                    {id: 543, group: 1, content: 'item 543', start: '2019-01-31 17:17:08'},
                    {id: 544, group: 1, content: 'item 544', start: '2019-01-31 17:17:27'},
                    {id: 545, group: 1, content: 'item 545', start: '2019-01-31 17:18:03'},
                    {id: 546, group: 1, content: 'item 546', start: '2019-01-31 17:24:16'},
                    {id: 547, group: 1, content: 'item 547', start: '2019-01-31 17:24:56'},
                    {id: 548, group: 1, content: 'item 548', start: '2019-01-31 17:31:32'},
                    {id: 549, group: 1, content: 'item 549', start: '2019-01-31 17:32:29'},
                    {id: 550, group: 1, content: 'item 550', start: '2019-01-31 17:34:10'},
                    {id: 551, group: 1, content: 'item 551', start: '2019-01-31 17:41:20'},
                    {id: 552, group: 1, content: 'item 552', start: '2019-01-31 17:43:07'},
                    {id: 553, group: 1, content: 'item 553', start: '2019-01-31 17:45:23'},
                    {id: 554, group: 1, content: 'item 554', start: '2019-01-31 17:45:55'},
                    {id: 555, group: 1, content: 'item 555', start: '2019-01-31 18:25:50'},
                    {id: 556, group: 1, content: 'item 556', start: '2019-01-31 18:27:24'},
                    {id: 557, group: 1, content: 'item 557', start: '2019-02-01 00:30:02'},
                    {id: 558, group: 1, content: 'item 558', start: '2019-02-01 00:30:47'},
                    {id: 559, group: 1, content: 'item 559', start: '2019-02-01 00:31:43'},
                    {id: 560, group: 1, content: 'item 560', start: '2019-02-01 00:35:38'},
                    {id: 561, group: 1, content: 'item 561', start: '2019-02-01 00:41:16'},
                    {id: 562, group: 1, content: 'item 562', start: '2019-02-01 01:09:19'},
                    {id: 563, group: 1, content: 'item 563', start: '2019-02-01 01:12:05'},
                    {id: 564, group: 1, content: 'item 564', start: '2019-02-01 13:20:38'},
                    {id: 565, group: 1, content: 'item 565', start: '2019-02-01 13:21:01'},
                    {id: 566, group: 1, content: 'item 566', start: '2019-02-01 15:55:39'},
                    {id: 567, group: 1, content: 'item 567', start: '2019-02-12 23:41:07'},
                    {id: 568, group: 1, content: 'item 568', start: '2019-02-12 23:41:12'},
                    {id: 569, group: 1, content: 'item 569', start: '2019-02-13 00:23:19'},
                    {id: 570, group: 1, content: 'item 570', start: '2019-02-13 00:24:32'},
                    {id: 571, group: 1, content: 'item 571', start: '2019-02-13 00:26:23'},
                    {id: 572, group: 1, content: 'item 572', start: '2019-02-13 00:26:31'},
                    {id: 573, group: 1, content: 'item 573', start: '2019-02-13 00:26:48'},
                    {id: 574, group: 1, content: 'item 574', start: '2019-04-01 02:18:20'},
                    {id: 575, group: 1, content: 'item 575', start: '2019-04-01 02:19:33'},
                    {id: 576, group: 1, content: 'item 576', start: '2019-04-01 02:19:40'},
                    {id: 577, group: 1, content: 'item 577', start: '2019-04-01 02:21:04'},
                    {id: 578, group: 1, content: 'item 578', start: '2019-04-01 02:21:11'},
                    {id: 579, group: 1, content: 'item 579', start: '2019-04-14 13:44:02'},
                    {id: 580, group: 1, content: 'item 580', start: '2019-04-14 13:46:21'},
                    {id: 581, group: 1, content: 'item 581', start: '2019-04-14 13:48:13'},
                    {id: 582, group: 1, content: 'item 582', start: '2019-04-14 15:08:46'},
                    {id: 583, group: 1, content: 'item 583', start: '2019-04-20 10:34:15'},
                    {id: 584, group: 1, content: 'item 584', start: '2019-04-20 10:42:15'},
                    {id: 585, group: 1, content: 'item 585', start: '2019-04-20 10:44:02'},
                    {id: 586, group: 1, content: 'item 586', start: '2019-04-20 10:45:44'},
                    {id: 587, group: 1, content: 'item 587', start: '2019-04-20 10:45:46'},
                    {id: 588, group: 1, content: 'item 588', start: '2019-04-20 10:45:50'},
                    {id: 589, group: 1, content: 'item 589', start: '2019-04-20 10:46:56'},
                    {id: 590, group: 1, content: 'item 590', start: '2019-04-20 11:03:54'},
                    {id: 591, group: 1, content: 'item 591', start: '2019-04-20 11:04:02'},
                    {id: 592, group: 1, content: 'item 592', start: '2019-04-20 11:14:41'},
                    {id: 593, group: 1, content: 'item 593', start: '2019-04-20 11:15:02'},
                    {id: 594, group: 1, content: 'item 594', start: '2019-04-20 11:16:52'},
                    {id: 595, group: 1, content: 'item 595', start: '2019-04-20 11:17:29'},
                    {id: 596, group: 1, content: 'item 596', start: '2019-04-20 11:19:51'},
                    {id: 597, group: 1, content: 'item 597', start: '2019-04-20 11:20:56'},
                    {id: 598, group: 1, content: 'item 598', start: '2019-04-20 11:28:34'},
                    {id: 599, group: 1, content: 'item 599', start: '2019-04-20 11:42:10'},
                    {id: 600, group: 1, content: 'item 600', start: '2019-04-20 12:58:17'},
                    {id: 601, group: 1, content: 'item 601', start: '2019-04-20 13:00:55'},
                    {id: 602, group: 1, content: 'item 602', start: '2019-04-20 13:04:32'},
                    {id: 603, group: 1, content: 'item 603', start: '2019-04-20 13:05:52'},
                    {id: 604, group: 1, content: 'item 604', start: '2019-04-20 15:21:26'},
                    {id: 605, group: 1, content: 'item 605', start: '2019-04-20 15:24:50'},
                    {id: 606, group: 1, content: 'item 606', start: '2019-04-20 15:25:57'},
                    {id: 607, group: 1, content: 'item 607', start: '2019-04-20 15:30:25'},
                    {id: 608, group: 1, content: 'item 608', start: '2019-04-20 15:34:04'},
                    {id: 609, group: 1, content: 'item 609', start: '2019-04-20 15:35:23'},
                    {id: 610, group: 1, content: 'item 610', start: '2019-04-20 15:42:29'},
                    {id: 611, group: 1, content: 'item 611', start: '2019-04-20 15:43:09'},
                    {id: 612, group: 1, content: 'item 612', start: '2019-04-20 15:44:00'},
                    {id: 613, group: 1, content: 'item 613', start: '2019-04-20 15:46:57'},
                    {id: 614, group: 1, content: 'item 614', start: '2019-04-20 15:48:44'},
                    {id: 615, group: 1, content: 'item 615', start: '2019-04-20 15:50:45'},
                    {id: 616, group: 1, content: 'item 616', start: '2019-04-20 15:51:10'},
                    {id: 617, group: 1, content: 'item 617', start: '2019-04-20 16:10:52'},
                    {id: 618, group: 1, content: 'item 618', start: '2019-04-20 16:11:53'},
                    {id: 619, group: 1, content: 'item 619', start: '2019-04-20 18:29:46'},
                    {id: 620, group: 1, content: 'item 620', start: '2019-04-20 18:29:57'},
                    {id: 621, group: 1, content: 'item 621', start: '2019-04-20 18:30:00'},
                    {id: 622, group: 1, content: 'item 622', start: '2019-04-20 18:34:25'},
                    {id: 623, group: 1, content: 'item 623', start: '2019-04-20 18:34:47'},
                    {id: 624, group: 1, content: 'item 624', start: '2019-04-20 18:39:11'},
                    {id: 625, group: 1, content: 'item 625', start: '2019-05-06 22:08:12'},
                    {id: 626, group: 1, content: 'item 626', start: '2019-05-06 22:08:17'},
                    {id: 627, group: 1, content: 'item 627', start: '2019-05-06 22:08:19'},
                    {id: 628, group: 1, content: 'item 628', start: '2019-05-06 22:11:32'},
                    {id: 629, group: 1, content: 'item 629', start: '2019-05-06 22:13:05'},
                    {id: 630, group: 1, content: 'item 630', start: '2019-05-06 22:13:12'},
                    {id: 631, group: 1, content: 'item 631', start: '2019-05-06 22:13:19'},
                    {id: 632, group: 1, content: 'item 632', start: '2019-05-07 15:47:34'},
                    {id: 633, group: 1, content: 'item 633', start: '2019-05-07 15:47:37'},
                    {id: 634, group: 1, content: 'item 634', start: '2019-05-07 15:47:39'}
                ]);

                // create visualization
                let container = document.getElementById('groupblockteimeline');
                let options1 = {
                    groupOrder: 'content'  // groupOrder can be a property name or a sorting function
                };

                let options = {


                    groupOrder: 'content',// groupOrder can be a property name or a sorting function
                    start: '2019-05-06 21:32:33',
                    end: '2019-05-06 21:59:37',

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

                let timeline = new vis.Timeline(container);
                timeline.setOptions(options);
                timeline.setGroups(groups);
                timeline.setItems(blocks);


                timeline.on('doubleClick', function (properties) {
                    alert('selected items: ' + properties.item);
                });


                $('#groupzoomIn').on('click', function () {

                    timeline.zoomIn(0.2);

                });


                $('#gruopzoomOut').on('click', function () {

                    timeline.zoomOut(0.2);

                });


                $('#groupmoveLeft').on('click', function () {

                    let percentage = 0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#groupmoveRight').on('click', function () {

                    let percentage = -0.2;
                    let range = timeline.getWindow();
                    let interval = range.end - range.start;

                    timeline.setWindow({
                        start: range.start.valueOf() - interval * percentage,
                        end: range.end.valueOf() - interval * percentage
                    });

                });


                $('#grouyptoggleRollingMode').on('click', function () {

                    timeline.toggleRollingMode()

                });


            }





            /******************************************************************************************************
             *
             *  统计图
             ******************************
             **/
            //统计图
            , struct_pic: function () {


                let vis = window.visobj;


                let LENGTH_MAIN = 350,
                    LENGTH_SERVER = 150,
                    LENGTH_SUB = 50,
                    WIDTH_SCALE = 2,

                    RED = '#C5000B',

                    //GRAY = '#666666',
                    GRAY = 'gray',


                    /// ================================   图例  ====================================

                    nodes1 = [];

                // legend
                let mynetwork1 = document.getElementById('mynetwork1');
                let x = -mynetwork1.clientWidth + 50;
                let y = -mynetwork1.clientHeight + 50;
                let step = 80;
                nodes1.push({
                    id: 1000,
                    x: x,
                    y: y,
                    label: 'Org1Msp',
                    group: 'org',
                    value: 1,
                    fixed: true,
                    physics: true
                });
                nodes1.push({
                    id: 1001,
                    x: x,
                    y: y + step,
                    label: 'orderer',
                    group: 'orderer',
                    value: 1,
                    fixed: true,
                    physics: false
                });
                nodes1.push({
                    id: 1002,
                    x: x,
                    y: y + 2 * step,
                    label: 'peer',
                    group: 'peer',
                    value: 1,
                    fixed: true,
                    physics: false
                });
                nodes1.push({
                    id: 1003,
                    x: x,
                    y: y + 3 * step,
                    label: 'fabric-ca',
                    group: 'fabric_ca',
                    value: 1,
                    fixed: true,
                    physics: false
                });
                nodes1.push({
                    id: 1004,
                    x: x,
                    y: y + 4 * step,
                    label: 'channel',
                    group: 'channel',
                    value: 1,
                    fixed: true,
                    physics: false
                });
                nodes1.push({
                    id: 1005,
                    x: x,
                    y: y + 5 * step,
                    label: 'chaincode',
                    group: 'chaincode',
                    value: 1,
                    fixed: true,
                    physics: false
                });
                nodes1.push({
                    id: 1006,
                    x: x,
                    y: y + 6 * step,
                    label: 'account',
                    group: 'account',
                    value: 1,
                    fixed: true,
                    physics: false
                });


                let container1 = document.getElementById('mynetwork1');
                let data1 = {
                    nodes: nodes1
                };
                let options1 = {
                    autoResize: true,
                    interaction: {

                        zoomView: false,  //控制是否被移动
                        dragNodes: false,
                        dragView: false
                    },
                    nodes: {
                        scaling: {
                            min: 16,
                            max: 32
                        }
                    },


                    groups: {
                        org: {
                            shape: 'ellipse',
                            color: '#FF9900' // orange
                        },
                        orderer: {
                            shape: 'circle',
                            color: "#2B7CE9" // blue
                        },
                        peer: {
                            shape: 'square',
                            color: "#5A1E5C" // purple
                        },
                        fabric_ca: {
                            shape: 'diamond',
                            color: "#C5000B" // red
                        },
                        channel: {
                            shape: 'box',
                            color: "#109618" // green
                        }
                        ,
                        chaincode: {
                            shape: 'triangle',
                            color: "#725334" // green
                        }
                        ,
                        account: {
                            shape: 'star',
                            color: "#00314f" // green
                        }
                    }
                };
                network1 = new vis.Network(container1, data1, options1);


                //// ==========    流程图  ===============


                // create a network


                // Create a data table with nodes.
                nodes = [];

                // Create a data table with links.
                edges = [];

                nodes.push({id: 1, label: '192.168.0.1', group: 'switch', value: 10});
                nodes.push({id: 2, label: '192.168.0.2', group: 'switch', value: 8});
                nodes.push({id: 3, label: '192.168.0.3', group: 'switch', value: 6});
                edges.push({from: 1, to: 2, length: LENGTH_MAIN, width: WIDTH_SCALE * 6, label: '0.71 mbps'});
                edges.push({from: 1, to: 3, length: LENGTH_MAIN, width: WIDTH_SCALE * 4, label: '0.55 mbps'});

                // group around 2
                for (let i = 100; i <= 104; i++) {
                    let value = 1;
                    let width = WIDTH_SCALE * 2;
                    let color = GRAY;
                    let label = null;

                    if (i === 103) {
                        value = 5;
                        width = 3;
                    }
                    if (i === 102) {
                        color = RED;
                        label = 'error';
                    }

                    nodes.push({id: i, label: '192.168.0.' + i, group: 'desktop', value: value});
                    edges.push({
                        from: 2,
                        to: i,
                        length: LENGTH_SUB,
                        color: color,
                        fontColor: color,
                        width: width,
                        label: label
                    });
                }
                nodes.push({id: 201, label: '192.168.0.201', group: 'desktop', value: 1});
                edges.push({from: 2, to: 201, length: LENGTH_SUB, color: GRAY, width: WIDTH_SCALE});

                // group around 3
                nodes.push({id: 202, label: '192.168.0.202', group: 'desktop', value: 4});
                edges.push({from: 3, to: 202, length: LENGTH_SUB, color: GRAY, width: WIDTH_SCALE * 2});
                for (let i = 230; i <= 231; i++) {
                    nodes.push({id: i, label: '192.168.0.' + i, group: 'mobile', value: 2});
                    edges.push({from: 3, to: i, length: LENGTH_SUB, color: GRAY, fontColor: GRAY, width: WIDTH_SCALE});
                }

                // group around 1
                nodes.push({id: 10, label: '192.168.0.10', group: 'server', value: 10});
                edges.push({
                    from: 1,
                    to: 10,
                    length: LENGTH_SERVER,
                    color: GRAY,
                    width: WIDTH_SCALE * 6,
                    label: '0.92 mbps'
                });
                nodes.push({id: 11, label: '192.168.0.11', group: 'server', value: 7});
                edges.push({
                    from: 1,
                    to: 11,
                    length: LENGTH_SERVER,
                    color: GRAY,
                    width: WIDTH_SCALE * 3,
                    label: '0.68 mbps'
                });
                nodes.push({id: 12, label: '192.168.0.12', group: 'server', value: 3});
                edges.push({
                    from: 1,
                    to: 12,
                    length: LENGTH_SERVER,
                    color: GRAY,
                    width: WIDTH_SCALE,
                    label: '0.3 mbps'
                });

                nodes.push({id: 204, label: 'Internet', group: 'internet', value: 10});
                edges.push({from: 1, to: 204, length: 200, width: WIDTH_SCALE * 3, label: '0.63 mbps'});


                let container = document.getElementById('mynetwork');
                let data = {
                    nodes: nodes,
                    edges: edges
                };
                let options = {
                    nodes: {
                        scaling: {
                            min: 24,
                            max: 40
                        }
                    },
                    edges: {
                        color: GRAY,
                        smooth: false
                    },
                    interaction: {

                        zoomView: false,  //控制是否被移动
                    },
                    physics: {
                        barnesHut: {gravitationalConstant: -30000},
                        stabilization: {iterations: 2500}
                    },
                    groups: {
                        switch: {
                            shape: 'triangle',
                            color: '#FF9900' // orange
                        },
                        desktop: {
                            shape: 'dot',
                            color: "#2B7CE9" // blue
                        },
                        mobile: {
                            shape: 'dot',
                            color: "#5A1E5C" // purple
                        },
                        server: {
                            shape: 'square',
                            color: "#C5000B" // red
                        },
                        internet: {
                            shape: 'square',
                            color: "#109618" // green
                        }
                    }
                };
                network = new vis.Network(container, data, options);


            }



            /**
             *  ==============一个页面对应的方法( 此处填写调用当前方法的html页面的路径 )=========================
             *
             *
             *
             */
            , edit: function () {

            }



            /**
             *  ==================================下面是同模块中其他的子模块的基本代码建议保留注释=========================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  ====================================================================================================================
             *  =====================================================================================================================
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


    exports('fabricstudiotpl', fabricstudiotpl);


});