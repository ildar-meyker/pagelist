/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
(function () {
  function el(selector) {
    return document.querySelector(selector);
  }

  function fetchData(url, callback) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        callback(xhttp.responseText);
      }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
  }

  function appendHtml(pagesData, configData) {
    var pages = JSON.parse(pagesData);
    var config = JSON.parse(configData);
    var pagesHtml = pages.map(function (page) {
      return "<a href=\"".concat(page, "\">").concat(page, "</a>");
    }).join("");
    var repoHtml = "";

    if (config.repoUrl) {
      repoHtml = "<a href=\"".concat(config.repoUrl, "\" target=\"_blank\" class=\"pl__repo\">\n                \u0420\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0439\n            </a>");
    }

    var zipHtml = "";

    if (config.zipUrl) {
      repoHtml = "<a href=\"".concat(config.zipUrl, "\" target=\"_blank\" class=\"pl__zip\">\n                \u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0430\u0440\u0445\u0438\u0432\n            </a>");
    }

    var div = document.createElement("div");
    div.innerHTML = "\n            <div class=\"pl\" id=\"pl\">\n                <div class=\"pl__btn\">Pages count: ".concat(pages.length, "</div>\n                <div class=\"pl__body\">\n                    <div class=\"pl__nav\">\n                        ").concat(pagesHtml, "\n                    </div>\n                    <div class=\"pl__nav\">\n                        ").concat(zipHtml, "\n                        ").concat(repoHtml, "\n                        <a href=\"#\" class=\"pl__hide\">\u0421\u043A\u0440\u044B\u0442\u044C</a>\n                    </div>\n                    <div class=\"pl__tip\">\n                        <div class=\"pl__text\">\n                            \u041C\u043E\u0436\u043D\u043E \u0449\u0435\u043B\u043A\u043D\u0443\u0442\u044C \u043C\u044B\u0448\u043A\u043E\u0439 \u0434\u0432\u0430\u0436\u0434\u044B \u0432 \u043B\u044E\u0431\u043E\u043C \u043C\u0435\u0441\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u043A\u0440\u044B\u0442\u044C \u0438\u043B\u0438\n                            \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C.\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ");
    document.body.appendChild(div);
  }

  function onDoubleClick(e) {
    var plEl = el("#pl");
    var isHidden = plEl.classList.contains("pl--hidden");
    plEl.classList.toggle("pl--hidden", !isHidden);
  }

  function onButtonClick(e) {
    if (e.target.classList.contains("pl__btn")) {
      var plEl = el("#pl");
      var isActive = plEl.classList.contains("pl--active");
      plEl.classList.toggle("pl--active", !isActive);
    }
  }

  function onOutsideClick(e) {
    var plEl = el("#pl");

    if (e.target.contains(plEl)) {
      plEl.classList.remove("pl--active");
    }
  }

  function onHideClick(e) {
    if (e.target.classList.contains("pl__hide")) {
      el("#pl").classList.add("pl--hidden");
    }
  }

  function addListeners() {
    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("click", onButtonClick);
    document.addEventListener("click", onOutsideClick);
    document.addEventListener("click", onHideClick);
  }

  window.addEventListener("DOMContentLoaded", function () {
    fetchData("pagelist.json", function (pagesData) {
      fetchData("config.json", function (configData) {
        appendHtml(pagesData, configData);
        addListeners();
      });
    });
  });
})();
/******/ })()
;