
export const TABLE = "materials";
export const TABLE_METAL = "materials_metal";

export const ENV = import.meta.env.VITE_ENV || "";

export const prodMessage = "大正断熱専用です。部外者は触るんじゃねぇ。";
export const devMessage = "デモバージョンです。ご自由に操作ください。";

export const COLUMNS_materials = [
  { label: "口径", key: "diameter", width: "15%" },
  { label: "厚み", key: "thickness", width: "15%" },
  { label: "表被仕様", key: "coating_type", width: "20%" },
  { label: "数量", key: "quantity", align: "num", width: "15%" },
  { label: "更新日", key: "updated_at", width: "25%" },
];

export const selectSymbols_materials = [
  { value: "", label: "選択してください", diameterLabel: "口径", diameterSuffix: "A" },
  { value: "GW", label: "GW", diameterLabel: "口径", diameterSuffix: "A" },
  { value: "RW", label: "RW", diameterLabel: "口径", diameterSuffix: "A" },
  { value: "スチロール", label: "スチロール", diameterLabel: "口径", diameterSuffix: "A" },
  { value: "GWロール", label: "GWロール", diameterLabel: "密度", diameterSuffix: "k" },
  { value: "RWロール", label: "RWロール", diameterLabel: "密度", diameterSuffix: "k" },
];

export const selectCoating_materials = [
  { value: "", label: "選択してください"},
  { value: "ALK", label: "ALK"},
  { value: "ALKP", label: "ALKP"},
  { value: "ALGC", label: "ALGC"},
  { value: "ALGCP", label: "ALGCP"},
];

export const duplicateKeys_materials = [
  "symbol","diameter", "thickness", "coating_type",
];

export const COLUMNS_materials_metal = [
  { label: "番手", key: "gauge", width: "15%" },
  { label: "色", key: "color", width: "30%" },
  { label: "数量", key: "quantity", align: "num", width: "15%" },
  { label: "更新日", key: "updated_at", width: "30%" },
];

export const selectSymbols_materials_metal = [
  { value: "J", label: "J"},
  { value: "L", label: "L"},
  { value: "L 45°", label: "L 45°"},
];

export const selectColor_materials_metal = [
  { value: "シルバー", label: "シルバー"},
  { value: "ガルバ", label: "ガルバ"},
  { value: "ニュークリーム", label: "ニュークリーム"},
];

export const duplicateKeys_materials_metal = [
  "symbol","gauge", "color",
];