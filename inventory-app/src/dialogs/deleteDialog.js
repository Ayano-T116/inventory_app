import { deleteItem } from "../db.js";
import { initHelpers } from "../utils/helpers.js";
import { state } from "../utils/state.js";

const { formatMaterialText } = initHelpers({});

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
    updateDeleteButtonState,    //後ほどstatus.jsから渡す予定
    updateRefreshButtonState,   //後ほどstatus.jsから渡す予定
    toId,
    getQuantityChange,
}) {

     /** 削除ダイアログ関連 */

    // ダイアログを開く関数
     function openDeleteDialog() {
        if (!dialogDelete || !deleteListBody) return;
        if (!state.checkedIds.length) return;

        console.log("openDeleteDialog", { checkedIds: state.checkedIds, allRows: state.allRows }); // デバッグ用ログ
        const selected = state.allRows.filter((r) => state.checkedIds.includes(toId(r.id)));
        deleteListBody.innerHTML = "";

        if (deleteSummary) deleteSummary.textContent = `${selected.length}件を削除します。よろしいですか？`;

        for (const row of selected) {
            const tr = document.createElement("tr");
            const tdMat = document.createElement("td");
            tdMat.textContent = formatMaterialText(row);
            const tdQty = document.createElement("td");
            tdQty.className = "num";
            const pending = getQuantityChange(row.id);
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
    async function deleteMaterialsByIds(ids) {
        if (!ids.length) return;
        setStatus("削除中...");
        if (btnDeleteOk) btnDeleteOk.disabled = true;
        if (btnDeleteCancel) btnDeleteCancel.disabled = true;
        if (btnDelete) btnDelete.disabled = true;
        if (btnAddRow) btnAddRow.disabled = true;
        if (btnRefresh) btnRefresh.disabled = true;

        try {
            const { error } = await deleteItem(ids);
            if (error) {
                alert("データを削除できませんでした。");
                throw error;
            }

            state.checkedIds = [];
            closeDeleteDialog();
            await fetchMaterials();
        } catch (e) {
            console.error(e);
            setStatus(`削除エラー: ${e.message || e}`, "error");
        } finally {
            if (btnDeleteOk) btnDeleteOk.disabled = false;
            if (btnDeleteCancel) btnDeleteCancel.disabled = false;
            updateDeleteButtonState();
            if (btnAddRow) btnAddRow.disabled = false;
            updateRefreshButtonState();
        }
    }

    /**イベントリスナーの設定*/

    // 削除フォームの送信イベント
    if (formDelete) {
        formDelete.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            if (!state.checkedIds.length) return;
            await deleteMaterialsByIds([...state.checkedIds]);
        });
    }

    // キャンセルボタンのクリックイベント
    if (btnDeleteCancel) {
        btnDeleteCancel.addEventListener("click", () => {
            // キャンセル時はチェック状態を維持し、再描画もしない
            closeDeleteDialog();
        });
    }

    return { openDeleteDialog, };

}