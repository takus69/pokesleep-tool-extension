# スマホ対応の実現性と優先順位（#58）

## 目的・判断基準

普段使うブラウザで公式元ツールを開き、**そのブラウザの保存済みボックス・共通計算条件をそのまま利用する**。別サイトへの移動、ブラウザ変更、PCとの同期を前提にしない。新しいブラウザの利用は、現在のEdge利用者には代替案として扱う。

判定は①同一ブラウザ・対象ページの保存値を利用できる、②一般利用者の導入経路がある、③他環境へ展開できる、④実装・維持負担が小さい、の順。同等なら手元のiPhoneで検証できる方式を先行させる。拡張メニュー、自作拡張の導入、ランキングの正常動作は別々に確認する。

資料確認日: **2026-10-03（日本時間）**。下表は資料に基づく暫定判断で、スマホ実機確認済みの行はまだない。iPhoneとiPad、安定版とBeta／実験機能は別記する。古い資料だけで現行版の非対応を断定しない。

## OS・ブラウザ別の比較

難易度は現行コードからの相対評価（低: 起動確認中心、中: runtime／manifest調整、高: パッケージ化・サイズ等の制約）。全行で必要API・計算・保存契約の実機確認が残る。

| OS × ブラウザ | 対応可否・確度 | 導入・同じブラウザの保存値 | 難易度・展開性 | 配布・更新 |
|---|---|---|---|---|
| iOS/iPadOS Edge | **制約未確定・最優先**。公式モバイル案内とiOS掲載は拡張に言及。[M1][M2] | メニューから既存ストア版を検索・追加。任意拡張の受付範囲、content script／storage／messaging／backgroundは未確認 | 導入できれば低〜中。Android Edgeと資産共有の可能性 | 既存ストアの導入・更新を検証。Apple Developer登録が必要とは判断しない |
| iOS/iPadOS Chrome | MV3直接導入経路を確認できない。電話からの追加はPCへの追加。[G1] | 同じページのbookmarklet候補。起動・URL長は未確認 | 診断は低、フルランキングは高。ページruntime共有 | 手動登録・差し替え。外部script loaderは採用しない |
| iOS/iPadOS Safari | **WebExtension方式あり・資料確認のみ**。[A1][A2] | アプリ同梱拡張を有効化し、対象サイトを許可。保存値参照はPoC確認 | 中。UI／domain／integration共有、manifest／runtime確認 | App Store／TestFlight経由はDeveloper Program登録が必要。公式Web packagerはMac不要。署名・審査・更新が必要 |
| iOS/iPadOS Firefox | Mozillaはdesktop／Android用拡張が利用できないと明示。資料更新は古い。[F1] | bookmarklet候補。現行版の実行経路は未確認 | フルランキングは高。ページruntime共有 | 手動更新。managerの存在を前提にしない |
| iOS/iPadOS Brave | 自作WebExtensionの公式導入経路は未確認 | bookmarklet候補。現行版で確認が必要 | フルランキングは高。ページruntime共有 | desktop互換をiOSへ当てはめない。手動更新 |
| iOS/iPadOS Orion | Chrome／Firefox拡張導入を公式案内。beta・API制限あり。[O1] | 設定で許可しストア／ファイルから追加。Orion内の保存値で確認 | 中〜高。bundle共有、MV3 API等は個別確認 | 更新機構を確認。Edgeから移る場合はボックス移行が別途必要 |
| Android Edge | モバイル案内・ストアのモバイル分類あり。任意拡張の導入範囲は未確認。[M1][M3] | 安定版で既存ストア版を検索・追加 | 低〜中の候補。PC版共有範囲が大きい可能性 | ストア更新を確認。flags／ID手動導入は実験扱い |
| Android Chrome | 公式ヘルプに電話上で実行する拡張導入経路なし。[G1] | 同じページのbookmarklet候補。起動・URL長は未確認 | フルランキングは高。iOS向けページruntime共有 | 手動登録・更新 |
| Android Firefox | **WebExtension導入方式あり・資料確認のみ**。[F2] | 拡張管理／AMOから導入。対象ページの保存値で確認 | 中。domain／UI共有、background／API差を確認。[F3] | AMO向け識別子・署名・掲載・更新を用意 |
| Android Samsung Internet | Add-ons／content blocker資料は任意MV3注入の根拠にならない。[S1] | bookmarklet候補。独自方式はAPI・申請経路の確認後に再評価 | フルランキングは高。ページruntime共有 | content blockerだけではランキングを提供できない。手動更新を検証 |
| Android Brave | 自作拡張の安定版導入経路は未確認 | bookmarklet候補。公式資料・現行版で再評価 | フルランキングは高。ページruntime共有 | desktop対応・開発中の機能を一般対応と扱わない |

## 方式ごとの機能・負担

| 方式 | 保存値・対応機能 | 導入、権限、費用 | 更新・展開性 |
|---|---|---|---|
| WebExtension | 対象ページを読めれば既存ランキングを共有。最新JSON更新・永続設定はAPI確認が必要 | 対象サイトと非実行JSON取得先のみ。ストア登録・審査条件を確認 | 自動起動・ストア更新が有力。共通bundle＋manifest／runtime差し替え |
| 自己完結bookmarklet | ページ内実行ができれば保存値参照可能。診断とフルUIは成立条件が異なる | ブックマークURL編集・手動起動。CSP・URL長・JavaScript URL拒否を確認。Apple Developer登録不要 | OSをまたぐ共通化が大きいが手動更新。フルbundleの長さが制約 |
| 自己完結userscript | managerが同じページで実行できればフルUI共有。PoCはgrant none・同梱データ・一時条件 | manager自体が普段のブラウザへ導入できることが前提。Safariには既存Userscripts方式あり。[U1] | managerのworld・許可・更新を確認。今回のPoCは手動差し替え |
| 別サイト／PWA | 他originの元ツールlocalStorageを直接読めず、主方式に不適合 | import/exportや別の共有設計が必要 | 共通配布しやすいが「そのままボックス利用」を満たさない |

既存のSafari用managerを利用するだけなら、このリポジトリの開発者のApple Developer登録は前提にならない。自分のSafari拡張を配布する方式とは区別する。Edge／Chromeにもmanagerがあるとは推測しない。

## 暫定優先順位

1. **iPhone Edgeの現行拡張導入**: 手元のブラウザとボックスを使える。既存ストアID、追加結果、サイト許可、起動を確認する。
2. **iPhone Edgeの小さな診断bookmarklet**: 拡張導入ができない場合、手動起動・DOM・保存値参照を確認する。診断成功だけでフルUI成立としない。
3. **ページruntimeの展開評価**: ブラウザごとのURL長とフルbundleを比較。難しい場合は同じブラウザのmanager経路、機能限定案を評価する。Safari既存managerも比較する。
4. **Android Edge／Firefox**: 資料上有望。Android実機確保後に確認し、iPhoneだけでAndroid対応済みとはしない。
5. **Safari独自拡張**: 導入・更新経路が明確だが、登録・署名・審査が加わるため正式配布は後続。
6. **Orion**: Orion利用者向けの候補。現在のEdgeのボックス利用への代替として先行させない。

導入不可・API不足・CSP拒否が判明したら順位を更新する。ブラウザ変更や機能限定を黙って採用しない。

## PoCと現在の判断

[PoC設計](design/mobile-poc.md)と[実機検証・結果記録](testing/mobile-poc.md)を参照。

`npm run build:mobile-poc`は公開MV3とは別に、Chrome APIなしの診断とフルランキングを自己完結IIFEとして生成する。domain・上流decoder・DOM controller・UIは再利用。同梱データのみで、独自条件はメモリ保持とする。個体・ボックス・並び順は変更せず、共有条件の明示編集だけ元ツールへ委譲する。

フルbookmarkletはビルド測定で数百万文字となり、通常の登録導線には重大な制約がある。正確な値は生成measurements.jsonを正とする。サイズだけでiPhone固有の実行不可とは断定しない。

スマホ実機結果は未取得。#58の「少なくとも1環境でPoC可否判断」は未達で、IssueはOpen／Projectは作業中を維持する。既存FeatureModule・RankingScenarioStorage・UpstreamDataPackRuntimeの別起動口に限定し、公開API／上流schema／固定submoduleは変更しない。SettingsStoreのモデルも正式対応時に共有する。

## 後続作業

- [#63: モバイルWebExtensionの導入経路とAPI互換性を検証する](https://github.com/takus69/pokesleep-tool-extension/issues/63)
- [#64: スマホの同一ページ手動実行方式とランキングのサイズ制約を検証する](https://github.com/takus69/pokesleep-tool-extension/issues/64)
- [#65: スマホのランキングUIと計算性能の共通受入を整える](https://github.com/takus69/pokesleep-tool-extension/issues/65)

本実装方式・対象版はPoC受入後に確定する。Safari独自配布・Firefox正式配布は採用決定後に個別Issue化する。

## 根拠（2026-10-03確認）

- [M1: モバイルEdge公式案内](https://www.microsoft.com/en-us/edge/mobile): OSによって対応拡張が異なる。
- [M2: Microsoft提供のiOS Edge掲載](https://apps.apple.com/us/app/microsoft-edge/id1288723196): 拡張に言及。任意拡張の受付条件は判断できない。
- [M3: Edge Add-ons](https://microsoftedge.microsoft.com/addons/microsoft-edge-extensions): モバイル分類は個々のOSでの導入保証ではない。
- [M4: モバイルEdge Betaリリースノート](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-mobile-beta-channel): iOS拡張項目修正と管理ポリシーに言及。企業管理経路を一般導入と扱わない。
- [G1: Chrome拡張導入](https://support.google.com/chrome/answer/2664769?hl=en): 電話からの追加はdesktop向け。
- [A1: Safari拡張公式案内](https://developer.apple.com/safari/extensions/): 配布・packager。
- [A2: App Store ConnectによるSafariパッケージ化](https://developer.apple.com/documentation/safariservices/packaging-and-distributing-safari-web-extensions-with-app-store-connect): Mac不要の経路とDeveloper Program登録要件。
- [F1: Firefox for iOS拡張](https://support.mozilla.org/en-US/kb/add-ons-firefox-ios): desktop／Androidとは区別。古い資料のため現行版確認も残す。
- [F2: Firefox for Android導入](https://support.mozilla.org/en-US/kb/find-and-install-add-ons-firefox-android): AMO／拡張管理。
- [F3: Mozilla background仕様](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background): ChromiumとFirefoxのbackground差。
- [O1: Orion iOS/iPadOS拡張](https://help.kagi.com/orion/browser-extensions/ios-ipados-extensions.html): ストア／ファイル導入、beta・API制限。
- [S1: Samsung content blocker開発仕様](https://developer.samsung.com/browser/android/adblockers-guide.html): フィルターを提供するアプリの方式。
- [U1: Userscripts公式リポジトリ](https://github.com/quoid/userscripts): Safari用manager。Safari独自拡張配布とは別方式。
