/**
 * XiaoMao Clash 配置模型（XMC@3.0）
 *
 * 目标格式：与 "订阅为底稿 + 自定义策略" 的静态版配置一致
 *  - 底稿：保留上传订阅自身的 dns / hosts / experimental / cfw-* 等顶层配置
 *  - 策略组：🌏S.全球策略 / 🎲S.手动选择 / 🏳️‍🌈U.全部节点 置顶，
 *            🦉S.GitHub服务 / 🌈S.谷歌服务 紧随，地区 url-test 组在后
 *  - 规则源：9 个规则集，默认 cdn.jsdmirror.com 镜像，支持自定义前缀
 */

// 信息占位节点（剩余流量 / 套餐到期 / 过滤线路等），不参与地区分组与自动测速
export const INFO_NODE_RE =
  /(剩余|流量|套餐|到期|重置|过期|时间|过滤|线路|Bandwidth|Expire|Traffic|expire|traffic)/i;

// 地区策略定义：strategy 与 home.vue 的 checkProxyList 对应，key 为节点数组字段
export const REGION_DEFS = [
  { strategy: "香港策略", flag: "🇭🇰", key: "hk_node", accent: "hk" },
  { strategy: "台湾策略", flag: "🇨🇳", key: "tw_node", accent: "tw" },
  { strategy: "新加坡策略", flag: "🇸🇬", key: "sg_node", accent: "sg" },
  { strategy: "美国策略", flag: "🇺🇸", key: "us_node", accent: "us" },
  { strategy: "日本策略", flag: "🇯🇵", key: "jp_node", accent: "jp" },
  { strategy: "英国策略", flag: "🇬🇧", key: "uk_node", accent: "uk" },
  { strategy: "韩国策略", flag: "🇰🇷", key: "kr_node", accent: "kr" },
  { strategy: "大陆策略", flag: "🇨🇳", key: "cn_node", accent: "cn" },
  { strategy: "其他策略", flag: "🏁", key: "other_node", accent: "other" },
];

// 9 个规则集：gh 为 "用户/仓库@分支/路径" 形式，可拼接 CDN 或 raw 直链
export const RULE_SETS = [
  {
    name: "ShuntCorrection",
    behavior: "classical",
    gh: "xiaomaoJT/QxScript@main/filter/ShuntCorrection.yaml",
  },
  {
    name: "Direct",
    behavior: "domain",
    gh: "Loyalsoldier/clash-rules@release/direct.txt",
  },
  {
    name: "AdvertisingLite",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/AdvertisingLite/AdvertisingLite_Classical.yaml",
  },
  {
    name: "Hijacking",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/Hijacking/Hijacking.yaml",
  },
  {
    name: "Privacy",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/Privacy/Privacy_Classical.yaml",
  },
  {
    name: "GitHub",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/GitHub/GitHub.yaml",
  },
  {
    name: "Google",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml",
  },
  {
    name: "Streaming",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/GlobalMedia/GlobalMedia_Classical.yaml",
  },
  {
    name: "Global",
    behavior: "domain",
    gh: "blackmatrix7/ios_rule_script@master/rule/Clash/Global/Global_Classical.yaml",
  },
];

// 兜底基础配置（订阅缺少 dns 等字段时使用，字段会被订阅值覆盖）
export const DEFAULT_BASE = {
  "mixed-port": 7890,
  "allow-lan": true,
  "bind-address": "*",
  mode: "rule",
  "log-level": "info",
  "external-controller": "127.0.0.1:9090",
  dns: {
    enable: true,
    listen: "127.0.0.1:53",
    ipv6: false,
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "28.0.0.1/8",
    "fake-ip-filter": [
      "+.lan",
      "+.cn",
      "+.10010.com",
      "+.chinaunicom.com",
      "*.alipay.com",
      "*.alipayobjects.com",
      "connect.rom.miui.com",
      "localhost.ptlogin2.qq.com",
      "+.stun.*.*",
      "+.stun.*.*.*",
      "+.stun.*.*.*.*",
      "+.stun.*.*.*.*.*",
      "*.n.n.srv.nintendo.net",
      "+.stun.playstation.net",
      "*.msftncsi.com",
      "*.msftconnecttest.com",
      "ntp.ntsc.ac.cn",
    ],
    nameserver: [
      "https://doh.pub/dns-query",
      "https://dns.alidns.com/dns-query",
    ],
    fallback: ["tls://8.8.4.4", "https://dns.twnic.tw/dns-query"],
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4", "0.0.0.0/32"],
    },
  },
};

/**
 * 以订阅为底稿构建基础配置：保留 dns/hosts/experimental/cfw-* 等，
 * 仅剔除 proxies / proxy-groups / rules / rule-providers 四段。
 */
export const buildBaseConfig = (subDoc) => {
  const base = JSON.parse(JSON.stringify(DEFAULT_BASE));
  if (subDoc && typeof subDoc === "object") {
    const doc = JSON.parse(JSON.stringify(subDoc));
    delete doc.proxies;
    delete doc["proxy-groups"];
    delete doc.rules;
    delete doc["rule-providers"];
    delete doc["proxy-providers"];
    Object.assign(base, doc);
  }
  base.mode = "rule";
  if (!base["log-level"]) base["log-level"] = "info";
  return base;
};

/**
 * 根据规则源类型生成 rule-providers。
 * mode: "jsdmirror"(默认) | "jsdelivr" | "github" | "custom"
 */
export const buildRuleProviders = (mode = "jsdmirror", customPrefix = "") => {
  const providers = {};
  RULE_SETS.forEach((rs) => {
    let url = "";
    if (mode === "github") {
      // user/repo@branch/path -> raw 直链
      const m = rs.gh.match(/^([^/]+)\/([^@]+)@([^/]+)\/(.+)$/);
      url = `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
    } else {
      let prefix = "https://cdn.jsdmirror.com";
      if (mode === "jsdelivr") prefix = "https://cdn.jsdelivr.net";
      if (mode === "custom" && customPrefix) {
        prefix = customPrefix.trim().replace(/\/+$/, "");
      }
      url = `${prefix}/gh/${rs.gh}`;
    }
    providers[rs.name] = {
      type: "http",
      behavior: rs.behavior,
      url: url,
      path: `./ruleset/${rs.name}.yaml`,
      interval: 216000,
    };
  });
  return providers;
};

/**
 * 构建固定策略组（全球/手动/全部置顶，GitHub/谷歌服务紧随）。
 * regionNames: 地区组名数组（如 ["🇭🇰U.香港策略", ...]）
 * nodeNames:   全部真实节点名（不含信息节点）→ 全部节点 url-test
 * manualNames: 手动选择候选（真实节点 + 信息节点）
 */
export const buildFixedGroups = (regionNames, nodeNames, manualNames) => {
  const groups = [
    {
      name: "🌏S.全球策略",
      type: "select",
      proxies: [
        "DIRECT",
        "🏳️‍🌈U.全部节点",
        ...regionNames,
        "🎲S.手动选择",
        "REJECT",
      ],
    },
    {
      name: "🎲S.手动选择",
      type: "select",
      proxies: ["DIRECT", ...manualNames, "REJECT"],
    },
    {
      name: "🏳️‍🌈U.全部节点",
      type: "url-test",
      proxies: [...nodeNames],
      url: "http://captive.apple.com/",
      interval: 216000,
    },
    {
      name: "🦉S.GitHub服务",
      type: "select",
      proxies: [
        ...regionNames,
        "DIRECT",
        "🌏S.全球策略",
        "🏳️‍🌈U.全部节点",
        "🎲S.手动选择",
        "REJECT",
      ],
    },
    {
      name: "🌈S.谷歌服务",
      type: "select",
      proxies: [
        "🌏S.全球策略",
        ...regionNames,
        "🏳️‍🌈U.全部节点",
        "🎲S.手动选择",
        "DIRECT",
        "REJECT",
      ],
    },
  ];
  return groups;
};

// 默认规则（与 9 个规则集 + 分流目标对应）
export const buildRules = () => [
  "RULE-SET,ShuntCorrection,DIRECT",
  "RULE-SET,Direct,DIRECT",
  "RULE-SET,AdvertisingLite,REJECT",
  "RULE-SET,Hijacking,REJECT",
  "RULE-SET,Privacy,REJECT",
  "RULE-SET,GitHub,🦉S.GitHub服务",
  "RULE-SET,Google,🌈S.谷歌服务",
  "RULE-SET,Streaming,🌏S.全球策略",
  "RULE-SET,Global,🌏S.全球策略",
  "GEOIP,CN,DIRECT",
  "MATCH,🌏S.全球策略",
];
