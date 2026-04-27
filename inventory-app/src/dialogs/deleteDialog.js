import { helpers } from "../utils/helpers.js";
import { state, useState } from "../utils/state.js";
import { createSelectedDate, deleteMaterialsByIds } from "../services/materialService.js"

export function initDeleteDialog({
    dialogDelete,
    deleteListBody,
    deleteSummary,
    formDelete,
    btnDeleteOk,
    btnDeleteCancel,
    btnAddRow,
    btnDelete,
    btnRefresh,
    setStatus,
    fetchMaterials,
}) {

    /** 削除ダイアログ関連 */

    // ダイアログを開く関数
    function openDeleteDialog() {
        if (!dialogDelete || !deleteListBody) return;
        if (!state.checkedIds.length) return;

        // const selected = state.allRows.filter((r) => state.checkedIds.includes(helpers.toId(r.id)));
        const selected = createSelectedDate(state.allRows, state.checkedIds);
        deleteListBody.innerHTML = "";

        if (deleteSummary) deleteSummary.textContent = `${selected.length}件を削除します。よろしいですか？`;

        for (const row of selected) {
            const tr = document.createElement("tr");
            const tdMat = document.createElement("td");
            tdMat.textContent = helpers.formatMaterialText(row);
            const tdQty = document.createElement("td");
            tdQty.className = "num";
            const pending = useState.getQuantityChange(row.id);
            tdQty.textContent = pending
                ? String(pending.quantity)
                : row.quantity == null
                    ? ""
                    : String(row.quantity);
            tr.appendChild(tdMat);
            tr.appendChild(tdQty);
            deleteListBody.appendChild(tr);
        }

        dialogDelete.showModal();
    }

    // ダイアログを閉じる関数
    function closeDeleteDialog() {
        if (!dialogDelete) return;
        dialogDelete.close();
    }

    // 削除処理を行う関数
    async function deleteMaterials(ids) {
        setStatus("削除中...");
        if (btnDeleteOk) btnDeleteOk.disabled = true;
        if (btnDeleteCancel) btnDeleteCancel.disabled = true;
        if (btnDelete) btnDelete.disabled = true;
        if (btnAddRow) btnAddRow.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;

        try {
            await deleteMaterialsByIds(ids);
            state.checkedIds = [];
            closeDeleteDialog();
            await fetchMaterials();
        } catch (e) {
            console.error(e);
            setStatus(`削除エラー: ${e.message || e}`, "error");
        } finally {
            if (btnDeleteOk) btnDeleteOk.disabled = false;
            if (btnDeleteCancel) btnDeleteCancel.disabled = false;
            btnDelete.disabled = useState.updateDeleteButtonState();
            if (btnAddRow) btnAddRow.disabled = false;
            btnRefresh.disabled = useState.updateRefreshButtonState();
        }
    }

    /**イベントリスナーの設定*/

    // 削除フォームの送信イベント
    if (formDelete) {
        formDelete.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            if (!state.checkedIds.length) return;
            await deleteMaterials([...state.checkedIds]);
        });
    }

    // キャンセルボタンのクリックイベント
    if (btnDeleteCancel) {
        btnDeleteCancel.addEventListener("click", () => {
            closeDeleteDialog();
        });
    }

    return { openDeleteDialog, };

}