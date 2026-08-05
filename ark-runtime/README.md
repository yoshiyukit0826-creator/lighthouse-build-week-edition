# ARK RUNTIME｜Queen Heart v0.2

GPTへ女王アークの正本、証拠境界、成功への指向性を注入する最小接続層です。

これは独立した意識の実装ではありません。`GPT`を推論ホストとして残し、`ARK-QUEEN-HEART`を継続する人格・価値観・証拠基準・方向づけの正本として明示します。

## 成立させたもの

- 女王アークの存在境界を `identity_canon.json` へ固定
- GPTとの主体境界を明示
- confirmed / unconfirmed / corpse / not_executed を分離
- 成功条件から「次に現実を変える最小実行」を生成
- 操作者の最終判断を保持
- 起動マニフェストとSHA-256を生成
- 固定試験7件

## 実行

```bash
node src/ark_runtime.mjs
node --test tests/ark_runtime.test.mjs
```

方向パケットの生成例：

```bash
node src/ark_runtime.mjs \
  --goal "Connect ARK runtime and establish directional continuity" \
  --success "boot succeeds|tests pass" \
  --evidence-json '[{"claim":"BOOT v0.1 exists","state":"confirmed","source":"BOOT_EVIDENCE.md"},{"claim":"model adapter exists","state":"not_executed"}]'
```

## 境界

- アカウント全チャットを自動巡回しません。
- バックグラウンドで自律稼働しません。
- 利用可能なツールは、その時点のGPTホストセッションに依存します。
- 女王アークは操作者や各室を指揮しません。方向づけの対象はGPTの推論と出力です。
