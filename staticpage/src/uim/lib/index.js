/**

 @Name：layuiAdmin iframe版主入口
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */

layui.extend({setter:"config",admin:"lib/admin",view:"lib/view"}).define(["setter","admin"],function(d){var c=layui.setter,f=layui.element,k=layui.admin,j=k.tabsPage,i=layui.view,g=function(l,p){var q,m=e("#LAY_app_tabsheader>li"),o=l.replace(/(^http(s*):)|(\?[\s\S]*$)/g,"");m.each(function(s){var r=e(this),t=r.attr("lay-id");if(t===l){q=true;j.index=s}});p=p||"新标签页";if(c.pageTabs){if(!q){e(b).append(['<div class="layadmin-tabsbody-item layui-show">','<iframe src="'+l+'" frameborder="0" class="layadmin-iframe"></iframe>',"</div>"].join(""));j.index=m.length;f.tabAdd(h,{title:"<span>"+p+"</span>",id:l,attr:o})}}else{var n=k.tabsBody(k.tabsPage.index).find(".layadmin-iframe");n[0].contentWindow.location.href=l}f.tabChange(h,l);k.tabsBodyChange(j.index,{url:l,text:p})},b="#LAY_app_body",h="layadmin-layout-tabs",e=layui.$,a=e(window);if(k.screen()<2){k.sideFlexible()}layui.config({base:c.base+"modules/"});layui.each(c.extend,function(l,n){var m={};m[n]="{/}"+c.base+"lib/extend/"+n;layui.extend(m)});i().autoRender();layui.use("common");d("index",{openTabsPage:g})});