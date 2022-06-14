// ==UserScript==
// @name         程序员文档选中美化
// @namespace    http://tampermonkey.net/
// @version      2.0.4
// @description  MDN/Mysql 文档选中美化
// @author       itxve
// @repo         https://github.com/itxve/doc-menu-selected-focus
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @license      MIT
// ==/UserScript==


const commTop=50;

function Load(predicate, fn) {
    predicate() && fn();
}
//平滑滚动至浏览目录
const scrollRootElement = (rootEle, top) => {
    rootEle.scrollTo({ top, behavior: "smooth" });
};

const MysqlDocSelct = (cssText) => {
    let path = location.pathname.split("/");
    let dom = document.querySelector("a[href='" + path[path.length - 1] + "']");
    dom.style.cssText = cssText;
    let doc= document.querySelector("#docs-sidebar-toc");
    doc.style.cssText="max-height:600px;overflow-y: auto;";
    console.info( dom.offsetTop);
    window.gh=dom;
    scrollRootElement(
        doc,
        dom.offsetTop-doc.offsetTop-20
    );

};

const MDnDocSelect = () => {
    const getPath = (href) => {
        const path = new URL(href).pathname
        .split("/")
        .filter((_, i) => i > 1)
        .join("/");
        return "/" + path;
    };

    const task = () => {
        // Your code here...
        const activeStyle = `color: var(--text-primary);font-weight: 600;
       border-left: 4px solid #1870F0;
       background-color: var(--category-color-background);`;

        const detailsStyle = `color: var(--text-primary);font-weight: 800;
       border-left: 3px solid var(--text-link);
       background-color: var(--category-color-background);`;

        const rootElement = document.querySelector("#sidebar-quicklinks");

        //展开
        const openTheParent = (adom) => {
            const maxFind = 5;
            let findCOunt = 0;
            while (findCOunt < maxFind) {
                if (adom && adom.tagName !== "DETAILS") {
                    adom = adom.parentElement;
                }
                findCOunt++;
            }
            if (adom == rootElement) return;
            //没有DETAILS的不做open
            if (adom && adom.tagName == "DETAILS") {
                adom.setAttribute("open", "open");
                adom.style = detailsStyle;
            }
        };

        const as = rootElement.querySelectorAll("li a");
        for (var i = 0; i < as.length; i++) {
            const adom = as[i];
            const domHref = getPath(adom.href);
            const localHref = getPath(location.href);
            if (!~adom.href.indexOf("#") && domHref === localHref) {
                adom.style = activeStyle;
                openTheParent(adom);
                scrollRootElement(rootElement, adom.offsetTop - rootElement.offsetTop-commTop);
                break;
            }
        }

        //非A标签的选中MDN的接口属性（event）
        const emDom = rootElement.querySelector("li em");
        if (emDom) {
            emDom.style = activeStyle;
            scrollRootElement(rootElement, emDom.offsetTop - rootElement.offsetTop-commTop);
        }
    };

    setTimeout(() => task());
    //切换语言不选中
    const pushState = window.history.pushState;
    window.history.pushState = (...args) => {
        pushState(args);
        task();
    };
};

(function () {
    "use strict";
    // mysql
    Load(
        () => location.host == "dev.mysql.com",
        () => MysqlDocSelct("font-size:16px;color:#f29221;")
    );

    //mdn
    Load(
        () => location.host == "developer.mozilla.org",
        () => MDnDocSelect()
    );
})();
