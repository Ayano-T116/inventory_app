# 在庫管理アプリ

HTML / CSS / JavaScript で作った、シンプルな在庫管理画面です。  
Supabase の `materials` テーブルにデータを格納します。


## できること

**一覧取得・表示**
- 記号ごとに在庫をグループ表示
- グループの表示／非表示の切り替え
- カラムクリックでソート
**新規登録** 
- ダイアログ入力 → SupabaseへINSERT → 再描画
**数量変更** 
- 数量編集 → 確認ダイアログ → UPDATE → 再描画
**行削除** 
- チェック選択 → 確認ダイアログ → DELETE → 再描画


## ファイル構成

├──`index.html` HTML構造
├──src/
│   ├── `style.css` スタイル定義（全体レイアウト・デザイン）
│   ├── `main.js` UI操作（取得・描画）
│   ├── `db.js` データベース操作（直接のDB操作）
│   ├── `supabase.js` Supabase接続設定（デモ環境）
│   ├── services/
│   │   └── `materialService.js` ロジック（データ処理の仲介）
│   ├── dialogs/
│   │   ├── `addDialog.js` UI操作（新規登録ダイアログ制御）
│   │   ├── `deleteDialog.js` UI操作（削除ダイアログ制御）
│   │   └── `quantityDialog.js` UI操作（数量変更ダイアログ制御）
│   ├── utils/
│   │   ├── `constants.js` 定数定義（設定値・固定データ）
│   │   ├── `helpers.js` 汎用関数（共通処理）
│   │   └── `state.js` 状態管理（アプリの状態保持）



## テーブル定義

**Materials**
カラム名（日本語）	カラム名（英語）	型	必須
id	id	uuid	○
記号	symbol	text	○
口径	diameter	integer	○
厚み	thickness	integer	○
表被仕様	coating_type	text	○(""OK)
数量	quantity	integer	○
メモ	memo	text	
更新日	updated_at	timestamp	○

※primary keyはid
※symbol, diameter, thickness, coating_type の組み合わせで一意制約を設定（重複防止）
※updated_atは登録時または更新時に自動入力



## 使用環境

- `Vercel` フロントエンドのデプロイを簡易化
- `supabase` バックエンド不要でDB/APIを構築し、開発効率を向上
- `GitHub` コード管理、バージョン管理
- `VisualStudioCode` エディター
- `Copilot` コーディング補助


## 工夫した点

**1）役割ごとに分離したモジュール設計**
- UI、ロジック、データ操作を分離
- ダイアログ単位でモジュール分割
- 再利用性も考慮し共通関数を分離

**2）直感的な操作ができるようにすること**
- ExcelのようなUIを作成
- シンプルな操作
- ボタンの活性非活性の切り替えを設定
- 全ての入力欄で入力方法を指定(選択肢、数字のみ)
- 過不足のない表示（口径/密度の表示切り替え、更新時間の非表示）
