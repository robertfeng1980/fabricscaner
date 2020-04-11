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


layui.define(['table', 'form', 'laytpl', 'adminutil','laydate'], function (exports) {


    var $ = layui.$
        , table = layui.table
        , form = layui.form
        , admin = layui.admin
        , laytpl = layui.laytpl
        , adminutil = layui.adminutil
        , laydate = layui.laydate

        , moduletpl =
        {

            name:'name'

            /**
             *  ==================================一个页面对应的方法( 此处填写调用当前方法的html页面的路径 )==============================
             *
             *  这是典型的一个数据库表能对应列表和表单页
             *
             */

            ,list: function ()
            {

            }


            /**
             *  ==============一个页面对应的方法( 此处填写调用当前方法的html页面的路径 )=========================
             *
             *
             *
             */
            , edit: function ()
            {

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


    exports('moduletpl', moduletpl);


});