# 元ツール連携仕様

対象originは `https://nitoyon.github.io`、対象pathは `/pokesleep-tool/` 配下です。初期プローブは `#root` の存在と、存在する場合のみ `PstIvState` がJSON objectかを確認します。保存値は変更しません。

候補比較:

| 方法 | 変更耐性 | リスク | 方針 |
|---|---:|---|---|
| 表示DOMの解析 | 低 | 文言・MUI構造変更で破損 | 最小の存在確認だけ |
| localStorageの検証付きdecode | 中 | 非公開スキーマ変更 | 利用者入力の取得候補 |
| page worldへの注入 | 低 | 内部React/CSP/MV3へ密結合 | 原則不採用 |
| 必要な静的データ・計算を同梱 | 高 | データ更新が必要 | ランキングの中心 |

adapterの返却値は共通型または型付きエラーです。不明な値、欠落、破損、未対応版ではfail closedし、計算を開始しません。将来decoderにはスキーマ版、範囲検査、fixture、移行処理を追加します。
