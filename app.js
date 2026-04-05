(function () {
  const data = SITE_DATA;
  const page = document.body.dataset.page;

  const GRAPH = {
    leftX: 0,
    cardW: 244,
    cardH: 92,
    railX: 340,
    memberGap: 82,
    memberTopY: 36,
    memberLabelY: 12,
    rowTop: 92,
    rowGap: 118,
    endPad: 72,
    nodeR: 10
  };

  const MOBILE_BREAKPOINT = 640;

  const $ = (sel, root = document) => root.querySelector(sel);
  const svgNS = "http://www.w3.org/2000/svg";

  const membersById = Object.fromEntries(data.members.map(m => [m.id, m]));
  const worksById = Object.fromEntries(data.works.map(w => [w.id, w]));

  let boardPostsCache = [];
  let activeBubbleTrigger = null;
  let lastIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;

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

  function bubbleHtml({ memberName, memberIcon, contribution }) {
    return `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <span class="avatar">${escapeHtml(memberIcon)}</span>
          <div>
            <div class="bubble-card-name">${escapeHtml(memberName)}</div>
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
    tip.style.right = "";
    tip.style.bottom = "";

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

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (isMobile) {
      tip.style.left = "12px";
      tip.style.right = "12px";
      tip.style.bottom = "12px";
      tip.style.top = "auto";
      tip.classList.remove("is-left", "is-right");

      requestAnimationFrame(() => {
        tip.classList.add("is-visible");
      });
      return;
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
      tip.style.right = "";
      tip.style.bottom = "";
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
    showBubbleAtRect(html, {
      left: x,
      right: x,
      top: y,
      bottom: y,
      width: 0,
      height: 0
    }, trigger);
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

      showBubbleAtRect(html, node.getBoundingClientRect(), node);
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

      showBubbleAtRect(html, node.getBoundingClientRect(), node);
    });
  }

  function setupBubbleSystem() {
    const tip = getTooltip();
    if (!tip) return;

    tip.addEventListener("click", event => event.stopPropagation());

    document.addEventListener("click", event => {
      const target = event.target;
      if (!target.closest(".bubble-trigger") && !target.closest("#tooltip")) {
        hideBubble();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") hideBubble();
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

    wrap.innerHTML = `
      ${data.site.contact.text || ""}
      <p>メール: <a href="mailto:${data.site.contact.email}">${data.site.contact.email}</a></p>
    `;
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

    if (member) {
      return `
        <a class="board-member-link" href="member.html?id=${member.id}" aria-label="${escapeHtml(member.name)}のページへ">
          <span class="avatar board-member-avatar">${escapeHtml(member.icon)}</span>
          <span class="board-member-name">${escapeHtml(member.name)}</span>
        </a>
      `;
    }

    return `
    <span class="board-guest">
      <span class="board-guest-name">${escapeHtml((post.name || "投稿者").slice(0, 1))}</span>
      <span class="board-member-name">${escapeHtml(post.name || "投稿者")}</span>
    </span>
  `;
  }

  function worksHtml(post) {
    if (!post.workIds?.length) return "";

    const itemsHtml = post.workIds.map(id => {
      const work = worksById[id];
      if (!work) return "";

      return `
        <a class="work-ref" href="work.html?id=${work.id}" aria-label="${escapeHtml(work.title)}">
          ${work.thumbnail
            ? `<img class="thumb" src="${work.thumbnail}" alt="${escapeHtml(work.title)}">`
            : `<span class="thumb thumb-placeholder" aria-hidden="true"></span>`
          }
        </a>
      `;
    }).join("");

    if (!itemsHtml) return "";

    return `
      <div class="board-works-group">
        <div class="board-works-items">
          ${itemsHtml}
        </div>
        <div class="board-works-note">に関して</div>
      </div>
    `;
  }

  function boardImagesHtml(post) {
    if (!Array.isArray(post.imageUrls) || !post.imageUrls.length) return "";

    const items = post.imageUrls.map(url => `
      <a class="board-image-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        <img class="board-image" src="${escapeHtml(url)}" alt="投稿画像">
      </a>
    `).join("");

    return `<div class="board-images">${items}</div>`;
  }

  function boardItemHtml(post, mode) {
    const person = personHtml(post);
    const works = worksHtml(post);
    const images = boardImagesHtml(post);
    const date = formatDate(post.date);
    const comment = escapeHtml(post.comment || "");

    if (mode === "home") {
      return `
        <article class="board-card">
          <div class="board-card-head">
            <div class="board-person">${person}</div>
            <div class="board-date">${date}</div>
          </div>
          ${works ? `<div class="board-works">${works}</div>` : ""}
          ${images}
          <div class="board-comment">${comment}</div>
        </article>
      `;
    }

    if (mode === "work") {
      return `
        <article class="board-card">
          <div class="board-card-head">
            <div class="board-person">${person}</div>
            <div class="board-date">${date}</div>
          </div>
          ${images}
          <div class="board-comment">${comment}</div>
        </article>
      `;
    }

    return `
      <article class="board-card">
        <div class="board-card-head">
          <div class="board-works">${works}</div>
          <div class="board-date">${date}</div>
        </div>
        ${images}
        <div class="board-comment">${comment}</div>
      </article>
    `;
  }

  function renderBoard(container, posts, mode = "home") {
    const sorted = [...posts].sort((a, b) => postTime(b) - postTime(a));

    if (!sorted.length) {
      container.innerHTML = `<p class="muted">まだ投稿がありません。</p>`;
      return;
    }

    container.innerHTML = "";
    sorted.forEach(post => {
      container.appendChild(el("div", "board-item", boardItemHtml(post, mode)));
    });
  }

  async function loadBoard(container, filterFn, mode) {
    if (!container) return;

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
      members.map((member, i) => [member.id, GRAPH.railX + i * GRAPH.memberGap])
    );
    const yByWork = Object.fromEntries(
      works.map((work, i) => [work.id, GRAPH.rowTop + i * GRAPH.rowGap])
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

      if (work.thumbnail) {
        link.appendChild(svgEl("image", {
          href: work.thumbnail,
          x: GRAPH.leftX,
          y: y - GRAPH.cardH / 2,
          width: GRAPH.cardW,
          height: GRAPH.cardH,
          preserveAspectRatio: "xMidYMid slice",
          class: "graph-work-image"
        }));
      }

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
          showBubbleAtRect(html, group.getBoundingClientRect(), group);
        });

        group.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          showBubbleAtRect(html, group.getBoundingClientRect(), group);
        });

        svg.appendChild(group);
      });
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function renderWorksListMobile() {
    const container = $("#worksGraph");
    if (!container) return;

    container.innerHTML = `
      <div class="works-mobile-list">
        ${data.works.map(work => `
          <article class="works-mobile-card">
            <a href="work.html?id=${work.id}" class="works-mobile-thumb">
              ${work.thumbnail
                ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">`
                : `<div class="works-mobile-thumb-placeholder"></div>`
              }
            </a>
            <div class="works-mobile-body">
              <div class="works-mobile-period">${escapeHtml(work.period)}</div>
              <h3 class="works-mobile-title">
                <a href="work.html?id=${work.id}">${escapeHtml(work.title)}</a>
              </h3>
              <p class="works-mobile-summary">${escapeHtml(work.summary)}</p>
              <div class="works-mobile-members">
                ${work.participantIds.map(id => {
                  const member = membersById[id];
                  if (!member) return "";
                  return `
                    <a class="member-detail-link" href="member.html?id=${member.id}">
                      <span class="avatar">${member.icon}</span>
                      <span>${escapeHtml(member.name)}</span>
                    </a>
                  `;
                }).join("")}
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;
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
      ${work.thumbnail
        ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">`
        : `<div class="work-tile-placeholder"></div>`
      }
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
        <h1>${escapeHtml(work.title)}</h1>
        ${work.thumbnail ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}">` : ""}
        <div class="meta">期間: ${escapeHtml(work.period)}</div>
        <div>
          <h3>参加者</h3>
          <div class="member-detail-list" id="workMemberList"></div>
        </div>
        <div>
          <h3>概要</h3>
          <p>${escapeHtml(work.summary)}</p>
        </div>
        ${
          work.detailHtml
            ? `
              <div>
                <h3>詳細</h3>
                <div class="work-detail-content">
                  ${work.detailHtml}
                </div>
              </div>
            `
            : ""
        }
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
        <h1>${escapeHtml(member.name)}</h1>
        <div class="member-page-icon">
          <span class="avatar">${member.icon}</span>
        </div>
        <div>
          <h3>情報</h3>
          <p>${escapeHtml(member.bio)}</p>
        </div>
        ${
          Array.isArray(member.links) && member.links.length
            ? `
              <div>
                <div class="member-links">
                  ${member.links.map(link => `
                    <a
                      class="member-external-link"
                      href="${escapeHtml(link.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${escapeHtml(link.label)}
                    </a>
                  `).join("")}
                </div>
              </div>
            `
            : ""
        }
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

  function renderWorksAreaForViewport() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      renderWorksListMobile();
    } else {
      renderWorksGraph();
    }
  }

  function initHome() {
    renderAbout();
    renderWorksAreaForViewport();
    renderContact();
    buildGuestWorkCheckboxes();
    setupPostModal();
    setupGuestPostForm();
    loadBoard($("#boardList"), () => true, "home");
  }

  function setupResponsiveRerender() {
    window.addEventListener("resize", () => {
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      if (isMobile === lastIsMobile) return;
      lastIsMobile = isMobile;

      if (document.body.dataset.page === "home") {
        renderWorksAreaForViewport();
      }
    });
  }

  setupBubbleSystem();
  setupResponsiveRerender();

  if (page === "home") initHome();
  if (page === "work") renderWorkPage();
  if (page === "member") renderMemberPage();
})();