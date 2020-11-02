# cloudflare-ddns

## 功能说明

对于没有 IP-v4 公网 IP 的同学，可以使用 IP-v6 来访问家里的群晖或者nextcloud服务。

## 路由器配置

首先你需要路由器开启 ip-v6 支持。如下是 openwrt 配置

1. 网络 => 接口 => LAN里设置 => 一般配置 => 基本设置

- IPV6分配长度，64
- IPV6后缀，::1

2. 一般配置 => 高级设置

- 使用内置的IPV6管理，勾选

3. DHCP服务器 => IPV6设置

- 路由通告服务，混合模式
- DHCPv6 服务，混合模式
- NDP 代理，混合模式
- DHCPv6 模式，无状态的 + 有状态

## cloudFlare 配置

- 登陆dashboard，打开你的域名，在侧边可以看到你的 zone id . 点击 Get You API Token 可以找到你的API token

## 脚本配置

clone 代码， 进入代码目录，新增一个 .env 文件， 内容如下：

```
ZONE_ID=在域名的首页右侧可以找到
AUTH_EMAIL= 你的 cloudFlare 账号 email
AUTH_KEY=你的 cloudFlare API key
DOMAIN=你的域名，比如 ddns.xxx.com
DOMAIN_TYPE=如果是 ip-v4 那么设置为 A， 默认为 AAAA ， ip-v6
COMMAND=获取ip 用到的 shell 命令（ 由于每个人的情况不一样，请自己编写好获取 IP  的shell 脚本
SCKEY= server酱的key . 具体使用 google 一下哦

```

## 运行脚本

- `yarn` or `npm install`
- `node index.js`






