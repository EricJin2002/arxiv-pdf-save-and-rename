// ==UserScript==
// @name         ArXiv PDF Save & Rename
// @description  Change the name of the downloaded file to the title of the paper.
// @namespace    Tampermonkey
// @version      0.1.0
// @author       EricJin2002
// @match        *://arxiv.org/abs/*
// @match        *://www.arxiv.org/abs/*
// @match        *://arxiv.org/search/*
// @match        *://www.arxiv.org/search/*
// @icon         https://arxiv.org/favicon.ico
// @grant        none
// @license      MIT
// ==/UserScript==



(function() {
    'use strict';
    const url = location.pathname,webTitle = document.title
    var downloadName = '',downloadPath = ''
    var papertitle = '',papertime = ''
    if(url.search('/abs/')!=-1){
        papertitle = document.querySelector("#abs > h1").innerText
        downloadPath = document.querySelector(".download-pdf")
        papertime = document.querySelector(".dateline").innerText.replace("[Submitted on ","").replace("]","")
        downloadName = renamePaperFile(papertitle,papertime)
        const ul = document.querySelector("#abs-outer > div.extra-services > div.full-text > ul")
        const li = document.createElement("li")
        ul.append(li)
        const btn = addDownloadButton(downloadPath,downloadName,li)
        btn.className = "abs-button download-eprint";
    }
    if(url.search('/search/')!=-1){
        var paperlist = document.querySelectorAll("#main-container > div.content > ol > li")
        for(let paper in paperlist){
            papertitle = paperlist[paper].children[1].innerText
            papertime = paperlist[paper].querySelector("p.is-size-7").innerText.split(";")[0].replace("Submitted ","")
            downloadName = renamePaperFile(papertitle,papertime)
            downloadPath = paperlist[paper].children[0].children[0].children[1].children[0].href+'.pdf'
            const btn = addDownloadButton(downloadPath,downloadName,paperlist[paper].children[0])
        }
    }

    function addDownloadButton(downloadPath,downloadName,element){
        var btn = document.createElement("a");
        // btn.id = "downloadPaper";
        btn.textContent = "Save&Rename";

        btn.addEventListener("click", async () => {
            try {
                /*
                const paperId = location.pathname.split("/").pop();
                const pdfUrl = `https://arxiv.org/pdf/${paperId}.pdf`;

                // Extract paper title
                const titleEl = document.querySelector("h1.title, h1");
                let title = titleEl ? titleEl.textContent.replace("Title:", "").trim() : paperId;
                title = title.replace(/[\\/:*?"<>|]/g, ""); // remove invalid chars for file names

                */

                btn.textContent = "📥 Downloading...";
                const pdfUrl = downloadPath

                // Fetch PDF as blob
                const response = await fetch(pdfUrl);
                const blob = await response.blob();

                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                btn.textContent = "✅ Download Complete!";
            } catch (err) {
                console.error(err);
                btn.textContent = "❌ Download Failed";
            }
        });

        // btn.setAttribute("href", downloadPath)
        // btn.setAttribute("download", downloadName)
        element.append(btn);
        return btn
    }
    function renamePaperFile(name,time){
        var downloadName = name.replace(': ','：')
        downloadName = downloadName.replace(':','：')
        downloadName = downloadName.replace('?','？')
        downloadName = downloadName.replace('/',' OR ')
        downloadName = downloadName.replace('"','“')+'.pdf'
        // return '['+time+']'+downloadName
        return downloadName
    }
})();
