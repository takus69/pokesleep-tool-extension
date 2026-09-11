# テスト手順

- 狭い単体テスト: `npm run test -- src/integration/upstreamAdapter.test.ts`
- 型検査: `npm run typecheck`
- lint/format検査: `npm run lint`
- 本番ビルド: `npm run build`
- 全体: `npm run verify`

ローカル導入後、対象ページで「接続済み」表示、対象外URLで非起動、破損した検証対象保存値で安全停止、コンソールに予期しない例外がないことを確認します。ランキング移植後はforkとのfixture同値、キャンセル、古い結果の競合、上流保存値非変更も検証します。
