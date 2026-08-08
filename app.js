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
  const announcementsById = Object.fromEntries(
    (data.site.announcements || []).map(item => [item.id, item])
  );

  let activeBubbleTrigger = null;
  let closeDialogTimer = null;
  let announcementStatus = "latest";
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

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setMeta({ title, description, image, url }) {
    if (title) {
      document.title = title;
      setMetaContent("property", "og:title", title);
    }

    if (description) {
      setMetaContent("name", "description", description);
      setMetaContent("property", "og:description", description);
    }

    if (image) {
      setMetaContent("property", "og:image", image);
    }

    if (url) {
      setMetaContent("property", "og:url", url);
    }
  }

  function setMetaContent(attr, key, content) {
    let tag = document.querySelector(`meta[${attr}="${key}"]`);

    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }

    tag.setAttribute("content", content);
  }

  function bubbleHtml({ memberName, contribution }) {
    return `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <div>
            <div class="bubble-card-name" id="dialogTitle">${escapeHtml(memberName)}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(contribution || "記述なし")}</div>
      </div>
    `;
  }

  function workBubbleHtml(work) {
    return `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <div>
            <div class="bubble-card-name" id="dialogTitle">${escapeHtml(work.title)}</div>
            <div class="bubble-card-meta">${escapeHtml(work.period)}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(work.summary)}</div>
      </div>
    `;
  }

  function announcementBubbleHtml(item) {
    return `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <span class="status-indicator status-indicator--${escapeHtml(item.status)}" aria-hidden="true"></span>
          <div>
            <div class="bubble-card-name" id="dialogTitle">${escapeHtml(item.title)}</div>
            <div class="bubble-card-meta">${escapeHtml(item.date)} · ${item.status === "done" ? "済み" : "最新"}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(item.summary)}</div>
      </div>
    `;
  }

  function getDialogBackdrop() {
    return $("#tooltip");
  }

  function getDialog() {
    return $(".tooltip", getDialogBackdrop());
  }

  function clearActiveBubbleTrigger() {
    if (!activeBubbleTrigger) return;
    activeBubbleTrigger.classList.remove("bubble-open");
    activeBubbleTrigger.removeAttribute("data-bubble-open");
    activeBubbleTrigger = null;
  }

  function hideBubble() {
    const backdrop = getDialogBackdrop();
    if (!backdrop || backdrop.hidden) return;
    const returnFocus = activeBubbleTrigger;

    backdrop.classList.remove("is-visible");
    document.body.classList.remove("dialog-open");

    clearTimeout(closeDialogTimer);
    closeDialogTimer = setTimeout(() => {
      backdrop.hidden = true;
      const content = $("#dialogContent", backdrop);
      if (content) content.innerHTML = "";
    }, 180);

    clearActiveBubbleTrigger();

    if (returnFocus?.isConnected) returnFocus.focus();
  }

  function showBubble(html, trigger = null, href = "") {
    const backdrop = getDialogBackdrop();
    const dialog = getDialog();
    const content = $("#dialogContent", backdrop);
    if (!backdrop || !dialog || !content || !html) return;

    clearTimeout(closeDialogTimer);
    clearActiveBubbleTrigger();

    content.innerHTML = `
      ${html}
      ${href ? `<a class="dialog-detail-link" href="${escapeHtml(href)}">詳細を見る</a>` : ""}
    `;
    backdrop.hidden = false;
    document.body.classList.add("dialog-open");

    if (trigger) {
      activeBubbleTrigger = trigger;
      trigger.classList.add("bubble-open");
      trigger.setAttribute("data-bubble-open", "1");
    }

    requestAnimationFrame(() => {
      backdrop.classList.add("is-visible");
      $(".dialog-close", backdrop)?.focus();
    });
  }

  function attachDialogNavigation(node, html, href = "", options = {}) {
    const { ignoreNestedLinks = false } = options;
    node.classList.add("bubble-trigger");
    node.setAttribute("tabindex", node.getAttribute("tabindex") || "0");

    const activate = event => {
      const nestedLink = event.target.closest?.("a");
      if (ignoreNestedLinks && nestedLink && nestedLink !== node) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showBubble(html, node, href);
    };

    node.addEventListener("click", activate);
    node.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      activate(event);
    });
  }

  function setupBubbleSystem() {
    const backdrop = getDialogBackdrop();
    const dialog = getDialog();
    if (!backdrop || !dialog) return;

    $(".dialog-close", backdrop)?.addEventListener("click", hideBubble);
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) hideBubble();
    });

    document.addEventListener("keydown", event => {
      if (backdrop.hidden) return;
      if (event.key === "Escape") {
        hideBubble();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [...dialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function renderAbout() {
    const about = $("#aboutContent");
    if (!about) return;
    if (about.innerHTML.trim()) return;
    about.innerHTML = data.site.about;
  }

  function renderAnnouncements() {
    const wrap = $("#newsList");
    if (!wrap) return;

    const announcements = [...(data.site.announcements || [])]
      .filter(item => item.status === announcementStatus)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    if (!announcements.length) {
      wrap.innerHTML = `<p class="news-empty">${announcementStatus === "latest" ? "現在、新しい告知はありません。" : "済みの告知はありません。"}</p>`;
      return;
    }

    wrap.innerHTML = announcements.map(item => `
      <article
        class="news-item announcement-item"
        tabindex="0"
        role="button"
        data-announcement-id="${escapeHtml(item.id)}"
        aria-label="${escapeHtml(item.title)}の概要を見る"
      >
        <time class="news-date" datetime="${escapeHtml(item.date.replaceAll(".", "-"))}">
          ${escapeHtml(item.date)}
        </time>
        <h3 class="news-title">${escapeHtml(item.title)}</h3>
        <p class="news-body">${escapeHtml(item.summary)}</p>
        <span class="news-more">概要を見る</span>
      </article>
    `).join("");

    wrap.querySelectorAll(".announcement-item").forEach(itemNode => {
      const item = announcementsById[itemNode.dataset.announcementId];
      attachDialogNavigation(
        itemNode,
        announcementBubbleHtml(item),
        `announcement.html?id=${item.id}`
      );
    });
  }

  function setupAnnouncementTabs() {
    document.querySelectorAll("[data-announcement-status]").forEach(button => {
      button.addEventListener("click", () => {
        announcementStatus = button.dataset.announcementStatus;
        document.querySelectorAll("[data-announcement-status]").forEach(tab => {
          const isActive = tab === button;
          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
        });
        renderAnnouncements();
      });
    });
  }

  function renderContact() {
    const wrap = $("#contactContent");
    if (!wrap) return;

    const sns = data.site.contact.sns || [];

    wrap.innerHTML = `
      ${data.site.contact.text || ""}
      <p>メール: <a href="mailto:${data.site.contact.email}">${data.site.contact.email}</a></p>
      ${
        sns.length
          ? `
            <div class="contact-sns">
              ${sns.map(item => `
                <a
                  class="contact-sns-link"
                  href="${item.url}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${item.name}
                </a>
              `).join("")}
            </div>
          `
          : ""
      }
    `;
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
    textEl.setAttribute("font-family", "inherit");

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
        stroke: "#bbb5d7",
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
        fill: "rgba(239,255,248,0.62)",
        stroke: "#aaa3cf",
        class: "graph-work-overlay"
      }));

      attachDialogNavigation(link, workBubbleHtml(work), `work.html?id=${work.id}`);

      svg.appendChild(link);

      svg.appendChild(svgEl("rect", {
        x: GRAPH.leftX + 12,
        y: y - 30,
        width: 118,
        height: 60,
        fill: "rgba(245,255,251,0.9)",
        class: "graph-work-label-bg"
      }));

      addSvgText(svg, GRAPH.leftX + 18, y - 12, {
        lines: splitTitle(work.title),
        fontSize: 16,
        fontWeight: "600",
        fill: "#4d477f"
      });

      addSvgText(svg, GRAPH.leftX + 18, y + 20, {
        text: work.period,
        fontSize: 13,
        fill: "#706b88"
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
        stroke: "#b9b2d6",
        "stroke-width": "2.2",
        "stroke-linecap": "round",
        class: "graph-member-shaft"
      }));

      const nameLink = svgEl("a", {
        href: `member.html?id=${member.id}`,
        class: "graph-member-link"
      });

      const labelW = 64;
      const labelH = 28;

      nameLink.appendChild(svgEl("rect", {
        x: x - labelW / 2,
        y: GRAPH.memberTopY - labelH / 2,
        width: labelW,
        height: labelH,
        fill: "#f7fffc",
        stroke: "#aaa3cf",
        class: "graph-member-name-box"
      }));

      addSvgText(nameLink, x, GRAPH.memberTopY + 4, {
        text: member.name,
        fontSize: 11,
        fill: "#4d477f",
        anchor: "middle"
      });

      svg.appendChild(nameLink);

    });

    works.forEach(work => {
      const y = yByWork[work.id];

      work.participantIds.forEach(memberId => {
        const member = membersById[memberId];
        if (!member) return;

        const x = xByMember[memberId];

        const html = bubbleHtml({
          memberName: member.name,
          contribution: work.contributions?.[member.id]
        });

        const group = svgEl("g", {
          class: "graph-node-button bubble-trigger",
          tabindex: "0",
          role: "link",
          "aria-label": `${member.name}が${work.title}で担当した内容を見る`
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
          fill: "#f7fffc",
          stroke: "#746db8",
          "stroke-width": "1.2"
        }));

        attachDialogNavigation(group, html, `member.html?id=${member.id}`);

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
          <article
            class="works-mobile-card${work.thumbnail ? "" : " is-without-image"}"
            data-href="work.html?id=${work.id}"
            tabindex="0"
            role="link"
            aria-label="${escapeHtml(work.title)}の活動詳細を見る"
          >
            ${work.thumbnail ? `
              <div class="works-mobile-thumb">
                <img src="${work.thumbnail}" alt="${escapeHtml(work.title)}" loading="lazy" decoding="async">
              </div>
            ` : ""}
            <div class="works-mobile-body">
              <div class="works-mobile-period">${escapeHtml(work.period)}</div>
              <h3 class="works-mobile-title">${escapeHtml(work.title)}</h3>
              <span class="works-mobile-more">概要を見る</span>
            </div>
            <div class="works-mobile-participants">
              <span class="works-mobile-members-label">参加者</span>
              <div class="works-mobile-members">
                ${work.participantIds.map(id => {
                  const member = membersById[id];
                  if (!member) return "";
                  return `
                    <a
                      class="member-detail-link"
                      href="member.html?id=${member.id}"
                      data-member-id="${member.id}"
                      data-work-id="${work.id}"
                    >
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

    container.querySelectorAll(".works-mobile-card").forEach(card => {
      const workId = new URL(card.dataset.href, location.href).searchParams.get("id");
      const work = worksById[workId];
      attachDialogNavigation(card, workBubbleHtml(work), card.dataset.href, {
        ignoreNestedLinks: true
      });
    });

    container.querySelectorAll(".works-mobile-members .member-detail-link").forEach(link => {
      const work = worksById[link.dataset.workId];
      const member = membersById[link.dataset.memberId];
      attachDialogNavigation(link, bubbleHtml({
        memberName: member.name,
        contribution: work.contributions?.[member.id]
      }), link.getAttribute("href"));
    });
  }

  function renderNotFound(wrap, label) {
    wrap.innerHTML = `<p>${label}が見つかりません。</p>`;
  }

  function memberLink(member, work) {
    const link = el(
      "a",
      "member-detail-link",
      `<span>${escapeHtml(member.name)}</span>`
    );
    link.href = `member.html?id=${member.id}`;

    attachDialogNavigation(link, bubbleHtml({
      memberName: member.name,
      memberIcon: member.icon,
      contribution: work.contributions[member.id]
    }), link.href);

    return link;
  }

  function workTile(work, member) {
    const tile = el("a", "work-tile", `
      ${work.thumbnail
        ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}" loading="lazy" decoding="async">`
        : `<div class="work-tile-placeholder"></div>`
      }
      <div class="caption">
        <div>${escapeHtml(work.title)}</div>
        <div class="muted">${escapeHtml(work.period)}</div>
      </div>
    `);

    tile.href = `work.html?id=${work.id}`;

    attachDialogNavigation(tile, `
      <div class="bubble-card">
        <div class="bubble-card-head">
          <div>
            <div class="bubble-card-name" id="dialogTitle">${escapeHtml(work.title)}</div>
            <div class="bubble-card-meta">${escapeHtml(work.period)}</div>
          </div>
        </div>
        <div class="bubble-card-text">${escapeHtml(work.contributions[member.id] || "記述なし")}</div>
      </div>
    `, tile.href);

    return tile;
  }

  function renderWorkPage() {
    const wrap = $("#workPage");
    if (!wrap) return;

    const work = worksById[getQueryParam("id")];
    if (!work) return renderNotFound(wrap, "作品");

    setMeta({
      title: `${work.title}｜活動｜プラントショップ`,
      description: `${work.summary}`.slice(0, 120),
      image: work.thumbnail
        ? new URL(work.thumbnail, location.origin).href
        : "https://plantshop.work/assets/logo-full.png",
      url: location.href
    });

    wrap.innerHTML = `
      <div class="page-hero">
        <h1>${escapeHtml(work.title)}</h1>
        ${work.thumbnail ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}" decoding="async">` : ""}
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
      </div>
    `;

    const memberList = $("#workMemberList");
    work.participantIds
      .map(id => membersById[id])
      .filter(Boolean)
      .forEach(member => memberList.appendChild(memberLink(member, work)));
  }

  function renderMemberPage() {
    const wrap = $("#memberPage");
    if (!wrap) return;

    const member = membersById[getQueryParam("id")];
    if (!member) return renderNotFound(wrap, "参加者");

    setMeta({
      title: `${member.name}｜参加者｜プラントショップ`,
      description: member.bio
        ? `${member.bio}`.slice(0, 120)
        : `${member.name}のプロフィールと参加活動を掲載しています。`,
      image: "https://plantshop.work/assets/logo-full.png",
      url: location.href
    });

    const memberWorks = data.works.filter(work => work.participantIds.includes(member.id));

    wrap.innerHTML = `
      <div class="page-hero">
        <h1>${escapeHtml(member.name)}</h1>
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
          <h3>参加活動</h3>
          <div class="work-list-grid" id="memberWorks"></div>
        </div>
      </div>
    `;

    const worksWrap = $("#memberWorks");
    memberWorks.forEach(work => worksWrap.appendChild(workTile(work, member)));
  }

  function renderAnnouncementPage() {
    const wrap = $("#announcementPage");
    if (!wrap) return;

    const item = announcementsById[getQueryParam("id")];
    if (!item) return renderNotFound(wrap, "告知");

    const image = item.image
      ? new URL(item.image, location.origin).href
      : "https://plantshop.work/assets/logo-full.png";

    setMeta({
      title: `${item.title}｜告知｜プラントショップ`,
      description: `${item.summary}`.slice(0, 120),
      image,
      url: location.href
    });

    wrap.innerHTML = `
      <article class="page-hero announcement-detail">
        <div class="announcement-detail-meta">
          <span class="announcement-status announcement-status--${escapeHtml(item.status)}">
            <span class="status-indicator status-indicator--${escapeHtml(item.status)}" aria-hidden="true"></span>
            ${item.status === "done" ? "済み" : "最新"}
          </span>
          <time datetime="${escapeHtml(item.date.replaceAll(".", "-"))}">${escapeHtml(item.date)}</time>
        </div>
        <h1>${escapeHtml(item.title)}</h1>
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" decoding="async">` : ""}
        <div>
          <h3>内容</h3>
          <p>${escapeHtml(item.body)}</p>
        </div>
        ${Array.isArray(item.relatedLinks) && item.relatedLinks.length ? `
          <div>
            <h3>関連情報</h3>
            <div class="announcement-related-links">
              ${item.relatedLinks.map(link => `
                <a class="member-external-link" href="${escapeHtml(link.url)}">
                  ${escapeHtml(link.label)}
                </a>
              `).join("")}
            </div>
          </div>
        ` : ""}
        <a class="text-link announcement-back-link" href="index.html#announcements">告知一覧へ戻る</a>
      </article>
    `;
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
    setupAnnouncementTabs();
    renderAnnouncements();
    renderWorksAreaForViewport();
    renderContact();
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

  function setupHeaderOffset() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--anchor-offset", `${height}px`);
    };

    update();

    if ("ResizeObserver" in window) {
      new ResizeObserver(update).observe(header);
    } else {
      addEventListener("resize", update, { passive: true });
    }

    if (location.hash) {
      requestAnimationFrame(() => {
        update();
        document.querySelector(location.hash)?.scrollIntoView({ block: "start" });
      });
    }
  }

  setupBubbleSystem();
  setupHeaderOffset();
  setupResponsiveRerender();

  if (page === "home") initHome();
  if (page === "work") renderWorkPage();
  if (page === "member") renderMemberPage();
  if (page === "announcement") renderAnnouncementPage();
})();
