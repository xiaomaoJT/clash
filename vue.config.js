// vue.config.js 配置说明
// 官方vue.config.js 参考文档 https://cli.vuejs.org/zh/config/#css-loaderoptions

// ---------------------------------------------------------------------------
// 订阅链接本地代理（devServer 中间件 /sub-fetch?url=xxx）
//
// 为什么需要它：
//  1. 机场订阅接口通常不返回 Access-Control-Allow-Origin，浏览器无法跨域直取；
//  2. 部分机场按 User-Agent 下发不同格式 —— mihomo 的 UA 返回 base64 分享链接，
//     Clash 客户端 UA 才返回 Clash YAML。
// 因此统一由 Node 侧代为请求，再把内容回传给页面。
// ---------------------------------------------------------------------------
const nodeHttps = require("https");
const nodeHttp = require("http");

const CLASH_UA = "clash-verge/v1.7.7";
const SUB_TIMEOUT = 30000;
const SUB_MAX_REDIRECT = 5;

function fetchSubscriptionText(target, redirects = 0) {
  return new Promise((resolve, reject) => {
    let u;
    try {
      u = new URL(target);
    } catch (e) {
      return reject(new Error("订阅链接格式不正确"));
    }
    if (!/^https?:$/.test(u.protocol)) {
      return reject(new Error("只支持 http/https 链接"));
    }
    const mod = u.protocol === "https:" ? nodeHttps : nodeHttp;
    const req = mod.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method: "GET",
        rejectUnauthorized: false, // 机场自签证书兜底
        headers: { "User-Agent": CLASH_UA, Accept: "*/*" },
        timeout: SUB_TIMEOUT,
      },
      (resp) => {
        const code = resp.statusCode || 0;
        if (
          [301, 302, 303, 307, 308].includes(code) &&
          resp.headers.location &&
          redirects < SUB_MAX_REDIRECT
        ) {
          resp.resume();
          const next = new URL(resp.headers.location, target).toString();
          return fetchSubscriptionText(next, redirects + 1).then(
            resolve,
            reject
          );
        }
        if (code !== 200) {
          resp.resume();
          return reject(new Error("订阅返回状态码 " + code));
        }
        const chunks = [];
        resp.on("data", (c) => chunks.push(c));
        resp.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      }
    );
    req.on("timeout", () => req.destroy(new Error("请求超时（30s）")));
    req.on("error", (e) => reject(e));
    req.end();
  });
}

function subFetchMiddleware(req, res, next) {
  const raw = req.url || "";
  if (raw.split("?")[0] !== "/sub-fetch") return next();

  const query = raw.indexOf("?") === -1 ? "" : raw.slice(raw.indexOf("?") + 1);
  const target = new URLSearchParams(query).get("url");

  const send = (code, body) => {
    res.writeHead(code, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(body));
  };

  if (req.method === "OPTIONS") return send(200, { ok: true });
  if (!target) return send(400, { ok: false, error: "缺少 url 参数" });

  fetchSubscriptionText(target).then(
    (text) => send(200, { ok: true, text }),
    (err) => send(502, { ok: false, error: (err && err.message) || "拉取失败" })
  );
}

module.exports = {
  // 部署生产环境和开发环境下的URL。
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
  // 例如 https://www.my-app.com/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 baseUrl 为 /my-app/。
  // baseUrl 从 Vue CLI 3.3 起已弃用，请使用publicPath
  // baseUrl: process.env.NODE_ENV === "production" ? "./" : "/",
  publicPath: "./" ,
  // outputDir: 在npm run build 或 yarn build 时 ，生成文件的目录名称
  outputDir: "xiaomao-clash",
  // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
  assetsDir: "assets",
  // 指定生成的 index.html 的输出路径  (打包之后，改变系统默认的index.html的文件名)
  // indexPath: "myIndex.html",
  // 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存。你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变)
  filenameHashing: false,

  //   lintOnSave：{ type:Boolean default:true } 问你是否使用eslint
  lintOnSave: false,
  // 如果你想要在生产构建时禁用 eslint-loader，你可以用如下配置
  // lintOnSave: process.env.NODE_ENV !== 'production',
  // 是否使用包含运行时编译器的 Vue 构建版本。设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。(默认false)
  // runtimeCompiler: false,

  /**
   * 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
   *  打包之后发现map文件过大，项目文件体积很大，设置为false就可以不输出map文件
   *  map文件的作用在于：项目打包后，代码都是经过压缩加密的，如果运行时报错，输出的错误信息无法准确得知是哪里的代码报错。
   *  有了map就可以像未加密的代码一样，准确的输出是哪一行哪一列有错。
   * */
  productionSourceMap: false,

  pwa: {
    iconPaths: {
      favicon32: "favicon.ico",
      favicon16: "favicon.ico",
      appleTouchIcon: "favicon.ico",
      maskIcon: "favicon.ico",
      msTileImage: "favicon.ico",
    },
  },

  // 它支持webPack-dev-server的所有选项
  devServer: {
    host: "0.0.0.0",
    port: 5555, // 端口号 注意代理时端口是否被占用
    https: false, // https:{type:Boolean}
    open: false, // 配置自动启动浏览器
    // 挂载订阅链接本地代理 /sub-fetch?url=xxx
    ...(function () {
      let major = 5;
      try {
        major = parseInt(
          require("webpack-dev-server/package.json").version.split(".")[0],
          10
        );
      } catch (e) {
        major = 5;
      }
      return major >= 5
        ? {
            setupMiddlewares: (middlewares) => {
              middlewares.unshift({
                name: "sub-fetch-proxy",
                middleware: subFetchMiddleware,
              });
              return middlewares;
            },
          }
        : {
            onBeforeSetupMiddleware: (devServer) => {
              if (devServer && devServer.app) {
                devServer.app.use(subFetchMiddleware);
              }
            },
          };
    })(),
  },
};
