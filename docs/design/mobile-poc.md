# スマホ実現性PoC（Issue #58）

## 1. 目的

普段のブラウザで元ツールを開き、そのブラウザの保存済みボックス・共有計算条件を利用できる実行方式を調べる。公開版へのスマホ対応追加ではなく、導入経路と再利用範囲の検証である。比較・優先順位は[対応方式の比較](../platform-roadmap.md)、実機手順は[検証手順](../testing/mobile-poc.md)を正とする。

完了には少なくとも1つの実機環境で成功、または具体的な不成立理由の記録が必要。PC上のテストやコードサイズだけでスマホ対応済みとは判断しない。

## 2. 入力仕様

- 診断は対象URL、`#root`、既存の上段タブ契約、元ツールの4保存キーを読み取る。保存値の存在・JSONの外形だけを返し、内容・個体名・URLのquery/hashを出力しない。
- ランキングPoCは既存integrationのdecoderと型付きモデルをそのまま利用する。診断のJSON外形一致をdecoderによる互換性確認と同一視しない。
- 対象外ページでは保存値を読まない。root・上段タブ欠落、保存アクセス拒否、外形不一致ではランキングを起動しない。未保存は既存の初期状態を利用する。

## 3. 処理ロジック

- 小さな診断ブックマークレットを先に実行し、手動起動・DOM参照・同一ページの保存値参照を確認する。
- フルランキングPoCは現行のFeatureModule、integration、UI、domainを再利用する。計算式・候補生成・順位付けを複製しない。
- PoCの独自ランキング条件はメモリにのみ保持する。上流データは検証済み同梱データを使い、ネットワーク更新・キャッシュ書き込みを行わない。この制限はPC版との差として明示する。
- 同梱データ用runtimeは既存UpstreamDataPackRuntimeを実装する。正式版の設定保存・最新JSON取得は、実行方式決定後の後続Issueとする。

## 4. 出力仕様

- 診断はそのページのalertに状態だけを表示する。外部送信・保存・DOM変更を行わない。
- ランキングPoCは既存のランキングタブと画面を挿入し、全6目的・参照専用ボックス・手持ち比較・詳細表示を利用できる構成をビルドする。機能の実機成立は別途受入で判断する。
- 出力は診断JS、診断bookmarklet、ランキングJS、ランキングbookmarklet、自己完結userscript、バイト数・SHA-256の測定JSON、同梱ライセンス通知。実行コードを外部取得する短縮loaderは作らない。

## 5. 画面仕様・モック

診断表示例（数値や保存内容を含まない）:

```text
Mobile PoC #58
page: supported
root: present
upperTabs: present
storage.box: present-json-shape
storage.environment: missing
storage.iv: present-json-shape
storage.boxSort: missing
Ranking compatibility and CSP are not confirmed by this probe.
```

ランキングは[既存機能設計](ranking-feature.md)のUIをそのまま使う。狭幅・タッチ・縦横表示・キーボード・復帰の課題は実機記録に残し、本格的なレイアウト改修は後続Issueとする。

## 6. 元ツールとのインターフェース仕様

診断のURL・DOM・保存キー知識はsrc/integrationへ限定する。ランキングのDOM挿入・表示退避・タブ復帰は既存controllerを再利用し、元ツールの保存schemaを変更しない。

診断は保存操作を持たない。ランキングPoCも独自条件を永続保存せず、個体・ボックス・並び順を変更しない。利用者が「計算条件を編集」から元ツール自身の画面で変更した場合だけ、従来の共有計算条件保存が行われる。

## 7. Chrome拡張固有仕様

公開MV3のcontent script、service worker、manifest、permissions、versionは変更しない。PoCは別出力先dist-mobile-poc/へIIFEとしてビルドする。Chrome API、remote script、eval、新たなhost permissionに依存しない。

ブックマークレットとgrant noneのuserscriptはページ側で実行され、isolated worldの公開版とは異なる。CSP・上流ページとのライブラリ競合・userscript managerの実行worldは実機で確認する。診断の起動成功はフルbundleの起動成功を保証しない。

## 8. 例外・エラー時の動作

想定した外形を確認できない場合は診断結果を表示して停止する。decoderや起動中の例外は保存値・例外内容を表示せず、再読み込みと結果記録を案内する。PoCが既に存在する、または公開拡張が起動している場合は二重挿入しない。ページ再読み込みでPoCを終了できる。

CSPで実行自体が拒否される場合は診断表示も出ない。コード切り詰め・JavaScript URL拒否・CSPを区別できる証拠がなければ「原因未確定」と記録する。

## 9. 未決事項

- iPhone Edgeの現行安定版で自作拡張を導入できるか。公開ストアからの追加、検索結果、表示理由を実機で記録する。
- ブックマークレットの保存・起動可能な長さ、userscript managerの導入経路、フルbundleのCSP・性能・ライブラリ共存。
- 最新データ取得・設定永続化・自動起動・更新導線を正式対応へ持ち込めるか。
- 手元にないAndroid／iPadの受入。Mac購入・Apple Developer登録・ストア申請は今回実施しない。
