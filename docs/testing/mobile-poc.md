# スマホPoCの検証・結果記録（#58）

## 成果物

```sh
npm run test -- src/integration/mobileCompatibilityProbe.test.ts src/runtime/mobile-poc/ranking.test.ts
npm run test:mobile-poc
npm run verify
```

`test:mobile-poc`はビルド後の生成コードをjsdomで動かす。dist-mobile-poc/を公開MV3のdist/と混ぜない。probe.bookmarklet.txtは読み取り専用診断、ranking.bookmarklet.txt／ranking.user.jsはフルランキング実験。測定JSONと3ライセンス通知を含む同じビルドの一式を保持する。公開版・ストア提出物は変更しない。

PoCの独自条件は再読み込みで失われ、最新JSON自動取得も行わない。同じcommit・同じ同梱データ・同じ条件のPC版と比較する。

## 最初にiPhone Edgeで確認

1. 普段のEdgeで元ツールの個体値計算画面を開き、既存ボックスを確認する。OS／ブラウザ版、安定版かBetaか、iPhoneかiPadかを記録する。
2. メニューの拡張機能を探し、名称「個体値計算機 for ポケモンスリープ 拡張」とストアID `fajkddnhbedmajmmnljclpjnfjopanhl` を検索する。[現行掲載](https://microsoftedge.microsoft.com/addons/detail/fajkddnhbedmajmmnljclpjnfjopanhl)
3. 検索結果なし、追加不可、サイト許可不可、起動不可のどこで止まるかと表示理由を記録する。他の拡張が動くことだけで本拡張も動くとは判断しない。
4. 導入できれば現行拡張でタブ・計算・比較を確認する。導入経路がなければ診断へ進む。公開拡張とランキングPoCを同時起動しない。

flags／Betaだけで動く場合は実験経路として別記し、普段の安定版の対応とはしない。有料登録・アプリ購入は前提にしない。

## 診断bookmarklet

1. [診断bookmarkletのコピー用ファイル](mobile-probe.bookmarklet.txt)または生成したprobe.bookmarklet.txtの**全内容**をiPhoneに渡す。元ツールのブックマークを別名「ランキング診断 #58」で作り、URL欄を全内容に置き換える。ボックスを別サイトへ渡す必要はない。
2. 保存後の先頭が`javascript:`で、切り詰められていないことを確認する。ブラウザごとの編集・起動経路も記録する。
3. 元ツール表示中に診断ブックマークを起動する。アドレスバーへの貼り付けでは検索扱いやprefix除去の可能性があるため、ブックマーク経由で確認する。
4. alertのpage／root／upperTabs／storage.*を記録。missingは未保存、present-json-shapeは読み取り・JSON外形一致、invalid-json-shapeは不正／未対応、unavailableはアクセス不可。decoderや計算の互換性は保証しない。
5. 表示がなければ切り詰め・起動方法・JavaScript URL拒否・CSPを切り分ける。証拠がなければ原因未確定と記録する。従来のボックスが見えることも確認する。

診断は書き込み・通信・DOM変更を行わず、保存内容・個体名・query/hashを出力しない。

## フルランキング

診断後に方式ごとの導入経路を確認する。ranking.bookmarklet.txtは数百万文字で通常の登録が難しい可能性が高い。実機で切り詰めが確認された時点でその導入方法は不成立と記録する。外部scriptの短縮loaderには切り替えない。

userscriptは**同じブラウザ**にmanagerを導入できることを確認し、ranking.user.jsをローカルファイルとして追加する。Safari用managerをEdgeで使えるとは扱わない。実行world・サイト許可・CSPも記録する。別サイトに生成コードを貼っても元ツールのボックスは参照できない。

- ランキングタブが1つだけ追加され、元ツールへ戻れる。再実行で重複しない。
- 6目的の代表計算・手持ち比較・詳細表示を、同じデータのPC版と照合する。試験個体・条件は匿名データで記録する。
- 個体・ボックス・並び順の保存値が変わらない。共有条件の明示編集後に条件を取得し、古い結果と再計算案内を表示する。
- 縦横、タッチ、タブ到達、スクロール、キーボード表示中の操作を確認する。
- 重い計算の所要時間・応答性・進捗・中止・バックグラウンド復帰・再読み込みを確認する。
- ページ読込後のオフラインで同梱データの計算を確認。最新JSON取得は対象外。
- 試験用環境で対象外URL、未知DOM、不正JSON、保存拒否を確認する。普段のボックスを破損させない。
- 未処理例外・CSP違反を確認。診断とフルUIの成功は別々に記録する。

## 結果テンプレート

```text
確認日（日本時間）:
端末 / OS / ブラウザ / 版 / channel:
普段のブラウザ内の既存ボックスを利用できたか:
方式（WebExtension / bookmarklet / userscript）:
成果物commit / SHA-256 / 同梱データcommit:
導入・起動手順 / 許可設定:
診断結果:
フルUI / 計算 / 手持ち比較 / 条件編集:
PC比較条件と一致結果:
保存値の不変確認（実施した操作）:
縦横 / キーボード / 計算時間 / 中止 / 復帰:
不成立の場合の停止段階と具体的証拠:
未確認項目:
判定（成功 / 不成立 / 原因未確定 / 未実施）:
```

少なくとも1実機で成功または具体的な不成立理由が確認できるまで#58のPoC判定は未完了。未実施・推測は不成立の証拠ではない。

## 今回の記録

2026-10-03: `npm run verify`成功（Vitest 233件、ライセンス1件、生成PoC実行4件）。型検査・lint・ストア素材・公開MV3とPoCの両ビルドを確認。生成コードの試験でタブ追加・復帰・二重起動防止・保存値不変を確認したが、jsdomの結果でCSPやスマホ実機互換性は判断しない。

iPhone／Android／iPad実機結果は未取得。利用できるUI自動化はCodex内蔵ブラウザのみで、公開MV3のChrome／Edge unpacked受入は手動確認が残る。Projectでは#58を作業中、後続#63／#64／#65を未着手として同じProjectへの登録を確認済み。

初回測定（変更後は生成measurements.jsonが正）:

| 成果物 | JS bytes | gzip bytes | bookmarklet文字数 |
|---|---:|---:|---:|
| 診断 | 1,657 | 873 | 2,403 |
| フルランキング | 1,736,880 | 493,466 | 2,848,964 |

gzipは比較用で圧縮実行は含まない。サイズは登録導線の懸念を示すが、スマホ固有の上限を実証したものではない。
