(function () {
  const data = SITE_DATA;
  const page = document.body.dataset.page;

  const GRAPH = {
    leftX: 20,
    cardW: 244,
    cardH: 92,
    railX: 360,
    memberGap: 108,
    memberTopY: 36,
    memberLabelY: 12,
    rowTop: 92,
    rowGap: 118,
    endPad: 72,
    nodeR: 10
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const svgNS = "http://www.w3.org/2000/svg";

  const membersById = Object.fromEntries(data.members.map(m => [m.id, m]));
  const worksById = Object.fromEntries(data.works.map(w => [w.id, w]));

  let boardPostsCache = [];
  let activeBubbleTrigger = null;

  function el(tag, className = "", html = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html) node.innerHTML = html;
    return node;
  }

  function getQueryParam(name) {
    return new URL(location.href).searchParams.get(name);
  }

  function formatDate(dateStr) {
    return dateStr ? dateStr.replaceAll("-", ".") : "";
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function postTime(post) {
    const raw = post.timestamp || post.createdAt || post.datetime || post.dateTime || "";
    const t = new Date(raw).getTime();
    if (!Number.isNaN(t)) return t;

    const fallback = post.date ? new Date(`${post.date}T00:00:00`).getTime() : 0;
    return Number.isNaN(fallback) ? 0 : fallback;
  }

  function bubbleHtml({ memberName, memberIcon, workTitle, contribution }) {
    return `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <span class="avatar">${escapeHtml(memberIcon)}</span>
          <div>
            <div class="bubble-card-name">${escapeHtml(memberName)}</div>
            <div class="bubble-card-meta">作品：${escapeHtml(workTitle)}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(contribution || "記述なし")}</div>
      </div>
    `;
  }

  function getTooltip() {
    return $("#tooltip");
  }

  function clearActiveBubbleTrigger() {
    if (!activeBubbleTrigger) return;
    activeBubbleTrigger.classList.remove("bubble-open");
    activeBubbleTrigger.removeAttribute("data-bubble-open");
    activeBubbleTrigger = null;
  }

  function hideBubble() {
    const tip = getTooltip();
    if (!tip) return;

    tip.classList.remove("is-visible", "is-left", "is-right");
    tip.hidden = true;
    tip.innerHTML = "";
    tip.style.left = "";
    tip.style.top = "";

    clearActiveBubbleTrigger();
  }

  function showBubbleAtRect(html, rect, trigger = null) {
    const tip = getTooltip();
    if (!tip || !html) return;

    clearActiveBubbleTrigger();

    tip.innerHTML = html;
    tip.hidden = false;
    tip.classList.add("is-bubble");

    if (trigger) {
      activeBubbleTrigger = trigger;
      trigger.classList.add("bubble-open");
      trigger.setAttribute("data-bubble-open", "1");
    }

    const gap = 18;
    const centerY = rect.top + rect.height / 2;

    requestAnimationFrame(() => {
      const tipRect = tip.getBoundingClientRect();

      let left = rect.right + gap;
      let side = "right";

      if (left + tipRect.width > window.innerWidth - 16) {
        left = rect.left - tipRect.width - gap;
        side = "left";
      }

      let top = centerY - tipRect.height / 2;

      if (top < 12) top = 12;
      if (top + tipRect.height > window.innerHeight - 12) {
        top = window.innerHeight - tipRect.height - 12;
      }

      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.classList.remove("is-left", "is-right");
      tip.classList.add(side === "right" ? "is-right" : "is-left");

      requestAnimationFrame(() => {
        tip.classList.add("is-visible");
      });
    });
  }

  function showBubbleAtEvent(html, event, trigger = null) {
    const x = event.clientX;
    const y = event.clientY;
    const fakeRect = {
      left: x,
      right: x,
      top: y,
      bottom: y,
      width: 0,
      height: 0
    };
    showBubbleAtRect(html, fakeRect, trigger);
  }

  function attachInfoBubble(node, html, isLink = false) {
    node.classList.add("bubble-trigger");
    node.setAttribute("tabindex", node.getAttribute("tabindex") || "0");

    node.addEventListener("click", event => {
      const isOpen = node.getAttribute("data-bubble-open") === "1";

      if (isLink && !isOpen) event.preventDefault();
      event.stopPropagation();

      if (isLink && isOpen) {
        hideBubble();
        return;
      }

      if (isLink) {
        showBubbleAtEvent(html, event, node);
        return;
      }

      const rect = node.getBoundingClientRect();
      showBubbleAtRect(html, rect, node);
    });

    node.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;

      const isOpen = node.getAttribute("data-bubble-open") === "1";
      event.preventDefault();
      event.stopPropagation();

      if (isLink && isOpen && node.href) {
        location.href = node.href;
        return;
      }

      const rect = node.getBoundingClientRect();
      showBubbleAtRect(html, rect, node);
    });
  }

  function setupBubbleSystem() {
    const tip = getTooltip();
    if (!tip) return;

    tip.addEventListener("click", e => e.stopPropagation());

    document.addEventListener("click", e => {
      const t = e.target;
      if (!t.closest(".bubble-trigger") && !t.closest("#tooltip")) hideBubble();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") hideBubble();
    });

    addEventListener("scroll", () => {
      if (!tip.hidden) hideBubble();
    }, { passive: true });

    addEventListener("resize", () => {
      if (!tip.hidden) hideBubble();
    });
  }

  function renderAbout() {
    const about = $("#aboutContent");
    if (about) about.innerHTML = data.site.about;
  }

  function renderContact() {
    const wrap = $("#contactContent");
    if (!wrap) return;
    wrap.innerHTML = `<p>メール: <a href="mailto:${data.site.contact.email}">${data.site.contact.email}</a></p>`;
  }

  async function fetchBoardPosts() {
    const api = (data.site.apiBaseUrl || "").trim();

    if (!api || api === "YOUR_APPS_SCRIPT_WEB_APP_URL") {
      console.warn("Apps Script URLが未設定です");
      boardPostsCache = [];
      return [];
    }

    const res = await fetch(`${api}?mode=posts`);
    if (!res.ok) throw new Error("投稿データの取得に失敗しました。");

    const json = await res.json();
    boardPostsCache = Array.isArray(json.posts) ? json.posts : [];
    return boardPostsCache;
  }

  function personHtml(post) {
    const member = post.memberId ? membersById[post.memberId] : null;

    return member
      ? `
        <a class="person-chip" href="member.html?id=${member.id}">
          <span class="avatar">${member.icon}</span>
          <span>${escapeHtml(member.name)}</span>
        </a>
      `
      : `
        <span class="person-chip guest-chip">
          <span>${escapeHtml(post.name || "投稿者")}</span>
        </span>
      `;
  }

  function worksHtml(post) {
    if (!post.workIds?.length) return "";

    return post.workIds.map(id => {
      const work = worksById[id];
      if (!work) return "";

      return `
        <a class="work-ref" href="work.html?id=${work.id}">
          <span class="work-ref-thumb-wrap">
            <img class="thumb" src="${work.thumbnail}" alt="${escapeHtml(work.title)}">
          </span>
          <span class="work-ref-text">に関して</span>
        </a>
      `;
    }).join("");
  }

  function boardItemHtml(post, mode) {
    const cols = {
      person: `<div class="board-person">${personHtml(post)}</div>`,
      works: `<div class="board-works">${worksHtml(post)}</div>`,
      date: `<div class="board-date">${formatDate(post.date)}</div>`,
      comment: `<div class="board-comment">${escapeHtml(post.comment || "")}</div>`
    };

    if (mode === "home") return [cols.person, cols.works, cols.date, cols.comment].join("");
    if (mode === "work") return [cols.person, cols.date, cols.comment].join("");
    return [cols.works, cols.date, cols.comment].join("");
  }

  function renderBoard(container, posts, mode = "home") {
    const sorted = [...posts].sort((a, b) => postTime(b) - postTime(a));

    if (!sorted.length) {
      container.innerHTML = `<p class="muted">まだ投稿がありません。</p>`;
      return;
    }

    container.innerHTML = "";
    sorted.forEach(post => {
      const item = el("div", "board-item", boardItemHtml(post, mode));
      container.appendChild(item);
    });
  }

  async function loadBoard(container, filterFn, mode) {
    container.innerHTML = `<p class="muted">読み込み中...</p>`;

    try {
      const posts = boardPostsCache.length ? boardPostsCache : await fetchBoardPosts();
      renderBoard(container, posts.filter(filterFn), mode);
    } catch (error) {
      console.error(error);
      container.innerHTML = `<p class="muted">投稿の読み込みに失敗しました。</p>`;
    }
  }

  function addSvgText(svg, x, y, options = {}) {
    const {
      text = "",
      lines = null,
      fontSize = 16,
      fontWeight = "400",
      fill = "#111",
      anchor = "start",
      lineHeight = 1.25
    } = options;

    const textEl = document.createElementNS(svgNS, "text");
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("font-size", fontSize);
    textEl.setAttribute("font-weight", fontWeight);
    textEl.setAttribute("fill", fill);
    textEl.setAttribute("text-anchor", anchor);
    textEl.setAttribute("font-family", "sans-serif");

    if (Array.isArray(lines)) {
      lines.forEach((line, i) => {
        const tspan = document.createElementNS(svgNS, "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("dy", i === 0 ? "0" : fontSize * lineHeight);
        tspan.textContent = line;
        textEl.appendChild(tspan);
      });
    } else {
      textEl.textContent = text;
    }

    svg.appendChild(textEl);
    return textEl;
  }

  function splitTitle(title, max = 7) {
    if (title.length <= max) return [title];

    const lines = [];
    let current = "";

    for (const ch of title) {
      current += ch;
      if (current.length >= max) {
        lines.push(current);
        current = "";
      }
    }

    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function renderWorksGraph() {
    const container = $("#worksGraph");
    if (!container) return;

    const works = data.works;
    const members = data.members;
    const width = GRAPH.railX + GRAPH.memberGap * members.length + GRAPH.endPad;
    const height = GRAPH.rowTop + GRAPH.rowGap * works.length + 20;

    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width,
      height,
      class: "graph-svg"
    });

    const xByMember = Object.fromEntries(
      members.map((m, i) => [m.id, GRAPH.railX + i * GRAPH.memberGap])
    );
    const yByWork = Object.fromEntries(
      works.map((w, i) => [w.id, GRAPH.rowTop + i * GRAPH.rowGap])
    );

    works.forEach(work => {
      const y = yByWork[work.id];

      svg.appendChild(svgEl("line", {
        x1: GRAPH.leftX + GRAPH.cardW,
        y1: y,
        x2: width - 28,
        y2: y,
        stroke: "#cfcfcf",
        "stroke-width": "1.2"
      }));

      const link = svgEl("a", {
        href: `work.html?id=${work.id}`,
        class: "graph-work-link"
      });

      link.appendChild(svgEl("image", {
        href: work.thumbnail,
        x: GRAPH.leftX,
        y: y - GRAPH.cardH / 2,
        width: GRAPH.cardW,
        height: GRAPH.cardH,
        preserveAspectRatio: "xMidYMid slice",
        class: "graph-work-image"
      }));

      link.appendChild(svgEl("rect", {
        x: GRAPH.leftX,
        y: y - GRAPH.cardH / 2,
        width: GRAPH.cardW,
        height: GRAPH.cardH,
        fill: "rgba(255,255,255,0.52)",
        stroke: "#d6d6d6",
        class: "graph-work-overlay"
      }));

      svg.appendChild(link);

      svg.appendChild(svgEl("rect", {
        x: GRAPH.leftX + 12,
        y: y - 30,
        width: 118,
        height: 60,
        fill: "rgba(255,255,255,0.88)",
        class: "graph-work-label-bg"
      }));

      addSvgText(svg, GRAPH.leftX + 18, y - 12, {
        lines: splitTitle(work.title),
        fontSize: 16,
        fontWeight: "600",
        fill: "#333"
      });

      addSvgText(svg, GRAPH.leftX + 18, y + 20, {
        text: work.period,
        fontSize: 13,
        fill: "#666"
      });
    });

    members.forEach(member => {
      const x = xByMember[member.id];
      const ys = works
        .filter(work => work.participantIds.includes(member.id))
        .map(work => yByWork[work.id])
        .sort((a, b) => a - b);

      if (!ys.length) return;

      svg.appendChild(svgEl("line", {
        x1: x,
        y1: Math.max(GRAPH.memberTopY + 18, ys[0]),
        x2: x,
        y2: ys.at(-1),
        stroke: "#d8d8d8",
        "stroke-width": "2.2",
        "stroke-linecap": "round",
        class: "graph-member-shaft"
      }));

      const iconLink = svgEl("a", {
        href: `member.html?id=${member.id}`,
        class: "graph-member-link"
      });

      iconLink.appendChild(svgEl("circle", {
        cx: x,
        cy: GRAPH.memberTopY,
        r: 16,
        fill: "#ffffff",
        stroke: "#bbbbbb",
        class: "graph-member-circle"
      }));

      addSvgText(iconLink, x, GRAPH.memberTopY + 5, {
        text: member.icon,
        fontSize: 12,
        fill: "#444",
        anchor: "middle"
      });

      svg.appendChild(iconLink);

      addSvgText(svg, x, GRAPH.memberLabelY, {
        text: member.name,
        fontSize: 11,
        fill: "#666",
        anchor: "middle"
      });
    });

    works.forEach(work => {
      const y = yByWork[work.id];

      work.participantIds.forEach(memberId => {
        const member = membersById[memberId];
        if (!member) return;

        const x = xByMember[memberId];
        const group = svgEl("g", {
          class: "graph-node-button bubble-trigger",
          tabindex: "0",
          role: "button",
          "aria-label": `${member.name}が${work.title}でやったことを表示`
        });

        group.appendChild(svgEl("circle", {
          cx: x,
          cy: y,
          r: 18,
          fill: "transparent"
        }));

        group.appendChild(svgEl("circle", {
          cx: x,
          cy: y,
          r: GRAPH.nodeR,
          fill: "#ffffff",
          stroke: "#bcbcbc",
          "stroke-width": "1.2"
        }));

        const html = bubbleHtml({
          memberName: member.name,
          memberIcon: member.icon,
          workTitle: work.title,
          contribution: work.contributions[member.id]
        });

        group.addEventListener("click", event => {
          event.stopPropagation();
          const rect = group.getBoundingClientRect();
          showBubbleAtRect(html, rect, group);
        });

        group.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          const rect = group.getBoundingClientRect();
          showBubbleAtRect(html, rect, group);
        });

        svg.appendChild(group);
      });
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function renderNotFound(wrap, label) {
    wrap.innerHTML = `<p>${label}が見つかりません。</p>`;
  }

  function memberLink(member, work) {
    const link = el(
      "a",
      "member-detail-link",
      `<span class="avatar">${member.icon}</span><span>${escapeHtml(member.name)}</span>`
    );
    link.href = `member.html?id=${member.id}`;

    attachInfoBubble(link, bubbleHtml({
      memberName: member.name,
      memberIcon: member.icon,
      workTitle: work.title,
      contribution: work.contributions[member.id]
    }), true);

    return link;
  }

  function workTile(work, member) {
    const tile = el("a", "work-tile", `
      <img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">
      <div class="caption">
        <div>${escapeHtml(work.title)}</div>
        <div class="muted">${work.period}</div>
      </div>
    `);

    tile.href = `work.html?id=${work.id}`;

    attachInfoBubble(tile, `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <div>
            <div class="bubble-card-name">${escapeHtml(work.title)}</div>
            <div class="bubble-card-meta">${escapeHtml(work.period)}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(work.contributions[member.id] || "記述なし")}</div>
      </div>
    `, true);

    return tile;
  }

  async function renderWorkPage() {
    const wrap = $("#workPage");
    if (!wrap) return;

    const work = worksById[getQueryParam("id")];
    if (!work) return renderNotFound(wrap, "作品");

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
    work.participantIds
      .map(id => membersById[id])
      .filter(Boolean)
      .forEach(member => memberList.appendChild(memberLink(member, work)));

    await loadBoard($("#workBoard"), post => (post.workIds || []).includes(work.id), "work");
  }

  async function renderMemberPage() {
    const wrap = $("#memberPage");
    if (!wrap) return;

    const member = membersById[getQueryParam("id")];
    if (!member) return renderNotFound(wrap, "参加者");

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
    memberWorks.forEach(work => worksWrap.appendChild(workTile(work, member)));

    await loadBoard($("#memberBoard"), post => post.memberId === member.id, "member");
  }

  function buildGuestWorkCheckboxes() {
    const wrap = $("#guestWorkCheckboxes");
    if (!wrap) return;

    wrap.innerHTML = data.works.map(work => `
      <label class="checkbox-row">
        <input class="checkbox-input" type="checkbox" name="workIds" value="${work.id}">
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

    const close = () => {
      modal.hidden = true;
      const status = $("#guestPostStatus");
      if (status) status.textContent = "";
    };

    openBtn.addEventListener("click", () => {
      modal.hidden = false;
    });
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) close();
    });
  }

  async function submitGuestPost(payload) {
    const api = (data.site.apiBaseUrl || "").trim();
    if (!api || api === "YOUR_APPS_SCRIPT_WEB_APP_URL") {
      throw new Error("Apps Script URLが未設定です。");
    }

    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("送信に失敗しました。");
    return res.json();
  }

  function setupGuestPostForm() {
    const form = $("#guestPostForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const status = $("#guestPostStatus");
      if (status) status.textContent = "";

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const comment = String(fd.get("comment") || "").trim();
      const workIds = fd.getAll("workIds").map(String);

      if (!name || !comment) {
        if (status) status.textContent = "名前とコメントを入力してください。";
        return;
      }

      if (!confirm("本当に送信しますか？")) return;

      try {
        if (status) status.textContent = "送信中...";

        await submitGuestPost({ type: "guestPost", name, comment, workIds });

        form.reset();
        if (status) status.textContent = "送信しました。";

        await loadBoard($("#boardList"), () => true, "home");

        const modal = $("#postModal");
        setTimeout(() => {
          if (modal) modal.hidden = true;
        }, 500);
      } catch (error) {
        console.error(error);
        if (status) status.textContent = "送信に失敗しました。";
      }
    });
  }

  function initHome() {
    renderAbout();
    renderWorksGraph();
    renderContact();
    buildGuestWorkCheckboxes();
    setupPostModal();
    setupGuestPostForm();
    loadBoard($("#boardList"), () => true, "home");
  }

  setupBubbleSystem();
  if (page === "home") initHome();
  if (page === "work") renderWorkPage();
  if (page === "member") renderMemberPage();
})();