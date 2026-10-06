# xiaomao-clash

用于 XiaoMao_Clash 自定义配置生成。

**当前版本：XMC@2.2 · 2026 重构版**

**最新更新时间：2026 年 10 月 06 日**

[**更新日志**](https://github.com/xiaomaoJT/clash/blob/main/UPDATE.md)

🖼️ [XMC@2.2 更新概览与功能图](./update-overview.png)

------



##### 🎟 XiaoMao频道 · 群组

<div align="center">
<a href="https://t.me/xiaomaoJT" target="_blank">
<img src=https://img.shields.io/badge/Telegram-XiaoMao频道-blue alt=github style="margin-bottom: 5px;" />
</a>
<a href="https://t.me/hSuMjrQppKE5MWU9" target="_blank">
<img src=https://img.shields.io/badge/Telegram-XiaoMao%E7%BE%A4%E8%81%8A-red alt=github style="margin-bottom: 5px;" />
</a>
<a href="https://t.me/Xiao_MaoMao_bot" target="_blank">
<img src=https://img.shields.io/badge/Robot-XiaoMaoBot-orange alt=github style="margin-bottom: 5px;" />
</a>
<a href="https://github.com/xiaomaoJT/xiaomaoJT/blob/main/photo/qrcode.jpg?raw=true" target="_blank">
<img src=https://img.shields.io/badge/WeChat-小帽集团-green alt=github style="margin-bottom: 5px;" />
</a>
</div>
---

#### 线上体验地址：[xiaomao-clash](https://static-mp-4c1955c1-4e3f-4ed7-9f2b-ea2165e28195.next.bspapp.com/xiaomao-clash/index.html#/)

> 须知：因XMC所部署的为临时测试服务器，无法承受大规模的IP访问，若您访问时出现错误，请稍后再试或移步XiaoMaoJT/clash仓库中下载已生成的打包文件，解压后打开xiaomao-clash文件夹，使用浏览器（不支持低内核浏览器，若页面空白，请尝试使用chrome浏览器）访问index.html文件（或将index.html文件拖至浏览器标签栏）即可于本地电脑正常访问，此方式下支持离线访问。感谢您的支持与理解。



------



#### ✨ 2026 重构版 · 新特性（XMC@2.2）

- 🔗 **链接订阅直接解析**：第一步支持粘贴订阅链接（如机场 Clash 订阅），自动拉取并解析，无需再手动上传文件。
- 📝 **书写格式弹窗可选**：生成配置时弹窗选择书写格式，支持 **Clash** 与 **FLClash**（XiaoMao_Clash_MoJie 行内 flow 格式）两种。
- 🎨 **亮色 UI 全面重构**：去除首屏广告弹窗，重做使用教程按钮与各类操作按钮，整体更灵动、可读性更好。
- 🧩 **节点名 / 策略顺序自定义**：节点命名规则、策略组排序均可在页面中自由配置。
- 🖱️ **策略组拖动排序**：策略组顺序支持鼠标拖拽调整，所见即所得。
- 🧭 **步骤条可点可回退**：步骤条支持点击切换步骤，最后一步也可回退修改。
- ☁️ **分流 CDN 前缀可配置**：规则分流的 CDN 前缀默认 `cdn.jsdmirror.com`，支持页面内自定义修改。
- 🧱 **兼容新格式**：兼容 XiaoMao_Clash 静态版，以及基于 `proxy-providers` 的在线更新格式。

------



#### [⛱ 使用教程](https://github.com/xiaomaoJT/clash/tree/main/yaml)

![【帽教程】Clash配置教程](https://github.com/xiaomaoJT/clash/blob/main/【帽教程】Clash配置教程.png?raw=true)

------



#### 🔧 源码与本地开发

本仓库现已包含完整的 Vue 前端源码，可自行构建与二次开发。

```bash
# 1. 安装依赖（首次或依赖变更时）
npm install

# 2. 本地开发预览（默认 http://localhost:5555）
npm run serve
#   · 打开后第一步即可粘贴「订阅链接」直接解析
#   · 订阅解析由 devServer 内置的 /sub-fetch 代理完成，需在本机 npm run serve 下使用

# 3. 构建静态站点（产物输出到 xiaomao-clash/ 目录）
npm run build
```

> **关于订阅链接解析的说明**
> 机场订阅接口通常不返回跨域头（Access-Control-Allow-Origin），浏览器在「纯静态部署」场景下无法直接跨域拉取。
> - 本地开发：`npm run serve` 已内置 `/sub-fetch` 代理，可直接解析；
> - 纯静态部署：可在页面「高级设置」中填写自备的 CORS 代理前缀，或改用「上传配置文件」方式。

------



#### 懒人配置：[🏖 **XiaoMao_Clash 配置 - 科学网**](https://raw.githubusercontent.com/xiaomaoJT/clash/main/yaml/Clash_XiaoMao.yaml)

#### 懒人配置：[🏖 **XiaoMao_Clash 配置 - 国内网**](https://raw.githubusercontent.com/xiaomaoJT/clash/main/yaml/Clash_Cdn_XiaoMao.yaml)

---

#### 将文件夹 xiaomao-clash 部署于服务器或本地即可访问。

- 服务器：`xxxx/xiaomao-clash/index.html`
- 本地：`file:///xxxxx/xiaomao-clash/index.html`
- 也可执行 `npm run build` 后，将 `xiaomao-clash/` 目录整体上传到任意静态空间。

---

#### 有问题请于此仓库提交 Issues。


------

##### 🎟 Github Stats

<div align="left">
<img src="https://github-readme-stats.vercel.app/api?username=xiaomaoJT&show_icons=true&count_private=true&hide_border=true" align="center" style="height:180px;" />
</div>



------

##### 🎟 Visitor Counter

<div align="left">
<img src="https://komarev.com/ghpvc/?username=xiaomaoJT&&style=flat-square" align="center" />
</div>



------------

#### 🎟 ***声明***

- 此项目中仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
- 由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
- 请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
- 此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
- 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
- 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我将在收到认证文件确认后删除此脚本。
- 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
