import { t, catName, TYPE_ORDER, CATEGORY_ORDER, LANGS, langName } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import {
  lang,
  escapeHtml,
  fleuron,
  makeThumb,
  formatDate,
  typeBadge,
  snippet,
  svgIcon,
  toast,
  confirmDialog,
  openModal,
  stateLoading,
  stateEmpty,
  stateError
} from "../ui.js";

const EMPTY_FORM = {
  title: "",
  type: "video",
  url: "",
  description: "",
  category: "prayer",
  thumbnail: "",
  areaId: ""
};

let activeTab = "areas";

function isValidUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (err) {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function initials(member) {
  const first = (member.firstName || "").trim().charAt(0);
  const last = (member.lastName || "").trim().charAt(0);
  return (first + last || member.email.charAt(0) || "?").toUpperCase();
}

function localizedAreaTitle(area, l) {
  return (area.titleI18n && area.titleI18n[l]) || area.title;
}

/* =====================================================================
   CONTENT PANEL
   ===================================================================== */

function contentRow(item) {
  const l = lang();
  const thumb = makeThumb(item);
  const area = store.getArea(item.areaId);
  const localized = {
    title: (item.titleI18n && item.titleI18n[l]) || item.title
  };
  return `
    <div class="admin-row" data-id="${escapeHtml(item.id)}">
      <img class="admin-row-thumb" src="${escapeHtml(thumb.src)}" alt="" loading="lazy" />
      <div class="admin-row-main">
        <div class="admin-row-title">${escapeHtml(localized.title)}</div>
        <div class="admin-row-meta">
          ${typeBadge(item.type)}
          <span class="card-cat">${escapeHtml(catName(item.category, l))}</span>
          <span class="card-cat">${area ? escapeHtml(localizedAreaTitle(area, l)) : escapeHtml(t("admin.noArea", l))}</span>
          <time>${escapeHtml(formatDate(item.createdAt, l))}</time>
        </div>
      </div>
      <div class="admin-row-actions">
        <button class="btn-icon" data-edit aria-label="${escapeHtml(t("admin.editAction", l))}">${svgIcon("edit", "icon icon-sm")}</button>
        <button class="btn-icon danger" data-delete aria-label="${escapeHtml(t("admin.deleteAction", l))}">${svgIcon("trash", "icon icon-sm")}</button>
      </div>
    </div>
  `;
}

function contentFormHtml(data, l) {
  const typeOptions = TYPE_ORDER.map(
    (tp) => `<option value="${escapeHtml(tp)}" ${data.type === tp ? "selected" : ""}>${escapeHtml(t(`types.${tp}`, l))}</option>`
  ).join("");
  const catOptions = CATEGORY_ORDER.map(
    (c) => `<option value="${escapeHtml(c)}" ${data.category === c ? "selected" : ""}>${escapeHtml(catName(c, l))}</option>`
  ).join("");
  const areas = store.getAreas();
  const areaOptions = areas.length
    ? `<option value="">${escapeHtml(t("admin.noArea", l))}</option>` +
      areas
        .map(
          (a) =>
            `<option value="${escapeHtml(a.id)}" ${data.areaId === a.id ? "selected" : ""}>${escapeHtml(localizedAreaTitle(a, l))}</option>`
        )
        .join("")
    : `<option value="">${escapeHtml(t("admin.noArea", l))}</option>`;

  return `
    <form class="content-form" novalidate data-content-form>
      <div class="form-group">
        <label class="form-label" for="af-title">${escapeHtml(t("admin.fieldTitle", l))} *</label>
        <input class="form-input" id="af-title" name="title" type="text" required
          placeholder="${escapeHtml(t("admin.placeholderTitle", l))}" value="${escapeHtml(data.title)}" />
        <p class="form-hint" data-error="title" hidden></p>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-area">${escapeHtml(t("admin.fieldArea", l))} *</label>
        <select class="form-select" id="af-area" name="areaId">${areaOptions}</select>
        ${
          areas.length
            ? `<p class="form-hint" data-error="areaId" hidden></p>`
            : `<p class="form-hint">${escapeHtml(t("admin.contentNoAreas", l))}</p>`
        }
      </div>

      <div class="form-group">
        <label class="form-label" for="af-type">${escapeHtml(t("admin.fieldType", l))} *</label>
        <select class="form-select" id="af-type" name="type">${typeOptions}</select>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-url">${escapeHtml(t("admin.fieldUrl", l))} *</label>
        <input class="form-input" id="af-url" name="url" type="url" required
          placeholder="${escapeHtml(t("admin.placeholderUrl", l))}" value="${escapeHtml(data.url)}" />
        <p class="form-hint" data-error="url" hidden></p>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-description">${escapeHtml(t("admin.fieldDescription", l))}</label>
        <textarea class="form-textarea" id="af-description" name="description" rows="4"
          placeholder="${escapeHtml(t("admin.placeholderDescription", l))}">${escapeHtml(data.description)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-category">${escapeHtml(t("admin.fieldCategory", l))} *</label>
        <select class="form-select" id="af-category" name="category">${catOptions}</select>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-thumbnail">${escapeHtml(t("admin.fieldThumbnail", l))}</label>
        <input class="form-input" id="af-thumbnail" name="thumbnail" type="url"
          placeholder="${escapeHtml(t("admin.placeholderUrl", l))}" value="${escapeHtml(data.thumbnail || "")}" />
        <p class="form-hint">${escapeHtml(t("admin.thumbnailOptional", l))}</p>
        <p class="form-hint" data-error="thumbnail" hidden></p>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-form-cancel>${escapeHtml(t("common.cancel", l))}</button>
        <button type="submit" class="btn btn-primary" data-form-save>${svgIcon("edit", "icon icon-sm")}${escapeHtml(t("common.save", l))}</button>
      </div>
    </form>
  `;
}

function openContentForm(item) {
  const l = lang();
  const isEdit = !!item;
  const data = item
    ? {
        title: item.title || "",
        type: item.type || "video",
        url: item.url || "",
        description: item.description || "",
        category: item.category || "prayer",
        thumbnail: item.thumbnail || "",
        areaId: item.areaId || ""
      }
    : { ...EMPTY_FORM };

  const { modal, close } = openModal({
    title: isEdit ? t("admin.editTitle", l) : t("admin.newTitle", l),
    body: contentFormHtml(data, l),
    onMount: (m, closeModal) => {
      const form = m.querySelector("[data-content-form]");
      const saveBtn = m.querySelector("[data-form-save]");

      function setLoading(loading) {
        saveBtn.disabled = loading;
        saveBtn.classList.toggle("loading", loading);
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {
          title: form.elements.title.value.trim(),
          type: form.elements.type.value,
          url: form.elements.url.value.trim(),
          description: form.elements.description.value.trim(),
          category: form.elements.category.value,
          thumbnail: form.elements.thumbnail.value.trim(),
          areaId: form.elements.areaId.value
        };
        let valid = true;
        form.querySelectorAll(".form-hint").forEach((h) => (h.hidden = true));
        form.querySelectorAll(".form-input").forEach((i) => i.classList.remove("error"));

        if (!values.title) {
          setError("title", t("admin.validationRequired", l));
          valid = false;
        }
        if (!values.areaId) {
          setError("areaId", t("admin.fieldAreaRequired", l));
          valid = false;
        }
        if (!values.url) {
          setError("url", t("admin.validationRequired", l));
          valid = false;
        } else if (!isValidUrl(values.url)) {
          setError("url", t("admin.validationUrl", l));
          valid = false;
        }
        if (values.thumbnail && !isValidUrl(values.thumbnail)) {
          setError("thumbnail", t("admin.validationUrl", l));
          valid = false;
        }
        if (!valid) return;

        setLoading(true);
        setTimeout(() => {
          try {
            const langCode = lang();
            const saved = store.upsertItem({
              ...(item ? { id: item.id } : {}),
              ...values,
              titleI18n: {
                ...(item && item.titleI18n ? item.titleI18n : {}),
                [langCode]: values.title
              },
              descI18n: {
                ...(item && item.descI18n ? item.descI18n : {}),
                [langCode]: values.description
              },
              tags: item && item.tags ? item.tags : []
            });
            if (saved) {
              close();
              toast(t("admin.saveSuccess", l), "success");
            } else {
              setLoading(false);
              toast(t("admin.deleteError", l), "error");
            }
          } catch (err) {
            setLoading(false);
            toast(t("admin.deleteError", l), "error");
          }
        }, 200);
      });

      function setError(name, msg) {
        const input = form.querySelector(`[name="${name}"]`);
        const hint = form.querySelector(`[data-error="${name}"]`);
        if (input) input.classList.add("error");
        if (hint) {
          hint.textContent = msg;
          hint.hidden = false;
        }
      }

      m.querySelector("[data-form-cancel]").addEventListener("click", closeModal);
      setTimeout(() => form.elements.title.focus(), 50);
    }
  });

  void modal;
}

function renderContentPanel(panel, l) {
  panel.innerHTML = `
    <div class="panel-head">
      <h2>${escapeHtml(t("admin.sub", l))}</h2>
      <button class="btn btn-primary btn-sm" data-add>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.contentAdd", l))}</button>
    </div>
    <div data-content-panel>${stateLoading()}</div>
  `;

  const holder = panel.querySelector("[data-content-panel]");

  function renderList() {
    let items;
    let areas;
    try {
      items = store.getContent();
      areas = store.getAreas();
    } catch (err) {
      holder.innerHTML = stateError(String(err && err.message ? err.message : err));
      return;
    }

    if (!items.length) {
      holder.innerHTML = stateEmpty(
        t("admin.emptyTitle", l),
        t("admin.emptyText", l),
        `<button class="btn btn-primary btn-sm" data-add-empty>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.contentAdd", l))}</button>`
      );
      const emptyAdd = holder.querySelector("[data-add-empty]");
      if (emptyAdd) emptyAdd.addEventListener("click", () => openContentForm(null));
      return;
    }

    if (areas.length) {
      const areaChips = areas
        .map((a) => `<button class="chip" data-area="${escapeHtml(a.id)}">${escapeHtml(localizedAreaTitle(a, l))}</button>`)
        .join("");
      const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      holder.innerHTML = `
        <div class="filter-block">
          <p class="filter-label">${escapeHtml(t("admin.contentFilter", l))}</p>
          <div class="chip-row" data-area-chips>
            <button class="chip active" data-area="all">${escapeHtml(t("common.all", l))}</button>
            ${areaChips}
          </div>
        </div>
        <div class="admin-list" aria-label="${escapeHtml(t("admin.list", l))}" data-rows>
          ${sorted.map(contentRow).join("")}
        </div>
      `;

      holder.querySelector("[data-area-chips]").addEventListener("click", (event) => {
        const chip = event.target.closest("[data-area]");
        if (!chip) return;
        holder.querySelectorAll("[data-area]").forEach((c) => c.classList.toggle("active", c === chip));
        const sel = chip.dataset.area;
        const rows = holder.querySelectorAll("[data-rows] .admin-row");
        rows.forEach((r) => {
          const rowArea = store.getArea(store.getItem(r.dataset.id).areaId);
          r.hidden = sel !== "all" && (rowArea ? rowArea.id !== sel : true);
        });
      });
    } else {
      holder.innerHTML = `<div class="admin-list" aria-label="${escapeHtml(t("admin.list", l))}">${[...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(contentRow).join("")}</div>`;
    }

    const list = holder.querySelector("[data-rows]") || holder.querySelector(".admin-list");
    if (list) {
      list.querySelectorAll("[data-edit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.closest("[data-id]").dataset.id;
          openContentForm(store.getItem(id));
        });
      });
      list.querySelectorAll("[data-delete]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.closest("[data-id]").dataset.id;
          const item = store.getItem(id);
          if (!item) return;
          const ok = await confirmDialog({
            title: t("admin.deleteConfirmTitle", l),
            message: t("admin.deleteConfirmText", l),
            confirmLabel: t("admin.confirmDelete", l),
            danger: true
          });
          if (ok) {
            store.deleteItem(id);
            toast(t("admin.deleteSuccess", l), "success");
          }
        });
      });
    }
  }

  const addBtn = panel.querySelector("[data-add]");
  addBtn.addEventListener("click", () => openContentForm(null));

  setTimeout(renderList, 200);
}

/* =====================================================================
   AREAS PANEL
   ===================================================================== */

function areaFormHtml(data, l) {
  return `
    <form class="content-form" novalidate data-area-form>
      <div class="form-group">
        <label class="form-label" for="af-area-title">${escapeHtml(t("admin.fieldAreaTitle", l))} *</label>
        <input class="form-input" id="af-area-title" name="title" type="text" required
          placeholder="${escapeHtml(t("admin.areaPlaceholderTitle", l))}" value="${escapeHtml(data.title)}" />
        <p class="form-hint" data-error="title" hidden></p>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-area-description">${escapeHtml(t("admin.fieldAreaDescription", l))}</label>
        <textarea class="form-textarea" id="af-area-description" name="description" rows="3"
          placeholder="${escapeHtml(t("admin.areaPlaceholderDesc", l))}">${escapeHtml(data.description)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="af-area-cover">${escapeHtml(t("admin.fieldAreaCover", l))}</label>
        <input class="form-input" id="af-area-cover" name="cover" type="url"
          placeholder="${escapeHtml(t("admin.placeholderUrl", l))}" value="${escapeHtml(data.cover || "")}" />
        <p class="form-hint">${escapeHtml(t("admin.coverOptional", l))}</p>
        <p class="form-hint" data-error="cover" hidden></p>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-form-cancel>${escapeHtml(t("common.cancel", l))}</button>
        <button type="submit" class="btn btn-primary" data-form-save>${svgIcon("edit", "icon icon-sm")}${escapeHtml(t("common.save", l))}</button>
      </div>
    </form>
  `;
}

function openAreaForm(area) {
  const l = lang();
  const isEdit = !!area;
  const data = area
    ? {
        title: area.title || "",
        description: area.description || "",
        cover: area.cover || ""
      }
    : { title: "", description: "", cover: "" };

  const { modal, close } = openModal({
    title: isEdit ? t("admin.editAreaTitle", l) : t("admin.newAreaTitle", l),
    body: areaFormHtml(data, l),
    onMount: (m, closeModal) => {
      const form = m.querySelector("[data-area-form]");
      const saveBtn = m.querySelector("[data-form-save]");

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {
          title: form.elements.title.value.trim(),
          description: form.elements.description.value.trim(),
          cover: form.elements.cover.value.trim()
        };
        let valid = true;
        form.querySelectorAll(".form-hint").forEach((h) => (h.hidden = true));
        form.querySelectorAll(".form-input").forEach((i) => i.classList.remove("error"));

        if (!values.title) {
          setError("title", t("admin.validationRequired", l));
          valid = false;
        }
        if (values.cover && !isValidUrl(values.cover)) {
          setError("cover", t("admin.validationUrl", l));
          valid = false;
        }
        if (!valid) return;

        const langCode = lang();
        const saved = store.upsertArea({
          ...(area ? { id: area.id } : {}),
          ...values,
          titleI18n: {
            ...(area && area.titleI18n ? area.titleI18n : {}),
            [langCode]: values.title
          },
          descI18n: {
            ...(area && area.descI18n ? area.descI18n : {}),
            [langCode]: values.description
          }
        });
        if (saved) {
          close();
          toast(t("admin.areaSaveSuccess", l), "success");
        } else {
          toast(t("admin.deleteError", l), "error");
        }
      });

      function setError(name, msg) {
        const input = form.querySelector(`[name="${name}"]`);
        const hint = form.querySelector(`[data-error="${name}"]`);
        if (input) input.classList.add("error");
        if (hint) {
          hint.textContent = msg;
          hint.hidden = false;
        }
      }

      m.querySelector("[data-form-cancel]").addEventListener("click", closeModal);
      setTimeout(() => form.elements.title.focus(), 50);
    }
  });

  void modal;
}

function areaRow(area) {
  const l = lang();
  const count = store.getContent().filter((i) => i.areaId === area.id).length;
  const localized = {
    title: localizedAreaTitle(area, l),
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const cover = area.cover && /^(https?:\/\/|\.\/|\.\.\/|\/|assets\/)/i.test(area.cover)
    ? area.cover
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64"><rect width="96" height="64" fill="#3b1f4e"/><polygon points="48,16 62,48 34,48" fill="none" stroke="#d9ab3c" stroke-width="2"/></svg>`)}`;
  return `
    <div class="admin-row" data-id="${escapeHtml(area.id)}">
      <img class="admin-row-thumb" src="${escapeHtml(cover)}" alt="" loading="lazy" />
      <div class="admin-row-main">
        <div class="admin-row-title">${escapeHtml(localized.title)}</div>
        <div class="admin-row-meta">
          <span class="card-cat">${count} ${escapeHtml(t("areas.pieces", l))}</span>
          ${localized.description ? `<span class="admin-row-desc">${escapeHtml(snippet(localized.description, 60))}</span>` : ""}
        </div>
      </div>
      <div class="admin-row-actions">
        <button class="btn-icon" data-edit-area aria-label="${escapeHtml(t("admin.editAction", l))}">${svgIcon("edit", "icon icon-sm")}</button>
        <button class="btn-icon danger" data-delete-area aria-label="${escapeHtml(t("admin.deleteAction", l))}">${svgIcon("trash", "icon icon-sm")}</button>
      </div>
    </div>
  `;
}

function renderAreasPanel(panel, l) {
  panel.innerHTML = `
    <div class="panel-head">
      <h2>${escapeHtml(t("admin.areasTitle", l))}</h2>
      <button class="btn btn-primary btn-sm" data-add-area>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.addArea", l))}</button>
    </div>
    <div data-areas-panel>${stateLoading()}</div>
  `;

  const holder = panel.querySelector("[data-areas-panel]");

  function renderList() {
    let areas;
    try {
      areas = store.getAreas();
    } catch (err) {
      holder.innerHTML = stateError(String(err && err.message ? err.message : err));
      return;
    }

    if (!areas.length) {
      holder.innerHTML = stateEmpty(
        t("admin.areaEmptyTitle", l),
        t("admin.areaEmptyText", l),
        `<button class="btn btn-primary btn-sm" data-add-area-empty>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.addArea", l))}</button>`
      );
      const emptyAdd = holder.querySelector("[data-add-area-empty]");
      if (emptyAdd) emptyAdd.addEventListener("click", () => openAreaForm(null));
      return;
    }

    holder.innerHTML = `
      <div class="admin-list" aria-label="${escapeHtml(t("admin.areaList", l))}">
        ${areas.map(areaRow).join("")}
      </div>
    `;

    holder.querySelectorAll("[data-edit-area]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.closest("[data-id]").dataset.id;
        openAreaForm(store.getArea(id));
      });
    });

    holder.querySelectorAll("[data-delete-area]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.closest("[data-id]").dataset.id;
        const area = store.getArea(id);
        if (!area) return;
        const ok = await confirmDialog({
          title: t("admin.areaDeleteConfirmTitle", l),
          message: t("admin.areaDeleteConfirmText", l),
          confirmLabel: t("admin.confirmDelete", l),
          danger: true
        });
        if (ok) {
          store.deleteArea(id);
          toast(t("admin.areaDeleteSuccess", l), "success");
        }
      });
    });
  }

  const addBtn = panel.querySelector("[data-add-area]");
  addBtn.addEventListener("click", () => openAreaForm(null));

  setTimeout(renderList, 200);
}

/* =====================================================================
   MEMBERS PANEL
   ===================================================================== */

function memberFormHtml(member, l) {
  const langOptions = LANGS.map(
    (code) =>
      `<option value="${escapeHtml(code)}" ${(member && member.language) === code ? "selected" : ""}>${escapeHtml(langName(code))}</option>`
  ).join("");
  return `
    <form class="content-form" novalidate data-member-form>
      <div class="form-group">
        <label class="form-label" for="mf-email">${escapeHtml(t("admin.fieldEmail", l))} *</label>
        <input class="form-input" id="mf-email" name="email" type="email" required
          placeholder="${escapeHtml(t("admin.memberPlaceholderEmail", l))}" value="${escapeHtml((member && member.email) || "")}" />
        <p class="form-hint" data-error="email" hidden></p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mf-first">${escapeHtml(t("admin.fieldFirstName", l))}</label>
          <input class="form-input" id="mf-first" name="firstName" type="text"
            placeholder="${escapeHtml(t("admin.memberPlaceholderName", l))}" value="${escapeHtml((member && member.firstName) || "")}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="mf-last">${escapeHtml(t("admin.fieldLastName", l))}</label>
          <input class="form-input" id="mf-last" name="lastName" type="text" value="${escapeHtml((member && member.lastName) || "")}" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mf-language">${escapeHtml(t("admin.fieldLanguage", l))}</label>
          <select class="form-select" id="mf-language" name="language">${langOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label" for="mf-password">${escapeHtml(t("admin.fieldPassword", l))}</label>
          <input class="form-input" id="mf-password" name="password" type="text" value="${escapeHtml((member && member.password) || "1234")}" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-form-cancel>${escapeHtml(t("common.cancel", l))}</button>
        <button type="submit" class="btn btn-primary" data-form-save>${svgIcon("edit", "icon icon-sm")}${escapeHtml(t("common.save", l))}</button>
      </div>
    </form>
  `;
}

function openMemberForm(member) {
  const l = lang();
  const isEdit = !!member;
  const { modal, close } = openModal({
    title: isEdit ? t("admin.editMemberTitle", l) : t("admin.newMemberTitle", l),
    body: memberFormHtml(member, l),
    onMount: (m, closeModal) => {
      const form = m.querySelector("[data-member-form]");

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = {
          email: form.elements.email.value.trim(),
          firstName: form.elements.firstName.value.trim(),
          lastName: form.elements.lastName.value.trim(),
          language: form.elements.language.value,
          password: form.elements.password.value.trim() || "1234"
        };
        form.querySelectorAll(".form-hint").forEach((h) => (h.hidden = true));
        form.querySelectorAll(".form-input").forEach((i) => i.classList.remove("error"));

        if (!isValidEmail(values.email)) {
          const input = form.elements.email;
          const hint = form.querySelector(`[data-error="email"]`);
          input.classList.add("error");
          hint.textContent = t("auth.invalidEmail", l);
          hint.hidden = false;
          return;
        }

        const existing = store
          .getMembers()
          .find((m) => m.email.toLowerCase() === values.email.toLowerCase() && m.id !== (member && member.id));
        if (existing) {
          const input = form.elements.email;
          const hint = form.querySelector(`[data-error="email"]`);
          input.classList.add("error");
          hint.textContent = t("admin.memberExists", l);
          hint.hidden = false;
          return;
        }

        const saved = store.upsertMember({
          ...(member ? { id: member.id } : {}),
          ...values,
          username: member && member.username ? member.username : values.email.split("@")[0]
        });
        if (saved) {
          close();
          toast(t("admin.memberSaveSuccess", l), "success");
        } else {
          toast(t("admin.deleteError", l), "error");
        }
      });

      m.querySelector("[data-form-cancel]").addEventListener("click", closeModal);
      setTimeout(() => form.elements.email.focus(), 50);
    }
  });

  void modal;
}

function memberRow(member, areas, l) {
  const isOwner = member.role === "owner";
  const isSelf = auth.currentUser() && auth.currentUser().userId === member.id;
  const toggles = areas.length
    ? areas
        .map((a) => {
          const checked = store.canAccessArea(member, a.id);
          return `<label class="access-toggle${isOwner ? " is-owner" : ""}" title="${escapeHtml(localizedAreaTitle(a, l))}">
            <input type="checkbox" data-area-toggle="${escapeHtml(a.id)}" ${checked ? "checked" : ""} ${isOwner ? "disabled" : ""} aria-label="${escapeHtml(localizedAreaTitle(a, l))}" />
            <span>${escapeHtml(localizedAreaTitle(a, l))}</span>
          </label>`;
        })
        .join("")
    : `<span class="member-no-areas">${escapeHtml(t("admin.contentNoAreas", l))}</span>`;

  return `
    <div class="member-row" data-member-id="${escapeHtml(member.id)}">
      <div class="member-avatar" aria-hidden="true">${escapeHtml(initials(member))}</div>
      <div class="member-main">
        <div class="member-name">${escapeHtml([member.firstName, member.lastName].filter(Boolean).join(" ") || member.email)}</div>
        <div class="member-email">${escapeHtml(member.email)}</div>
        ${isOwner ? `<span class="member-owner-badge">${escapeHtml(t("profile.owner", l))}</span>` : ""}
      </div>
      <div class="member-access">
        <p class="filter-label">${escapeHtml(t("admin.memberAccess", l))}</p>
        <div class="access-grid">${toggles}</div>
      </div>
      <div class="admin-row-actions">
        <button class="btn-icon" data-edit-member aria-label="${escapeHtml(t("admin.editAction", l))}">${svgIcon("edit", "icon icon-sm")}</button>
        ${!isOwner && !isSelf ? `<button class="btn-icon danger" data-delete-member aria-label="${escapeHtml(t("admin.deleteAction", l))}">${svgIcon("trash", "icon icon-sm")}</button>` : ""}
      </div>
    </div>
  `;
}

function renderMembersPanel(panel, l) {
  panel.innerHTML = `
    <div class="panel-head">
      <h2>${escapeHtml(t("admin.membersTitle", l))}</h2>
      <button class="btn btn-primary btn-sm" data-add-member>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.addMember", l))}</button>
    </div>
    <div data-members-panel>${stateLoading()}</div>
  `;

  const holder = panel.querySelector("[data-members-panel]");

  function renderList() {
    let members;
    let areas;
    try {
      members = store.getMembers();
      areas = store.getAreas();
    } catch (err) {
      holder.innerHTML = stateError(String(err && err.message ? err.message : err));
      return;
    }

    if (!members.length) {
      holder.innerHTML = stateEmpty(
        t("admin.membersEmpty", l),
        t("admin.membersEmptyText", l),
        `<button class="btn btn-primary btn-sm" data-add-member-empty>${svgIcon("plus", "icon icon-sm")}${escapeHtml(t("admin.addMember", l))}</button>`
      );
      const emptyAdd = holder.querySelector("[data-add-member-empty]");
      if (emptyAdd) emptyAdd.addEventListener("click", () => openMemberForm(null));
      return;
    }

    holder.innerHTML = `
      <div class="member-list" aria-label="${escapeHtml(t("admin.membersList", l))}">
        ${members.map((m) => memberRow(m, areas, l)).join("")}
      </div>
    `;

    holder.querySelectorAll("[data-area-toggle]").forEach((box) => {
      box.addEventListener("change", () => {
        const row = box.closest("[data-member-id]");
        const member = store.getMemberById(row.dataset.memberId);
        store.setMemberEnrollment(row.dataset.memberId, box.dataset.areaToggle, box.checked);
        const area = store.getArea(box.dataset.areaToggle);
        const label = area ? localizedAreaTitle(area, l) : box.dataset.areaToggle;
        const memberName = member && [member.firstName, member.lastName].filter(Boolean).join(" ");
        toast(
          `${box.checked ? t("admin.accessGranted", l) : t("admin.accessRevoked", l)} · ${label} · ${memberName || member.email}`
        );
      });
    });

    holder.querySelectorAll("[data-edit-member]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.closest("[data-member-id]").dataset.memberId;
        openMemberForm(store.getMemberById(id));
      });
    });

    holder.querySelectorAll("[data-delete-member]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.closest("[data-member-id]").dataset.memberId;
        const member = store.getMemberById(id);
        if (!member) return;
        const ok = await confirmDialog({
          title: t("admin.memberDeleteConfirmTitle", l),
          message: t("admin.memberDeleteConfirmText", l),
          confirmLabel: t("admin.confirmDelete", l),
          danger: true
        });
        if (ok) {
          store.deleteMember(id);
          toast(t("admin.memberDeleteSuccess", l), "success");
        }
      });
    });
  }

  const addBtn = panel.querySelector("[data-add-member]");
  addBtn.addEventListener("click", () => openMemberForm(null));

  setTimeout(renderList, 200);
}

/* =====================================================================
   ADMIN SHELL
   ===================================================================== */

export function renderAdmin(container) {
  const l = lang();

  container.innerHTML = `
    <div class="view view-pad">
      <header class="page-head admin-head">
        <div>
          <h1 class="page-title">${escapeHtml(t("admin.title", l))}</h1>
          ${fleuron()}
          <p class="page-sub">${escapeHtml(t("admin.sub", l))}</p>
        </div>
      </header>

      <div class="admin-tabs" role="tablist" aria-label="${escapeHtml(t("admin.title", l))}">
        <button class="chip tab-btn ${activeTab === "areas" ? "active" : ""}" data-tab="areas" role="tab" aria-selected="${activeTab === "areas" ? "true" : "false"}">${escapeHtml(t("admin.tabAreas", l))}</button>
        <button class="chip tab-btn ${activeTab === "content" ? "active" : ""}" data-tab="content" role="tab" aria-selected="${activeTab === "content" ? "true" : "false"}">${escapeHtml(t("admin.tabContent", l))}</button>
        <button class="chip tab-btn ${activeTab === "members" ? "active" : ""}" data-tab="members" role="tab" aria-selected="${activeTab === "members" ? "true" : "false"}">${escapeHtml(t("admin.tabMembers", l))}</button>
      </div>

      <div data-admin-panel></div>
    </div>
  `;

  const panel = container.querySelector("[data-admin-panel]");
  const tabs = container.querySelectorAll("[data-tab]");

  function renderPanel() {
    if (activeTab === "areas") renderAreasPanel(panel, l);
    else if (activeTab === "content") renderContentPanel(panel, l);
    else renderMembersPanel(panel, l);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      tabs.forEach((b) => {
        const active = b === tab;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      renderPanel();
    });
  });

  renderPanel();
  return container;
}
