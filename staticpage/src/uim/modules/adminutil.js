/**

 @Name：layuiAdmin 公共业务
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */

layui.define(function(exports){

    var $ = layui.$
        ,layer = layui.layer
        ,laytpl = layui.laytpl
        ,setter = layui.setter
        ,view = layui.view
        ,admin = layui.admin

        ,adminutil = {


        /**
         * 随机数
         * @param max
         * @param min
         * @returns {number}
         */
        getRandInt: (max , min)=>{

            return parseInt(Math.random()*(max-min+1)+min,10);


        }



        /**
         * 获取URL中的参数的值
         *
         * 改方法只能返回当前的页面的url中包含的参数，如果实在 iframe 中只能获取当前iframe的参数
         *
         * @param parmname
         * @returns {*}
         */
        ,getUrlParam : function (parmname) {



            var url = location.search; //获取url中"?"符后的字串
            var theRequest = new Object();

            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for(var i = 0; i < strs.length; i ++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }

            if( theRequest != null )
                return theRequest[parmname];
            else
                return null;

        }

        /**
         * 将页面请求参数添加到ajax请求中
         */
        ,joinHtmlParm2Ajaxrequest:(htmlurl)=>{

            var urlparm = location.search; //获取url中"?"符后的字串

            if (urlparm.indexOf("?") != -1) {

                if( htmlurl.indexOf("?") != -1 ){

                    urlparm = urlparm.substring(1, urlparm.length);
                    return htmlurl+"&"+urlparm;

                }else{

                    return htmlurl+urlparm;
                }

            }else{

                return htmlurl;

            }




        }





    };

    exports('adminutil',adminutil);
});