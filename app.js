const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const BASE_URL = "https://developers.payco.com/cs";
const DATA_DIR = path.join(process.env.GIT_PATH || __dirname, "feeds");
const JSON_FILE = path.join(DATA_DIR, process.env.JSON_FILE || "payco_notices.json");
const ATOM_FILE = path.join(DATA_DIR, process.env.FEED_FILE || "payco_notice_feed.xml");

// 디렉토리 확인 및 생성
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// HTML에서 공지사항 추출
async function fetchAndParseHTML() {
    try {
        const response = await axios.get(BASE_URL);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const notices = [];
        const noticeRows = document.querySelectorAll("#noticeTableBody > tr.noticeTitle");

        noticeRows.forEach((row) => {
            const id = row.querySelector("td:nth-child(1)").textContent.trim();
            const title = row.querySelector("td:nth-child(2) a").textContent.trim();
            const date = row.querySelector("td:nth-child(3)").textContent.trim();
            notices.push({ id, title, date });
        });

        return notices;
    } catch (error) {
        console.error("Error fetching or parsing HTML:", error);
        return null;
    }
}

// JSON 파일 저장
function saveJSON(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// JSON 파일 읽기
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Atom Feed 생성
function createAtomFeed(notices) {
    const feed = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>PAYCO Notices</title>
  <updated>${new Date().toISOString()}</updated>
  <id>${BASE_URL}</id>
  ${notices
      .map(
          (notice) => `
  <entry>
    <title>${notice.title}</title>
    <id>${BASE_URL}/notice/${notice.id}</id>
    <updated>${new Date(notice.date).toISOString()}</updated>
  </entry>`
      )
      .join("\n")}
</feed>`;
    return feed;
}

// Atom Feed 저장
function saveAtomFeed(feed, filePath) {
    fs.writeFileSync(filePath, feed, "utf8");
}

// 메인 실행 함수
async function main() {
    console.log(`[${new Date().toISOString()}] Starting script...`);

    const newNotices = await fetchAndParseHTML();
    if (!newNotices) return;

    const existingNotices = readJSON(JSON_FILE);

    if (!existingNotices || JSON.stringify(existingNotices) !== JSON.stringify(newNotices)) {
        console.log("Notices have changed, updating files...");

        // JSON 파일 저장
        saveJSON(newNotices, JSON_FILE);

        // Atom Feed 생성 및 저장
        const atomFeed = createAtomFeed(newNotices);
        saveAtomFeed(atomFeed, ATOM_FILE);

        console.log(`Updated notices and feed saved to ${JSON_FILE} and ${ATOM_FILE}.`);
    } else {
        console.log("No changes detected in notices.");
    }
}

main(); // 즉시 실행
