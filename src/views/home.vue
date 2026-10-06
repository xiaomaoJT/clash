<template>
  <div
    class="container-content"
    v-loading="loading"
    element-loading-text="XiaoMao AI运算中..."
    element-loading-background="rgba(13, 17, 28, 0.85)"
  >
    <div class="page-hero">
      <div class="hero-main">
        <div class="hero-title">⚡ XiaoMao Clash Config</div>
        <div class="hero-sub">机场订阅解析 · 策略组自动生成 · 完全离线无泄漏</div>
        <div class="hero-badges">
          <span class="hero-badge">XMC@3.2</span>
          <span class="hero-badge">订阅为底稿</span>
          <span class="hero-badge">Clash / FLClash 双格式</span>
        </div>
      </div>
      <div class="hero-actions">
        <el-button class="hero-link" @click="tutorialDialogVisible = true">
          📖 使用教程
        </el-button>
        <el-button v-if="activeStep > 0" class="hero-link" @click="goBack">
          ↺ 重新开始
        </el-button>
      </div>
    </div>
    <el-alert
      v-if="activeStep == 0"
      :closable="false"
      title="① 粘贴机场订阅链接，或上传配置文件（.yaml）"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>
    <el-alert
      v-if="activeStep == 1"
      :closable="false"
      title="② 选择要移除的节点与要启用的地区策略"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>
    <el-alert
      v-if="activeStep == 2"
      :closable="false"
      title="③ 检查地区节点组（空策略会自动忽略）"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>
    <el-alert
      v-if="activeStep == 3"
      :closable="false"
      title="④ 选择分流规则源与配置书写格式"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>
    <el-alert
      v-if="activeStep == 4"
      :closable="false"
      title="⑤ 配置已生成，可复制或下载导入客户端"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>
    <el-alert
      v-if="activeStep == 5"
      :closable="false"
      title="感谢使用 XiaoMao_Clash"
      type="warning"
      description="全程浏览器本地解析，不上传任何数据"
    ></el-alert>

    <div class="div-steps">
      <div
        v-for="(item, index) in stepList"
        :key="item"
        class="step-item"
        :class="{
          'is-active': activeStep == index,
          'is-done': activeStep > index,
          'is-visited': index <= maxStep,
        }"
        @click="goStep(index)"
      >
        <span class="step-dot">{{ activeStep > index ? "✓" : index + 1 }}</span>
        <span class="step-text">{{ item }}</span>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="activeStep == 0">
        <div class="content-input">
          <div class="sub-hero" v-if="sliderValue != 100">
            <div class="sub-hero-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3v10m0 0 3.5-3.5M12 13 8.5 9.5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4 14.5V17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2.5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div class="sub-hero-body">
              <div class="sub-hero-head">
                <span class="sub-hero-title">链接订阅</span>
                <span class="sub-hero-desc">粘贴订阅链接一键解析，无需下载文件</span>
                <span
                  class="sub-adv-toggle"
                  @click="showSubAdv = !showSubAdv"
                >
                  {{ showSubAdv ? "收起高级" : "高级" }}
                </span>
              </div>
              <div class="sub-hero-row">
                <div class="sub-input-wrap" :class="{ 'is-focus': subFocused }">
                  <svg class="sub-input-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10.5 13.5a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.2 1.2M13.5 10.5a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.2-1.2"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <input
                    class="sub-input-native"
                    v-model="subUrl"
                    type="text"
                    spellcheck="false"
                    placeholder="https://xxx.com/api/v1/client/subscribe?token=…"
                    @focus="subFocused = true"
                    @blur="subFocused = false"
                    @keyup.enter="parseSubscription"
                  />
                  <button
                    class="sub-go"
                    :class="{ 'is-loading': subLoading }"
                    :disabled="subLoading"
                    @click="parseSubscription"
                  >
                    <span v-if="!subLoading">解析订阅</span>
                    <span v-else class="sub-go-spinner"></span>
                  </button>
                </div>
              </div>
              <div class="sub-adv" v-if="showSubAdv">
                <span class="sub-adv-label">CORS 代理前缀</span>
                <el-input
                  v-model="subProxyPrefix"
                  size="small"
                  placeholder="形如 https://your-proxy/?url= ；本地运行留空即可"
                />
              </div>
              <div class="sub-adv-tip" v-if="showSubAdv">
                本地运行（npm run serve）自动使用内置解析服务；纯静态部署到服务器时浏览器无法绕过订阅接口的跨域限制，可在上方填写自备的 CORS 代理前缀，或改用文件上传
              </div>
              <div class="sub-error" v-if="subError">{{ subError }}</div>
            </div>
          </div>
          <div class="sub-or" v-if="sliderValue != 100">
            <span>或</span>
          </div>
          <div class="input-div" v-if="sliderValue != 100">
            <span class="input-label">上传配置</span>
            <el-upload
              class="input-content input-upload"
              action=""
              :on-change="handleUpload"
              :show-file-list="true"
              multiple
              accept=".yaml,.yam"
              :auto-upload="false"
              drag
            >
              <Upload class="el-icon-upload"></Upload>
              <div class="el-upload__text">
                将文件拖到此处
                <br />
                或
                <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只支持上传 .yaml、.yam 文件，支持多份配置合并
                </div>
              </template>
            </el-upload>
          </div>
          <div class="input-div">
            <span class="input-label">源代码模式</span>
            <el-slider
              class="input-content"
              v-model="sliderValue"
              :show-tooltip="false"
              :min="99"
              :max="100"
            ></el-slider>
          </div>
          <div class="input-div" v-if="sliderValue == 100">
            <span class="input-label">获取示例代码</span>
            <div class="input-content">
              <el-button type="primary" @click="resourceValue = templateYaml">
                获取示例
              </el-button>
              <el-button type="warning" @click="resourceValue = ''">
                清空示例
              </el-button>
            </div>
          </div>
          <div class="input-div">
            <span class="input-label">
              {{ sliderValue == 100 ? "填写配置代码" : "上传的配置" }}
            </span>
            <el-input
              class="input-content"
              type="textarea"
              :rows="16"
              :placeholder="
                sliderValue == 100
                  ? '配置代码必须且只能包含一个proxies参数'
                  : '请上传配置'
              "
              v-model="resourceValue"
            ></el-input>
          </div>
          <div class="input-button">
            <el-button type="primary" size="small" @click="goBack">
              重新开始
            </el-button>
            <el-button type="primary" size="small" @click="conVerCode">
              下一步：转换处理
            </el-button>
          </div>
        </div>
        <el-divider content-position="center" style="padding-bottom: 60px">
          XiaoMao
        </el-divider>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="activeStep == 1">
        <div class="hint-line">
          💡 节点名支持「正则删除 → 国旗优化 → 正则替换」三步处理；重名节点会自动追加
          -2 / -3 后缀，若正则处理后出现重名将无法进入下一步。
        </div>
        <div class="content-input">
          <div class="input-div">
            <span class="input-label">格式化配置</span>
            <div class="input-content json-panel">
              <div class="json-panel-head">
                <span>订阅原始结构</span>
                <span class="json-panel-ops">
                  <span>共 {{ nodeList.length }} 个节点</span>
                  <button
                    class="panel-toggle"
                    @click="jsonPanelOpen = !jsonPanelOpen"
                  >
                    <span>{{ jsonPanelOpen ? "收起源码" : "展开源码" }}</span>
                    <span
                      class="panel-toggle-icon"
                      :class="{ 'is-open': jsonPanelOpen }"
                    >
                      ⌄
                    </span>
                  </button>
                </span>
              </div>
              <el-collapse-transition>
                <div v-show="jsonPanelOpen" class="json-panel-body">
                  <json-viewer
                    theme="my-awesome-json-theme"
                    :value="dealValue"
                    :copyable="{
                      copyText: '复制',
                      copiedText: '复制成功',
                      timeout: 2000,
                    }"
                    boxed
                    sort
                  />
                </div>
              </el-collapse-transition>
            </div>
          </div>

          <div class="input-div">
            <span class="input-label">需要移除的节点</span>
            <div class="input-content">
              <div class="chip-tools">
                <el-button size="small" @click="checkList = []">
                  保留全部
                </el-button>
                <el-button size="small" @click="checkList = [...nodeList]">
                  全部移除
                </el-button>
                <span class="chip-hint">
                  已选 {{ checkList.length }} / {{ nodeList.length }} 个
                </span>
              </div>
              <div class="chip-box">
                <span
                  v-for="item in nodeList"
                  :key="item"
                  class="chip"
                  :class="{ 'is-active': checkList.includes(item) }"
                  @click="toggleCheck('checkList', item)"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
          <div class="input-div">
            <span class="input-label">节点名国旗优化</span>
            <el-row class="input-content" :gutter="10">
              <el-col :span="12">
                <el-switch
                  v-model="proxyNameFlag"
                  active-text="添加国旗"
                  inactive-text="移除国旗"
                ></el-switch>
              </el-col>
              <el-col :span="12">
                <el-switch
                  v-if="proxyNameFlag"
                  v-model="proxyNameArea"
                  :active-value="0"
                  :inactive-value="1"
                  active-text="国行国标"
                  inactive-text="外行鬼标"
                ></el-switch>
              </el-col>
            </el-row>
          </div>
          <div class="input-div">
            <span class="input-label">节点名正则删除</span>
            <el-row class="input-content" :gutter="10">
              <el-col :span="12">
                <el-input
                  v-model="proxyNameDel"
                  placeholder="输入需要删除的字，用英文`|`间隔"
                ></el-input>
              </el-col>
            </el-row>
          </div>
          <div class="input-div">
            <span class="input-label">节点名正则替换</span>
            <el-row class="input-content" :gutter="10">
              <el-col :span="12">
                <el-input
                  v-model="proxyNameReO"
                  placeholder="输入需要替换的字，用英文`|`间隔"
                ></el-input>
              </el-col>
              <el-col :span="12">
                <el-input
                  v-model="proxyNameReN"
                  placeholder="输入需要显示的字"
                ></el-input>
              </el-col>
            </el-row>
          </div>
          <div class="input-div">
            <span class="input-label">需要配置的策略</span>
            <div class="input-content">
              <div class="chip-tools">
                <el-button size="small" @click="checkProxyList = [...proxyList]">
                  全选
                </el-button>
                <el-button size="small" @click="checkProxyList = []">
                  清空
                </el-button>
                <span class="chip-hint">
                  已选 {{ checkProxyList.length }} / {{ proxyList.length }} 个，
                  无节点的策略将自动忽略
                </span>
              </div>
              <div class="chip-box">
                <span
                  v-for="item in proxyList"
                  :key="item"
                  class="chip"
                  :class="{ 'is-active': checkProxyList.includes(item) }"
                  @click="toggleCheck('checkProxyList', item)"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
          <div class="input-button">
            <el-button type="primary" size="small" @click="activeStep--">
              上一步
            </el-button>
            <el-button type="primary" size="small" @click="analysisCode">
              下一步：解析处理
            </el-button>
          </div>
          <el-divider content-position="center" style="padding-bottom: 60px">
            小帽集团
          </el-divider>
        </div>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="activeStep == 2">
        <div class="content-input">
          <el-row class="json-row">
            <el-col :span="12">
              <label>🏓️ 节点组源码</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="dealValue_proxies"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>

            <el-col :span="12">
              <label>⚽️ 全部节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="dealValue_proxies_name"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12">
              <label>🏈 其他节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="other_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('香港策略') != -1">
              <label>🇭🇰 香港节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="hk_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('台湾策略') != -1">
              <label>🇨🇳 台湾节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="tw_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('日本策略') != -1">
              <label>🇯🇵 日本节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="jp_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col
              :span="12"
              v-if="checkProxyList.indexOf('新加坡策略') != -1"
            >
              <label>🇸🇬 新加坡节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="sg_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('美国策略') != -1">
              <label>🇺🇸 美国节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="us_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('英国策略') != -1">
              <label>🇬🇧 英国节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="uk_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('韩国策略') != -1">
              <label>🇰🇷 韩国节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="kr_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
            <el-col :span="12" v-if="checkProxyList.indexOf('大陆策略') != -1">
              <label>🇨🇳 大陆节点组</label>
              <json-viewer
                class="input-content"
                theme="my-awesome-json-theme"
                :value="cn_node"
                :copyable="{
                  copyText: '复制',
                  copiedText: '复制成功',
                  timeout: 2000,
                }"
                boxed
                sort
              />
            </el-col>
          </el-row>

          <div class="input-button" style="margin-top: 20px">
            <el-button type="primary" size="small" @click="activeStep--">
              上一步
            </el-button>
            <el-button type="primary" size="small" @click="customDeal">
              下一步：配置自定义
            </el-button>
          </div>
        </div>
        <el-divider content-position="center" style="padding-bottom: 60px">
          XiaoMao
        </el-divider>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="activeStep == 3">
        <div class="content-input">
          <el-card class="card-block">
            <div class="input-div">
              <span class="input-label">XMC默认分流</span>
              <div class="input-content">
                <div class="filter-source">
                  <el-radio-group v-model="tabFilterState" size="small">
                    <el-radio-button value="jsdmirror">
                      jsdmirror（默认）
                    </el-radio-button>
                    <el-radio-button value="jsdelivr">jsdelivr</el-radio-button>
                    <el-radio-button value="github">GitHub直连</el-radio-button>
                    <el-radio-button value="custom">自定义</el-radio-button>
                  </el-radio-group>
                  <el-input
                    class="custom-prefix"
                    v-if="tabFilterState == 'custom'"
                    v-model="cdnPrefixCustom"
                    placeholder="输入规则源前缀，如 https://fastly.jsdelivr.net ，将自动拼接 /gh/用户/仓库@分支/路径"
                    clearable
                  >
                    <template #prepend>前缀</template>
                  </el-input>
                </div>
                <div class="rule-grid">
                  <span class="rule-chip" v-for="item in MaoFilterList" :key="item">
                    <span class="rule-check">✓</span>
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
          <el-card class="card-block">
            <div class="input-div">
              <span class="input-label">自选策略</span>
              <div class="input-content">
                <div class="wall-head">
                  <span class="wall-count">
                    {{ regionCards.length }} 个地区策略
                  </span>
                  <span class="wall-note">
                    按地区自动测速，可在「策略组顺序」中调整先后
                  </span>
                </div>
                <div class="region-pills">
                  <span
                    class="region-pill"
                    v-for="card in regionCards"
                    :key="card.key"
                    :class="'accent-' + card.accent"
                  >
                    <span class="pill-flag">{{ card.flag }}</span>
                    {{ card.label }}策略
                  </span>
                </div>
              </div>
            </div>
          </el-card>
          <el-card class="card-block">
            <div class="input-div">
              <span class="input-label">策略组顺序</span>
              <div class="input-content group-order">
                <div class="order-tip">按住左侧手柄拖动排序，列表顺序即客户端中的显示顺序</div>
                <div
                  class="order-list"
                  :class="{ 'is-dragging': dragIndex !== -1 }"
                >
                  <div
                    v-for="(item, index) in groupOrder"
                    :key="item"
                    class="order-row"
                    :class="{
                      'is-active': dragIndex === index,
                      'is-over': dragOverIndex === index && dragIndex !== index,
                    }"
                    draggable="true"
                    @dragstart="onDragStart(index, $event)"
                    @dragover.prevent="onDragOver(index)"
                    @dragenter.prevent="onDragOver(index)"
                    @drop.prevent="onDrop(index)"
                    @dragend="onDragEnd"
                  >
                    <span class="order-handle">
                      <svg viewBox="0 0 8 14" aria-hidden="true">
                        <circle cx="2" cy="2.5" r="1.2" fill="currentColor" />
                        <circle cx="6" cy="2.5" r="1.2" fill="currentColor" />
                        <circle cx="2" cy="7" r="1.2" fill="currentColor" />
                        <circle cx="6" cy="7" r="1.2" fill="currentColor" />
                        <circle cx="2" cy="11.5" r="1.2" fill="currentColor" />
                        <circle cx="6" cy="11.5" r="1.2" fill="currentColor" />
                      </svg>
                    </span>
                    <span class="order-index">{{ index + 1 }}</span>
                    <span class="order-name">{{ item }}</span>
                    <span class="order-ops">
                      <button
                        v-if="item == '🦉S.GitHub服务' || item == '🌈S.谷歌服务'"
                        class="order-del"
                        @click="closeMaoProxy(item)"
                      >
                        移除
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
          <el-card class="card-block">
            <div class="input-div">
              <span class="input-label">节点名称自定义</span>
              <div class="input-content node-edit">
                <div
                  class="node-edit-row"
                  v-for="(item, index) in editNodes"
                  :key="index"
                >
                  <el-input
                    v-model="editNodes[index]"
                    placeholder="修改后自动同步分组引用"
                    @change="applyNodeRename(index)"
                  ></el-input>
                </div>
              </div>
            </div>
          </el-card>
          <el-card class="card-block">
            <div class="input-div">
              <span class="input-label">全部节点</span>
              <div class="input-content">
                <div class="wall-head">
                  <span class="wall-count">
                    {{ dealValue_proxies_name.length }} 个可用节点
                  </span>
                  <span class="wall-note">
                    用于「🏳️‍🌈U.全部节点」自动测速；点击 × 可移除
                  </span>
                </div>
                <div class="tag-wall">
                  <span
                    class="node-tag"
                    v-for="(item, index) in dealValue_proxies_name"
                    :key="item"
                  >
                    <span class="node-name">{{ item }}</span>
                    <span
                      class="node-x"
                      @click="closeTag(item, index, 'dealValue_proxies_name')"
                    >
                      ×
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card
            class="card-block region-card"
            v-for="card in regionCards"
            :key="card.key"
            :class="'accent-' + card.accent"
          >
            <div class="input-div">
              <span class="input-label">{{ card.label }}节点</span>
              <div class="input-content">
                <div class="wall-head">
                  <span class="wall-flag">{{ card.flag }}</span>
                  <span class="wall-count">{{ card.nodes.length }} 个节点</span>
                  <span class="wall-note">地区测速策略 · 点击 × 移除</span>
                </div>
                <div class="tag-wall">
                  <span
                    class="node-tag"
                    v-for="(item, index) in card.nodes"
                    :key="item"
                  >
                    <span class="node-name">{{ item }}</span>
                    <span class="node-x" @click="closeTag(item, index, card.key)">
                      ×
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </el-card>

          <div class="input-button" style="margin-top: 20px">
            <el-button type="primary" size="small" @click="activeStep--">
              上一步
            </el-button>
            <el-button type="primary" size="small" @click="createCLash">
              下一步：生成配置
            </el-button>
          </div>
        </div>
        <el-divider content-position="center" style="padding-bottom: 60px">
          小帽集团
        </el-divider>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-if="activeStep == 4">
        <div class="content-input">
          <el-row class="json-row">
            <el-col :span="24">
              <div class="code-actions">
                <el-button @click="activeStep--">← 上一步</el-button>
                <el-button @click="createCLash">⇄ 重选书写格式</el-button>
                <el-button
                  class="copy btn-primary-lg"
                  :data-clipboard-text="yamlCode"
                  data-clipboard-action="copy"
                  data-clipboard-target="#copyTarget"
                  @click="copyYaml"
                >
                  ⧉ 复制配置
                </el-button>
                <el-button
                  class="copy btn-warn"
                  :data-clipboard-text="yamlCode"
                  data-clipboard-action="copy"
                  data-clipboard-target="#copyTarget"
                  @click="downloadYaml"
                >
                  ⤓ 下载配置
                </el-button>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="code-panel">
                <div class="code-panel-head">
                  <span class="code-dot dot-red"></span>
                  <span class="code-dot dot-yellow"></span>
                  <span class="code-dot dot-green"></span>
                  <span class="code-file">XiaoMao_Clash.yaml</span>
                  <span class="code-format">
                    {{
                      outputFormat == "flclash"
                        ? "FLClash 行内格式"
                        : "Clash 标准格式"
                    }}
                  </span>
                </div>
                <Codemirror
                  id="copyTarget"
                  v-model:value="yamlCode"
                  :options="cmOptionsYaml"
                  border
                  ref="myCodemirror2"
                />
              </div>
            </el-col>
          </el-row>
        </div>
        <el-divider content-position="center" style="padding-bottom: 60px">
          XiaoMao
        </el-divider>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-if="activeStep == 5">
        <div class="content-input">
          <img
            :src="require('@/assets/qrcode.png')"
            style="width: 80%; padding-left: 10%"
          />
          <div class="input-button" style="margin-top: 20px">
            <el-button size="small" @click="goStep(4)">返回上一步</el-button>
            <el-button type="primary" size="small" @click="goStep(3)">
              返回配置自定义
            </el-button>
            <el-button type="primary" size="small" @click="goBack">
              重新开始
            </el-button>
          </div>
        </div>
        <el-divider content-position="center" style="padding-bottom: 60px">
          XiaoMaoGroup
        </el-divider>
      </div>
    </el-collapse-transition>

    <el-dialog
      title="📖 使用教程"
      v-model="tutorialDialogVisible"
      width="620px"
      class="tutorial-dialog"
    >
      <div class="tutorial-body">
        <div class="tutorial-sec">
          <div class="tutorial-sec-title">一、整体流程</div>
          <div class="tutorial-sec-text">
            上传机场订阅配置 → 解析节点与策略组 → 预览/自定义节点名与策略顺序 →
            选择规则源与书写格式 → 生成并复制或下载配置。全流程在浏览器本地完成，不上传任何数据。
          </div>
        </div>
        <div class="tutorial-sec">
          <div class="tutorial-sec-title">二、Clash 配置如何获取？</div>
          <div class="tutorial-sec-text">
            ① Clash 客户端订阅机场后，配置会保存到客户端配置目录，直接取该 .yaml 文件即可。<br />
            ② 或在机场订阅链接后拼接 <code>&flag=clash</code>，浏览器访问即下载，手动补上
            <code>.yaml</code> 后缀即可。
          </div>
          <el-input
            class="tutorial-link"
            placeholder="粘贴机场订阅链接，直接下载 Clash 配置"
            v-model="airportsLink"
          >
            <template #append>
              <el-button type="primary" @click="downloadAirportsLink">
                下载Clash配置
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="tutorial-sec">
          <div class="tutorial-sec-title">三、节点名正则说明</div>
          <div class="tutorial-sec-text">
            正则删除与替换均支持多字符，用英文 <code>|</code> 间隔，执行顺序为「先删除后替换」；
            加国旗在两者之间执行。重名节点会自动追加 -2/-3 后缀，若正则处理后出现重名将无法进入下一步。
          </div>
        </div>
        <div class="tutorial-sec">
          <div class="tutorial-sec-title">四、资源与反馈</div>
          <div class="tutorial-sec-text">
            <a target="_blank" href="http://s.nfangbian.com/2Ru">图文教程</a>
            ·
            <a target="_blank" href="https://t.me/xiaomaoJT">资源频道 xiaomaoJT</a>
            ·
            <a target="_blank" href="https://github.com/xiaomaoJT/clash">
              仓库 xiaomaoJT/clash
            </a>
            ·
            <a
              target="_blank"
              href="https://github.com/xiaomaoJT/clash/blob/main/UPDATE.md"
            >
              更新日志
            </a>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="tutorialDialogVisible = false">
          我知道了
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      title="选择配置书写格式"
      v-model="formatDialogVisible"
      width="520px"
      :close-on-click-modal="false"
      class="format-dialog"
    >
      <div class="format-body">
        <el-radio-group v-model="outputFormat">
          <el-radio value="clash" class="format-radio">
            <span class="format-title">Clash 标准格式（默认）</span>
            <span class="format-desc">
              块状缩进书写，通用兼容所有 Clash / Mihomo 客户端
            </span>
          </el-radio>
          <el-radio value="flclash" class="format-radio">
            <span class="format-title">FLClash 行内格式</span>
            <span class="format-desc">
              节点与策略组行内 flow 书写，与机场订阅风格一致
            </span>
          </el-radio>
        </el-radio-group>
        <div class="format-tip">
          当前节点 {{ dealValue_proxies.length }} 个，策略组
          {{ groupOrder.length }} 个，规则源
          {{
            tabFilterState == "jsdmirror"
              ? "cdn.jsdmirror.com"
              : tabFilterState == "jsdelivr"
              ? "cdn.jsdelivr.net"
              : tabFilterState == "github"
              ? "GitHub 直连"
              : cdnPrefixCustom || "自定义（未填写）"
          }}
        </div>
      </div>
      <template #footer>
        <el-button @click="formatDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doGenerate">生成配置</el-button>
      </template>
    </el-dialog>

    
  </div>
</template>

<script>
import Codemirror from "codemirror-editor-vue3";
// placeholder
import "codemirror/addon/display/placeholder.js";
// language
import "codemirror/mode/yaml/yaml.js";
// theme
import "codemirror/theme/dracula.css";
import "codemirror/addon/display/autorefresh";
import Clipboard from "clipboard";
import {
  reactive,
  ref,
  toRefs,
  computed,
  getCurrentInstance,
  onMounted,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElNotification } from "element-plus";
import {
  REGION_DEFS,
  INFO_NODE_RE,
  buildBaseConfig,
  buildRuleProviders,
  buildFixedGroups,
  buildRules,
} from "./yamlJs/yamlModel";
import { dumpByFormat } from "./yamlJs/dumpModel";
export default {
  name: "Home",
  components: {
    Codemirror,
  },
  setup(props, ctx) {
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    const yaml = require("js-yaml");

    // 上传的数据定义
    let data = reactive({
      resourceValue: "",
      dealValue: "",
      baseConfig: null,
      airportsLink: "",
      // 订阅链接直接解析
      subUrl: "",
      subLoading: false,
      subProxyPrefix: "",
      subError: "",
      showSubAdv: false,
      subFocused: false,
      templateYaml: `proxies:
        - {
            "name": "🇭🇰香港节点•🎟XiaoMao-Forever",
            "desc":"仅用于示例，此代码无效，可输入完整配置，或仅输入配置内proxies模块内容。",
            "attention":"⚠️⚠️⚠️ 注意格式对齐，否则无法解析。如“-”号需对齐。",
            "type": "",
            "server": "",
            "port": "",
            "cipher": "",
            "uuid": "",
            "alterId": "",
            "tls": "",
            "network": "",
            "ws-opts": { "path": "", "headers": { "Host": "" } },
            "servername": "",
          }
        - {
          "name": "🇨🇳台湾节点•🎟XiaoMao-Forever",
          "desc":"仅用于示例，此代码无效，可输入完整配置，或仅输入配置内proxies模块内容。。",
          "attention":"⚠️⚠️⚠️ 注意格式对齐，否则无法解析。如“-”号需对齐。",
          "type": "",
          "server": "",
          "port": "",
          "cipher": "",
          "uuid": "",
          "alterId": "",
          "tls": "",
          "network": "",
          "ws-opts": { "path": "", "headers": { "Host": "" } },
          "servername": "",
        }
      `,
    });

    // 解析的数据定义
    let dataModel = reactive({
      loading: false,
      proxyNameDel: "",
      proxyNameReO: "",
      proxyNameReN: "",
      proxyNameArea: 0,
      proxyNameFlag: false,
      sliderValue: 0,
      dialogVisible: false,
      tutorialDialogVisible: false,
      jsonPanelOpen: true,
      activeStep: 0,
      maxStep: 0,
      stepList: [
        "上传机场配置",
        "解析节点及策略组",
        "策略组节点预览",
        "XiaoMao配置自定义",
        "生成XiaoMao配置",
      ],
      nodeResourceList: [],
      nodeList: [],
      checkList: [],
      dealValue_proxies_name: [],
      dealValue_proxies: [],
      dealValue_proxies_yaml: "",
      hk_node: [],
      tw_node: [],
      jp_node: [],
      us_node: [],
      sg_node: [],
      uk_node: [],
      kr_node: [],
      cn_node: [],
      other_node: [],
      proxyList: [
        "香港策略",
        "台湾策略",
        "新加坡策略",
        "美国策略",
        "日本策略",
        "英国策略",
        "韩国策略",
        "大陆策略",
        "其他策略",
      ],
      checkProxyList: [
        "香港策略",
        "台湾策略",
        "新加坡策略",
        "美国策略",
        "日本策略",
      ],
      finishProxyList: [],
      infoNodeList: [],
      // 节点名自定义（与 dealValue_proxies 索引对齐）
      editNodes: [],
      // 策略组顺序（固定组 + 地区组，支持拖动排序）
      groupOrder: [],
      // 拖动排序状态
      dragIndex: -1,
      dragOverIndex: -1,
      // 书写格式弹窗
      formatDialogVisible: false,
      outputFormat: "clash",
      cdnPrefixCustom: "",
      MaoProxyList: [
        "🌏S.全球策略",
        "🦉S.GitHub服务",
        "🌈S.谷歌服务",
        "🎲S.手动选择",
        "🏳️‍🌈U.全部节点",
      ],
      MaoFilterList: [
        "规则修正(ShuntCorrection)",
        "直连(Direct)",
        "广告拦截(AdvertisingLite)",
        "防劫持(Hijacking)",
        "隐私防护(Privacy)",
        "GitHub服务(GitHub)",
        "谷歌服务(Google)",
        "国外流媒体(Streaming)",
        "国外网络服务(Global)",
        "国内网络服务(Geoip CN)",
      ],
      tabFilterState: "jsdmirror",
      yamlCode: "",
      cmOptionsYaml: {
        autorefresh: true,
        tabSize: 4,
        mode: "text/yaml",
        theme: "dracula",
        line: true,
        viewportMargin: Infinity, //处理高度自适应时搭配使用
        highlightDifferences: true,
        autofocus: false,
        indentUnit: 2,
        smartIndent: true,
        showCursorWhenSelecting: true,
        firstLineNumber: 1,
      },
    });

    let resourceList = [];
    // 地区节点卡片（数据驱动：有节点且策略已启用）
    const regionCards = computed(() =>
      REGION_DEFS.filter(
        (d) =>
          dataModel.finishProxyList.includes(d.strategy) &&
          (dataModel[d.key] || []).length
      ).map((d) => ({
        key: d.key,
        label: d.strategy.replace("策略", ""),
        flag: d.flag,
        accent: d.accent,
        nodes: dataModel[d.key],
      }))
    );
    let handleUpload = async (file) => {
      // console.log(file, await readYamlFile(file.raw));
      resourceList.push(await readYamlFile(file.raw));
      data.resourceValue = JSON.stringify(resourceList);
    };

    /* ===================== 订阅链接直接解析 ===================== */
    // 判断文本是否像 Clash 配置
    let looksLikeClashYaml = (t) =>
      /(^|\n)\s*(proxies|proxy-groups|mixed-port|port|dns)\s*:/.test(t || "");

    // 机场按 UA 下发分享链接时返回 base64，这里兜底解码
    let tryDecodeBase64 = (t) => {
      const s = (t || "").trim().replace(/\s+/g, "");
      if (!/^[A-Za-z0-9+/=_-]{40,}$/.test(s)) return "";
      try {
        const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder("utf-8").decode(bytes);
      } catch (e) {
        return "";
      }
    };

    // 拉取订阅文本：① 本地代理（npm run serve） ② 自定义代理前缀 ③ 直连兜底
    let fetchSubText = async (url) => {
      let lastErr = "";
      try {
        const r = await fetch(`/sub-fetch?url=${encodeURIComponent(url)}`);
        const ct = r.headers.get("content-type") || "";
        if (ct.indexOf("application/json") !== -1) {
          const j = await r.json();
          if (j.ok) return j.text;
          lastErr = j.error || "本地代理拉取失败";
        } else {
          lastErr = "未检测到本地解析服务：请用 npm run serve 打开本页面";
        }
      } catch (e) {
        lastErr = "未检测到本地解析服务：请用 npm run serve 打开本页面";
      }
      const prefix = (data.subProxyPrefix || "").trim();
      if (prefix) {
        try {
          const r = await fetch(prefix + encodeURIComponent(url));
          if (r.ok) return await r.text();
          lastErr = "自定义代理 HTTP " + r.status;
        } catch (e) {
          lastErr = "自定义代理请求失败：" + (e.message || e);
        }
      }
      // 直连兜底：机场若开放了跨域，或浏览器装了解除跨域限制的扩展
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) return await r.text();
      } catch (e) {
        /* 预期内：多数机场不允许跨域 */
      }
      throw new Error(lastErr || "拉取订阅失败");
    };

    let parseSubscription = async () => {
      const url = (data.subUrl || "").trim();
      if (!url) {
        return ElNotification({
          title: "提示",
          message: "请先填写订阅链接",
          type: "warning",
        });
      }
      data.subLoading = true;
      data.subError = "";
      try {
        let text = await fetchSubText(url);
        // 未带 flag=clash 时部分机场下发的是分享链接，自动补参数重试一次
        if (!looksLikeClashYaml(text) && url.indexOf("flag=clash") === -1) {
          const retry =
            url + (url.indexOf("?") === -1 ? "?" : "&") + "flag=clash";
          try {
            const t2 = await fetchSubText(retry);
            if (looksLikeClashYaml(t2)) text = t2;
          } catch (e) {
            /* 忽略，交给下方统一报错 */
          }
        }
        if (!looksLikeClashYaml(text)) {
          const decoded = tryDecodeBase64(text);
          if (decoded && looksLikeClashYaml(decoded)) text = decoded;
        }
        if (!looksLikeClashYaml(text)) {
          throw new Error(
            "返回内容不是 Clash 配置（可能是分享链接或错误页），请确认订阅支持 Clash 格式"
          );
        }
        // 写入代码模式并复用原有解析流程
        data.resourceValue = text;
        dataModel.sliderValue = 100;
        resourceList = [];
        conVerCode();
      } catch (e) {
        data.subError = e.message || String(e);
        ElNotification({
          title: "解析失败",
          message: data.subError,
          type: "error",
          duration: 6000,
        });
      } finally {
        data.subLoading = false;
      }
    };

    // 读取文本文件内容
    let readYamlFile = async (file) => {
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = function (e) {
          reader.abort();
          reject(e);
        };
      });
      reader.readAsText(file, "UTF-8"); // 将文件读取为文本

      return promise;
    };

    // 用于解析代码
    let dealRename = (name, nameOld, nameNew) => {
      let reg = new RegExp(name, "gi");
      let result_name = nameOld.replace(reg, nameNew);
      return result_name;
    };
    // 统一的节点名转换（含信息节点旁路）：删除 → 国旗 → 替换
    let transformName = (name) => {
      // 信息占位节点（剩余流量/套餐到期等）保持原名
      if (INFO_NODE_RE.test(name)) return name;
      return dealRename(
        dataModel.proxyNameReO,
        get_emoji(0, dealRename(dataModel.proxyNameDel, name, "")),
        dataModel.proxyNameReN
      );
    };
    //重命名国旗及正则判断 名 地区 正则（true/false） 是否加国旗
    let get_emoji = (emojiArea, sName) => {
      let LEmoji = {
        "🏳️‍🌈": [
          "流量",
          "套餐",
          "剩余",
          "重置",
          "到期",
          "时间",
          "应急",
          "过期",
          "Bandwidth",
          "expire",
          "Traffic",
          "traffic",
        ],
        "🇴🇲": ["阿曼", " OM "],
        "🇦🇩": ["安道尔", "Andorra"],
        "🇦🇿": ["阿塞拜疆", "Azerbaijan"],
        "🇦🇹": ["奥地利", "奧地利", "Austria", "维也纳"],
        "🇦🇺": [
          "AU",
          "Australia",
          "Sydney",
          "澳大利亚",
          "澳洲",
          "墨尔本",
          "悉尼",
          "土澳",
          "京澳",
          "廣澳",
          "滬澳",
          "沪澳",
          "广澳",
        ],
        "🇧🇪": ["BE", "比利時", "比利时", "Belgium"],
        "🇧🇬": ["保加利亚", "保加利亞", "Bulgaria"],
        "🇵🇰": ["巴基斯坦", "Pakistan", "PAKISTAN"],
        "🇧🇭": ["巴林", "Bahrain"],
        "🇵🇾": ["巴拉圭", "Paraguay"],
        "🇰🇭": ["柬埔寨", "Cambodia"],
        "🇺🇦": ["烏克蘭", "乌克兰", "Ukraine"],
        "🇺🇿": ["乌兹别克斯坦", "烏茲別克斯坦", "Uzbekistan"],
        "🇭🇷": ["克罗地亚", "HR", "克羅地亞", "Croatia"],
        "🇨🇦": [
          "CA",
          "Canada",
          "CANADA",
          "CAN",
          "Waterloo",
          "加拿大",
          "蒙特利尔",
          "温哥华",
          "楓葉",
          "枫叶",
          "滑铁卢",
          "多伦多",
        ],
        "🇨🇭": ["瑞士", "苏黎世", "Switzerland", "CH "],
        "🇳🇬": ["尼日利亚", "NG", "尼日利亞", "拉各斯", "Nigeria"],
        "🇨🇿": ["Czechia", "捷克"],
        "🇸🇰": ["斯洛伐克", "SK", "Slovakia"],
        "🇸🇮": ["斯洛文尼亚", "斯洛文尼亞", "Slovenia"],
        "🇦🇲": ["亚美尼亚", "亞美尼亞", "Armenia"],
        "🇷🇸": ["RS ", "RS_", "塞尔维亚", "塞爾維亞", "Seville", "Sevilla"],
        "🇲🇩": ["摩爾多瓦", "MD", "摩尔多瓦", "Moldova"],
        "🇩🇪": [
          "DE ",
          "DE-",
          "DE_",
          "German",
          "GERMAN",
          "德国",
          "德國",
          "法兰克福",
          "京德",
          "滬德",
          "廣德",
          "沪德",
          "广德",
        ],
        "🇩🇰": ["DK", "DNK", "丹麦", "丹麥", "Denmark"],
        "🇪🇸": ["ES", "西班牙", "Spain"],
        "🇪🇺": ["EU", "欧盟", "欧罗巴", "欧洲", "European"],
        "🇫🇮": ["Finland", "芬兰", "芬蘭", "赫尔辛基"],
        "🇫🇷": ["FR", "France", "法国", "法國", "巴黎"],
        "🇷🇪": ["留尼汪", "留尼旺", "Réunion", "Reunion"],
        "🇨🇼": ["库拉索", "庫拉索", "Curaçao"],
        "🇬🇧": ["UK", "GB ", "England", "United Kingdom", "英国", "伦敦", "英"],
        "🇲🇴": ["MO", "Macao", "Macau", "MAC", "澳门", "澳門", "CTM"],
        "🇰🇿": ["哈萨克斯坦", "哈薩克斯坦", "Kazakhstan"],
        "🇱🇦": ["老挝", "老挝", "Laos"],
        "🇭🇺": ["匈牙利", "Hungary"],
        "🇱🇹": ["立陶宛", "Lithuania"],
        "🇱🇰": ["斯里兰卡", "斯里蘭卡", "Sri Lanka"],
        "🇧🇾": [
          "BY",
          "白俄罗斯",
          "白俄羅斯",
          "White Russia",
          "Republic of Belarus",
          "Belarus",
        ],
        "🇷🇺": [
          "RU ",
          "RU-",
          "RU_",
          "RUS",
          "Russia",
          "俄罗斯",
          "毛子",
          "俄国",
          "俄羅斯",
          "伯力",
          "莫斯科",
          "圣彼得堡",
          "西伯利亚",
          "新西伯利亚",
          "京俄",
          "杭俄",
          "廣俄",
          "滬俄",
          "广俄",
          "沪俄",
        ],
        "🇸🇬": [
          "SG",
          "Singapore",
          "SINGAPORE",
          "新加坡",
          "狮城",
          "沪新",
          "京新",
          "泉新",
          "穗新",
          "深新",
          "杭新",
          "广新",
          "廣新",
          "滬新",
        ],
        "🇺🇸": [
          "US",
          "USA",
          "America",
          "United States",
          "美国",
          "美",
          "京美",
          "波特兰",
          "达拉斯",
          "俄勒冈",
          "凤凰城",
          "费利蒙",
          "硅谷",
          "矽谷",
          "拉斯维加斯",
          "洛杉矶",
          "圣何塞",
          "圣荷西",
          "圣克拉拉",
          "西雅图",
          "芝加哥",
          "沪美",
          "哥伦布",
          "纽约",
        ],
        "🇹🇼": [
          "TW",
          "Taiwan",
          "TAIWAN",
          "台湾",
          "台北",
          "台中",
          "新北",
          "彰化",
          "CHT",
          "台",
          "HINET",
        ],
        "🇮🇩": ["ID ", "IDN ", "Indonesia", "印尼", "印度尼西亚", "雅加达"],
        "🇮🇪": ["Ireland", "IRELAND", "IE ", "爱尔兰", "愛爾蘭", "都柏林"],
        "🇮🇱": ["Israel", "以色列"],
        "🇮🇳": ["India", "IND", "INDIA", "印度", "孟买", "Mumbai", "IN "],
        "🇮🇸": ["IS", "ISL", "冰岛", "冰島", "Iceland"],
        "🇰🇵": ["KP", "朝鲜", "North Korea"],
        "🇰🇷": ["KR", "Korea", "KOR", "韩国", "首尔", "韩", "韓", "春川"],
        "🇬🇭": ["加纳", "Ghana"],
        "🇱🇺": ["卢森堡", "LU ", "Luxembourg"],
        "🇱🇻": ["Latvia", "Latvija", "拉脱维亚"],
        "🇧🇩": ["孟加拉", "Bengal"],
        "🇲🇽️": [" MEX", "MX", "墨西哥", "Mexico", "MEXICO"],
        "🇲🇾": [
          " MY",
          "Malaysia",
          "MALAYSIA",
          "马来西亚",
          "马来",
          "馬來",
          "大马",
          "大馬",
          "馬來西亞",
          "吉隆坡",
        ],
        "🇳🇱": [" NL", "Netherlands", "荷兰", "荷蘭", "尼德蘭", "阿姆斯特丹"],
        "🇵🇭": [" PH", "Philippines", "菲律宾", "菲律賓"],
        "🇷🇴": [" RO ", "罗马尼亚", "Rumania"],
        "🇸🇦": ["沙特", "利雅得", "Saudi Arabia", "Saudi"],
        "🇸🇪": ["SE", "Sweden", "瑞典"],
        "🇹🇭": [" TH", "Thailand", "泰国", "泰國", "曼谷"],
        "🇹🇷": ["TR ", "TR-", "TR_", "TUR", "Turkey", "土耳其", "伊斯坦布尔"],
        "🇻🇳": ["VN", "越南", "胡志明市", "Vietnam"],
        "🇮🇹": ["Italy", " IT ", "Nachash", "意大利", "米兰", "義大利"],
        "🇿🇦": ["South Africa", "南非", "Johannesburg"],
        "🇦🇪": ["United Arab Emirates", "阿联酋", "AE ", "迪拜", "Dubai"],
        "🇧🇷": ["BR", "Brazil", "巴西", "圣保罗"],
        "🇯🇵": [
          "JP",
          "Japan",
          "JAPAN",
          "日本",
          "东京",
          "大阪",
          "埼玉",
          "京日",
          "苏日",
          "沪日",
          "上日",
          "穗日",
          "川日",
          "中日",
          "泉日",
          "杭日",
          "深日",
          "辽日",
          "广日",
          "Tokyo",
        ],
        "🇦🇷": ["AR", "Argentina", "阿根廷"],
        "🇳🇴": ["Norway", "挪威", "NO"],
        "🇵🇱": [" PL", "POL", "波兰", "波蘭", "Poland"],
        "🇨🇱": ["智利", "Chile", "CHILE"],
        "🇳🇿": ["新西蘭", "新西兰", "New Zealand"],
        "🇬🇷": ["希腊", "希臘", "Greece"],
        "🇪🇬": ["埃及", "Egypt"],
        "🇮🇲": ["马恩岛", "馬恩島", "Isle of Man", "Mannin"],
        "🇵🇹": ["葡萄牙", "Portugal"],
        "🇲🇳": ["蒙古", "Mongolia"],
        "🇵🇪": ["秘鲁", "祕魯", "Peru"],
        "🇨🇴": ["哥伦比亚", "Colombia"],
        "🇪🇪": ["爱沙尼亚", "Estonia"],
        "🇱🇾": ["利比亚", "Libya"],
        "🇲🇰": ["马其顿", "馬其頓", "Macedonia"],
        "🇲🇹": ["马耳他", "Malta"],
        "🇻🇪": ["委内瑞拉", "Venezuela"],
        "🇧🇦": ["波黑共和国", "波黑", "Bosnia and Herzegovina"],
        "🇬🇪": ["格魯吉亞", "格鲁吉亚", "Georgia"],
        "🇦🇱": ["阿爾巴尼亞", "阿尔巴尼亚", "Albania"],
        "🇨🇾": ["CY", "塞浦路斯", "Cyprus"],
        "🇨🇷": ["哥斯达黎加", "Costa Rica"],
        "🇹🇳": ["突尼斯", "Tunisia"],
        "🇻🇦": ["梵蒂冈"],
        "🇷🇼": ["卢旺达"],
        "🇵🇦": ["巴拿马", "巴拿馬", "Panama"],
        "🇮🇷": ["伊朗", "Iran"],
        "🇯🇴": ["约旦", "約旦", "Jordan"],
        "🇺🇾": ["乌拉圭", "烏拉圭", "Uruguay"],
        "🇰🇪": ["肯尼亚", "肯尼亞", "Kenya"],
        "🇰🇬": ["吉尔吉斯坦", "吉尔吉斯斯坦", "Kyrghyzstan"],
        "🇳🇵": ["尼泊尔", "Nepal"],
        "🇽🇰": ["科索沃", "Kosovo"],
        "🇲🇦": ["摩洛哥", "Morocco"],
        "🇪🇨": ["厄瓜多尔", "EC", "Ecuador"],
        "🇲🇺": ["毛里求斯", "Mauritius"],
        "🇵🇷": ["波多黎各", "PR", "Puerto Rico"],
        "🇬🇹": ["危地马拉", " GT "],
        "🇭🇰": [
          "HK",
          "Hongkong",
          "Hong Kong",
          "HongKong",
          "HONG KONG",
          "香港",
          "深港",
          "沪港",
          "呼港",
          "HKT",
          "HKBN",
          "HGC",
          "WTT",
          "CMI",
          "穗港",
          "京港",
          "港",
        ],
        "🇨🇳": [
          "CN",
          "China",
          "回国",
          "中国",
          "中國",
          "江苏",
          "北京",
          "上海",
          "广州",
          "深圳",
          "杭州",
          "徐州",
          "青岛",
          "宁波",
          "镇江",
          "back",
        ],
        "🇱🇧": ["黎巴嫩", "LB", "Lebanon"],
        "🇧🇳": ["文莱", "BRN", "Negara Brunei Darussalam"],
        "🌏": ["亚洲", "Asia"],
      };
      let str1 = JSON.stringify(LEmoji);
      let aa = JSON.parse(str1);
      let bb = JSON.parse(str1.replace(/🇹🇼/g, " 🇨🇳"));
      let cnt = emojiArea == 1 ? aa : bb;
      let flagArea = 0;
      for (let key in cnt) {
        let dd = cnt[key];
        for (let i in dd) {
          if (sName.indexOf(dd[i]) != -1) {
            flagArea = 1;
            let nName =
              key +
              " " +
              sName
                .replace(/\s+/g, "")
                .replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "")
                .trim();
            return nName;
          }
        }
      }
      if (flagArea == 0) {
        let nName =
          "🏴‍☠️ " +
          sName
            .replace(/\s+/g, "")
            .replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "")
            .replace("🏴‍☠️", "")
            .trim();
        return nName;
      }
    };
    let renameFlag = (name, regexName, state, flags = false) => {
      //加国旗重命名方法
      let areaRegex = {
        hk_regex: new RegExp(
          "(?!.*(台湾|日本|新加坡|美国|韩国|狮城|南朝鲜|US|SG|JP|KR|TW|台灣|美國|韓國|獅城|NeteaseMusic|网易云|Netease)).*(🇭🇰|港|HK|hong)",
          "i"
        ),
        tw_regex: new RegExp(
          "(?!.*(港|日|韩|新|美|NeteaseMusic|网易云|Netease)).*(🇨🇳|台|TW|Taiwan)",
          "i"
        ),
        us_regex: new RegExp(
          "(?!.*(香港|台湾|日本|新加坡|韩国|狮城|南朝鲜|SG|JP|KR|HK|TW|台灣|韓國|獅城|NeteaseMusic|网易云|Netease)).*(🇺🇸|美国|美國|US|洛杉矶|西雅图|States|American)",
          "i"
        ),
        us_regex: new RegExp(
          "(?!.*(香港|台湾|日本|新加坡|韩国|狮城|南朝鲜|SG|JP|KR|HK|TW|台灣|韓國|獅城|NeteaseMusic|网易云|Netease)).*(🇺🇸|美国|美國|US|洛杉矶|西雅图|States|American)",
          "i"
        ),
        sg_regex: new RegExp(
          "(?!.*(香港|台湾|日本|美国|韩国|南朝鲜|US|JP|KR|HK|TW|台灣|美國|韓國|NeteaseMusic|网易云|Netease)).*(🇸🇬|新加坡|狮城|SG|Singapore)",
          "i"
        ),
        jp_regex: new RegExp(
          "(?!.*(香港|台湾|新加坡|美国|韩国|狮城|南朝鲜|US|SG|KR|HK|TW|台灣|美國|韓國|獅城|NeteaseMusic|网易云|Netease)).*(🇯🇵|日本|JP|Japan)",
          "i"
        ),
        uk_regex: new RegExp(
          "(?!.*(香港|美国|新加坡|台湾|日本|韩P国|狮城|南朝鲜|俄罗斯|HK|US|SG|TW|JP|KR|RU|美國|韓國|獅城|台灣|俄羅斯|Netease)).*(🇬🇧|英|英国|英國|大不列颠及北爱尔兰联合王国|联合王国|伦敦|UK|Britain|United Kingdom)",
          "i"
        ),
        kr_regex: new RegExp(
          "(?!.*(香港|台湾|新加坡|美国|狮城|南朝鲜|US|SG|HK|TW|台灣|美國|獅城|NeteaseMusic|网易云|Netease)).*(🇰🇷|KR|Korea|KOR|首尔|韩|韓|Korea)",
          "i"
        ),
        cn_regex: new RegExp(
          "(?!.*(香|台|澳|日|韩|新|美|迪|🇭🇰|🇰🇷|🏴‍☠️)).*(中国|国内|大陆|CH|CN|ch|cn|China)",
          "i"
        ),
      };
      if (state) {
        return areaRegex[regexName + "_regex"].test(name);
      } else {
        // return
      }
      if (flags) {
        return get_emoji(dataModel.proxyNameArea, name);
      } else {
        return name
          .replace(/\s+/g, "")
          .replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "")
          .replace("🏴‍☠️", "");
      }
    };
    let checkList = [],
      nodeList = [],
      nodeResourceList = [];
    let analysisCode = async () => {
      if (
        dataModel.nodeResourceList.length &&
        dataModel.checkProxyList.length
      ) {
        //用于正则命名
        nodeResourceList = [];
        nodeList = [];
        dataModel.nodeResourceList.forEach((el) => {
          if (INFO_NODE_RE.test(el.name)) {
            // 信息节点（剩余流量/套餐到期等）保持原名：不加国旗、不进地区分组
            nodeResourceList.push(el);
            return;
          }
          el.name = dealRename(
            dataModel.proxyNameReO,
            get_emoji(0, dealRename(dataModel.proxyNameDel, el.name, "")),
            dataModel.proxyNameReN
          );

          nodeResourceList.push(el);
        });
        dataModel.nodeList.forEach((el) => {
          if (INFO_NODE_RE.test(el)) {
            nodeList.push(el);
            return;
          }
          nodeList.push(
            dealRename(
              dataModel.proxyNameReO,
              get_emoji(0, dealRename(dataModel.proxyNameDel, el, "")),
              dataModel.proxyNameReN
            )
          );
        });

        if (Array.from(new Set(nodeList)).length < nodeList.length) {
          ElNotification({
            title: "错误",
            message: "正则命名后存在重复节点名，请修改正则语句后重试！",
            type: "error",
          });
          return;
        }

        //处理需要移除的节点
        if (dataModel.checkList.length) {
          checkList = JSON.parse(JSON.stringify(dataModel.checkList));
          // console.log(checkList, "check");
          checkList.forEach((el) => {
            let nameTem = transformName(el);
            let index = nodeResourceList.findIndex((name) => {
              return name.name == nameTem;
            });

            if (index != -1) {
              nodeResourceList.splice(index, 1);
              nodeList.splice(index, 1);
            }
          });
        }

        let hk = [],
          tw = [],
          us = [],
          jp = [],
          sg = [],
          uk = [],
          kr = [],
          cn = [],
          other = [];

        nodeResourceList.forEach((el, i) => {
          if (INFO_NODE_RE.test(el.name)) return; // 信息节点不参与地区分组
          if (renameFlag(el.name, "hk", true)) {
            hk.push(renameFlag(el.name, "hk", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "tw", true)) {
            tw.push(renameFlag(el.name, "tw", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "jp", true)) {
            jp.push(renameFlag(el.name, "jp", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "us", true)) {
            us.push(renameFlag(el.name, "us", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "sg", true)) {
            sg.push(renameFlag(el.name, "sg", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "uk", true)) {
            uk.push(renameFlag(el.name, "uk", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "kr", true)) {
            kr.push(renameFlag(el.name, "kr", false, dataModel.proxyNameFlag));
          } else if (renameFlag(el.name, "cn", true)) {
            cn.push(renameFlag(el.name, "cn", false, dataModel.proxyNameFlag));
          } else {
            other.push(
              renameFlag(el.name, "other", false, dataModel.proxyNameFlag)
            );
          }
        });

        nodeResourceList.forEach((el) => {
          if (INFO_NODE_RE.test(el.name)) return; // 信息节点保持原名
          el.name = renameFlag(el.name, "all", false, dataModel.proxyNameFlag);
        });

        // 信息节点单独记录：仅出现在 proxies 与 手动选择 中
        dataModel.infoNodeList = nodeResourceList
          .filter((el) => INFO_NODE_RE.test(el.name))
          .map((el) => el.name);

        nodeList = nodeResourceList
          .filter((el) => !INFO_NODE_RE.test(el.name))
          .map((el) => el.name);

        dataModel.hk_node = hk;
        dataModel.tw_node = tw;
        dataModel.jp_node = jp;
        dataModel.us_node = us;
        dataModel.sg_node = sg;
        dataModel.uk_node = uk;
        dataModel.kr_node = kr;
        dataModel.cn_node = cn;
        dataModel.other_node = other;

        dataModel.dealValue_proxies_name = nodeList;
        dataModel.dealValue_proxies = nodeResourceList;
        // 节点名自定义草稿（可在下一步修改并同步所有引用）
        dataModel.editNodes = nodeResourceList.map((el) => el.name);

        try {
          dataModel.dealValue_proxies_yaml = yaml.dump({
            proxies: dataModel.dealValue_proxies,
          });
        } catch (e) {
          // console.log(e);
          ElNotification({
            title: "错误",
            message: "发生错误，回转yaml失败！",
            type: "error",
          });
        }

        ElNotification({
          title: "成功",
          message: "解析成功",
          type: "success",
        });
        customDeal();
        return;

        // dataModel.loading = true;
        // setTimeout(() => {
        //   dataModel.loading = false;
        //   dataModel.activeStep = 2;
        // }, 500);
      } else {
        ElNotification({
          title: "错误",
          message: "发生错误，节点或策略不能为空！",
          type: "error",
        });
      }
    };

    //转换按钮 转换为json
    let converObj = {};
    let conVerCode = () => {
      if (dataModel.sliderValue == 100) {
        resourceList = [];
        resourceList.push(JSON.parse(JSON.stringify(data.resourceValue)));
      }
      try {
        // console.log(resourceList);
        if (resourceList.length) {
          resourceList.forEach((el, index) => {
            yaml.loadAll(el, function (doc) {
              // console.log(doc);
              if (index == 0) {
                converObj = doc;
              } else {
                converObj.proxies.push(...(doc.proxies || []));
              }
            });
          });

          data.dealValue = converObj;
          // 以订阅为底稿：解析时即深拷贝基础配置（dns/hosts/experimental 等），
          // 后续节点重命名不会影响底稿
          data.baseConfig = buildBaseConfig(converObj);
          // 保持订阅原始节点顺序（与静态版格式一致），不做排序
          dataModel.nodeResourceList = data.dealValue.proxies;

          //处理命名 重复/去国旗
          function removeFlag(name) {
            return name
              .replace(/\s+/g, "")
              .replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "")
              .replace("🏴‍☠️", "");
          }
          let arrTem = [];
          dataModel.nodeResourceList.forEach((el, index) => {
            el.name = removeFlag(el.name);
            if (arrTem.indexOf(el.name) == -1) {
              arrTem.push(el.name);
            } else {
              let numTem = arrTem.filter(function (res) {
                return res == el.name;
              });
              el.name = el.name + "-" + (numTem.length + 1);
              arrTem.push(el.name);
            }
          });

          dataModel.nodeList = arrTem;

          dataModel.loading = true;
          setTimeout(() => {
            dataModel.loading = false;
            dataModel.activeStep = 1;
            ElNotification({
              title: "成功",
              message: "转换成功",
              type: "success",
            });
          }, 500);
        } else {
          ElNotification({
            title: "错误",
            message: "发生错误，请先上传原始配置文件！",
            type: "error",
          });
        }
      } catch (e) {
        // console.log(e);
        ElNotification({
          title: "错误",
          message: "转换失败，请检查格式！",
          type: "error",
        });
      }
    };

    let delMaoList = [];
    //自定义配置
    let customList = [];
    let customCheckProxyList = [];
    let customDeal = () => {
      if (dataModel.checkProxyList.length) {
        customCheckProxyList = JSON.parse(
          JSON.stringify(dataModel.checkProxyList)
        );
        customList = [];
        customCheckProxyList.forEach((el) => {
          switch (el) {
            case "香港策略":
              dataModel.hk_node.length ? "" : customList.push(el);
              break;
            case "台湾策略":
              dataModel.tw_node.length ? "" : customList.push(el);
              break;
            case "新加坡策略":
              dataModel.sg_node.length ? "" : customList.push(el);
              break;
            case "美国策略":
              dataModel.us_node.length ? "" : customList.push(el);
              break;
            case "日本策略":
              dataModel.jp_node.length ? "" : customList.push(el);
              break;
            case "英国策略":
              dataModel.uk_node.length ? "" : customList.push(el);
              break;
            case "大陆策略":
              dataModel.cn_node.length ? "" : customList.push(el);
              break;
            case "韩国策略":
              dataModel.kr_node.length ? "" : customList.push(el);
              break;
            case "其他策略":
              dataModel.other_node.length ? "" : customList.push(el);
              break;
            default:
              break;
          }
        });

        dataModel.finishProxyList = customCheckProxyList.filter(
          (el) => !customList.includes(el)
        );

        if (customList.length) {
          ElNotification({
            title: "警告",
            message:
              "检测到策略: " +
              JSON.stringify(customList) +
              " 内节点为空，已自动移除",
            type: "warning",
          });

          if (dataModel.finishProxyList.length == 0) {
            setTimeout(() => {
              ElNotification({
                title: "错误",
                message: "检测到有效的自选策略为空，建议检查节点组及策略组设置",
                type: "error",
              });
            }, 800);
          }
          if (dataModel.dealValue_proxies_name.length == 0) {
            setTimeout(() => {
              ElNotification({
                title: "错误",
                message: "检测到有效的节点为空，建议检查节点组",
                type: "error",
              });
            }, 500);
          }
        }

        dataModel.loading = true;

        // 重置固定策略组，并按「固定组 + 地区组」初始化顺序（步骤3可上下调整）
        dataModel.MaoProxyList = [
          "🌏S.全球策略",
          "🦉S.GitHub服务",
          "🌈S.谷歌服务",
          "🎲S.手动选择",
          "🏳️‍🌈U.全部节点",
        ];
        const regionGroupNames = dataModel.finishProxyList
          .map((el) => {
            const def = REGION_DEFS.find((r) => r.strategy === el);
            return def ? def.flag + "U." + el : null;
          })
          .filter(Boolean);
        dataModel.groupOrder = [...dataModel.MaoProxyList, ...regionGroupNames];

        delMaoList = [];
        setTimeout(() => {
          dataModel.loading = false;
          dataModel.activeStep = 3;
        }, 500);
      }
    };

    let closeMaoProxy = (val) => {
      // console.log(val);
      let maoList = JSON.parse(JSON.stringify(dataModel.MaoProxyList));
      let maoIndex = maoList.indexOf(val);
      if (maoIndex != -1) {
        delMaoList.push(val);
        maoList.splice(maoIndex, 1);
        dataModel.MaoProxyList = maoList;
        dataModel.groupOrder = dataModel.groupOrder.filter((n) => n != val);
      }
      // console.log(delMaoList, maoIndex, maoList, dataModel.MaoProxyList);
    };

    // 策略组顺序：上移 / 下移（保留兼容）
    let moveGroup = (index, step) => {
      const list = JSON.parse(JSON.stringify(dataModel.groupOrder));
      const target = index + step;
      if (target < 0 || target >= list.length) return;
      const tmp = list[index];
      list[index] = list[target];
      list[target] = tmp;
      dataModel.groupOrder = list;
    };

    /* ===== 策略组顺序：拖动排序 ===== */
    let resetDrag = () => {
      dataModel.dragIndex = -1;
      dataModel.dragOverIndex = -1;
    };
    let onDragStart = (index, e) => {
      dataModel.dragIndex = index;
      dataModel.dragOverIndex = index;
      if (e && e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        // 部分浏览器必须设置数据才会触发后续 dragover/drop
        e.dataTransfer.setData("text/plain", String(index));
      }
    };
    let onDragOver = (index) => {
      if (dataModel.dragIndex === -1) return;
      dataModel.dragOverIndex = index;
    };
    // 把拖动项移动到目标位置（目标项自动后移）
    let onDrop = (index) => {
      const from = dataModel.dragIndex;
      if (from === -1 || from === index) return resetDrag();
      const list = JSON.parse(JSON.stringify(dataModel.groupOrder));
      const [moved] = list.splice(from, 1);
      list.splice(index, 0, moved);
      dataModel.groupOrder = list;
      resetDrag();
    };
    let onDragEnd = () => resetDrag();

    // 节点名自定义：改名后同步所有分组引用
    let applyNodeRename = (index) => {
      const newName = (dataModel.editNodes[index] || "").trim();
      const oldName = dataModel.dealValue_proxies[index].name;
      if (!newName) {
        dataModel.editNodes[index] = oldName;
        return;
      }
      if (newName === oldName) return;
      // 重名校验
      const dup = dataModel.dealValue_proxies.some(
        (p, i) => i != index && p.name === newName
      );
      if (dup) {
        ElNotification({
          title: "错误",
          message: "节点名已存在：" + newName + "，请换一个名字",
          type: "error",
        });
        dataModel.editNodes[index] = oldName;
        return;
      }
      dataModel.dealValue_proxies[index].name = newName;
      const keys = [
        "dealValue_proxies_name",
        "infoNodeList",
        "hk_node",
        "tw_node",
        "sg_node",
        "us_node",
        "jp_node",
        "uk_node",
        "kr_node",
        "cn_node",
        "other_node",
      ];
      keys.forEach((k) => {
        const arr = dataModel[k];
        if (!Array.isArray(arr)) return;
        arr.forEach((v, i) => {
          if (v === oldName) arr[i] = newName;
        });
      });
      dataModel.editNodes[index] = newName;
      ElNotification({
        title: "成功",
        message: "节点已重命名：" + newName,
        type: "success",
      });
    };

    //生成配置
    let arrCode = {},
      yamlCode = "";
    let proxyGroup = [];
    let proxyGroupName = [];
    let createCLash = () => {
      proxyGroupName = [];
      proxyGroup = JSON.parse(JSON.stringify(dataModel.finishProxyList));
      try {
        // ① 以订阅为底稿：保留 dns / hosts / experimental / cfw-* 等订阅自身配置
        arrCode = data.baseConfig
          ? JSON.parse(JSON.stringify(data.baseConfig))
          : buildBaseConfig(null);

        // ② 节点：真实节点 + 信息节点（保持订阅原顺序）
        arrCode.proxies = JSON.parse(
          JSON.stringify(dataModel.dealValue_proxies)
        );

        // ③ 地区策略组（仅保留有节点的策略），组名如 🇭🇰U.香港策略
        const regionGroups = [];
        proxyGroup.forEach((el) => {
          const def = REGION_DEFS.find((r) => r.strategy === el);
          if (!def) return;
          const nodes = dataModel[def.key] || [];
          if (!nodes.length) return;
          const gname = def.flag + "U." + el;
          proxyGroupName.push(gname);
          regionGroups.push({
            name: gname,
            type: "url-test",
            proxies: JSON.parse(JSON.stringify(nodes)),
            url: "http://captive.apple.com/",
            interval: 216000,
          });
        });

        // ④ 固定策略组（全球/手动/全部置顶，GitHub/谷歌紧随）+ 地区组
        arrCode["proxy-groups"] = buildFixedGroups(
          proxyGroupName,
          dataModel.dealValue_proxies_name,
          [
            ...dataModel.dealValue_proxies_name,
            ...dataModel.infoNodeList,
          ]
        ).concat(regionGroups);

        // ⑤ 规则源：默认 cdn.jsdmirror.com，支持 jsdelivr / GitHub直连 / 自定义前缀
        arrCode["rule-providers"] = buildRuleProviders(
          dataModel.tabFilterState,
          dataModel.cdnPrefixCustom
        );
        arrCode.rules = buildRules();

        // ⑥ 移除被删除的固定服务组（GitHub/谷歌）及其规则与规则集
        if (delMaoList.length) {
          const findObj = {
            "🦉S.GitHub服务": "GitHub",
            "🌈S.谷歌服务": "Google",
          };
          delMaoList.forEach((el) => {
            const findMao = arrCode["proxy-groups"].findIndex(
              (i) => i.name == el
            );
            const findRule = arrCode["rules"].findIndex(
              (i) => i.indexOf(el) != -1
            );
            if (findMao != -1) {
              arrCode["proxy-groups"].splice(findMao, 1);
              if (findRule != -1) arrCode["rules"].splice(findRule, 1);
              if (
                findObj[el] &&
                arrCode["rule-providers"].hasOwnProperty(findObj[el])
              ) {
                Reflect.deleteProperty(
                  arrCode["rule-providers"],
                  findObj[el]
                );
              }
            }
          });
        }

        // 按用户自定义顺序输出策略组（未在顺序表中的附加在末尾）
        const orderedNames = dataModel.groupOrder.filter(Boolean);
        const builtGroups = arrCode["proxy-groups"];
        arrCode["proxy-groups"] = [
          ...orderedNames
            .map((n) => builtGroups.find((g) => g.name === n))
            .filter(Boolean),
          ...builtGroups.filter((g) => !orderedNames.includes(g.name)),
        ];

        // 组装完成 → 弹窗选择书写格式
        dataModel.formatDialogVisible = true;
      } catch (e) {
        // console.log(e);
        ElNotification({
          title: "错误",
          message: "发生错误，配置组装失败！",
          type: "error",
        });
      }
    };

    // 弹窗确认：按选择的书写格式输出
    let doGenerate = () => {
      try {
        yamlCode = dumpByFormat(arrCode, dataModel.outputFormat);
        dataModel.yamlCode = yamlCode;
        dataModel.formatDialogVisible = false;

        dataModel.loading = true;
        setTimeout(() => {
          dataModel.loading = false;
          dataModel.activeStep = 4;
          ElNotification({
            title: "成功",
            message:
              "生成配置成功（" +
              (dataModel.outputFormat == "flclash"
                ? "FLClash 行内格式"
                : "Clash 标准格式") +
              "）",
            type: "success",
          });
        }, 500);
      } catch (e) {
        // console.log(e);
        ElNotification({
          title: "错误",
          message: "发生错误，回转yaml失败！",
          type: "error",
        });
      }
    };

    let closeTag = (val, index, tag) => {
      // console.log(val, tag);
      if (dataModel[tag].length < 2) {
        // ElMessage.error("警告：节点移除失败，策略组节点不能为空！");
        ElNotification({
          title: "警告",
          message: "节点移除失败，策略组节点不能为空！",
          type: "warning",
        });
        return;
      }
      dataModel[tag].splice(index, 1);
      dataModel[tag] = JSON.parse(JSON.stringify(dataModel[tag]));
      // ElMessage.success({
      //   message: "成功移除节点：" + val,
      //   type: "success",
      // });
      ElNotification({
        title: "成功",
        message: "成功移除节点：" + val,
        type: "success",
      });
    };

    //复制配置
    let copyYaml = () => {
      let clipboard = new Clipboard(".copy");
      clipboard.on("success", (e) => {
        // 释放内存
        clipboard.destroy();

        dataModel.loading = true;
        setTimeout(() => {
          dataModel.loading = false;
          dataModel.activeStep = 5;
          ElNotification({
            title: "成功",
            message: "配置复制成功",
            type: "success",
          });
        }, 500);
      });
      clipboard.on("error", (e) => {
        // 不支持复制
        // 释放内存
        clipboard.destroy();
        ElNotification({
          title: "错误",
          message: "该浏览器不支持自动复制,请手动复制！",
          type: "error",
        });
        // ElMessage.error("发生错误，该浏览器不支持自动复制,请手动复制！");
      });
    };

    //下载配置
    let downloadYaml = () => {
      let export_blob = new Blob([dataModel.yamlCode]);
      let save_link = document.createElement("a");
      save_link.href = window.URL.createObjectURL(export_blob);
      save_link.setAttribute("download", "XiaoMao_Clash.yaml");
      save_link.click();
      save_link.remove();

      dataModel.loading = true;
      setTimeout(() => {
        dataModel.loading = false;
        dataModel.activeStep = 5;
        ElNotification({
          title: "成功",
          message: "下载成功",
          type: "success",
        });
      }, 500);
    };

    //下载原始配置
    let downloadAirportsLink = () => {
      if (data.airportsLink != "") {
        let fileUrl = data.airportsLink + "&flag=clash";
        let fileName = "XiaoMao_Airport.yaml";
        let eleLink = document.createElement("a");
        eleLink.style.display = "none";
        eleLink.target = "_blank";
        eleLink.href = fileUrl;
        eleLink.download = fileName;
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);

        ElNotification({
          title: "成功",
          message: "配置下载成功！",
          type: "success",
        });
        data.airportsLink = "";
      } else {
        ElNotification({
          title: "警告",
          message: "链接错误，下载失败！",
          type: "warning",
        });
      }
    };

    //页面重载
    let goBack = () => {
      dataModel.loading = true;
      setTimeout(() => {
        dataModel.loading = false;
        dataModel.activeStep = 0;
      }, 500);
      goTop();
      window.location.reload()
      router.go(0);
    };

    let goTop = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    // 步骤条点击跳转（仅允许回到已到达过的步骤）
    let goStep = (index) => {
      if (index > dataModel.maxStep || index == dataModel.activeStep) return;
      dataModel.activeStep = index;
      goTop();
    };

    // 可选项切换（节点移除 / 策略选择）
    let toggleCheck = (key, item) => {
      const arr = dataModel[key];
      if (!Array.isArray(arr)) return;
      const i = arr.indexOf(item);
      if (i == -1) {
        arr.push(item);
      } else {
        arr.splice(i, 1);
      }
    };

    watch(
      [() => dataModel.activeStep, () => dataModel.sliderValue],
      ([newA, newS], [oldA, oldS]) => {
        if (newA != oldA) {
          dataModel.maxStep = Math.max(dataModel.maxStep, newA);
          goTop();
        }
        if (newA == 2) {
          dataModel.MaoProxyList = [
            "🌏S.全球策略",
            "🦉S.GitHub服务",
            "🌈S.谷歌服务",
            "🎲S.手动选择",
            "🏳️‍🌈U.全部节点",
          ];
        }
        if (newS == 100) {
          if (oldS != 100) {
            // ElMessage.success({
            //   message: "源代码模式激活成功",
            //   type: "success",
            // });
            ElNotification({
              title: "成功",
              message: "源代码模式激活成功",
              type: "success",
            });
          }
        } else if (oldS != 0 && oldS != newS) {
          // ElMessage.warning({
          //   message: newS < oldS ? "源代码模式已关闭" : "源代码模式激活失败",
          //   type: "warning",
          // });
          ElNotification({
            title: "警告",
            message: newS < oldS ? "源代码模式已关闭" : "源代码模式激活失败",
            type: "warning",
          });
        }
      }
    );

    onMounted(() => {
      let text = [
        "靓仔靓女，来都来了，还不关注一波？",
        "# 微信公众号 【小帽集团】",
        "# XiaoMao · Tg频道频道：https://t.me/xiaomaoJT",
        "# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript",
      ];
      text.forEach((t) => {
        console.log("%c" + t, "font-size:24px;color:red;");
      });
    });

    return {
      ...toRefs(data),
      ...toRefs(dataModel),
      regionCards,
      conVerCode,
      parseSubscription,
      handleUpload,
      analysisCode,
      customDeal,
      createCLash,
      doGenerate,
      moveGroup,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd,
      applyNodeRename,
      goStep,
      toggleCheck,
      copyYaml,
      downloadYaml,
      goBack,
      downloadAirportsLink,
      closeTag,
      closeMaoProxy,
    };
  },
};
</script>

<style lang="scss">
.container-content {
  min-height: 100vh;
  width: 100%;
  display: table;
  padding-bottom: 40px;
  .content-input {
    width: 74%;
    max-width: 1200px;
    min-width: 320px;
    margin: 20px auto;
    .input-div {
      width: 100%;
      margin: 18px auto;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 16px;
      .input-label {
        flex: 0 0 112px;
        width: 112px;
        padding-right: 0;
        font-size: 15px;
        line-height: 1.6;
      }
      .input-content {
        flex: 1;
        width: auto;
        min-width: 0;
      }

      .input-upload {
        border: 1px dashed #dcdfe6;
        .el-upload {
          width: 100%;
          .el-upload-dragger {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0px !important;
          }
        }
        .el-icon-upload {
          height: 80px;
          padding-right: 20px;
          color: #c1c4cb;
        }
        .el-upload__text {
          em {
            color: #5a9cf8;
          }
        }
        .el-upload__tip {
          text-align: center;
        }
      }

      .input-checkbox {
        padding-left: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-row-gap: 10px;
        label:last-child {
          margin-right: 30px;
        }
      }
    }
    .input-button {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 40px;
    }
  }

  .div-steps {
    margin: 20px auto;
    .el-step__title {
      font-size: 12px;
    }
  }

  .input-tag {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
  }

  .json-row {
    width: 100%;
    margin: 0 auto;
    .el-col > label {
      line-height: 40px;
      color: #067bca;
      font-weight: bold;
      font-size: 15px;
    }
    .el-col:nth-child(2n-1) {
      padding-right: 10px;
    }
    .el-col:nth-child(2n) {
      padding-left: 10px;
    }
  }

  .jv-my-awesome-json-theme {
    background: #fbfcff;
    border: 1px solid #e8edf7;
    border-radius: 12px;
    white-space: nowrap;
    color: #334155;
    font-size: 12px;
    font-family: Consolas, Menlo, Courier, monospace;
    min-height: 300px;

    .jv-ellipsis {
      color: #999;
      background-color: #eee;
      display: inline-block;
      line-height: 0.9;
      font-size: 0.9em;
      padding: 0px 4px 2px 4px;
      border-radius: 3px;
      vertical-align: 2px;
      cursor: pointer;
      user-select: none;
    }
    .jv-button {
      color: #49b3ff;
    }
    .jv-key {
      color: #111111;
    }
    .jv-item {
      &.jv-array {
        color: #111111;
      }
      &.jv-boolean {
        color: #fc1e70;
      }
      &.jv-function {
        color: #067bca;
      }
      &.jv-number {
        color: #fc1e70;
      }
      &.jv-number-float {
        color: #fc1e70;
      }
      &.jv-number-integer {
        color: #fc1e70;
      }
      &.jv-object {
        color: #111111;
      }
      &.jv-undefined {
        color: #e08331;
      }
      &.jv-string {
        color: #42b983;
        word-break: break-word;
        white-space: normal;
      }
    }
    .jv-code {
      .jv-toggle {
        &:before {
          padding: 0px 2px;
          border-radius: 2px;
        }
        &:hover {
          &:before {
            background: #eee;
          }
        }
      }
    }
  }
}

/* ===================== XMC@3.1 全新视觉（亮色重构） ===================== */

/* 页面底色：柔和渐变 + 两处光晕 */
.container-content {
  background:
    radial-gradient(
      900px 520px at 10% -10%,
      rgba(99, 102, 241, 0.18),
      transparent 62%
    ),
    radial-gradient(
      820px 480px at 94% 2%,
      rgba(6, 182, 212, 0.16),
      transparent 64%
    ),
    linear-gradient(180deg, #f6f8fd 0%, #eef2fb 100%);
}

/* 顶部标题卡 */
.page-hero {
  position: relative;
  overflow: hidden;
  width: 74%;
  margin: 26px auto 4px;
  padding: 26px 32px;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(120deg, #4f46e5 0%, #6366f1 44%, #06b6d4 100%);
  box-shadow: 0 20px 44px -22px rgba(79, 70, 229, 0.7);

  &::after {
    content: "";
    position: absolute;
    right: -70px;
    top: -80px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
  }
  .hero-title {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #fff;
  }
  .hero-sub {
    margin-top: 10px;
    font-size: 15px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.9);
  }
  .hero-badges {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .hero-badge {
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 13px;
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

/* ===== 可点击步骤条 ===== */
.container-content .div-steps {
  width: 74%;
  min-width: 320px;
  margin: 18px auto 6px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e8edf7;
  border-radius: 16px;
  box-shadow: 0 12px 30px -24px rgba(15, 23, 42, 0.4);

  .step-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 10px 6px;
    border-radius: 12px;
    color: #8b95a6;
    font-size: 14.5px;
    font-weight: 600;
    transition: all 0.2s;
    user-select: none;

    .step-dot {
      flex: none;
      width: 26px;
      height: 26px;
      line-height: 26px;
      text-align: center;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
      background: #f1f5fd;
      border: 1px solid #e3e9f6;
    }
    &.is-visited {
      color: #4f46e5;
      cursor: pointer;
      .step-dot {
        color: #4f46e5;
        background: #eef2ff;
        border-color: #c7d2fe;
      }
      &:hover {
        background: #f5f7ff;
      }
    }
    &.is-active {
      color: #fff;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      box-shadow: 0 10px 22px -14px rgba(79, 70, 229, 0.9);
      .step-dot {
        color: #4f46e5;
        background: #fff;
        border-color: #fff;
      }
      &:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      }
    }
    &.is-done {
      color: #10b981;
      .step-dot {
        color: #10b981;
        background: #e8fbf3;
        border-color: #a7f0d3;
      }
    }
  }
}

/* 提示条 */
.container-content .el-alert {
  width: 74%;
  margin: 14px auto 0;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #fbe3b4;
  background: linear-gradient(100deg, #fff8e8 0%, #fffdf7 100%);
  .el-alert__icon {
    color: #f59e0b;
  }
  .el-alert__title {
    color: #b45309;
    font-weight: 700;
    font-size: 15px;
  }
  .el-alert__description {
    color: #7c6a4d;
    font-size: 13.5px;
    line-height: 1.7;
  }
}

/* 卡片 */
.container-content .el-card {
  background: #fff;
  border: 1px solid #e8edf7;
  border-radius: 16px;
  box-shadow: 0 12px 30px -26px rgba(15, 23, 42, 0.45);
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: 0 18px 42px -26px rgba(79, 70, 229, 0.5);
  }
}
.container-content .card-block {
  margin-top: 14px;
}

/* 文本可读性 */
.container-content .input-label {
  color: #334155;
  font-weight: 700;
  padding-top: 4px;
}
.container-content .json-row .el-col > label {
  color: #4f46e5;
}

/* 输入控件 */
.container-content {
  .el-input__wrapper,
  .el-textarea__inner {
    border-radius: 10px;
  }
  .el-input-group__prepend {
    border-radius: 10px 0 0 10px;
  }
  .filter-source {
    margin-bottom: 15px;
    .custom-prefix {
      margin-top: 12px;
    }
  }
}

/* 上传区 */
.container-content .input-upload {
  border: 1px dashed #cdd7ea;
  border-radius: 14px;
  background: #fbfcff;
  transition: border-color 0.2s;
  &:hover {
    border-color: #6366f1;
  }
  .el-upload-dragger {
    background: transparent;
  }
  .el-upload__text {
    color: #64748b;
  }
}

/* ===== 可选项胶囊（节点/策略多选） ===== */
.container-content .chip-box {
  max-height: 300px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #eef2f9;
  border-radius: 14px;
  background: #fbfcff;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid #e2e8f5;
    background: #fff;
    color: #475569;
    font-size: 13.5px;
    cursor: pointer;
    transition: all 0.18s;
    user-select: none;
    &:hover {
      border-color: #a5b4fc;
      color: #4f46e5;
    }
    &.is-active {
      border-color: #6366f1;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      color: #4338ca;
      font-weight: 600;
      box-shadow: 0 6px 16px -12px rgba(79, 70, 229, 0.9);
    }
    .chip-flag {
      font-size: 13px;
    }
  }
}
.container-content .chip-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

/* ===== 标签墙（分区节点） ===== */
.container-content .tag-wall {
  max-height: 220px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #eef2f9;
  border-radius: 14px;
  background: #fbfcff;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  .el-tag {
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    color: #4338ca;
    font-weight: 600;
  }
}
.container-content .wall-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #334155;
  font-weight: 700;
  .wall-count {
    padding: 1px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: #4f46e5;
    background: #eef2ff;
  }
}

/* ===== JSON 面板 ===== */
.container-content .json-panel {
  border: 1px solid #eef2f9;
  border-radius: 14px;
  overflow: hidden;
  background: #fbfcff;
  .json-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: linear-gradient(100deg, #f5f7ff 0%, #fbfcff 100%);
    border-bottom: 1px solid #eef2f9;
    color: #334155;
    font-weight: 700;
    .json-panel-ops {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }
  }
  .el-collapse {
    border: none;
  }
  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border-color: #eef2f9;
  }
  .json-panel-body {
    max-height: 360px;
    overflow: auto;
    padding: 10px 14px;
  }
}

/* 策略组顺序列表（拖动排序） */
.container-content .group-order {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .order-tip {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.6;
  }
  .order-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 330px;
    overflow: auto;
    padding: 2px 4px 2px 2px;
  }
  .order-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid #e8edf7;
    border-radius: 12px;
    background: #fbfcff;
    cursor: grab;
    transition: transform 0.18s ease, box-shadow 0.18s ease,
      border-color 0.18s ease, background 0.18s ease;

    &:hover {
      border-color: #c7d2fe;
      background: #f5f7ff;
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.08);
      transform: translateX(2px);
    }
    &:active {
      cursor: grabbing;
    }
    /* 正在拖动的项 */
    &.is-active {
      opacity: 0.55;
      background: #eef2ff;
      border-color: #a5b4fc;
      border-style: dashed;
      box-shadow: none;
      transform: none;
    }
    /* 拖动经过的目标位：上方画一条插入线 */
    &.is-over::before {
      content: "";
      position: absolute;
      left: 10px;
      right: 10px;
      top: -5px;
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
    }
  }
  .order-handle {
    flex: none;
    display: flex;
    align-items: center;
    width: 14px;
    color: #cbd5e1;
    user-select: none;
    transition: color 0.18s ease;

    svg {
      width: 9px;
      height: 14px;
      display: block;
    }
  }
  .order-row:hover .order-handle {
    color: #6366f1;
  }
  .order-index {
    flex: none;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 7px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 700;
  }
  .order-name {
    flex: 1;
    color: #1e293b;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .order-ops {
    flex: none;
    display: flex;
    gap: 6px;
  }
  .order-del {
    padding: 4px 12px;
    border: 1px solid #fecdd3;
    border-radius: 999px;
    background: #fff1f2;
    color: #e11d48;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;

    &:hover {
      background: #e11d48;
      border-color: #e11d48;
      color: #fff;
    }
  }
}

/* 节点名自定义列表 */
.container-content .node-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow: auto;
  padding-right: 6px;
}

/* 标签 */
.container-content .el-tag {
  border-radius: 8px;
}

/* 分隔线 */
.container-content .el-divider__text {
  background-color: transparent;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 2px;
}
.container-content .el-divider {
  border-top-color: #e8edf7;
}

/* 折叠面板 */
.container-content .el-collapse {
  border-color: #eef2f9;
  .el-collapse-item__header,
  .el-collapse-item__wrap {
    background: transparent;
    border-color: #eef2f9;
    color: #334155;
  }
  .el-collapse-item__content {
    color: #64748b;
    a {
      color: #4f46e5;
    }
  }
}

/* 按钮 */
.container-content .el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 10px 22px -14px rgba(79, 70, 229, 0.9);
  &:hover {
    background: linear-gradient(135deg, #5b53ea 0%, #7a7cf5 100%);
  }
}

/* 弹窗 */
.el-dialog {
  border-radius: 18px;
  overflow: hidden;
}
.format-body {
  padding-bottom: 6px;
  .el-radio-group {
    display: block;
  }
  .format-radio {
    display: flex;
    align-items: flex-start;
    width: 100%;
    margin: 0 0 12px;
    padding: 14px 16px;
    height: auto;
    border: 1px solid #e8edf7;
    border-radius: 12px;
    background: #fbfcff;
    transition: all 0.2s;
    &:hover {
      border-color: #c7d2fe;
    }
    &.is-checked {
      border-color: #6366f1;
      background: #f5f7ff;
    }
    .el-radio__label {
      white-space: normal;
      padding-left: 10px;
    }
    .format-title {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    .format-desc {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: #64748b;
    }
  }
}
.format-tip {
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f1f5fd;
  color: #475569;
  font-size: 12px;
  line-height: 1.7;
}

/* ===== 步骤1：胶囊选择 / 提示行 ===== */
.container-content .chip-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  .chip-hint {
    color: #94a3b8;
    font-size: 12px;
  }
}

.container-content .hint-line {
  width: 74%;
  margin: 16px auto 0;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #dbe4f7;
  background: #f6f9ff;
  color: #4a5a75;
  font-size: 13px;
  line-height: 1.7;
}

/* 步骤3：标签墙 */
.container-content .input-tag {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  max-height: 240px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #eef2f9;
  border-radius: 14px;
  background: #fbfcff;

  .el-tag {
    border: none;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13.5px;
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    color: #4338ca;
    &.el-tag--warning {
      background: linear-gradient(135deg, #fff7e6 0%, #ffedd5 100%);
      color: #b45309;
    }
    &.el-tag--info {
      background: linear-gradient(135deg, #eef4ff 0%, #e0ecff 100%);
      color: #2563eb;
    }
    &.el-tag--danger {
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
      color: #be123c;
    }
  }
}

/* ===== 教程弹窗 ===== */
.tutorial-body {
  .tutorial-sec {
    padding: 12px 0;
    border-bottom: 1px dashed #eef2f9;
    &:last-child {
      border-bottom: none;
    }
  }
  .tutorial-sec-title {
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .tutorial-sec-text {
    color: #64748b;
    font-size: 13px;
    line-height: 1.8;
    a {
      color: #4f46e5;
      font-weight: 600;
    }
    code {
      padding: 1px 6px;
      border-radius: 6px;
      background: #f1f5fd;
      color: #4338ca;
    }
  }
  .tutorial-link {
    margin-top: 10px;
  }
}

/* ===== 统一栅格：所有区块同宽、同左右边距 ===== */
.container-content {
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 24px;
}
.container-content .page-hero,
.container-content .div-steps,
.container-content .el-alert,
.container-content .hint-line,
.container-content .content-input {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin-left: auto;
  margin-right: auto;
}

/* ===================== XMC@3.2 视觉升级 ===================== */

/* 动态光晕背景 */
.container-content {
  position: relative;
  overflow-x: hidden;
}
.container-content::before,
.container-content::after {
  content: "";
  position: fixed;
  z-index: 0;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.42;
  pointer-events: none;
}
.container-content::before {
  width: 560px;
  height: 560px;
  left: -180px;
  top: -200px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent 70%);
  animation: xmcFloat 18s ease-in-out infinite;
}
.container-content::after {
  width: 500px;
  height: 500px;
  right: -160px;
  top: 160px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.5), transparent 70%);
  animation: xmcFloat 24s ease-in-out infinite reverse;
}
.container-content > * {
  position: relative;
  z-index: 1;
}
@keyframes xmcFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(30px, 46px, 0) scale(1.14);
  }
}
@keyframes xmcRise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero：动感渐变 + 玻璃按钮 */
.container-content .page-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 38px 40px;
  border-radius: 26px;
  background: linear-gradient(
    120deg,
    #4f46e5,
    #7c3aed 34%,
    #0ea5e9 72%,
    #06b6d4
  );
  background-size: 200% 200%;
  animation: xmcHero 16s ease infinite, xmcRise 0.5s ease both;
  box-shadow: 0 30px 60px -32px rgba(79, 70, 229, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);

  .hero-title {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: -0.5px;
    text-shadow: 0 3px 20px rgba(0, 0, 0, 0.18);
  }
  .hero-sub {
    margin-top: 12px;
    font-size: 15.5px;
  }
  .hero-badges {
    margin-top: 18px;
  }
  .hero-badge {
    padding: 6px 16px;
    font-size: 13.5px;
    backdrop-filter: blur(8px);
    transition: transform 0.25s ease, background 0.25s ease;
    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.3);
    }
  }
  .hero-actions {
    position: static;
    flex: none;
    display: flex;
    gap: 10px;
    z-index: 2;
  }
  .hero-link {
    height: 40px;
    padding: 0 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.34);
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;
    &:hover,
    &:focus {
      color: #fff;
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.55);
      transform: translateY(-2px);
    }
  }
}
@keyframes xmcHero {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 提示条：精致通知卡 */
.container-content .el-alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  border-radius: 18px;
  border: 1px solid #eaeff9;
  border-left: 4px solid #f59e0b;
  background: linear-gradient(100deg, #ffffff 0%, #fffdf7 100%);
  box-shadow: 0 18px 40px -34px rgba(15, 23, 42, 0.6);
  animation: xmcRise 0.5s 0.05s ease both;

  .el-alert__icon {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: linear-gradient(135deg, #fff6e5, #ffedd5);
  }
  .el-alert__content {
    display: block;
    padding: 0;
  }
  .el-alert__title {
    color: #1e293b;
    font-weight: 800;
    font-size: 15.5px;
    letter-spacing: 0.2px;
  }
  .el-alert__description {
    margin: 3px 0 0;
    color: #8593a8;
    font-size: 13px;
  }
}

/* 步骤条：更饱满的胶囊 */
.container-content .div-steps {
  padding: 14px 20px;
  border-radius: 22px;
  gap: 8px;
  box-shadow: 0 22px 46px -36px rgba(15, 23, 42, 0.7);
  animation: xmcRise 0.5s 0.08s ease both;

  .step-item {
    padding: 12px 8px;
    border-radius: 15px;
    font-size: 14.5px;
    &.is-active {
      transform: translateY(-1px);
    }
    &.is-visited:hover {
      transform: translateY(-1px);
    }
  }
}

/* 卡片：悬浮感 */
.container-content .el-card {
  border-radius: 22px;
  padding: 6px 4px;
  box-shadow: 0 20px 44px -34px rgba(15, 23, 42, 0.65);
  transition: transform 0.28s ease, box-shadow 0.28s ease;
  animation: xmcRise 0.45s ease both;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 30px 60px -36px rgba(79, 70, 229, 0.65);
  }
}

/* 标签列：渐变竖条 + 深色字 */
.container-content .input-div {
  margin: 22px auto;
  gap: 18px;
  .input-label {
    position: relative;
    padding-left: 16px;
    font-size: 15px;
    color: #1e293b;
    line-height: 1.7;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 7px;
      width: 4px;
      height: 16px;
      border-radius: 3px;
      background: linear-gradient(180deg, #6366f1, #06b6d4);
    }
  }
}

/* 主/次按钮：更大更有层级 */
.container-content .input-button {
  gap: 14px;
  margin: 34px 0 40px;

  .el-button {
    height: 46px;
    padding: 0 32px;
    border-radius: 15px;
    font-size: 15px;
    font-weight: 700;
    transition: all 0.25s ease;
  }
  .el-button:first-child {
    background: #fff;
    color: #4f46e5;
    border: 1px solid #dbe3f5;
    box-shadow: 0 12px 26px -22px rgba(15, 23, 42, 0.7);
    &:hover {
      color: #4f46e5;
      border-color: #a5b4fc;
      background: #f7f9ff;
      transform: translateY(-2px);
    }
  }
  .el-button + .el-button {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border: none;
    box-shadow: 0 20px 36px -20px rgba(79, 70, 229, 0.95);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 26px 44px -20px rgba(79, 70, 229, 1);
    }
  }
}

/* 工具小按钮 */
.container-content .chip-tools .el-button {
  height: 34px;
  padding: 0 16px;
  border-radius: 10px;
  border-color: #dbe3f5;
  color: #475569;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    color: #4f46e5;
    border-color: #a5b4fc;
    background: #f7f9ff;
    transform: translateY(-1px);
  }
}

/* 生成页操作按钮 */
.container-content .code-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .el-button {
    height: 44px;
    padding: 0 22px;
    border-radius: 13px;
    font-size: 14.5px;
    font-weight: 700;
    border: 1px solid #dbe3f5;
    background: #fff;
    color: #475569;
    box-shadow: 0 12px 26px -22px rgba(15, 23, 42, 0.7);
    transition: all 0.25s ease;
    &:hover {
      color: #4f46e5;
      border-color: #a5b4fc;
      background: #f7f9ff;
      transform: translateY(-2px);
    }
    &.btn-primary-lg {
      color: #fff;
      border: none;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      box-shadow: 0 20px 36px -20px rgba(79, 70, 229, 0.95);
      &:hover {
        color: #fff;
        transform: translateY(-2px);
      }
    }
    &.btn-warn {
      color: #fff;
      border: none;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      box-shadow: 0 20px 36px -22px rgba(245, 158, 11, 0.95);
      &:hover {
        color: #fff;
        transform: translateY(-2px);
      }
    }
  }
}

/* 代码面板 */
.container-content .code-panel {
  border: 1px solid #e8edf7;
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 28px 56px -36px rgba(15, 23, 42, 0.7);
  animation: xmcRise 0.45s ease both;
}
.container-content .code-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 20px;
  background: linear-gradient(100deg, #f5f7ff, #fbfcff);
  border-bottom: 1px solid #eef2f9;
  color: #334155;

  .code-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    &.dot-red {
      background: #ff5f57;
    }
    &.dot-yellow {
      background: #febc2e;
    }
    &.dot-green {
      background: #28c840;
    }
  }
  .code-file {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 800;
  }
  .code-format {
    margin-left: auto;
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 700;
    color: #4338ca;
    background: #eef2ff;
  }
}

/* 上传区更醒目 */
.container-content .input-upload {
  padding: 6px;
  border-radius: 20px;
  .el-upload-dragger {
    padding: 24px 0;
  }
  .el-icon-upload {
    font-size: 44px;
    color: #6366f1;
  }
}

/* 分隔线更轻 */
.container-content .el-divider {
  margin: 30px 0 60px;
}

/* ===== 节点/地区/规则 一览组件 ===== */

/* 区域标题行 */
.container-content .wall-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.container-content .wall-flag {
  font-size: 18px;
  line-height: 1;
}
.container-content .wall-count {
  padding: 3px 13px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 800;
  color: #4338ca;
  background: #eef2ff;
}
.container-content .wall-note {
  margin-left: auto;
  color: #98a4b8;
  font-size: 12.5px;
}

/* 标签墙容器 */
.container-content .tag-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  max-height: 220px;
  overflow: auto;
  padding: 12px;
  border-radius: 16px;
  border: 1px dashed #e3e9f6;
  background: linear-gradient(180deg, #fbfcff, #f7f9ff);
}

/* 节点标签 */
.container-content .node-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px 7px 13px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e6ebf7;
  box-shadow: 0 8px 16px -14px rgba(15, 23, 42, 0.6);
  font-size: 13.5px;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s ease;

  &::before {
    content: "";
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent, #6366f1);
  }
  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent, #6366f1);
    box-shadow: 0 14px 24px -16px rgba(15, 23, 42, 0.55);
  }
  .node-name {
    white-space: nowrap;
  }
  .node-x {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 7px;
    font-size: 14px;
    line-height: 1;
    color: #9aa7bd;
    background: #f3f6fc;
    cursor: pointer;
    transition: all 0.18s ease;
    &:hover {
      background: #fee2e2;
      color: #dc2626;
      transform: rotate(90deg);
    }
  }
}

/* 地区胶囊 */
.container-content .region-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.container-content .region-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  color: #334155;
  background: #fff;
  border: 1px solid #e6ebf7;
  box-shadow: 0 10px 20px -18px rgba(15, 23, 42, 0.75);
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent, #6366f1);
  }
  .pill-flag {
    font-size: 15px;
    line-height: 1;
  }
}

/* 地区配色（卡片与胶囊共用） */
.region-card,
.region-pill {
  --accent: #6366f1;
}
.container-content .region-card {
  border-top: 3px solid var(--accent);
}
.accent-hk {
  --accent: #ef4444;
}
.accent-tw {
  --accent: #f43f5e;
}
.accent-jp {
  --accent: #ec4899;
}
.accent-sg {
  --accent: #10b981;
}
.accent-us {
  --accent: #3b82f6;
}
.accent-uk {
  --accent: #6366f1;
}
.accent-kr {
  --accent: #8b5cf6;
}
.accent-cn {
  --accent: #e11d48;
}
.accent-other {
  --accent: #f59e0b;
}

/* 规则集一览 */
.container-content .rule-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.container-content .rule-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e6ebf7;
  color: #334155;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: #a5b4fc;
    box-shadow: 0 14px 24px -18px rgba(79, 70, 229, 0.7);
  }
  .rule-check {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 11px;
    color: #fff;
    background: linear-gradient(135deg, #34d399, #10b981);
  }
}

/* 源码面板折叠按钮 */
.container-content .panel-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 15px;
  border-radius: 999px;
  border: 1px solid #dbe3f5;
  background: #fff;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  &:hover {
    border-color: #a5b4fc;
    background: #f7f9ff;
    transform: translateY(-1px);
  }
  .panel-toggle-icon {
    display: inline-block;
    font-size: 13px;
    line-height: 1;
    transition: transform 0.25s ease;
    &.is-open {
      transform: rotate(180deg);
    }
  }
}
.container-content .json-panel-head {
  .json-panel-ops {
    color: #98a4b8;
    font-size: 12.5px;
    font-weight: 600;
  }
}

/* ===================== 订阅链接直接解析（Hero 卡片） ===================== */
.container-content .sub-hero {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  width: 96%;
  margin: 0 auto;
  padding: 22px 24px;
  border: 1px solid rgba(99, 102, 241, 0.16);
  border-radius: 18px;
  background:
    radial-gradient(120% 180% at 0% 0%, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 46%),
    radial-gradient(120% 180% at 100% 100%, rgba(168, 85, 247, 0.07) 0%, rgba(255, 255, 255, 0) 46%),
    #ffffff;
  box-shadow: 0 10px 30px -12px rgba(79, 70, 229, 0.18);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 16px 40px -14px rgba(79, 70, 229, 0.28);
    transform: translateY(-2px);
  }

  .sub-hero-icon {
    flex: none;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    color: #fff;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    box-shadow: 0 8px 18px -4px rgba(99, 102, 241, 0.45);

    svg {
      width: 26px;
      height: 26px;
    }
  }

  .sub-hero-body {
    flex: 1;
    min-width: 0;
  }

  .sub-hero-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }
  .sub-hero-title {
    font-size: 17px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: 0.3px;
  }
  .sub-hero-desc {
    flex: 1;
    font-size: 13px;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub-adv-toggle {
    flex: none;
    font-size: 13px;
    font-weight: 600;
    color: #6366f1;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  /* 输入区：整体一个胶囊，输入与按钮融为一体 */
  .sub-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    border: 1.5px solid #e2e8f5;
    border-radius: 999px;
    background: #f8faff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:hover {
      border-color: #c7d2fe;
    }
    &.is-focus {
      border-color: #818cf8;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
    }

    .sub-input-icon {
      flex: none;
      width: 18px;
      height: 18px;
      color: #a5b4fc;
    }
    .sub-input-native {
      flex: 1;
      min-width: 0;
      height: 34px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #1e293b;
      font-family: inherit;

      &::placeholder {
        color: #b6c2d6;
      }
    }
    .sub-go {
      flex: none;
      height: 38px;
      padding: 0 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      box-shadow: 0 6px 16px -4px rgba(99, 102, 241, 0.55);
      transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px -6px rgba(99, 102, 241, 0.6);
      }
      &:active:not(:disabled) {
        transform: translateY(0);
        filter: brightness(0.95);
      }
      &:disabled {
        opacity: 0.75;
        cursor: not-allowed;
      }

      .sub-go-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: xmc-spin 0.7s linear infinite;
      }
    }
  }

  .sub-adv {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    padding: 10px 14px;
    border: 1px dashed #dbe3f3;
    border-radius: 12px;
    background: #fafbff;

    .sub-adv-label {
      flex: none;
      font-size: 13px;
      color: #64748b;
    }
  }

  .sub-adv-tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.7;
    color: #a3aec2;
  }

  .sub-error {
    margin-top: 12px;
    padding: 10px 14px;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    background: #fff1f2;
    color: #e11d48;
    font-size: 13px;
    line-height: 1.7;
  }
}

@keyframes xmc-spin {
  to {
    transform: rotate(360deg);
  }
}

.container-content .sub-or {
  position: relative;
  width: 96%;
  margin: 22px auto;
  text-align: center;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: #eef2f9;
  }
  span {
    position: relative;
    padding: 0 14px;
    background: #fff;
    color: #b6c2d6;
    font-size: 13px;
  }
}

/* 窄屏适配 */
@media (max-width: 900px) {
  .container-content {
    padding-left: 14px;
    padding-right: 14px;
  }
  .container-content .page-hero {
    padding: 20px;
  }
  .container-content .hero-title {
    font-size: 22px;
  }
  .container-content .step-text {
    display: none;
  }
  .container-content .sub-hero {
    flex-direction: column;
    padding: 18px;
  }
  .container-content .sub-hero .sub-hero-head {
    flex-wrap: wrap;
  }
  .container-content .sub-hero .sub-input-wrap {
    flex-wrap: wrap;
    border-radius: 16px;
    padding: 10px 12px;
  }
  .container-content .sub-hero .sub-go {
    width: 100%;
  }
}
</style>
