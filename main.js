import { supabase } from "./supabase.js";

const TABLE = "materials";

// UIの「coating-type」「updated-at」は、DB列名として coating_type / updated_at を想定
const COLUMNS = [
  { label: "symbol", key: "symbol" },
  { label: "diameter", key: "diameter" },
  { label: "thickness", key: "thickness" },
  { label: "coating-type", key: "coating_type" },
  { label: "quantity", key: "quantity", align: "num" },
  { label: "updated-at", key: "updated_at" },
];

const elTbody = document.getElementById("tbody");
const elStatus = document.getElementById("status");
const btnRefresh = document.getElementById("btnRefresh");
const btnAddRow = document.getElementById("btnAddRow");
const dialogAdd = document.getElementById("dialogAdd");
const formAdd = document.getElementById("formAdd");
const btnSubmitAdd = document.getElementById("btnSubmitAdd");

function setStatus(message, kind = "info") {
  if (!elStatus) return;
  elStatus.textContent = message || "";
  elStatus.dataset.kind = kind;
}

function formatValue(key, value) {
  if (value === null || value === undefined) return "";

  if (key === "updated_at") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  return String(value);
}

function renderRows(rows) {
  elTbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = COLUMNS.length;
    td.className = "muted";
    td.textContent = "データがありません。右上の「新規行を追加」から登録できます。";
    tr.appendChild(td);
    elTbody.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement("tr");

    for (const col of COLUMNS) {
      const td = document.createElement("td");
      td.classList.add("cell");
      td.tabIndex = 0; // Excelっぽく「セルを選択」できるようにする

      if (col.align === "num") td.classList.add("num");

      const v = formatValue(col.key, row[col.key]);
      td.textContent = v;
      tr.appendChild(td);
    }

    elTbody.appendChild(tr);
  }
}

async function fetchMaterials() {
  setStatus("読み込み中...");
  btnRefresh.disabled = true;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("symbol,diameter,thickness,coating_type,quantity,updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    renderRows(data);
    setStatus(`表示件数: ${data.length}`);
  } catch (e) {
    console.error(e);
    setStatus(`エラー: ${e.message || e}`, "error");
    renderRows([]);
  } finally {
    btnRefresh.disabled = false;
  }
}

function openAddDialog() {
  if (!dialogAdd) return;
  formAdd.reset();
  dialogAdd.showModal();
  const first = formAdd.querySelector("input[name='symbol']");
  if (first) first.focus();
}

function readNumber(formData, name) {
  const raw = formData.get(name);
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n;
}

async function insertMaterial(payload) {
  setStatus("登録中...");
  btnSubmitAdd.disabled = true;
  btnAddRow.disabled = true;

  try {
    const { error } = await supabase.from(TABLE).insert(payload);
    if (error) throw error;

    setStatus("登録しました。再読み込みします...");
    dialogAdd.close();
    await fetchMaterials();
  } catch (e) {
    console.error(e);
    setStatus(`登録エラー: ${e.message || e}`, "error");
  } finally {
    btnSubmitAdd.disabled = false;
    btnAddRow.disabled = false;
  }
}

btnRefresh.addEventListener("click", () => {
  fetchMaterials();
});

btnAddRow.addEventListener("click", () => {
  openAddDialog();
});

formAdd.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const fd = new FormData(formAdd);
  const payload = {
    symbol: String(fd.get("symbol") || "").trim(),
    diameter: readNumber(fd, "diameter"),
    thickness: readNumber(fd, "thickness"),
    coating_type: String(fd.get("coating_type") || "").trim() || null,
    quantity: readNumber(fd, "quantity"),
  };

  // 超シンプルな入力チェック（初心者向けに最低限）
  if (!payload.symbol) {
    setStatus("symbol は必須です。", "error");
    return;
  }
  if (payload.diameter === null || payload.thickness === null || payload.quantity === null) {
    setStatus("diameter / thickness / quantity は数値で入力してください。", "error");
    return;
  }

  await insertMaterial(payload);
});

// 初期表示
fetchMaterials();
