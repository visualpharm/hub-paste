// Большая вставка → вложение-файл. Перехватываем ⌘V на поле ввода и отдаём штатной загрузке файл paste-*.txt
// (тем же событием paste, но с файлом): дальше всё как с картинкой — /api/upload, ~/.hub-core/attachments/…
const LIMIT = 3000;                 // знаков: короче — остаётся текстом
const SHOWN = 200_000;              // знаков: больше в просмотре не показываем целиком (страница не должна виснуть)
const texts = new Map();            // имя файла → текст, для плитки и просмотра
let own = false;                    // наше синтетическое событие не перехватываем второй раз

const kb = (n) => (n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + " КБ" : (n / 1024 / 1024).toFixed(1) + " МБ");
const num = (n) => n.toLocaleString("ru-RU");

export default function register(hub) {
  hub.addStyle("paste.css");

  function toast(text) {
    document.querySelector(".pp-toast")?.remove();
    const t = hub.el("div", "pp-toast", text);
    t.setAttribute("role", "alert");
    document.body.append(t);
    setTimeout(() => t.remove(), 7000);
  }

  document.addEventListener("paste", (e) => {
    const ta = e.target;
    if (own || !(ta instanceof HTMLTextAreaElement) || !ta.closest(".composer")) return;
    if (e.clipboardData?.files?.length) return;
    const text = e.clipboardData?.getData("text/plain") || "";
    if (text.length <= LIMIT) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const blob = new Blob([text], { type: "text/plain" });
    // потолок — у самого хаба (snapshot.upload.max_bytes, настройка attachments.max_mb); свой у плагина больше не стоит
    const max = hub.snapshot().upload?.max_bytes;
    if (max && blob.size > max) return toast(`Вставка ${kb(blob.size)} — больше лимита хаба в ${kb(max)} (attachments.max_mb в настройках).`);
    const name = `paste-${Date.now().toString(36)}.txt`;
    texts.set(name, text);
    const dt = new DataTransfer();
    dt.items.add(new File([blob], name, { type: "text/plain" }));
    own = true;
    try { ta.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true })); } finally { own = false; }
  }, true);

  function view(name) {
    const text = texts.get(name);
    const back = hub.el("div", "pp-back");
    const box = hub.el("div", "pp-box");
    const head = hub.el("div", "pp-head");
    const close = hub.el("button", "btn quiet", "Закрыть");
    close.type = "button";
    const del = hub.el("button", "btn quiet", "Удалить");
    del.type = "button";
    head.append(hub.el("b", null, `Вставка · ${num(text.length)} знаков`), hub.el("span", "pp-sp"), del, close);
    const pre = hub.el("pre", "pp-text");
    pre.textContent = text.length > SHOWN ? text.slice(0, SHOWN) : text;
    box.append(head, pre);
    if (text.length > SHOWN) box.append(hub.el("p", "pp-more", `Показаны первые ${num(SHOWN)} знаков из ${num(text.length)}; сессия получает файл целиком.`));
    back.append(box);
    const off = () => { back.remove(); document.removeEventListener("keydown", esc, true); };
    const esc = (e) => { if (e.key === "Escape") { e.stopPropagation(); off(); } };
    close.addEventListener("click", off);
    back.addEventListener("mousedown", (e) => { if (e.target === back) off(); });
    del.addEventListener("click", () => {
      for (const c of document.querySelectorAll(".pchip.pp-tile")) if (c.dataset.paste === name) c.querySelector(".x")?.click();
      off();
    });
    document.addEventListener("keydown", esc, true);
    document.body.append(back);
    close.focus();
  }

  function decorate(chip) {
    if (chip.classList.contains("pp-tile")) return;
    const nm = chip.querySelector(".nm");
    const name = /^(paste-[a-z0-9]+\.txt)/.exec(nm?.textContent || "")?.[1];
    if (!name || !texts.has(name)) return;
    const text = texts.get(name);
    const loading = /загружаю/.test(nm.textContent);
    chip.classList.add("pp-tile");
    chip.dataset.paste = name;
    chip.tabIndex = 0;
    chip.setAttribute("role", "button");
    chip.setAttribute("aria-label", `Вставка, ${num(text.length)} знаков. Открыть`);
    chip.querySelector("svg")?.remove();
    const snip = hub.el("span", "pp-snip", text.slice(0, 160).replace(/\s+/g, " "));
    nm.replaceChildren(`Вставка · ${num(text.length)} зн.${loading ? " · загружаю" : ""}`);
    chip.insertBefore(snip, nm);
    chip.addEventListener("click", (e) => { if (!e.target.closest(".x")) view(name); });
    chip.addEventListener("keydown", (e) => { if (e.target === chip && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); view(name); } });
  }

  const scan = () => document.querySelectorAll(".pchip:not(.pp-tile)").forEach(decorate);
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}
