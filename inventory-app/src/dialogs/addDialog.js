import { selectSymbols_materials, selectSymbols_materials_metal, selectCoating_materials, selectColor_materials_metal } from "../utils/constants.js";
import { helpers } from "../utils/helpers.js";
import { state, useState } from "../utils/state.js";
import { insertMaterial, createPayload } from "../services/materialService.js";



export function initAddDialog({
    dialogAdd,
    formAdd,
    fieldInsulation,
    fieldMetal,
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

    // 英数字入力欄の取得
    const alphanumericInputs = Array.from(
        formAdd.querySelectorAll("input[name='gauge']")
    );

    // ダイアログを開く関数
    function openAddDialog() {
        if (!dialogAdd) return;
        formAdd.reset();
        dialogAdd.showModal();
        chacgeDialogFields(state.tabName);
        createSymbolOptions(state.tabName);
        createCoatingOptions(state.tabName);
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
        const payload = createPayload(fd, state.tabName);

        setStatus("登録中...");
        btnAddOk.disabled = true;
        btnAddRow.disabled = true;
        if (btnDelete) btnDelete.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;

        try {
            await insertMaterial(state.allRows, payload, state.tabName);
            setStatus("登録しました。再読み込みします...");
            dialogAdd.close();
            await fetchMaterials();
        } catch (e) {
            if (e.message == "重複エラー") {
                console.error(e);
                setStatus(`登録エラー: 同じ材料が既に登録されています。`, "error");
                alert(`同じ材料が既に登録されています。`);
            } else {
                console.error(e);
                setStatus(`登録エラー: ${e.message || e}`, "error");
                alert(`${e.message || e}`);
            }
        } finally {
            btnAddOk.disabled = false;
            btnAddRow.disabled = false;
            btnDelete.disabled = useState.updateDeleteButtonState();
            btnRefresh.disabled = useState.updateRefreshButtonState();
        }
    }

    // ダイアログ内の表示をタブによって切り替える処理
    function chacgeDialogFields(tabName) {
        const isInsulation = tabName === "tabInsulation";

        fieldInsulation.style.display = isInsulation ? "block" : "none";
        fieldMetal.style.display = isInsulation ? "none" : "block";

        fieldInsulation.querySelectorAll("input, select").forEach((el) => {
            el.disabled = !isInsulation;
            el.required = isInsulation;
        });
        fieldMetal.querySelectorAll("input, select").forEach((el) => {
            el.disabled = isInsulation;
            el.required = !isInsulation;
        });
    }


    // 記号の選択肢を生成する関数
    function createSymbolOptions(tabName) {
        const select = document.querySelector("select[name='symbol']");
        if (!select) return;
        select.innerHTML = "";

        const selectSymbols = tabName === "tabInsulation" ? selectSymbols_materials : selectSymbols_materials_metal;
        selectSymbols.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });

    }

    // 表被仕様・色の選択肢を生成する関数
    function createCoatingOptions(tabName) {
        const selectName = tabName === "tabInsulation" ? "coating_type" : "color";
        const select = document.querySelector(`select[name='${selectName}']`);
        if (!select) return;
        select.innerHTML = "";

        const selectCoating = tabName === "tabInsulation" ? selectCoating_materials : selectColor_materials_metal;
        selectCoating.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });
    }


    // 記号選択に応じて、口径のラベルと単位を更新する関数
    function createDiameterTexts(symbol) {
        const diameterLabel = document.getElementById("diameterLabel");
        const diameterSuffix = document.getElementById("diameterSuffix");
        const texts = selectSymbols_materials.find(({ value }) => value === symbol);
        diameterLabel.textContent = texts.diameterLabel;
        diameterSuffix.textContent = texts.diameterSuffix;
    }



    /**イベントリスナーの設定*/

    // 記号選択の変更に応じて、口径のラベルと単位を更新
    selectSymbol.addEventListener("change", (ev) => {
        if (state.tabName === "tabInsulation") {
            createDiameterTexts(ev.target.value);
        }
    });

    // 数値入力欄の整形
    for (const input of numericInputs) {
        input.addEventListener("input", (ev) => {
            const next = helpers.normalizeIntegerText(ev.target.value);
            ev.target.value = next;
        });
    }

    // 英数字入力欄の整形
    for (const inputAlpha of alphanumericInputs) {
        inputAlpha.addEventListener("input", (ev) => {
            const next = helpers.normalizeAlphanumericText(ev.target.value);
            ev.target.value = next;
        });
    }

    // 登録ボタンのクリックイベント
    formAdd.addEventListener("submit", async (ev) => {
        console.log(state.tabName);
        ev.preventDefault();
        await addMaterials();
    });

    // キャンセルボタンのクリックイベント
    btnAddCancel.addEventListener("click", () => {
        closeAddDialog();
    });


    return { openAddDialog }


}