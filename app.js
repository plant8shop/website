(function () {
  const data = SITE_DATA;
  const $ = (s, root = document) => root.querySelector(s);
  const membersById = Object.fromEntries(data.members.map(m => [m.id, m]));
  const worksById = Object.fromEntries(data.works.map(w => [w.id, w]));
  const getQueryParam = name => new URL(location.href).searchParams.get(name);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const el = (tag, cls, html) => { const n = document.createElement(tag); n.className = cls; n.innerHTML = html; return n; };
  const renderNotFound = (wrap, label) => { wrap.innerHTML = `<p>${label}が見つかりません。</p><a class="text-link" href="index.html">トップへ戻る</a>`; };
  let announcementStatus = 'latest';

  function setupNavigation() {
    const nav = $('.nav-links');
    const toggle = $('.nav-toggle');
    if (!nav || !toggle) return;
    const mobile = matchMedia('(max-width: 960px)');
    const setOpen = open => {
      const expanded = mobile.matches && open;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', expanded ? 'メニューを閉じる' : 'メニューを開く');
      nav.hidden = mobile.matches && !expanded;
      $('.site-header').classList.toggle('menu-open', expanded);
    };
    const update = () => { toggle.hidden = !mobile.matches; setOpen(false); };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false); toggle.focus();
      }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setOpen(false); });
    mobile.addEventListener('change', update);
    update();
    const updateOffset = () => document.documentElement.style.setProperty('--anchor-offset', `${mobile.matches ? $('.nav-home').getBoundingClientRect().height + 48 : 32}px`);
    new ResizeObserver(updateOffset).observe($('.nav-home'));
    updateOffset();
  }

  function memberLink(member, work) {
    const a = el('a', 'member-detail-link', `<span>${escapeHtml(member.name)}</span><span aria-hidden="true">↗</span>`);
    a.href = `member.html?id=${encodeURIComponent(member.id)}`;
    if (work?.contributions?.[member.id]) a.title = work.contributions[member.id];
    return a;
  }
  function workCard(work, member) {
    const article = el('article', 'content-card project-card', `
      <a class="project-cover" href="work.html?id=${encodeURIComponent(work.id)}" aria-label="${escapeHtml(work.title)}の活動ページ">
        ${work.thumbnail ? `<img src="${escapeHtml(work.thumbnail)}" alt="" loading="lazy" decoding="async">` : `<span class="project-placeholder" aria-hidden="true">${escapeHtml(work.title)}</span>`}
      </a>
      <div class="card-body">
        <div class="card-meta">${escapeHtml(work.period)}${work.status ? ` <span class="card-status">${escapeHtml(work.status)}</span>` : ''}</div>
        <h3><a class="card-title-link" href="work.html?id=${encodeURIComponent(work.id)}">${escapeHtml(work.title)}<span aria-hidden="true">↗</span></a></h3>
        <p>${escapeHtml(work.summary)}</p>
        ${member && work.contributions?.[member.id] ? `<p class="contribution">${escapeHtml(work.contributions[member.id])}</p>` : ''}
      </div>`);
    return article;
  }
  const workTile = workCard;
  function renderWorks() {
    const area = $('#worksGraph');
    if (!area) return;
    area.className = 'project-grid';
    data.works.forEach(w => area.append(workCard(w)));
    const people = $('#membersList');
    const counts = Object.fromEntries(data.members.map(m => [m.id, data.works.filter(w => w.participantIds.includes(m.id)).length]));
    people.className = 'member-directory';
    people.setAttribute('aria-label', 'メンバー（参加活動数順）');
    [...data.members].sort((a,b) => counts[b.id] - counts[a.id]).forEach(m => {
      const entry = el('li', 'member-directory-entry', `<a href="member.html?id=${encodeURIComponent(m.id)}"><span class="member-directory-name">${escapeHtml(m.name)}</span><span class="member-directory-meta">${counts[m.id]} 活動<span aria-hidden="true">↗</span></span></a>`);
      people.append(entry);
    });
  }
  function renderAnnouncements() {
    const list = $('#newsList');
    if (!list) return;
    const items = [...(data.site.announcements || [])].filter(x => x.status === announcementStatus).sort((a,b) => b.date.localeCompare(a.date));
    list.innerHTML = items.length ? items.map(x => `<article class="content-card news-item" id="news-${escapeHtml(x.id)}"><div class="card-body"><time class="card-meta" datetime="${escapeHtml(x.date.replaceAll('.', '-'))}">${escapeHtml(x.date)}</time><h3>${escapeHtml(x.title)}</h3>${x.image ? `<img class="news-image" src="${escapeHtml(x.image)}" alt="" loading="lazy">` : ''}<p>${escapeHtml(x.summary)}</p>${x.body && x.body !== x.summary ? `<p>${escapeHtml(x.body)}</p>` : ''}<div class="card-links">${(x.relatedLinks || []).map(l => `<a class="text-link" href="${escapeHtml(l.url)}">${escapeHtml(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div></article>`).join('') : '<p class="news-empty">現在、新しい告知はありません。</p>';
    decorateServiceLinks(list);
  }
  function setupTabs() {
    const tabs = [...document.querySelectorAll('[data-announcement-status]')];
    tabs.forEach((button, i) => {
      button.id = `news-tab-${button.dataset.announcementStatus}`;
      button.tabIndex = i ? -1 : 0;
      button.addEventListener('click', () => {
        announcementStatus = button.dataset.announcementStatus;
        tabs.forEach(t => { t.classList.toggle('is-active', t === button); t.setAttribute('aria-selected', t === button); t.tabIndex = t === button ? 0 : -1; });
        $('#newsList').setAttribute('aria-labelledby', button.id);
        renderAnnouncements();
      });
      button.addEventListener('keydown', e => {
        let target;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') target = tabs[(i + 1) % tabs.length];
        if (e.key === 'Home') target = tabs[0];
        if (e.key === 'End') target = tabs.at(-1);
        if (target) { e.preventDefault(); target.click(); target.focus(); }
      });
    });
    $('#newsList').setAttribute('aria-labelledby', tabs[0].id);
  }
  const serviceDomains = {
    'x.com':'x','twitter.com':'x','instagram.com':'instagram','note.com':'note',
    'open.spotify.com':'spotify','spotify.com':'spotify','youtube.com':'youtube','youtu.be':'youtube',
    'podcasts.apple.com':'applepodcasts','github.com':'github','vimeo.com':'vimeo',
    'facebook.com':'facebook','soundcloud.com':'soundcloud','tiktok.com':'tiktok',
    'threads.net':'threads','threads.com':'threads','forms.gle':'googleforms',
    'maps.google.com':'googlemaps'
  };
  function decorateServiceLinks(root = document) {
    root.querySelectorAll('a[href]').forEach(a => {
      if (a.dataset.serviceLogo || a.querySelector('img,svg')) return;
      let url; try { url = new URL(a.getAttribute('href'), location.href); } catch { return; }
      const host = url.hostname.replace(/^www\./,'');
      let service = serviceDomains[host];
      if (host === 'google.com' && url.pathname.startsWith('/maps')) service = 'googlemaps';
      if (host === 'docs.google.com' && url.pathname.startsWith('/forms')) service = 'googleforms';
      if (!service) return;
      const label = a.textContent.trim() || service;
      a.dataset.serviceLogo = service;
      a.classList.add('service-link');
      a.setAttribute('aria-label', label);
      a.title = label;
      a.replaceChildren();
      const img = document.createElement('img'); img.src = `assets/icons/${service}.svg`; img.alt = ''; img.width = 22; img.height = 22;
      a.append(img);
      a.target = '_blank'; a.rel = 'noopener noreferrer';
    });
  }
  function renderContact() {
    const c = data.site.contact;
    $('#contactContent').innerHTML = `${c.text || ''}<a class="email-link" href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)} ↗</a><div class="contact-sns">${(c.sns || []).map(l => `<a href="${escapeHtml(l.url)}">${escapeHtml(l.name)}</a>`).join('')}</div>`;
    const share = data.site.memberShare;
    $('#memberShareContent').innerHTML = `<p>${escapeHtml(share.description)}</p><a class="outline-link" href="${escapeHtml(share.url)}" target="_blank" rel="noopener noreferrer">共有サイトを開く <span aria-hidden="true">↗</span></a>`;
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

  async function renderPodcast() {
    const wrap = $("#podcastContent");
    if (!wrap) return;

    const podcast = data.site.podcast;
    if (!podcast) return;

    wrap.innerHTML = `
      <p class="podcast-description">${escapeHtml(podcast.description)}</p>
      <div class="podcast-player" aria-busy="true">
        <p class="podcast-player-note">エピソードを読み込んでいます。</p>
      </div>
      <div class="podcast-links" aria-label="${escapeHtml(podcast.name)}の配信先">
        ${(podcast.platforms || []).map(platform => `
          <a
            class="contact-sns-link"
            href="${escapeHtml(platform.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >${escapeHtml(platform.name)}</a>
        `).join("")}
      </div>
    `;

    const player = $(".podcast-player", wrap);
    if (!player || !podcast.feedUrl) return;

    try {
      const response = await fetch(podcast.feedUrl, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error("Podcast feed request failed");

      const documentXml = new DOMParser().parseFromString(await response.text(), "application/xml");
      if (documentXml.querySelector("parsererror")) throw new Error("Podcast feed parse failed");

      const setSafeDescription = (element, value) => {
        element.replaceChildren();
        if (!value) return;

        const htmlDocument = new DOMParser().parseFromString(value, "text/html");
        const appendSafeNode = (source, target) => {
          if (source.nodeType === 3) {
            target.append(document.createTextNode(source.textContent || ""));
            return;
          }
          if (source.nodeType !== 1) return;

          const tagName = source.tagName.toLowerCase();
          if (tagName === "br") {
            target.append(document.createElement("br"));
            return;
          }
          if (tagName === "a") {
            const href = source.getAttribute("href")?.trim() || "";
            if (href.startsWith("https://")) {
              const link = document.createElement("a");
              link.href = href;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.textContent = source.textContent || href;
              target.append(link);
            } else {
              [...source.childNodes].forEach(node => appendSafeNode(node, target));
            }
            return;
          }
          if (["p", "div", "li"].includes(tagName)) {
            const paragraph = document.createElement("p");
            [...source.childNodes].forEach(node => appendSafeNode(node, paragraph));
            target.append(paragraph);
            return;
          }

          [...source.childNodes].forEach(node => appendSafeNode(node, target));
        };

        [...htmlDocument.body.childNodes].forEach(node => appendSafeNode(node, element));
      };

      const episodes = [...documentXml.querySelectorAll("item")].map((item, index) => {
        const enclosureUrl = item.querySelector("enclosure")?.getAttribute("url") || "";
        const publishedAt = item.querySelector("pubDate")?.textContent?.trim() || "";
        const duration = item.getElementsByTagName("itunes:duration")[0]?.textContent?.trim() || "";
        const descriptionHtml = (
          item.querySelector("description")?.textContent?.trim()
            || item.getElementsByTagName("itunes:summary")[0]?.textContent?.trim()
            || ""
        );
        return {
          id: item.querySelector("guid")?.textContent?.trim() || String(index),
          title: item.querySelector("title")?.textContent?.trim() || `エピソード ${index + 1}`,
          enclosureUrl,
          publishedAt,
          duration,
          descriptionHtml
        };
      }).filter(episode => episode.enclosureUrl.startsWith("https://"));

      if (!episodes.length) throw new Error("Podcast feed has no playable episodes");

      const episodeDate = episode => {
        const date = new Date(episode.publishedAt);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ja-JP', {year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
      };
      player.innerHTML = `
        <div class="podcast-episode-meta"></div>
        <h3 class="podcast-current-title" id="podcastCurrentTitle"></h3>
        <audio controls preload="metadata">
          お使いのブラウザは音声再生に対応していません。
        </audio>
        <details class="podcast-notes"><summary>この回の内容</summary><div class="podcast-episode-description"></div></details>
        <details class="podcast-archive"><summary>エピソード一覧 <span>${episodes.length}</span></summary><ol class="podcast-episode-list">
          ${episodes.map((episode,index) => `<li><button type="button" data-episode="${index}" aria-label="${escapeHtml(episode.title)}を選ぶ"><time>${escapeHtml(episodeDate(episode))}</time><span>${escapeHtml(episode.title)}</span><span class="episode-action" aria-hidden="true">選ぶ</span></button></li>`).join('')}
        </ol></details>
      `;

      const audio = $("audio", player);
      const meta = $(".podcast-episode-meta", player);
      const episodeDescription = $(".podcast-episode-description", player);

      const selectEpisode = (index = 0) => {
        const episode = episodes[index];
        meta.textContent = [index === 0 ? '最新エピソード' : '', episodeDate(episode), episode.duration].filter(Boolean).join(' · ');
        $('#podcastCurrentTitle').textContent = episode.title;
        audio.setAttribute('aria-label', episode.title);
        setSafeDescription(episodeDescription, episode.descriptionHtml);
        $('.podcast-notes', player).hidden = !episode.descriptionHtml;
        $('.podcast-notes', player).open = false;
        player.querySelectorAll('[data-episode]').forEach(button => {
          const active = Number(button.dataset.episode) === index;
          button.setAttribute('aria-pressed', String(active));
          $('.episode-action',button).textContent = active ? '選択中' : '選ぶ';
        });
        audio.pause();
        audio.src = episode.enclosureUrl;
        audio.load();
        decorateServiceLinks(episodeDescription);
      };

      player.querySelectorAll('[data-episode]').forEach(button => button.addEventListener('click', () => {
        selectEpisode(Number(button.dataset.episode));
        $('.podcast-archive',player).open = false;
        audio.focus();
      }));
      selectEpisode();
    } catch {
      player.innerHTML = `
        <p class="podcast-player-note">エピソード一覧を読み込めませんでした。下の配信サービスからお聴きください。</p>
      `;
    } finally {
      player.setAttribute('aria-busy', 'false');
    }
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

    if (work.visualPage) {
      document.body.classList.add("is-plant-project");
      wrap.closest(".section-inner")?.classList.add("plant-project-inner");
      wrap.innerHTML = work.detailHtml;
      const memberList = $("#workMemberList");
      if (memberList) {
        const heading = el('h3', 'work-members-heading', '参加メンバー');
        memberList.before(heading);
        work.participantIds.map(id => membersById[id]).filter(Boolean)
          .forEach(member => memberList.appendChild(memberLink(member, work)));
      }
      return;
    }

    wrap.innerHTML = `
      <div class="page-hero">
        <h1>${escapeHtml(work.title)}</h1>
        ${work.thumbnail ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)}" decoding="async">` : ""}
        <div class="meta">${work.status ? `状況: ${escapeHtml(work.status)} ／ ` : ""}期間: ${escapeHtml(work.period)}</div>
        <div>
          <h3>概要</h3>
          <p>${escapeHtml(work.summary)}</p>
          <h3 class="work-members-heading">参加メンバー</h3>
          <div class="member-detail-list" id="workMemberList"></div>
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
    if (!member) return renderNotFound(wrap, "メンバー");

    setMeta({
      title: `${member.name}｜メンバー｜プラントショップ`,
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
          <h3>プロフィール</h3>
          <p class="member-profile-text">${escapeHtml(member.bio)}</p>
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


  const page = document.body.dataset.page;
  setupNavigation();
  if (page === 'home') {
    $('#aboutContent').innerHTML = data.site.about;
    setupTabs(); renderAnnouncements(); renderWorks(); renderContact(); renderPodcast().then(() => decorateServiceLinks());
  }
  if (page === 'work') renderWorkPage();
  if (page === 'member') renderMemberPage();
  if (page === 'announcement') location.replace('index.html#announcements');
  decorateServiceLinks();
})();
