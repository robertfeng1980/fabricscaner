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

 @Name：由于layui不支持互相依赖，因此才会用这个办法来做复用，希望后面的框架能够升级解决这个问题
 @Author：robertfeng

 */


layui.define(['channel', 'fabricnode', 'fabricnetwork'], function (exports) {


    var $ = layui.$
        , channel = layui.channel
        , fabricnode = layui.fabricnode
        , fabricnetwork = layui.fabricnetwork


        , fabricstudiocommon =
        {

            name:'name'

            /**
             *  ==================================一个页面对应的方法( 此处填写调用当前方法的html页面的路径 )==============================
             *
             *  这是典型的一个数据库表能对应列表和表单页
             *
             */

            ,organization_detail: function ()
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


    exports('fabricstudiocommon', fabricstudiocommon);


});