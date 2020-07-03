const path = require("path");
const { remote } = require("electron");

const config_dir = remote.app.getPath("userData");
const customCSS = path.join(config_dir, "user.css");

exports.customCSS = customCSS;

exports.injectCSS = function (fileName = customCSS) {
  const head = document.head;
  const link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
};
