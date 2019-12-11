/**

 @Name：layuiAdmin 公共业务
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */

layui.define(function (exports) {

    var $ = layui.$
        , layer = layui.layer
        , laytpl = layui.laytpl
        , setter = layui.setter
        , view = layui.view
        , admin = layui.admin

        , adminutil = {


        /**
         * ==================数据异步请求改进方法===============================
         *
         * 原版本的方法没有提供明确的超时自动跳转，而且没有提供POST方法，我们对原版
         * 的方法做适当的改进，提供post方法和超时跳转到登录页面的操作
         *
         * @date    2019-02-21
         * @author robert.feng
         *
         * ===================================================================
         */
        ajaxreq: function (options) {


            var that = this

                , reqtype = options.type ? options.type : 'POST'
                , reqdatatype = options.dataType ? options.dataType : 'html'
                , timeoutjumpurl = options.timeoutjumpurl
                , success = options.success
                , error = options.error
                , request = setter.request
                , response = setter.response
                , debug = function () {
                return setter.debug
                    ? '<br><cite>URL：</cite>' + options.url
                    : '';
            };

            options.data = options.data || {};
            options.headers = options.headers || {};

            if (request.tokenName) {
                var sendData = typeof options.data === 'string'
                    ? JSON.parse(options.data)
                    : options.data;

                //自动给参数传入默认 token
                options.data[request.tokenName] = request.tokenName in sendData
                    ? options.data[request.tokenName]
                    : (layui.data(setter.tableName)[request.tokenName] || '');

                //自动给 Request Headers 传入 token
                options.headers[request.tokenName] = request.tokenName in options.headers
                    ? options.headers[request.tokenName]
                    : (layui.data(setter.tableName)[request.tokenName] || '');
            }

            delete options.success;
            delete options.error;

            return $.ajax($.extend({
                type: reqtype
                , dataType: reqdatatype
                , success: function (res) {
                    var statusCode = response.statusCode;

                    //只有 response 的 code 一切正常才执行 done
                    if (res[response.statusName] === statusCode.ok) {
                        typeof options.done === 'function' && options.done(res);
                    }

                    //登录状态失效，清除本地 access_token，并强制跳转到登入页
                    else if (res[response.statusName] === statusCode.logout) {


                        var loginurlprifx = setter.base.replace("uim", "views");
                        ;
                        //alert(loginurlprifx);
                        var timeoururl;
                        if (typeof(timeoutjumpurl) === "undefined" || timeoutjumpurl) {
                            timeoururl = loginurlprifx + 'user/login.html';
                        } else {
                            timeoururl = loginurlprifx + timeoutjumpurl;
                        }
                        view.exit();
                        top.location.href = timeoururl;

                    }

                    //其它异常
                    else {
                        var error = [
                            '<cite>Error：</cite> ' + (res[response.msgName] || '返回状态码异常')
                            , debug()
                        ].join('');
                        view.error(error);
                    }

                    //只要 http 状态码正常，无论 response 的 code 是否正常都执行 success
                    typeof success === 'function' && success(res);
                }
                , error: function (e, code) {
                    var error = [
                        '请求异常，请重试<br><cite>错误信息：</cite>' + code
                        , debug()
                    ].join('');
                    view.error(error);

                    typeof error === 'function' && error(res);
                }
            }, options));
        }






        /**
         * 随机数
         * @param max
         * @param min
         * @returns {number}
         */
        ,getRandInt: (max, min) => {

            return parseInt(Math.random() * (max - min + 1) + min, 10);


        }



        /**
         * 获取URL中的参数的值
         *
         * 改方法只能返回当前的页面的url中包含的参数，如果实在 iframe 中只能获取当前iframe的参数
         *
         * @param parmname
         * @returns {*}
         */
        , getUrlParam: function (parmname) {


            var url = location.search; //获取url中"?"符后的字串
            var theRequest = new Object();

            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }

            if (theRequest != null)
                return theRequest[parmname];
            else
                return null;

        }

        /**
         * 将页面请求参数添加到ajax请求中
         */
        , joinHtmlParm2Ajaxrequest: (htmlurl) => {

            var urlparm = location.search; //获取url中"?"符后的字串

            if (urlparm.indexOf("?") != -1) {

                if (htmlurl.indexOf("?") != -1) {

                    urlparm = urlparm.substring(1, urlparm.length);
                    return htmlurl + "&" + urlparm;

                } else {

                    return htmlurl + urlparm;
                }

            } else {

                return htmlurl;

            }


        }


    };

    exports('adminutil', adminutil);
});