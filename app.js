const axios = require('axios');
const { JSDOM } = require('jsdom');

// Atom feed XML 생성 헬퍼 함수
function createXMLElement(doc, tagName, text) {
    const element = doc.createElement(tagName);
    if (text) {
        element.textContent = text;
    }
    return element;
}

// HTML 파일에서 공지사항을 추출하고 Atom 피드 생성
async function generateAtomFeed() {
    // PAYCO 개발자센터 고객지원 페이지에서 HTML 가져오기
    const { data: html } = await axios.get('https://developers.payco.com/cs');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const notices = document.querySelectorAll("#noticeTableBody .noticeTitle");

    // Atom 피드 XML 생성
    const feedDoc = new JSDOM().window.document;
    const feedElement = createXMLElement(feedDoc, "feed");
    feedElement.setAttribute("xmlns", "http://www.w3.org/2005/Atom");

    // 피드 정보
    const title = createXMLElement(feedDoc, "title", "PAYCO 공지사항 피드");
    const link = createXMLElement(feedDoc, "link");
    link.setAttribute("href", "https://gilchris.github.io/feeds/payco_developer_notice.xml");
    const updated = createXMLElement(feedDoc, "updated", new Date().toISOString());

    feedElement.appendChild(title);
    feedElement.appendChild(link);
    feedElement.appendChild(updated);

    // 공지사항을 Atom 피드 항목으로 추가
    notices.forEach((notice) => {
        const entry = createXMLElement(feedDoc, "entry");
        const entryTitle = createXMLElement(feedDoc, "title", notice.querySelector("a").textContent);
        const entryLink = createXMLElement(feedDoc, "link");
        entryLink.setAttribute("href", "https://developers.payco.com" + notice.querySelector("a").getAttribute("href"));
        const dateElement = notice.nextElementSibling.querySelector(".date");
        let updatedDate = "";
        if (!!dateElement) {
            updatedDate = dateElement.textContent;
        }
        const entryUpdated = createXMLElement(feedDoc, "updated", updatedDate);

        entry.appendChild(entryTitle);
        entry.appendChild(entryLink);
        entry.appendChild(entryUpdated);

        feedElement.appendChild(entry);
    });

    feedDoc.body.appendChild(feedElement);

    // XML 문자열 반환
    const serializer = new feedDoc.defaultView.XMLSerializer();
    return serializer.serializeToString(feedDoc);
}

(function () {
    generateAtomFeed().then((atomFeed) => {
        process.stdout.write(atomFeed);
    }).catch((error) => {
        console.error(error);
    });
})();