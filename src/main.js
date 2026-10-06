import { createApp } from "vue";

// elementplus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// json com
import JsonViewer from "vue3-json-viewer";
import 'vue3-json-viewer/dist/index.css'

import App from "./App.vue";
import router from "./router";
import store from "./store";

import * as Icons from "@element-plus/icons";

const app = createApp(App);

for (const name in Icons) {
  app.component(name, Icons[name]);
}

app
  .use(store)
  .use(router)
  .use(ElementPlus, { size: "small" })
  .use(JsonViewer)
  .mount("#app");
