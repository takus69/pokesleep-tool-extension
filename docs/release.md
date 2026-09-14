# ストア公開・リリース手順

1. `develop`でCHANGELOG、`package.json`とmanifestのversion、対応上流版、ライセンス通知を更新。
2. 元ツールの検証対象checkoutを用意し、`POKESLEEP_TOOL_SOURCE` を指定して `npm run release:prepare` を実行。
3. Chrome／Edgeの最新安定版で手動受入試験。
4. `dist/` のmanifestと内容を確認し、外部コードがないことを確認。
5. 再現可能なZIP、ストア説明、画像、プライバシー回答を作成。
6. Chrome Web Storeへ提出後、同一ソースからEdge Add-onsへ提出。
7. Chrome／Edgeの受入完了後、`develop`から`main`へのリリースPRを作成。
8. マージされた`main`の同一コミットへ注釈付き`vX.Y.Z`タグとGitHub Releaseを作成し、同一成果物を両ストアへ提出。
9. 審査結果と既知問題を記録。

日次および手動実行の `Sync upstream data` workflowは元ツールをcheckoutし、JSON同期、型検査、lint、テスト、ビルドを通過した変更だけを`develop`へのPRにします。PRではデータmanifestのcommit、除外された未知仕様、ランキング回帰結果を確認します。計算コードの同期とストア公開は自動化対象外で、レビュー後に行います。

署名鍵、ストア資格情報、公開操作は管理者が行います。既存の公開物を廃止する場合は、安定版公開と移行確認の完了後に別途判断します。
