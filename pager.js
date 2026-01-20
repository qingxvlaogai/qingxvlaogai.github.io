// pager.js
// 自动扫描 GitHub 仓库根目录下的 novel-*.html，生成循环翻页
(async function () {
  try {
    const prevEl = document.getElementById("prevPage");
    const nextEl = document.getElementById("nextPage");
    if (!prevEl || !nextEl) return;

    // 当前文件名，例如 "novel-001.html"
    const current = location.pathname.split("/").pop();

    // 你的 GitHub Pages 域名通常是：username.github.io
    // 仓库名同域名。我们从域名推断 owner/repo：
    // https://qingxvlaogai.github.io -> owner=qingxvlaogai, repo=qingxvlaogai.github.io
    const host = location.hostname; // qingxvlaogai.github.io
    const owner = host.split(".")[0];
    const repo = host; // repo = qingxvlaogai.github.io

    const cacheKey = `novels:${owner}/${repo}`;
    const cacheTTLms = 1000 * 60 * 10; // 10分钟缓存，避免频繁打 GitHub API

    function loadCache() {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || !obj.t || !obj.files) return null;
        if (Date.now() - obj.t > cacheTTLms) return null;
        return obj.files;
      } catch {
        return null;
      }
    }

    function saveCache(files) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), files }));
      } catch {}
    }

    // 拉取仓库根目录文件列表
    async function fetchNovelFiles() {
      const cached = loadCache();
      if (cached) return cached;

      const api = `https://api.github.com/repos/${owner}/${repo}/contents/`;
      const res = await fetch(api, { headers: { "Accept": "application/vnd.github+json" } });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const items = await res.json();

      // 只取 novel-*.html
      const files = items
        .filter(x => x && x.type === "file" && /^novel-\d+\.html$/i.test(x.name))
        .map(x => x.name)
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)[0], 10);
          const nb = parseInt(b.match(/\d+/)[0], 10);
          return na - nb;
        });

      saveCache(files);
      return files;
    }

    const files = await fetchNovelFiles();
    if (!files.length) return;

    const idx = files.indexOf(current);

    // 如果当前页不是按命名规则来的，就不做任何事
    if (idx === -1) return;

    const prev = files[(idx - 1 + files.length) % files.length];
    const next = files[(idx + 1) % files.length];

    prevEl.href = prev;
    nextEl.href = next;

    // 可选：让键盘左右键也能翻页（桌面更像书）
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") location.href = prev;
      if (e.key === "ArrowRight") location.href = next;
    });
  } catch (err) {
    // 静默失败：不影响正文阅读
    // console.error(err);
  }
})();
