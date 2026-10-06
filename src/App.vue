<template>
  <router-view />
</template>

<style lang="scss">
html,
body,
#app {
  background: linear-gradient(160deg, #f6f8fd 0%, #eef2fb 100%);
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  font-size: 15px;
  color: #1e293b;
  font-family: "Inter", "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei",
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
/* 全局滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #cfd8e8;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #b3c0d8;
}
::-webkit-scrollbar-track {
  background: transparent;
}
nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #4f46e5;

    &.router-link-exact-active {
      color: #10b981;
    }
  }
}
</style>
