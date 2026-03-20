// app.js
(function () {
  const data = SITE_DATA;
  const page = document.body.dataset.page;

  let boardPostsCache = [];

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };

  function getMember(id) {
    return data.members.find(m => m.id === id);
  }

  function getWork(id) {
    return data.works.find(w => w.id === id);
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return dateStr.replaceAll("-", ".");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showTooltip(evt, html) {
    const tip = $("#tooltip");
    if (!tip) return;
    tip.innerHTML = html;
    tip.hidden = false;

    const offset = 14;
    let left = evt.clientX + offset;
    let top = evt.clientY + offset;

    requestAnimationFrame(() => {
      const rect = tip.getBoundingClientRect();
      if (left + rect.width > window.innerWidth - 10) {
        left = evt.clientX - rect.width - offset;
      }
      if (top + rect.height > window.innerHeight - 10) {
        top = evt.clientY - rect.height - offset;
      }
      tip.style.left = `${Math.max(10, left)}px`;
      tip.style.top = `${Math.max(10, top)}px`;
    });
  }

  function hideTooltip() {
    const tip = $("#tooltip");
    if (!tip) return;
    tip.hidden = true;
  }

  function attachTooltip(node, html) {
    node.addEventListener("mousemove", e => showTooltip(e, html));
    node.addEventListener("mouseleave", hideTooltip);
  }

  function renderAbout() {
    const about = $("#aboutContent");
    if (about) about.innerHTML = data.site.about;
  }

  function renderContact() {
    const wrap = $("#contactContent");
    if (!wrap) return;
    wrap.innerHTML = `
      <p>メール: <a href="mailto:${data.site.contact.email}">${data.site.contact.email}</a></p>
      <p>メンバー投稿フォーム: <a href="${data.site.memberFormUrl}" target="_blank" rel="noopener noreferrer">Googleフォームを開く</a></p>
      <div class="inline-list">
        ${data.site.contact.sns.map(s => `<a class="person-chip" href="${s.url}">${s.name}</a>`).join("")}
      </div>
    `;
  }

  async function fetchBoardPosts() {
    const api = data.site.apiBaseUrl;
    if (!api || api === "https://script.google.com/macros/s/AKfycbwTbGHWHAQ7wKYW-OFJzhaxe_WoI97P8PaEoQbT767WubU-oDgsH25A1pjInihw7KfMzA/exec") {
      console.warn("Apps Script URLが未設定です");
      boardPostsCache = [];
      return [];
    }

    const res = await fetch(`${api}?mode=posts`, {
      method: "GET"
    });

    if (!res.ok) {
      throw new Error("投稿データの取得に失敗しました。");
    }

    const json = await res.json();
    boardPostsCache = Array.isArray(json.posts) ? json.posts : [];
    return boardPostsCache;
  }

  function renderBoard(container, posts, mode = "home") {
    container.innerHTML = "";

    const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

    if (!sorted.length) {
      container.innerHTML = `<p class="muted">まだ投稿がありません。</p>`;
      return;
    }

    sorted.forEach(post => {
      const item = el("div", "board-item");

      const member = post.memberId ? getMember(post.memberId) : null;

      let worksHtml = "";
      if (post.workIds && post.workIds.length) {
        worksHtml = post.workIds.map(workId => {
          const work = getWork(workId);
          if (!work) return "";
          return `
            <a class="work-chip" href="work.html?id=${work.id}">
              <img class="thumb" src="${work.thumbnail}" alt="${escapeHtml(work.title)}">
            </a>
          `;
        }).join("");
      } else {
        worksHtml = `<span class="muted">なし</span>`;
      }

      const nameHtml = member
        ? `
          <a class="person-chip" href="member.html?id=${member.id}">
            <span class="avatar">${member.icon}</span>
            <span>${escapeHtml(member.name)}</span>
          </a>
        `
        : `
          <span class="person-chip">
            <span class="avatar">外</span>
            <span>${escapeHtml(post.name || "投稿者")}</span>
          </span>
        `;

      if (mode === "home") {
        item.innerHTML = `
          <div class="board-person">${nameHtml}</div>
          <div class="board-works">${worksHtml}</div>
          <div class="board-date">${formatDate(post.date)}</div>
          <div class="board-comment">${escapeHtml(post.comment || "")}</div>
        `;
      } else if (mode === "work") {
        item.innerHTML = `
          <div class="board-person">${nameHtml}</div>
          <div class="board-date">${formatDate(post.date)}</div>
          <div class="board-comment">${escapeHtml(post.comment || "")}</div>
        `;
      } else if (mode === "member") {
        item.innerHTML = `
          <div class="board-works">${worksHtml}</div>
          <div class="board-date">${formatDate(post.date)}</div>
          <div class="board-comment">${escapeHtml(post.comment || "")}</div>
        `;
      }

      container.appendChild(item);
    });
  }

  async function renderHomeBoard() {
    const list = $("#boardList");
    if (!list) return;

    list.innerHTML = `<p class="muted">読み込み中...</p>`;

    try {
      const posts = await fetchBoardPosts();
      renderBoard(list, posts, "home");
    } catch (err) {
      list.innerHTML = `<p class="muted">投稿の読み込みに失敗しました。</p>`;
      console.error(err);
    }
  }

  function addSvgText(svg, x, y, text, options = {}) {
    const svgNS = "http://www.w3.org/2000/svg";
    const {
      fontSize = 16,
      fontWeight = "400",
      fill = "#111",
      anchor = "start",
      lines = null,
      lineHeight = 1.25
    } = options;

    if (lines && Array.isArray(lines)) {
      const textEl = document.createElementNS(svgNS, "text");
      textEl.setAttribute("x", x);
      textEl.setAttribute("y", y);
      textEl.setAttribute("font-size", String(fontSize));
      textEl.setAttribute("font-weight", String(fontWeight));
      textEl.setAttribute("fill", fill);
      textEl.setAttribute("text-anchor", anchor);
      textEl.setAttribute("font-family", "sans-serif");

      lines.forEach((line, i) => {
        const tspan = document.createElementNS(svgNS, "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("dy", i === 0 ? "0" : `${fontSize * lineHeight}`);
        tspan.textContent = line;
        textEl.appendChild(tspan);
      });

      svg.appendChild(textEl);
      return textEl;
    }

    const textEl = document.createElementNS(svgNS, "text");
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("font-size", String(fontSize));
    textEl.setAttribute("font-weight", String(fontWeight));
    textEl.setAttribute("fill", fill);
    textEl.setAttribute("text-anchor", anchor);
    textEl.setAttribute("font-family", "sans-serif");
    textEl.textContent = text;
    svg.appendChild(textEl);
    return textEl;
  }

  function splitTitle(title, maxPerLine = 7) {
    if (title.length <= maxPerLine) return [title];
    const lines = [];
    let current = "";
    for (const ch of title) {
      current += ch;
      if (current.length >= maxPerLine) {
        lines.push(current);
        current = "";
      }
    }
    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  function renderWorksGraph() {
    const container = $("#worksGraph");
    if (!container) return;

    const works = data.works;
    const members = data.members;
    const svgNS = "http://www.w3.org/2000/svg";

    const leftBlockX = 24;
    const workCardW = 260;
    const workCardH = 96;
    const railStartX = 390;
    const memberGap = 120;
    const memberTopY = 34;
    const rowTopPad = 78;
    const rowGap = 132;
    const railEndPadding = 90;
    const bandWidth = 20;
    const nodeRadius = 11;

    const width = railStartX + memberGap * members.length + railEndPadding;
    const height = rowTopPad + rowGap * works.length + 20;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("class", "graph-svg");

    const xByMember = {};
    const yByWork = {};

    members.forEach((member, i) => {
      xByMember[member.id] = railStartX + i * memberGap;
    });

    works.forEach((work, i) => {
      yByWork[work.id] = rowTopPad + i * rowGap;
    });

    works.forEach(work => {
      const y = yByWork[work.id];

      const workLine = document.createElementNS(svgNS, "line");
      workLine.setAttribute("x1", leftBlockX + workCardW);
      workLine.setAttribute("y1", y);
      workLine.setAttribute("x2", width - 28);
      workLine.setAttribute("y2", y);
      workLine.setAttribute("stroke", "#222");
      workLine.setAttribute("stroke-width", "1.6");
      svg.appendChild(workLine);

      const workLink = document.createElementNS(svgNS, "a");
      workLink.setAttribute("href", `work.html?id=${work.id}`);

      const thumb = document.createElementNS(svgNS, "image");
      thumb.setAttribute("href", work.thumbnail);
      thumb.setAttribute("x", leftBlockX);
      thumb.setAttribute("y", y - workCardH / 2);
      thumb.setAttribute("width", workCardW);
      thumb.setAttribute("height", workCardH);
      thumb.setAttribute("preserveAspectRatio", "xMidYMid slice");
      workLink.appendChild(thumb);

      const overlay = document.createElementNS(svgNS, "rect");
      overlay.setAttribute("x", leftBlockX);
      overlay.setAttribute("y", y - workCardH / 2);
      overlay.setAttribute("width", workCardW);
      overlay.setAttribute("height", workCardH);
      overlay.setAttribute("fill", "rgba(255,255,255,0.38)");
      overlay.setAttribute("stroke", "#222");
      workLink.appendChild(overlay);

      svg.appendChild(workLink);

      const labelBg = document.createElementNS(svgNS, "rect");
      labelBg.setAttribute("x", leftBlockX + 12);
      labelBg.setAttribute("y", y - 34);
      labelBg.setAttribute("width", 126);
      labelBg.setAttribute("height", 68);
      labelBg.setAttribute("fill", "rgba(255,255,255,0.88)");
      svg.appendChild(labelBg);

      const titleLines = splitTitle(work.title, 7);
      addSvgText(svg, leftBlockX + 18, y - 12, "", {
        fontSize: 17,
        fontWeight: "700",
        lines: titleLines
      });

      addSvgText(svg, leftBlockX + 18, y + 20, work.period, {
        fontSize: 13,
        fill: "#444"
      });
    });

    members.forEach(member => {
      const x = xByMember[member.id];
      const memberWorks = works.filter(w => w.participantIds.includes(member.id));
      if (!memberWorks.length) return;

      const ys = memberWorks.map(w => yByWork[w.id]).sort((a, b) => a - b);
      const yMin = ys[0];
      const yMax = ys[ys.length - 1];

      const band = document.createElementNS(svgNS, "rect");
      band.setAttribute("x", x - bandWidth / 2);
      band.setAttribute("y", yMin);
      band.setAttribute("width", bandWidth);
      band.setAttribute("height", yMax - yMin);
      band.setAttribute("rx", bandWidth / 2);
      band.setAttribute("fill", "#fff");
      band.setAttribute("stroke", "#222");
      band.setAttribute("stroke-width", "2");
      band.style.cursor = "pointer";
      svg.appendChild(band);

      band.addEventListener("mousemove", e => showTooltip(e, `${member.name}`));
      band.addEventListener("mouseleave", hideTooltip);
      band.addEventListener("click", () => {
        location.href = `member.html?id=${member.id}`;
      });

      const iconLink = document.createElementNS(svgNS, "a");
      iconLink.setAttribute("href", `member.html?id=${member.id}`);

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", memberTopY);
      circle.setAttribute("r", 16);
      circle.setAttribute("fill", "#fff");
      circle.setAttribute("stroke", "#222");
      iconLink.appendChild(circle);

      const iconText = document.createElementNS(svgNS, "text");
      iconText.setAttribute("x", x);
      iconText.setAttribute("y", memberTopY + 5);
      iconText.setAttribute("text-anchor", "middle");
      iconText.setAttribute("font-size", "12");
      iconText.setAttribute("font-family", "sans-serif");
      iconText.textContent = member.icon;
      iconLink.appendChild(iconText);

      svg.appendChild(iconLink);

      addSvgText(svg, x, memberTopY + 30, member.name, {
        fontSize: 12,
        anchor: "middle"
      });
    });

    works.forEach(work => {
      const y = yByWork[work.id];

      work.participantIds.forEach(memberId => {
        const member = getMember(memberId);
        const x = xByMember[memberId];

        const node = document.createElementNS(svgNS, "circle");
        node.setAttribute("cx", x);
        node.setAttribute("cy", y);
        node.setAttribute("r", nodeRadius);
        node.setAttribute("fill", "#fff");
        node.setAttribute("stroke", "#222");
        node.setAttribute("stroke-width", "1.6");
        node.style.cursor = "pointer";
        svg.appendChild(node);

        const message = `
          <strong>${member.name}</strong><br>
          ${work.contributions[memberId]}
        `;

        node.addEventListener("mousemove", e => showTooltip(e, message));
        node.addEventListener("mouseleave", hideTooltip);
        node.addEventListener("click", () => {
          location.href = `member.html?id=${memberId}`;
        });
      });
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  async function renderWorkPage() {
    const id = getQueryParam("id");
    const work = getWork(id);
    const wrap = $("#workPage");
    if (!wrap) return;

    if (!work) {
      wrap.innerHTML = `<p>作品が見つかりません。</p>`;
      return;
    }

    wrap.innerHTML = `
      <div class="page-hero">
        <h1>${work.title}</h1>
        <img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">
        <div class="meta">期間: ${work.period}</div>

        <div>
          <h3>参加者</h3>
          <div class="member-detail-list" id="workMemberList"></div>
        </div>

        <div>
          <h3>概要</h3>
          <p>${work.summary}</p>
        </div>

        <div>
          <h3>掲示板</h3>
          <div id="workBoard"></div>
        </div>
      </div>
    `;

    const memberList = $("#workMemberList");
    work.participantIds.forEach(memberId => {
      const member = getMember(memberId);
      const link = el(
        "a",
        "member-detail-link",
        `
          <span class="avatar">${member.icon}</span>
          <span>${escapeHtml(member.name)}</span>
        `
      );
      link.href = `member.html?id=${member.id}`;
      attachTooltip(link, `<strong>${member.name}</strong><br>${work.contributions[member.id]}`);
      memberList.appendChild(link);
    });

    const board = $("#workBoard");
    board.innerHTML = `<p class="muted">読み込み中...</p>`;

    try {
      const posts = boardPostsCache.length ? boardPostsCache : await fetchBoardPosts();
      renderBoard(
        board,
        posts.filter(post => (post.workIds || []).includes(work.id)),
        "work"
      );
    } catch (err) {
      board.innerHTML = `<p class="muted">投稿の読み込みに失敗しました。</p>`;
    }
  }

  async function renderMemberPage() {
    const id = getQueryParam("id");
    const member = getMember(id);
    const wrap = $("#memberPage");
    if (!wrap) return;

    if (!member) {
      wrap.innerHTML = `<p>参加者が見つかりません。</p>`;
      return;
    }

    const memberWorks = data.works.filter(work => work.participantIds.includes(member.id));

    wrap.innerHTML = `
      <div class="page-hero">
        <h1>${member.name}</h1>

        <div class="person-chip" style="width: fit-content;">
          <span class="avatar">${member.icon}</span>
          <span>${escapeHtml(member.name)}</span>
        </div>

        <div>
          <h3>情報</h3>
          <p>${member.bio}</p>
        </div>

        <div>
          <h3>参加作品</h3>
          <div class="work-list-grid" id="memberWorks"></div>
        </div>

        <div>
          <h3>投稿</h3>
          <div id="memberBoard"></div>
        </div>
      </div>
    `;

    const worksWrap = $("#memberWorks");
    memberWorks.forEach(work => {
      const tile = el("a", "work-tile");
      tile.href = `work.html?id=${work.id}`;
      tile.innerHTML = `
        <img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">
        <div class="caption">
          <div>${escapeHtml(work.title)}</div>
          <div class="muted">${work.period}</div>
        </div>
      `;
      attachTooltip(tile, `${work.contributions[member.id]}`);
      worksWrap.appendChild(tile);
    });

    const board = $("#memberBoard");
    board.innerHTML = `<p class="muted">読み込み中...</p>`;

    try {
      const posts = boardPostsCache.length ? boardPostsCache : await fetchBoardPosts();
      renderBoard(
        board,
        posts.filter(post => post.memberId === member.id),
        "member"
      );
    } catch (err) {
      board.innerHTML = `<p class="muted">投稿の読み込みに失敗しました。</p>`;
    }
  }

  function buildGuestWorkCheckboxes() {
    const wrap = $("#guestWorkCheckboxes");
    if (!wrap) return;

    wrap.innerHTML = data.works.map(work => `
      <label class="checkbox-row">
        <input type="checkbox" name="workIds" value="${work.id}">
        <span>${escapeHtml(work.title)}</span>
      </label>
    `).join("");
  }

  function setupPostModal() {
    const modal = $("#postModal");
    const openBtn = $("#openPostModalBtn");
    const closeBtn = $("#closePostModalBtn");
    const backdrop = $("#modalBackdrop");

    if (!modal || !openBtn || !closeBtn || !backdrop) return;

    const openModal = () => {
      modal.hidden = false;
    };

    const closeModal = () => {
      modal.hidden = true;
      const status = $("#guestPostStatus");
      if (status) status.textContent = "";
    };

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  async function submitGuestPost(payload) {
    const api = data.site.apiBaseUrl;
    if (!api || api === "https://script.google.com/macros/s/AKfycbwTbGHWHAQ7wKYW-OFJzhaxe_WoI97P8PaEoQbT767WubU-oDgsH25A1pjInihw7KfMzA/exec") {
      throw new Error("Apps Script URLが未設定です。");
    }

    const res = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("送信に失敗しました。");
    }

    return await res.json();
  }

  function setupGuestPostForm() {
    const form = $("#guestPostForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const status = $("#guestPostStatus");
      if (status) status.textContent = "";

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const comment = String(formData.get("comment") || "").trim();
      const workIds = formData.getAll("workIds").map(String);

      if (!name || !comment) {
        if (status) status.textContent = "名前とコメントを入力してください。";
        return;
      }

      const ok = window.confirm("本当に送信しますか？");
      if (!ok) return;

      try {
        if (status) status.textContent = "送信中...";
        await submitGuestPost({
          type: "guestPost",
          name,
          comment,
          workIds
        });

        form.reset();
        if (status) status.textContent = "送信しました。";

        await renderHomeBoard();

        const modal = $("#postModal");
        setTimeout(() => {
          if (modal) modal.hidden = true;
        }, 500);
      } catch (err) {
        console.error(err);
        if (status) status.textContent = "送信に失敗しました。";
      }
    });
  }

  if (page === "home") {
    renderAbout();
    renderWorksGraph();
    renderHomeBoard();
    renderContact();
    buildGuestWorkCheckboxes();
    setupPostModal();
    setupGuestPostForm();
  }

  if (page === "work") {
    renderWorkPage();
  }

  if (page === "member") {
    renderMemberPage();
  }
})();