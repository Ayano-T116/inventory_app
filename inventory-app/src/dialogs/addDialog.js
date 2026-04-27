import { selectSymbols } from "../utils/constants.js";
import { helpers } from "../utils/helpers.js";
import { state, useState } from "../utils/state.js";
import { insertMaterial, createPayload } from "../services/materialService.js";



export function initAddDialog({
    dialogAdd,
    formAdd,
    btnAddOk,
    btnAddCancel,
    btnAddRow,
    btnDelete,
    btnRefresh,
    setStatus,
    fetchMaterials,
    selectSymbol,
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

    // 登録ボタン押下処理
    async function addMaterials() {
        const fd = new FormData(formAdd);
        const payload = createPayload(fd); 

        setStatus("登録中...");
        btnAddOk.disabled = true;
        btnAddRow.disabled = true;
        if (btnDelete) btnDelete.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;

        try {
            await insertMaterial(state.allRows, payload);
            setStatus("登録しました。再読み込みします...");
            dialogAdd.close();
            await fetchMaterials();
        } catch (e) {
            if(e.message == "重複エラー") {
                alert(`同じ記号・口径・厚さ・表面処理の材料が既に存在しています。`);
            }
            console.error(e);
            setStatus(`登録エラー: ${e.message || e}`, "error");
        } finally {
            btnAddOk.disabled = false;
            btnAddRow.disabled = false;
            btnDelete.disabled = useState.updateDeleteButtonState();
            btnRefresh.disabled = useState.updateRefreshButtonState();
        }
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



    /**イベントリスナーの設定*/

    // 記号選択の変更に応じて、口径のラベルと単位を更新
    selectSymbol.addEventListener("change", (ev) => {
        createDiameterTexts(ev.target.value);
    });

    // 数値入力欄の整形
    for (const input of numericInputs) {
        input.addEventListener("input", (ev) => {
            const next = helpers.normalizeIntegerText(ev.target.value);
            ev.target.value = next;
        });
    }

    // 登録ボタンのクリックイベント
    formAdd.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        await addMaterials();
    });

    // キャンセルボタンのクリックイベント
    btnAddCancel.addEventListener("click", () => {
        closeAddDialog();
    });


    return { openAddDialog }


}