/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Type    : MySQL
Source Server Version : 50505
Source Host           : localhost
Source Database       : fabric_studio

Target Server Type    : MySQL
Target Server Version : 50505
File Encoding         : utf-8

Date: 06/01/2020 20:37:45 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `accounts`
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`mspid` varchar(32) DEFAULT NULL COMMENT '组织编号',
`name` varchar(32) NOT NULL COMMENT '账号名称',
`comments` varchar(64) DEFAULT NULL COMMENT '账号的注释',
`account_type` int(11) DEFAULT NULL COMMENT '签名用户的类型（0-背书  1-发起交易）',
`certs_md5` varchar(64) DEFAULT NULL COMMENT '证书的MD5编码',
`certs` text COMMENT '账号证书',
`certs_json` text COMMENT '证书JSON格式',
`effective_dt` datetime DEFAULT NULL,
`invalid_dt` datetime DEFAULT NULL,
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`,`name`)
) ENGINE=MyISAM AUTO_INCREMENT=727 DEFAULT CHARSET=utf8 COMMENT='组织中的账号';

-- ----------------------------
--  Table structure for `blocks`
-- ----------------------------
DROP TABLE IF EXISTS `blocks`;
CREATE TABLE `blocks` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`channel_id` varchar(32) DEFAULT NULL COMMENT '账本名称',
`blocknum` int(11) DEFAULT NULL COMMENT '区块编号',
`block_detail` text COMMENT '区块链详细信息',
`datahash` varchar(256) DEFAULT NULL COMMENT '数据哈希',
`perhash` varchar(256) DEFAULT NULL COMMENT '区块的前一哈希值',
`txcount` int(11) DEFAULT NULL COMMENT '交易数',
`keysets` int(255) DEFAULT NULL COMMENT '区块链中包含的ketset',
`account_certs` int(255) DEFAULT NULL COMMENT '区块中包含的用户签名',
`blockcreatedt` datetime(3) DEFAULT NULL COMMENT '区块创建时间',
`blockcreatedt_year` varchar(4) DEFAULT NULL,
`blockcreatedt_month` varchar(2) DEFAULT NULL,
`blockcreatedt_day` varchar(2) DEFAULT NULL,
`blockcreatedt_h` varchar(2) DEFAULT NULL,
`blockcreatedt_m` varchar(2) DEFAULT NULL,
`blockcreatedt_s` varchar(2) DEFAULT NULL,
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=13122 DEFAULT CHARSET=utf8 COMMENT='区块';

-- ----------------------------
--  Table structure for `chaincodes`
-- ----------------------------
DROP TABLE IF EXISTS `chaincodes`;
CREATE TABLE `chaincodes` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`peer_name` varchar(32) DEFAULT NULL COMMENT '名称',
`channel_id` varchar(128) DEFAULT NULL COMMENT '账本名称',
`languages` varchar(32) DEFAULT NULL COMMENT '开发语言',
`name` varchar(256) DEFAULT NULL COMMENT '名称',
`comments` varchar(64) DEFAULT NULL COMMENT '链码注释',
`version` varchar(256) DEFAULT NULL COMMENT '版本',
`path` varchar(256) DEFAULT NULL COMMENT '路径',
`escc` varchar(32) DEFAULT NULL COMMENT 'escc',
`vscc` varchar(32) DEFAULT NULL COMMENT 'vscc',
`peers` int(11) DEFAULT NULL COMMENT 'chaincode部署的peer节点数量',
`txcount` int(11) DEFAULT '0' COMMENT '交易数',
`keysets` int(255) DEFAULT NULL COMMENT 'ketset数',
`account_certs` int(255) DEFAULT NULL COMMENT '用户签名数',
`ccstatus` varchar(32) DEFAULT NULL COMMENT '状态',
`cccreatedt` datetime(3) DEFAULT NULL,
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
`ifoncerun` int(11) DEFAULT '0' COMMENT '是否曾经运行过（如果cc曾经运行过会有交易记录 0 从来没有运行过 1-曾经运行过，但是现在版本已经停止）',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=1778 DEFAULT CHARSET=utf8 COMMENT='链码(智能合约)';

-- ----------------------------
--  Table structure for `channel`
-- ----------------------------
DROP TABLE IF EXISTS `channel`;
CREATE TABLE `channel` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`channel_id` varchar(64) DEFAULT NULL COMMENT '账本名称',
`comments` varchar(64) DEFAULT NULL COMMENT '账本的注释',
`originate_dt` datetime(3) DEFAULT NULL COMMENT '创世时间',
`originate_detail` text COMMENT '创世快信息（通道配置信息）',
`blocks` int(11) DEFAULT NULL COMMENT '区块数（记数用从0开始）',
`countblocks` int(11) DEFAULT '1' COMMENT '区块数（显示区块数目）',
`chaincodes` int(11) DEFAULT NULL COMMENT 'chaincode数目',
`txcount` int(11) DEFAULT NULL COMMENT '交易数',
`keysets` int(11) DEFAULT NULL COMMENT '账本中的key数目',
`account_certs` int(11) DEFAULT NULL COMMENT '签名账号数',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=611 DEFAULT CHARSET=utf8 COMMENT='通道（账本）';

-- ----------------------------
--  Table structure for `channel_ref_instantiatedcc`
-- ----------------------------
DROP TABLE IF EXISTS `channel_ref_instantiatedcc`;
CREATE TABLE `channel_ref_instantiatedcc` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`peer_name` varchar(64) DEFAULT NULL COMMENT 'peer节点的编号',
`channel_id` varchar(64) DEFAULT NULL COMMENT '通道（账本）编号',
`chaincode_name` varchar(64) DEFAULT NULL COMMENT '链码名称',
`chaincode_version` varchar(64) DEFAULT NULL COMMENT '链码版本',
`chaincode_createdt` datetime DEFAULT NULL COMMENT '链码实例化的时间',
`instance_txhash` varchar(128) DEFAULT NULL COMMENT '实例化当前链码的交易哈希值',
`isactive` int(4) DEFAULT '1' COMMENT '是否存活（如果遇到版本升级，旧版本不在提供服务）',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` varchar(64) DEFAULT NULL COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=426 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='通道（账本）和已经实例化的链码（智能合约）的关系\r\n';

-- ----------------------------
--  Table structure for `fabricca`
-- ----------------------------
DROP TABLE IF EXISTS `fabricca`;
CREATE TABLE `fabricca` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`mspid` varchar(64) DEFAULT NULL COMMENT 'mspid',
`org_name` varchar(64) DEFAULT NULL COMMENT '组织名称',
`ca_name` varchar(128) DEFAULT NULL COMMENT 'ca名称',
`comments` varchar(64) DEFAULT NULL COMMENT '注释',
`ca_request` varchar(128) DEFAULT NULL COMMENT 'ca请求路径',
`ca_config_path` varchar(128) DEFAULT NULL COMMENT 'ca配置文件路径',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`runtype` int(11) DEFAULT NULL COMMENT '运行方式(0-bin 1-docker)',
`docker_images` varchar(128) DEFAULT NULL COMMENT 'docker镜像名称',
`docker_images_config` text COMMENT 'docker镜镜像配置信息',
`server_ipaddress` varchar(64) DEFAULT NULL COMMENT '运行服务器',
`docker_ipaddress` varchar(64) DEFAULT NULL COMMENT 'content地址',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='组织中的CA服务器';

-- ----------------------------
--  Table structure for `fabricnetwork`
-- ----------------------------
DROP TABLE IF EXISTS `fabricnetwork`;
CREATE TABLE `fabricnetwork` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT,
`orgs` int(11) DEFAULT NULL COMMENT '组织数',
`orderers` int(11) DEFAULT NULL COMMENT 'orderer数',
`fabric_cas` int(11) DEFAULT NULL COMMENT 'ca数目',
`peers` int(11) DEFAULT NULL COMMENT 'peer数目',
`channels` int(11) NOT NULL COMMENT '账本数目',
`blocks` int(11) DEFAULT NULL COMMENT '区块数',
`chaincodes` int(11) DEFAULT NULL COMMENT '链码数',
`txcount` int(11) DEFAULT NULL COMMENT '交易数',
`keysets` int(11) DEFAULT NULL COMMENT 'key数',
`account_certs` int(11) DEFAULT NULL COMMENT '账号证书数',
PRIMARY KEY (`pkid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='fabric网络中的服务器';

-- ----------------------------
--  Records of `fabricnetwork`
-- ----------------------------
BEGIN;
INSERT INTO `fabricnetwork` VALUES ('1', '4', '0', '0', '1', '7', '109', '21', '147', '23', '7');
COMMIT;
-- ----------------------------
--  Table structure for `fabricnetwork_copy`
-- ----------------------------
DROP TABLE IF EXISTS `fabricnetwork_copy`;
CREATE TABLE `fabricnetwork_copy` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT,
`orgs` int(11) DEFAULT NULL COMMENT '组织数',
`orderers` int(11) DEFAULT NULL COMMENT 'orderer数',
`fabric_cas` int(11) DEFAULT NULL COMMENT 'ca数目',
`peers` int(11) DEFAULT NULL COMMENT 'peer数目',
`channels` int(11) NOT NULL COMMENT '账本数目',
`blocks` int(11) DEFAULT NULL COMMENT '区块数',
`chaincodes` int(11) DEFAULT NULL COMMENT '链码数',
`txcount` int(11) DEFAULT NULL COMMENT '交易数',
`keysets` int(11) DEFAULT NULL COMMENT 'key数',
`account_certs` int(11) DEFAULT NULL COMMENT '账号证书数',
PRIMARY KEY (`pkid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='fabric网络中的服务器';

-- ----------------------------
--  Table structure for `keyset`
-- ----------------------------
DROP TABLE IF EXISTS `keyset`;
CREATE TABLE `keyset` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`channel_id` varchar(128) DEFAULT NULL COMMENT '账本名称',
`blocknum` int(11) DEFAULT NULL COMMENT '区块编号',
`blockhash` varchar(128) DEFAULT NULL COMMENT '区块哈希值',
`transactionhash` varchar(255) DEFAULT NULL COMMENT '交易哈希值',
`keyname` varchar(128) DEFAULT NULL COMMENT 'key名称',
`keyset_createdt` datetime(3) DEFAULT NULL,
`isdelete` int(11) DEFAULT NULL COMMENT '是否删除',
`valuess` text COMMENT '值',
`chaincode_name` varchar(64) DEFAULT NULL COMMENT '链码',
`chaincodeversion` varchar(32) DEFAULT NULL COMMENT '链码版本',
`trandtstr` varchar(128) DEFAULT NULL COMMENT '交易地址',
`transnums` int(11) DEFAULT NULL COMMENT '交易数目',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
`txcreatedt_str` varchar(64) DEFAULT NULL,
`txcreatedt` datetime DEFAULT NULL,
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=2190 DEFAULT CHARSET=utf8 COMMENT='账本中存储的key';

-- ----------------------------
--  Table structure for `keyset_history`
-- ----------------------------
DROP TABLE IF EXISTS `keyset_history`;
CREATE TABLE `keyset_history` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`channel_id` varchar(128) DEFAULT NULL COMMENT '账本名称',
`blocknum` int(11) DEFAULT NULL COMMENT '区块编号',
`blockhash` varchar(128) DEFAULT NULL COMMENT '区块哈希值',
`transactionhash` varchar(255) DEFAULT NULL COMMENT '交易哈希值',
`keyname` varchar(128) DEFAULT NULL COMMENT 'key名称',
`valuess` text COMMENT '值',
`trandtstr` varchar(64) DEFAULT NULL COMMENT '交易地址',
`chaincode_name` varchar(64) DEFAULT NULL COMMENT '链码',
`chaincodeversion` varchar(32) DEFAULT NULL COMMENT '链码版本',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
`txcreatedt_str` varchar(64) DEFAULT NULL,
`txcreatedt` datetime DEFAULT NULL,
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=17605 DEFAULT CHARSET=utf8 COMMENT='账本中存储的key的历史记录';

-- ----------------------------
--  Table structure for `keyset_ref_account`
-- ----------------------------
DROP TABLE IF EXISTS `keyset_ref_account`;
CREATE TABLE `keyset_ref_account` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT,
`channel_id` varchar(32) DEFAULT NULL COMMENT '账本编号',
`chaincode_name` varchar(32) DEFAULT NULL COMMENT 'chaincode名称',
`cc_version` varchar(32) DEFAULT NULL COMMENT 'chaincode版本',
`keyset_name` varchar(64) DEFAULT NULL COMMENT 'keyset名称',
`account_cert_md5` varchar(64) DEFAULT NULL COMMENT '账号md5编码',
`account_types` varchar(255) DEFAULT NULL COMMENT '签名账号在交易的作用类型（0-背书 1-创建  2-签名）',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=17932 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='交易和背书人直接的关系';

-- ----------------------------
--  Table structure for `orderer`
-- ----------------------------
DROP TABLE IF EXISTS `orderer`;
CREATE TABLE `orderer` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`orderer_name` varchar(64) DEFAULT NULL COMMENT 'orderer节点的名称',
`comments` varchar(64) DEFAULT NULL COMMENT 'orderer节点的别名',
`orderer_config` text COMMENT '配置文件',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`orderer_mspid` varchar(32) DEFAULT NULL COMMENT 'orderer的组织编号',
`url` varchar(128) DEFAULT NULL COMMENT '访问地址',
`tls_cacerts` text COMMENT 'TLS加密证书',
`runtype` int(11) DEFAULT NULL COMMENT '运行方式(0-bin 1-docker)',
`docker_images` varchar(128) DEFAULT NULL COMMENT 'docker镜像名称',
`docker_images_config` text COMMENT 'docker镜镜像配置信息',
`server_ipaddress` varchar(64) DEFAULT NULL COMMENT '运行服务器',
`docker_ipaddress` varchar(64) DEFAULT NULL COMMENT 'content地址',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='orderer节点打包服务';

-- ----------------------------
--  Table structure for `org_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS `org_ref_channel`;
CREATE TABLE `org_ref_channel` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`mspid` varchar(64) DEFAULT NULL COMMENT '组织编号',
`channel_id` varchar(64) DEFAULT NULL COMMENT '账本编号',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=1497 DEFAULT CHARSET=utf8 COMMENT='组织和通道的关联关系';

-- ----------------------------
--  Table structure for `organization`
-- ----------------------------
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`name` varchar(128) DEFAULT NULL COMMENT '名称',
`comments` varchar(64) DEFAULT NULL COMMENT '组织的别名',
`mspid` varchar(128) DEFAULT NULL COMMENT '组织编号',
`adminkey` text COMMENT '管理员私钥',
`admincert` text COMMENT '管理员证书',
`cacerts` text COMMENT '组织的签名证书',
`cacerts_json` text COMMENT '组织签名证书的解析',
`admins_scert` text,
`admins_scert_json` text,
`tls_root_certs` text,
`tls_root_certs_json` text,
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
`fabric_cas` int(11) DEFAULT NULL,
`peers` int(11) DEFAULT NULL,
`channels` int(11) DEFAULT NULL,
`blocks` int(11) DEFAULT NULL,
`chaincodes` int(11) DEFAULT NULL,
`txcount` int(11) DEFAULT NULL,
`keysets` int(11) DEFAULT NULL,
`account_certs` int(11) DEFAULT NULL,
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='组织';

-- ----------------------------
--  Table structure for `organization_endorser`
-- ----------------------------
DROP TABLE IF EXISTS `organization_endorser`;
CREATE TABLE `organization_endorser` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT,
`mspid` varchar(64) DEFAULT NULL COMMENT '组织编号',
`account_name` varchar(255) DEFAULT NULL COMMENT '账号名称',
`account_cacerts` text COMMENT '账号签名',
`account_cacerts_parser` text COMMENT '账号签名的解析',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='组织中的背书账号';

-- ----------------------------
--  Table structure for `peer`
-- ----------------------------
DROP TABLE IF EXISTS `peer`;
CREATE TABLE `peer` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`mspid` varchar(128) DEFAULT NULL COMMENT '组织编号',
`name` varchar(64) DEFAULT NULL COMMENT '名称',
`comments` varchar(65) DEFAULT NULL COMMENT 'peer节点的别名',
`requests` varchar(64) DEFAULT NULL COMMENT '请求地址',
`events` varchar(64) DEFAULT NULL COMMENT '事件',
`serverhostname` varchar(64) DEFAULT NULL COMMENT 'serverhostname',
`tls_value` int(1) DEFAULT NULL COMMENT '是否采用TLS的通信方式1-是 0-否',
`tls_cacerts` text COMMENT 'TLS通信证书',
`peer_config` varchar(128) DEFAULT NULL COMMENT 'peer配置文件路径',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`runtype` int(11) DEFAULT NULL COMMENT '运行方式(0-bin 1-docker)',
`docker_images` varchar(128) DEFAULT NULL COMMENT 'docker镜像名称',
`docker_images_config` text COMMENT 'docker镜镜像配置信息',
`server_ipaddress` varchar(64) DEFAULT NULL COMMENT '运行服务器',
`docker_ipaddress` varchar(64) DEFAULT NULL COMMENT 'content地址',
`channels` int(11) DEFAULT NULL COMMENT 'peer节点加入的channel数目',
`blocks` int(255) DEFAULT NULL COMMENT '区块数',
`chaincodes` int(11) DEFAULT NULL COMMENT 'peer节点中包含的chaincodes',
`txcount` int(255) DEFAULT NULL COMMENT '交易数',
`keysets` int(255) DEFAULT NULL COMMENT 'keyset数',
`account_certs` int(255) DEFAULT NULL COMMENT '签名账号数',
`remark` text COMMENT '备注',
`versions` varchar(32) DEFAULT NULL COMMENT 'peer节点程序的版本号',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='peer节点';

-- ----------------------------
--  Table structure for `peer_ref_chaincode`
-- ----------------------------
DROP TABLE IF EXISTS `peer_ref_chaincode`;
CREATE TABLE `peer_ref_chaincode` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`peer_name` varchar(64) DEFAULT NULL COMMENT '名称',
`chaincode_name` varchar(64) DEFAULT NULL COMMENT '链码名称',
`chaincode_version` varchar(32) DEFAULT NULL COMMENT '链码版本',
`channel_id` varchar(64) DEFAULT NULL COMMENT '通道名称',
`ccstatus` int(11) DEFAULT NULL COMMENT 'chaincode状态',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=1504 DEFAULT CHARSET=utf8 COMMENT='peer节点和链码的关系';

-- ----------------------------
--  Table structure for `peer_ref_channel`
-- ----------------------------
DROP TABLE IF EXISTS `peer_ref_channel`;
CREATE TABLE `peer_ref_channel` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`peer_name` varchar(64) DEFAULT NULL COMMENT '名称',
`channel_id` varchar(64) DEFAULT NULL COMMENT '账本名称',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=611 DEFAULT CHARSET=utf8 COMMENT='peer节点和通道的关系';

-- ----------------------------
--  Table structure for `servers`
-- ----------------------------
DROP TABLE IF EXISTS `servers`;
CREATE TABLE `servers` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`ipaddress` varchar(128) DEFAULT NULL COMMENT 'IP地址',
`docker_service_port` varchar(16) DEFAULT NULL COMMENT 'docker服务端口',
`name` varchar(64) DEFAULT NULL COMMENT '服务器名称',
`remark` text COMMENT '备注',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COMMENT='网络中的服务器';

-- ----------------------------
--  Table structure for `sys_logger`
-- ----------------------------
DROP TABLE IF EXISTS `sys_logger`;
CREATE TABLE `sys_logger` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`operatetime` date DEFAULT NULL COMMENT '操作时间',
`modulename` varchar(128) DEFAULT NULL COMMENT '模块名称',
`permissiondesc` varchar(128) DEFAULT NULL COMMENT '权限名',
`loginname` varchar(128) DEFAULT NULL COMMENT '登陆名',
`optresult` varchar(128) DEFAULT NULL COMMENT '操作结果',
`remark` varchar(128) DEFAULT NULL COMMENT '备注',
`loggertype` varchar(1) DEFAULT NULL COMMENT '日志类型',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统日志';

-- ----------------------------
--  Table structure for `sys_opermodule`
-- ----------------------------
DROP TABLE IF EXISTS `sys_opermodule`;
CREATE TABLE `sys_opermodule` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`name` varchar(64) DEFAULT NULL COMMENT '功能名称',
`restype` varchar(64) DEFAULT NULL COMMENT '功能类型',
`resstring` varchar(64) DEFAULT NULL COMMENT '功能字符串',
`url` varchar(240) DEFAULT NULL COMMENT '操作路径',
`descn` varchar(128) DEFAULT NULL COMMENT '功能描述',
`parentid` int(11) DEFAULT NULL COMMENT '父项编号',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统功能点';

-- ----------------------------
--  Table structure for `sys_roleoper`
-- ----------------------------
DROP TABLE IF EXISTS `sys_roleoper`;
CREATE TABLE `sys_roleoper` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`roleid` int(11) DEFAULT NULL COMMENT '角色编号',
`functionid` int(11) DEFAULT NULL COMMENT '功能编号',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='角色中所包含的功能点';

-- ----------------------------
--  Table structure for `sys_roles`
-- ----------------------------
DROP TABLE IF EXISTS `sys_roles`;
CREATE TABLE `sys_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`name` varchar(128) DEFAULT NULL COMMENT '角色名称',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='角色';

-- ----------------------------
--  Table structure for `sys_sysbook`
-- ----------------------------
DROP TABLE IF EXISTS `sys_sysbook`;
CREATE TABLE `sys_sysbook` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`modelname` varchar(32) DEFAULT NULL COMMENT '模块',
`property` varchar(64) DEFAULT NULL COMMENT '属性名',
`mark` varchar(32) DEFAULT NULL COMMENT '掩码',
`value` varchar(128) DEFAULT NULL COMMENT '掩码值',
`remark` varchar(64) DEFAULT NULL COMMENT '备注',
`extendvalue` text COMMENT '属性扩展值',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统参数表';

-- ----------------------------
--  Table structure for `sys_systeminfo`
-- ----------------------------
DROP TABLE IF EXISTS `sys_systeminfo`;
CREATE TABLE `sys_systeminfo` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`name` varchar(128) DEFAULT NULL COMMENT '系统名称',
`websiteurl` varchar(128) DEFAULT NULL COMMENT '系统网站',
`servicephone` varchar(128) DEFAULT NULL COMMENT '服务电话',
`maxcode` varchar(128) DEFAULT NULL COMMENT '传真',
`serviceemail` varchar(128) DEFAULT NULL COMMENT '服务邮箱',
`linkman` varchar(128) DEFAULT NULL COMMENT '联系人',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统信息';

-- ----------------------------
--  Table structure for `sys_systemmodula`
-- ----------------------------
DROP TABLE IF EXISTS `sys_systemmodula`;
CREATE TABLE `sys_systemmodula` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`modulename` varchar(128) DEFAULT NULL COMMENT '模块名称',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统所包含的模块';

-- ----------------------------
--  Table structure for `sys_users`
-- ----------------------------
DROP TABLE IF EXISTS `sys_users`;
CREATE TABLE `sys_users` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`loginname` varchar(128) DEFAULT NULL COMMENT '登陆编号',
`passwd` varchar(254) DEFAULT NULL COMMENT '密码',
`name` varchar(16) DEFAULT NULL COMMENT '姓名',
`email` varchar(64) DEFAULT NULL COMMENT 'email',
`statuscode` varchar(1) DEFAULT NULL COMMENT '状态',
`remark` varchar(254) DEFAULT NULL COMMENT '备注',
`createdate` datetime DEFAULT NULL COMMENT '创建时间',
`modifyuser` int(11) DEFAULT NULL COMMENT '更新者',
`modifydatetime` datetime DEFAULT NULL COMMENT '更新时间',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='系统管理用户';

-- ----------------------------
--  Table structure for `sys_usersrole`
-- ----------------------------
DROP TABLE IF EXISTS `sys_usersrole`;
CREATE TABLE `sys_usersrole` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT '编号',
`accountid` int(11) DEFAULT NULL COMMENT '用户编号',
`roleid` int(11) DEFAULT NULL COMMENT '角色编号',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='用户所拥有的角色';

-- ----------------------------
--  Table structure for `trans_ref_account`
-- ----------------------------
DROP TABLE IF EXISTS `trans_ref_account`;
CREATE TABLE `trans_ref_account` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT,
`channel_id` varchar(32) DEFAULT NULL,
`chaincode_name` varchar(32) DEFAULT NULL COMMENT 'chaincode名称',
`cc_version` varchar(32) DEFAULT NULL,
`transhash` varchar(64) DEFAULT NULL COMMENT '交易的hash值',
`account_cert_md5` varchar(64) DEFAULT NULL,
`account_types` varchar(255) DEFAULT NULL COMMENT '签名账号在交易的作用类型（0-背书 1-创建  2-签名）',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=37670 DEFAULT CHARSET=utf8 COMMENT='交易和背书人直接的关系';

-- ----------------------------
--  Table structure for `transactions`
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `pkid` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
`channel_id` varchar(128) DEFAULT NULL COMMENT '账本名称',
`blocknum` varchar(128) DEFAULT NULL COMMENT '区块编号',
`blockhash` varchar(128) DEFAULT NULL COMMENT '区块哈希值',
`txhash` varchar(256) DEFAULT NULL COMMENT '交易哈希值',
`tx_detail` text COMMENT '交易详细信息',
`txcreatedt` datetime(3) DEFAULT NULL COMMENT '交易创建时间',
`txcreatedt_year` varchar(4) DEFAULT NULL,
`txcreatedt_month` varchar(2) DEFAULT NULL,
`txcreatedt_day` varchar(2) DEFAULT NULL,
`txcreatedt_h` varchar(2) DEFAULT NULL,
`txcreatedt_m` varchar(2) DEFAULT NULL,
`txcreatedt_s` varchar(2) DEFAULT NULL,
`txcreatedt_str` varchar(64) DEFAULT NULL COMMENT '交易创建时间字符串',
`txlanguage` varchar(32) DEFAULT NULL COMMENT '交易开发语言',
`chaincode_name` varchar(128) DEFAULT NULL COMMENT '链码名称',
`chaincodeversion` varchar(32) DEFAULT NULL COMMENT '链码版本',
`validationcode` int(11) DEFAULT NULL COMMENT '交易的最终状态',
`cc_name_created` varchar(128) DEFAULT NULL COMMENT '当前交易为创建CC的交易时，本字段表示被创建CC的名字',
`cc_version_created` varchar(32) DEFAULT NULL COMMENT '当前交易为创建CC的交易时，本字段表示被创建CC的VERSION',
`createdt` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`remark` text COMMENT '备注',
PRIMARY KEY (`pkid`)
) ENGINE=MyISAM AUTO_INCREMENT=12494 DEFAULT CHARSET=utf8 COMMENT='交易';

SET FOREIGN_KEY_CHECKS = 1;
