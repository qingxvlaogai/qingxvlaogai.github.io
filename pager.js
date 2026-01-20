(function () {
  // 所有小说页的文件名（顺序 = 阅读顺序）
  const pages = [
    "novel-001.html",
    "novel-002.html",
    "novel-003.html"
    // 以后只在这里加
  ];

  const current = location.pathname.split("/").pop();
  const index = pages.indexOf(current);

  if (index === -1) return;

  const prev = pages[(index - 1 + pages.length) % pages.length];
  const next = pages[(index + 1) % pages.length];

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (prevBtn) prevBtn.href = prev;
  if (nextBtn) nextBtn.href = next;
})();
