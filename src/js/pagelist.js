(function () {
    function el(selector) {
        return document.querySelector(selector);
    }

    function fetchData(url, callback) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                callback(xhttp.responseText);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function appendHtml(pagesData, configData) {
        const pages = JSON.parse(pagesData);
        const config = JSON.parse(configData);

        const pagesHtml = pages
            .map((page) => {
                return `<a href="${page}">${page}</a>`;
            })
            .join("");

        let repoHtml = "";
        if (config.repoUrl) {
            repoHtml = `<a href="${config.repoUrl}" target="_blank" class="pl__repo">
                Репозиторий
            </a>`;
        }

        let zipHtml = "";
        if (config.zipUrl) {
            repoHtml = `<a href="${config.zipUrl}" target="_blank" class="pl__zip">
                Скачать архив
            </a>`;
        }

        const div = document.createElement("div");
        div.innerHTML = `
            <div class="pl" id="pl">
                <div class="pl__btn">Pages count: ${pages.length}</div>
                <div class="pl__body">
                    <div class="pl__nav">
                        ${pagesHtml}
                    </div>
                    <div class="pl__nav">
                        ${zipHtml}
                        ${repoHtml}
                        <a href="#" class="pl__hide">Скрыть</a>
                    </div>
                    <div class="pl__tip">
                        <div class="pl__text">
                            Можно щелкнуть мышкой дважды в любом месте, чтобы скрыть или
                            показать.
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    function onDoubleClick(e) {
        const plEl = el("#pl");
        const isHidden = plEl.classList.contains("pl--hidden");
        plEl.classList.toggle("pl--hidden", !isHidden);
    }

    function onButtonClick(e) {
        if (e.target.classList.contains("pl__btn")) {
            const plEl = el("#pl");
            const isActive = plEl.classList.contains("pl--active");
            plEl.classList.toggle("pl--active", !isActive);
        }
    }

    function onOutsideClick(e) {
        const plEl = el("#pl");
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

    window.addEventListener("DOMContentLoaded", () => {
        fetchData("pagelist.json", (pagesData) => {
            fetchData("config.json", (configData) => {
                appendHtml(pagesData, configData);
                addListeners();
            });
        });
    });
})();
