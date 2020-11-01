# cloudflare-ddns

## 功能说明

对于没有 IP-v4 公网 IP 的同学，可以使用 IP-v6 来访问家里的群晖或者nextcloud服务。

## 路由器配置

首先你需要路由器开启 ip-v6 支持。下面的 openwrt 的配置说明

网络-接口-LAN里设置
一般配置-基本设置
IPV6分配长度，64
IPV6后缀，::1
一般配置-高级设置
使用内置的IPV6管理，勾选

DHCP服务器-IPV6设置
路由通告服务，混合模式
DHCPv6 服务，混合模式
NDP 代理，混合模式
DHCPv6 模式，无状态的 + 有状态

## cloudFlare 配置

- 登陆dashboard，打开你的域名，在侧边可以看到你的 zone id . 点击 Get You API Token 可以找到你的API token
- 增加一条 DNS record , 类型为 AAAA , 随便填写一个 ip v6 地址，点击保存
- clone 代码， 进入代码目录，新增一个 .env 文件， 内容如下

```
ZONE_ID=在域名的首页右侧可以找到
DNS_RECORD_ID=需要运行 `node dns_records.js` 来获取
SCKEY= server酱的key . 具体使用 google 一下哦
AUTH_EMAIL= 你的 cloudFlare 账号 email
AUTH_KEY=你的 cloudFlare API key
DOMAIN=你的域名，比如 ddns.xxx.com

```
- 填写 `ZONE_ID` `AUTH_EMAIL` 和 `AUTH_KEY` `DOMAIN`
- 运行 `npm install`
- 运行 `node dns_records.js` 找到你的 DNS RECORD ID， 并填写到 `.env` 文件中

## 脚本的其他配置

- 修改你获取 IP 地址的 shell 脚本，由于每个人的情况不一样，请自己编写好获取 IP  的shell 脚本，替换代码中原始的shell 脚本
- 运行脚本 `node index.js`






