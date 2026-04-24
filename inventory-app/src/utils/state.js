import { helpers } from "./helpers.js";

/**状態変数 */
export const state = {
  allRows: [],
  sortStateBySymbol: {},
  checkedIds: [],
  quantityChanges: [],
  isCollapsedBySymbol: {},
};

/**状態を操作する関数 */

  //選択された行かどうかを判定する
  function isChecked(id) {
    const sid = helpers.toId(id);
    return !!sid && state.checkedIds.includes(sid);
  }

  //選択された行を追加する
  function setChecked(id, nextChecked) {
    const sid = helpers.toId(id);
    if (!sid) return;
    if (nextChecked) {
      if (!state.checkedIds.includes(sid)) state.checkedIds = [...state.checkedIds, sid];
    } else {
      state.checkedIds = state.checkedIds.filter((x) => x !== sid);
    }
  }

  //削除ボタンの活性非活を切り替える
  function updateDeleteButtonState() {
    return state.checkedIds.length === 0;
  }

  //更新ボタンの活性非活を切り替える
  function updateRefreshButtonState() {
    return state.quantityChanges.length === 0;
  }

  //idが一致するquantityChangesを取得する
  function getQuantityChange(id) {
    const sid = helpers.toId(id);
    if (!sid) return null;
    return state.quantityChanges.find((x) => x.id === sid) || null;
  }

  //quantityChangesに新数量をセットする
  function setQuantityChange(id, quantity) {
    const sid = helpers.toId(id);
    if (!sid) return;
    state.quantityChanges = state.quantityChanges.filter((x) => x.id !== sid);
    if (quantity == null) {
      return updateRefreshButtonState();
    }
    state.quantityChanges = [...state.quantityChanges, { id: sid, quantity: Number(quantity) }];
    return updateRefreshButtonState();
  }

  //quantityChangesをクリアする
  function clearQuantityChanges() {
    state.quantityChanges = [];
    return updateRefreshButtonState();
  }


/**関数をexport(他ファイルから使用できるようにする) */
export const useState = {
  isChecked,
  setChecked,
  updateDeleteButtonState,
  updateRefreshButtonState,
  getQuantityChange,
  setQuantityChange,
  clearQuantityChanges
}

