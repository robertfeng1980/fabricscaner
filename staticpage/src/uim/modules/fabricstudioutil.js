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

layui.define(['table', 'form', 'adminutil'], function (exports) {


    let $ = layui.$
        , admin = layui.admin
        , adminutil = layui.adminutil
        , fabricnetwork1 = layui.fabricnetwork




        , fabricstudioutil =
        {

            name:'name'
            //结构图中节点形状
            ,pic_gorup_base_option:{
                org: {shape: 'circle', color: '#FF9900', font:{bold:true}},
                orderer: {shape: 'ellipse', color: "#2B7CE9"  , font:{bold:true}},
                peer: {shape: 'database', color: "#f9cda9" , font:{bold:true}},
                block: {shape: 'square', color: "#5A1E5C" , font:{bold:true}},
                fabric_ca: {shape: 'triangle', color: "#C5000B" , font:{bold:true}},
                channel: {shape: 'box', color: "#26bcd5" , font:{bold:true}},
                //chaincode: {shape: 'diamond', color: "#725334" , font:{bold:true}},
                chaincodeinstall: {shape: 'diamond', color: "#725334" , font:{bold:true}},
                chaincodeinstance: {shape: 'diamond', color: "#109618" , font:{bold:true}},
                account: {shape: 'image', color: "#00314f",image:"../../source/img/user.png" , font:{bold:true}},
                transaction: {shape: 'hexagon', color: "#57693c" , font:{bold:true}},
                keyset: {shape: 'image', color: "#71969f",image:"../../source/img/key.png", font:{bold:true}}

            }


            /**
             * 显示所有结构图的图例
             */
            ,display_struct_example: (divelementid)=>{


                let vis = window.visobj;
                let peer_font_color = '#665a09'
                /// ================================   图例  ====================================
                let nodes = [];

                // legend
                let mynetwork1 = document.getElementById(divelementid);
                let x = -mynetwork1.clientWidth - 70;
                let y = -mynetwork1.clientHeight + 50;
                let step = 80;

                nodes.push({id: 1000, x: x, y: y, label: 'Org1Msp', group: 'org', value: 1, fixed: true, physics: true});
                nodes.push({id: 1001, x: x, y: y + step, label: 'orderer', group: 'orderer', value: 1, fixed: true, physics: false});
                nodes.push({id: 1002, x: x, y: y + 2 * step,label: 'peer', group: 'peer', value: 1, fixed: true, physics: false});
                nodes.push({id: 1003, x: x, y: y + 3 * step, label: 'fabric-ca', group: 'fabric_ca', value: 1, fixed: true, physics: false});
                nodes.push({id: 1004, x: x, y: y + 4 * step, label: 'channel', group: 'channel', value: 1, fixed: true, physics: false});

                nodes.push({id: 10021, x: x, y: y + 5 * step, label: 'block', group: 'block', value: 1, fixed: true, physics: false});

                nodes.push({id: 1005, x: x, y: y + 6 * step, label: 'chaincode(install)', group: 'chaincodeinstall', value: 1, fixed: true, physics: false});
                nodes.push({id: 1006, x: x, y: y + 7 * step, label: 'chaincode(instance)', group: 'chaincodeinstance', value: 1, fixed: true, physics: false});

                nodes.push({id: 1007, x: x, y: y + 8 * step, label: 'account', group: 'account', value: 1, fixed: true, physics: false});

                nodes.push({id: 1008, x: x, y: y + 9 * step, label: 'transaction', group: 'transaction', value: 1, fixed: true, physics: false});
                nodes.push({id: 1009, x: x, y: y + 10 * step, label: 'keyset', group: 'keyset', value: 1, fixed: true, physics: false});


                let container1 = document.getElementById(divelementid);

                let data1 = {
                    nodes: nodes
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

                    groups: fabricstudioutil.pic_gorup_base_option
                };

                network1 = new vis.Network(container1, data1, options1);



            }


            /**
             * ====================================================显示网络结构图明细=========================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */
            ,network_struct_pic_detail:(data,divelmentid)=>{


                let LENGTH_MAIN = 350, LENGTH_SERVER = 150, LENGTH_SUB = 50, WIDTH_SCALE = 2, RED = '#C5000B', GRAY = 'gray'
                let vis = window.visobj;
                nodes = [];
                edges = [];

                let orgs = data['orgs'];

                nodes.push({id: "orderergroups", label:"orderer节点组", group: "orderer", value: 0});


                for (let ind = 0 ; ind < orgs.length; ind++ ){

                    let org = orgs[ind];
                    let org_pic_id = org['id'] + "##" + "org" + "##" +org['mspid'] + "##" + adminutil.getRandInt(1,10000);
                    nodes.push({id: org_pic_id, label:org['comments'], group: org['flag'], value: org['id']});


                    //fabric-ca绑定和绘制
                    let fabric_cas = org['fabric-ca'];

                    if( fabric_cas !== null && fabric_cas !== undefined && fabric_cas !== '' ){


                        for ( let pind = 0 ; pind<fabric_cas.length; pind++){

                            let fabric_ca = fabric_cas[pind];
                            let fabric_ca_pic_id = fabric_ca['id']  + "##" + "fabric_ca" + "##" + fabric_ca['name']+ "##" + adminutil.getRandInt(1,10000);

                            nodes.push({id: fabric_ca_pic_id, label:fabric_ca['name'], group: fabric_ca['flag']});
                            edges.push({from: org_pic_id, to: fabric_ca_pic_id, length: LENGTH_MAIN-LENGTH_SUB*1, width: WIDTH_SCALE *3});


                        }

                    }


                    /*if( ind+1<orgs.length ){

                        let org_next = orgs[ind + 1];
                        let org_next_pic_id = org_next['id']+"##"+org_next['mspid']
                        edges.push({from: org_pic_id, to: org_next_pic_id, length: LENGTH_MAIN, width: WIDTH_SCALE * 6});

                    }*/

                    // peer节点处理
                    let peers = org['peers'];

                    if( peers !== null && peers !== undefined && peers !== '' ){


                           for ( let pind = 0 ; pind<peers.length; pind++){

                               let peer = peers[pind];
                               let peer_pic_id = peer['id']  + "##" + "peer" + "##" + peer['name']+ "##" + adminutil.getRandInt(1,10000);

                               nodes.push({id: peer_pic_id, label:peer['name'], group: peer['flag']});
                               edges.push({from: org_pic_id, to: peer_pic_id, length: LENGTH_MAIN-LENGTH_SUB*1, width: WIDTH_SCALE *4});

                               //状态为install的chaincode的处理
                               /*nodes.push({id: "installccs", label:"状态为install的chaincode", group: "chaincode" });
                               edges.push({from: peer_pic_id, to: "installccs", length: LENGTH_MAIN-LENGTH_SUB*2, width: WIDTH_SCALE *4 });*/

                               let installccs = peer['installcc'];
                               if( installccs !== null && installccs !== undefined && installccs !== '' ){

                                   for ( let installccind = 0 ; installccind<installccs.length; installccind++){

                                       let installcc = installccs[installccind];
                                       let installcc_pic_id = installcc['id']+"##"+"chaincode"+"##"+installcc['name']+ "##" + adminutil.getRandInt(1,10000)

                                       nodes.push( { id: installcc_pic_id, label:installcc['comments'], group:installcc['flag'] } );
                                       edges.push({from: peer_pic_id, to: installcc_pic_id, length: LENGTH_MAIN-LENGTH_SUB*3, width: WIDTH_SCALE * 3 });

                                   }


                               }

                               //channel处理
                               let channels = peer['channels'];

                               if( channels !== null && channels !== undefined && channels !== '' ){

                                   for ( let cind = 0 ; cind<channels.length; cind++) {



                                       let channel = channels[cind];
                                       let channel_pic_id = channel['id'] + "##" + "channel" + "##" + channel['channel_id']+ "##" + adminutil.getRandInt(1,10000);

                                       nodes.push({id: channel_pic_id, label: channel['comments'], group: channel['flag']});
                                       edges.push({from: peer_pic_id, to: channel_pic_id, length: LENGTH_MAIN-LENGTH_SUB*4, width: WIDTH_SCALE * 2});


                                       //如果存在通道的总区块数，则显示
                                       let channel_blocknums = channel['blocknumbers'];
                                       if( channel_blocknums !== null && channel_blocknums !== undefined && channel_blocknums !== '' ){

                                           let blocknums_pic_id = adminutil.getRandInt(10000,50000); + "##" + "blocksss" + "##" + channel['channel_id']+ "##" + adminutil.getRandInt(1,10000);
                                           nodes.push({id: blocknums_pic_id, label: `总区块数[${channel_blocknums}]`, group: 'block'});
                                           edges.push({from: channel_pic_id, to: blocknums_pic_id, length: LENGTH_MAIN-LENGTH_SUB*4, width: WIDTH_SCALE * 2});

                                           //如果存在交易总数则显示
                                           let channel_block_txs = channel['txnums'];
                                           if( channel_block_txs !== null && channel_block_txs !== undefined && channel_block_txs !== '' ){

                                               let channel_block_txs_pic_id = adminutil.getRandInt(10000,50000); + "##" + "txs" + "##" + channel['channel_id']+ "##" + adminutil.getRandInt(1,10000);
                                               nodes.push({id: channel_block_txs_pic_id, label: `交易总数[${channel_block_txs}]`, group: 'transaction'});
                                               edges.push({from: blocknums_pic_id, to: channel_block_txs_pic_id, length: LENGTH_MAIN-LENGTH_SUB*5, width: WIDTH_SCALE * 2});


                                               //如果存在keyset的总数，则显示

                                               let channel_block_tx_keysets = channel['keysetnums'];
                                               if( channel_block_tx_keysets !== null && channel_block_tx_keysets !== undefined && channel_block_tx_keysets !== '' ){

                                                   let channel_block_tx_keysets_pic_id = adminutil.getRandInt(10000,50000); + "##" + "keysets" + "##" + channel['channel_id']+ "##" + adminutil.getRandInt(1,10000);
                                                   nodes.push({id: channel_block_tx_keysets_pic_id, label: `keyset总数[${channel_block_tx_keysets}]`, group: 'keyset'});
                                                   edges.push({from: channel_block_tx_keysets_pic_id, to: channel_block_txs_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2});


                                                   //如果存在keyset的总数，则显示



                                               }




                                           }


                                       }



                                       //处理已经instance的chaincode

                                       let instanceccs = channel['instanceccs'];
                                       if( instanceccs !== null && instanceccs !== undefined && instanceccs !== '' ){

                                           for ( let cind = 0 ; cind<instanceccs.length; cind++) {

                                               let instancecc = instanceccs[cind];
                                               let instancecc_pic_id = instancecc['id'] + "##" + "chaincode" + "##" + instancecc['name']+ "##" + adminutil.getRandInt(1,10000);

                                               nodes.push( { id: instancecc_pic_id, label:instancecc['comments'], group:instancecc['flag'] } );
                                               edges.push({from: channel_pic_id, to: instancecc_pic_id, length: LENGTH_MAIN-LENGTH_SUB*5, width: WIDTH_SCALE * 3 });

                                           }

                                       }


                                       //处理cahnnel中的区块信息
                                       let blocks  = channel['blocks'];
                                       if( blocks !== null && blocks !== undefined && blocks !== '' ){

                                           for ( let bind = 0 ; bind<blocks.length; bind++) {

                                               let block = blocks[cind];
                                               let block_pic_id = block['id'] + "##" + block['flag'] + "##" + block['blocknum']+ "##" + adminutil.getRandInt(1,10000);

                                               nodes.push( { id: block_pic_id, label:"#"+block['blocknum'], group:block['flag'] } );
                                               edges.push({from: channel_pic_id, to: block_pic_id, length: LENGTH_MAIN-LENGTH_SUB*5, width: WIDTH_SCALE * 3 });


                                               let transactions  = block['transactions'];
                                               if( transactions !== null && transactions !== undefined && transactions !== '' ){

                                                   for ( let bind = 0 ; bind<transactions.length; bind++) {


                                                       let transaction = transactions[cind];
                                                       let transaction_pic_id = transaction['id'] + "##" + transaction['flag'] + "##" + transaction['name']+ "##" + adminutil.getRandInt(1,10000);

                                                       nodes.push( { id: transaction_pic_id, label:transaction['name'], group:transaction['flag'] } );
                                                       edges.push({from: block_pic_id, to: transaction_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2 });


                                                       let tx_chaincode = transaction['chaincode'];
                                                       let tx_chaincode_pic_id =  tx_chaincode['id'] + "##" + tx_chaincode['flag'] + "##" + tx_chaincode['name']+ "##" + adminutil.getRandInt(1,10000);

                                                       nodes.push( { id: tx_chaincode_pic_id, label:tx_chaincode['name'], group:tx_chaincode['flag'] } );
                                                       edges.push({from: tx_chaincode_pic_id, to: transaction_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2 });
                                                       edges.push({from: tx_chaincode_pic_id, to: channel_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2 });




                                                       //给交易背书的账号
                                                       let accounts  = transaction['accounts'];
                                                       if( accounts !== null && accounts !== undefined && accounts !== '' ){

                                                           for ( let bind = 0 ; bind<accounts.length; bind++) {


                                                               let account = accounts[cind];
                                                               let account_pic_id = account['id'] + "##" + account['flag'] + "##" + account['name']+ "##" + adminutil.getRandInt(1,10000);

                                                               nodes.push( { id: account_pic_id, label:account['name'], group:account['flag'] } );
                                                               edges.push({from: transaction_pic_id, to: account_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2 });


                                                           }

                                                       }


                                                       //交易中包含的keyset
                                                       let keysets  = transaction['keysets'];
                                                       if( keysets != null && keysets !== undefined && keysets !== '' ){

                                                           for ( let bind = 0 ; bind<keysets.length; bind++) {


                                                               let keyset = keysets[cind];
                                                               let keyset_pic_id = keyset['id'] + "##" + keyset['flag'] + "##" + keyset['name']+ "##" + adminutil.getRandInt(1,10000);

                                                               nodes.push( { id: keyset_pic_id, label:keyset['name'], group:keyset['flag'] } );
                                                               edges.push({from: transaction_pic_id, to: keyset_pic_id, length: LENGTH_MAIN-LENGTH_SUB*6, width: WIDTH_SCALE * 2 });


                                                           }

                                                       }



                                                   }

                                               }


                                           }



                                       }




                                   }

                               }



                           }

                    }


                    edges.push({from: org_pic_id, to: "orderergroups", length: LENGTH_MAIN-LENGTH_SUB*2, width: WIDTH_SCALE * 6});


                }



                //
                let orderers = data['orderers'];

                if( orderers !== null && orderers !== undefined && orderers !== '' ){


                    for(  let oind=0 ; oind<orderers.length;oind++  ){

                        let orderer = orderers[oind];
                        let orderer_id =  orderer['id'] +"##" +orderer['flag']+"##" + orderer['name']+ "##" + adminutil.getRandInt(1,10000);

                        nodes.push({id: orderer_id, label:orderer['name'], group: orderer['flag'], value: orderer['id']});
                        edges.push({from: "orderergroups", to: orderer_id, length: LENGTH_MAIN-LENGTH_SUB*2, width: WIDTH_SCALE * 5});

                    }


                }



                //容器准备
                let container = document.getElementById(divelmentid);

                let nodedata = {
                    nodes: nodes,
                    edges: edges
                };


                let options = {

                    nodes: {scaling: {min: 24, max: 40}},

                    edges: {color: GRAY, smooth: false},

                    interaction: {

                        zoomView: true,  //控制是否被移动
                    },

                    physics: { barnesHut: {gravitationalConstant: -30000}, stabilization: {iterations: 2500}},

                    groups: fabricstudioutil.pic_gorup_base_option

                };



                let network = new vis.Network(container, nodedata, options);


                //绑定双击事件
                network.on("doubleClick", function (params) {


                    //业务数据只能先放到ID里面啦
                    var nodeid = params.nodes[0];
                    var node = network.findNode(nodeid);

                    var nodeValue = node.extvalue;

                    //alert(nodeid);

                    if ( nodeid !== undefined && nodeid.indexOf("##") !== -1) {

                        var str = nodeid;
                        var regex = /\s+|,|@|##/;
                        var strAry = str.split(regex);

                        //layer.msg(JSON.stringify(strAry ));

                        let nodepkid = strAry[0];
                        let nodetype = strAry[1];
                        let nodeentid = strAry[2];


                        if( nodetype === 'org'){

                            let title= '组织 [ ' + nodeentid + ' ] 详情';
                            let openurl = layui.setter.base +'../views/fabricnetwork/organization_detail.html?mspid=' +nodeentid+"&msppkid="+nodepkid;
                            fabricstudioutil.open_node_detail_win(title,openurl);


                        }else if( nodetype === 'orderer'){

                            layer.msg(nodeid);

                        }else if( nodetype === 'peer'){


                            let title= 'peer节点 [ ' + nodepkid + ' ] 详情';
                            let openurl = layui.setter.base +'../views/fabricnode/peer_detail.html?peerid=' + nodepkid
                            fabricstudioutil.open_node_detail_win(title,openurl);


                        }else if( nodetype === 'block'){

                            let title= '区块 [ #' +nodeentid  +' ] 详情';
                            let openurl = layui.setter.base +'../views/channel/block_detail.html?peerid=' + nodepkid
                            fabricstudioutil.open_node_detail_win(title,openurl);

                        }else if( nodetype === 'fabric_ca'){



                        }else if( nodetype === 'channel'){

                            let title= '账本 [ '+nodeentid+' ] 详情'
                            let openurl = layui.setter.base +'../views/channel/channel_detail.html?pkid='+nodepkid+'&channel_id='+nodeentid
                            fabricstudioutil.open_node_detail_win(title,openurl);

                        }else if( nodetype === 'chaincode'){

                            let title=  'chaincode [ ' + nodeentid + ' ] 详情'
                            let openurl = layui.setter.base +'../views/channel/chaincode_detail.html?pkid='+nodepkid+'&cc_id='+nodeentid
                            fabricstudioutil.open_node_detail_win(title,openurl);


                        }else if( nodetype === 'account'){

                            let title= '签名账号 [ '+nodeentid+' ] 详情'
                            let openurl = layui.setter.base +'../views/channel/account_detail.html?pkid='+nodepkid+'&account_id='+nodeentid
                            fabricstudioutil.open_node_detail_win(title,openurl);


                        }else if( nodetype === 'transaction'){

                            let title= '交易 [ '+nodeentid+' ] 详情'
                            let openurl = layui.setter.base +'../views/channel/transaction_detail.html?pkid='+nodepkid+'&txhash='+nodeentid
                            fabricstudioutil.open_node_detail_win(title,openurl);


                        }else if( nodetype === 'keyset'){

                            let title= 'keyset [ '+nodeentid+' ] 详情'
                            let openurl = layui.setter.base +'../views/channel/keyset_detail.html?pkid='+nodepkid+'&ketset_name='+nodeentid
                            fabricstudioutil.open_node_detail_win(title,openurl);

                        }




                    }


                });


            }


            /**
             * 打开统计图中节点详细信息
             */
            ,open_node_detail_win:(tiele,openurl)=>{


                // 组织 [ ' + nodeentid + ' ] 详情'
                //  'organization_detail.html?mspid=' +nodeentid+"&msppkid="+nodepkid

                layer.open({
                    type: 2
                    , title:  tiele
                    , content: openurl
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


            /**
             * ====================================================cahnnel网络结构拓扑图=====================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */
            ,channel_detail_struct_pic:( data , divelmentid )=>{


                fabricstudioutil.network_struct_pic_detail(data, divelmentid);


                /*let LENGTH_MAIN = 350, LENGTH_SERVER = 150, LENGTH_SUB = 50, WIDTH_SCALE = 2, RED = '#C5000B', GRAY = 'gray'
                let vis = window.visobj;
                nodes = [];
                edges = [];

                let channel = data;


                let channel_id = channel['id']+"##channel##"+channel['channel_id'];
                nodes.push({id: channel_id , label:channel['channel_id'], group: "channel", value: 0});

                let orgs = channel['orgs'];


                if( orgs !== null && orgs!=='' && orgs!== undefined ){



                    for (let ind = 0 ; ind < orgs.length; ind++ ) {

                        let org = orgs[ind];
                        let org_pic_id = org['id'] + "##" + "org" + "##" + org['mspid']
                        nodes.push({id: org_pic_id, label: org['mspid'], group: org['flag'], value: org['id']});
                        edges.push({from: channel_id, to: org_pic_id, length: LENGTH_MAIN - LENGTH_SUB * 2, width: WIDTH_SCALE * 5});


                        let peers = org['peers'];

                        if( peers !== null && peers !== undefined && peers !== '' ){


                            for ( let pind = 0 ; pind<peers.length; pind++) {

                                let peer = peers[pind];
                                let peer_pic_id = peer['id'] + "##" + "peer" + "##" + peer['name'];

                                nodes.push({id: peer_pic_id, label: peer['name'], group: peer['flag']});
                                edges.push({from: org_pic_id, to: peer_pic_id, length: LENGTH_MAIN - LENGTH_SUB * 3, width: WIDTH_SCALE * 4});
                            }
                        }


                    }
                }







                //容器准备
                let container = document.getElementById(divelmentid);

                let nodedata = {
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

                        zoomView: true,  //控制是否被移动
                    },
                    physics: {
                        barnesHut: {gravitationalConstant: -30000},
                        stabilization: {iterations: 2500}
                    },

                    groups: fabricstudioutil.pic_gorup_base_option
                };



                let network = new vis.Network(container, nodedata, options);


                network.on("doubleClick", function (params) {


                    //业务数据只能先放到ID里面啦
                    var nodeid = params.nodes[0];
                    var node = network.findNode(nodeid);

                    var nodeValue = node.extvalue;

                    alert(nodeid);

                    //network.findNode()
                });*/


            }



            /**
             * ====================================================block网络拓扑图=====================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */

            ,block_detail_struct_pic:( data , divelmentid )=>{



                fabricstudioutil.network_struct_pic_detail(data, divelmentid);




            }



            /**
             * ====================================================chaincode网络拓扑图=====================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */

            ,chaincode_detail_struct_pic:( data , divelmentid )=>{


                fabricstudioutil.network_struct_pic_detail(data, divelmentid);


            }


            /**
             * ====================================================交易网络拓扑图=====================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */

            ,transaction_detail_struct_pic:( data , divelmentid )=>{

                fabricstudioutil.network_struct_pic_detail(data, divelmentid);

            }


            /**
             * ========================================================交易网络拓扑图========================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */

            ,keyset_detail_struct_pic:( data , divelmentid )=>{

                fabricstudioutil.network_struct_pic_detail(data, divelmentid);

            }


            /**
             * ========================================================交易网络拓扑图========================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */
            ,account_detail_struct_pic:( data , divelmentid )=>{

                fabricstudioutil.network_struct_pic_detail(data, divelmentid);

            }


            /**
             * ========================================================交易网络拓扑图========================================================
             * ============================================================================================================================
             * ============================================================================================================================
             * ============================================================================================================================
             *
             * @param data
             */
            ,peer_detail_struct_pic:( data , divelmentid )=>{

                fabricstudioutil.network_struct_pic_detail(data, divelmentid);

            }



            /**
             *
             *  用控件显示结构化的json信息
             *
             *  layui.setter.base + '../json/fabricnetwork/json.json?jsonparm=1'
             *
             */

            ,dispaly_json: (url)=>
            {


                adminutil.ajaxreq({

                    url: url
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        let data = response.data;
                        //let responsestr=JSON.stringify(data);
                        //$("#RawJson").text(data);
                       /* window.QuoteKeys = false;
                        Process();*/

                        $("#Canvasper").text(data);
                    }

                });

            }

            ,dispaly_json1: (url)=>
            {


                adminutil.ajaxreq({

                    url: url
                    , type: 'GET'
                    , dataType: 'json'
                    //,data:JSON.stringify(data.field)
                    //,data: data.field

                    , error: function (e) {
                        layer.msg('系统错误');
                    }

                    , success: function (response) {

                        let data = response.data;
                        //let responsestr=JSON.stringify(data);
                        //$("#RawJson").text(data);
                        /* window.QuoteKeys = false;
                         Process();*/

                        //$("#Canvasper").text(data);
                        Process(data);
                    }

                });

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


    exports('fabricstudioutil', fabricstudioutil);


});