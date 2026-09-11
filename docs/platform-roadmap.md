# Safari／Android将来対応

Safari Web Extensionではdomain、features、integrationの純粋部分、UIを共有し、設定とruntimeをWebExtensions互換層へ差し替えます。Xcodeプロジェクト、署名、App Store配布はPC Chromium版安定後に行います。

Androidは機能限定ブックマークレットを候補とします。同期保存や重いランキング、権限が必要な機能は対象外にし、自己完結コード、CSP、URL長、更新導線を評価します。現段階では実装しません。
