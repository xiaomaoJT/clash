let arr = [
  {
    name: "🇦🇶€001•🎟XiaoMao-Forever",
    type: "",
    server: "",
    port: "",
    cipher: "",
    uuid: "",
    alterId: "",
    tls: "",
    network: "",
    "ws-opts": { path: "", headers: { Host: "" } },
    servername: "",
  },
];

let arr2 = [];
let arr3 = [];

arr.forEach((el) => {
  if (el.port.length < 5) {
    arr2.push(el.name);
    arr3.push(el);
  }
});

console.log(arr2);
console.log(arr3);
