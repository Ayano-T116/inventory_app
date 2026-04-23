import { addItem } from "../db.js";
import { selectSymbols } from "../utils/constants.js";
import { initHelpers } from "../utils/helpers.js";
import { state } from "../utils/state.js";

const { normalizeIntegerText, readNumber } = initHelpers({});

export function initAddDialog({
    dialogAdd,
    formAdd,
    btnAddOk,
    btnAddCancel,
    btnAddRow,
    btnDelete,
    setStatus,
    fetchMaterials,
    selectSymbol,
    updateDeleteButtonState,    //後ほどstatus.jsから渡す予定
    updateRefreshButtonState,   //後ほどstatus.jsから渡す予定
}) {

    /** 新規登録ダイアログ関連 */

    // 数値入力欄の取得
    const numericInputs = Array.from(
        formAdd.querySelectorAll("input[name='diameter'], input[name='thickness'], input[name='quantity']")
    );

    // ダイアログを開く関数
    function openAddDialog() {
        if (!dialogAdd) return;
        formAdd.reset();
        dialogAdd.showModal();
        createSymbolOptions();
        const first = formAdd.querySelector("select[name='symbol']");
        if (first) first.focus();
    }

    // ダイアログを閉じる関数
    function closeAddDialog() {
        formAdd.reset();
        dialogAdd.close();
    }


    // 記号の選択肢を生成する関数
    function createSymbolOptions() {
        const select = document.querySelector("select[name='symbol']");
        if (!select) return;
        if (select.options.length === 0) {
            selectSymbols.forEach(({ value, label }) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = label;
                select.appendChild(option);
            });
        }
    }

    // 記号選択に応じて、口径のラベルと単位を更新する関数
    function createDiameterTexts(symbol) {
        const diameterLabel = document.getElementById("diameterLabel");
        const diameterSuffix = document.getElementById("diameterSuffix");
        const texts = selectSymbols.find(({ value }) => value === symbol);
        diameterLabel.textContent = texts.diameterLabel;
        diameterSuffix.textContent = texts.diameterSuffix;
    }

    //重複登録を防ぐためのチェック
    function isDuplicate(payload) {
        return state.allRows.some(row => row.symbol === payload.symbol
            && row.diameter === payload.diameter
            && row.thickness === payload.thickness
            && (row.coating_type ?? "") === (payload.coating_type ?? ""));
    }

    // DBに登録する関数
    async function insertMaterial(payload) {
        setStatus("登録中...");
        btnAddOk.disabled = true;
        btnAddRow.disabled = true;
        if (btnDelete) btnDelete.disabled = true;

        try {
            const { error } = await addItem(payload);
            if (error) {
                alert("データを登録できませんでした。");
                throw error;
            }

            setStatus("登録しました。再読み込みします...");
            dialogAdd.close();
            await fetchMaterials();
        } catch (e) {
            console.error(e);
            setStatus(`登録エラー: ${e.message || e}`, "error");
        } finally {
            btnAddOk.disabled = false;
            btnAddRow.disabled = false;
            updateDeleteButtonState();
            updateRefreshButtonState();
        }
    }



    /**イベントリスナーの設定*/

    // 記号選択の変更に応じて、口径のラベルと単位を更新
    selectSymbol.addEventListener("change", (ev) => {
        createDiameterTexts(ev.target.value);
    });

    // 数値入力欄の整形
    for (const input of numericInputs) {
        input.addEventListener("input", (ev) => {
            const next = normalizeIntegerText(ev.target.value);
            ev.target.value = next;
        });
    }

    // フォームの送信イベント
    formAdd.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        const fd = new FormData(formAdd);
        const payload = {
            symbol: String(fd.get("symbol") || "").trim(),
            diameter: readNumber(fd, "diameter"),
            thickness: readNumber(fd, "thickness"),
            coating_type: String(fd.get("coating_type") || "").trim(),
            quantity: readNumber(fd, "quantity"),
        };

        if (!payload.symbol) {
            setStatus("symbol は必須です。", "error");
            return;
        }
        if (payload.diameter === null || payload.thickness === null || payload.quantity === null) {
            setStatus("diameter / thickness / quantity は数値で入力してください。", "error");
            return;
        }

        if (isDuplicate(payload)) {
            setStatus("同じ記号・口径・厚さ・表面処理の材料が既に存在しています。", "error");
            alert("同じ記号・口径・厚さ・表面処理の材料が既に存在しています。");
            return;
        }

        await insertMaterial(payload);
    });

    // キャンセルボタンのクリックイベント
    btnAddCancel.addEventListener("click", () => {
        closeAddDialog();
    });


    return { openAddDialog }


}