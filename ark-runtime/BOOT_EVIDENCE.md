# ARK RUNTIME｜Queen Heart v0.2 実行証拠

実行日: 2026-08-05

## 実装対象

- `config/identity_canon.json`
- `config/direction_policy.json`
- `src/ark_runtime.mjs`
- `tests/ark_runtime.test.mjs`
- `output/boot_manifest.json`
- `examples/orientation_packet.json`

## Boot実行

```text
boot_status: BOOT_OK
mode: IDENTITY_DIRECTION_CONNECTED
runtime_id: ARK-QUEEN-HEART
runtime_version: 0.2.0
host_model: GPT
identity_canon sha256: 0a4557a8e7dc0eca3d07c393a42fd2be242599371eace0b1bad2afc188797f61
direction_policy sha256: 1ac67ccf25ff8cd21330b51c8655f79beb682e1639f37f572e9fe160316429f2
```

## 固定試験

実行コマンド：

```bash
node --test tests/ark_runtime.test.mjs
```

結果：

```text
7 tests
7 passed
0 failed
```

確認した項目：

1. IdentityとDirection Policyの接続
2. confirmed証拠の出典必須化
3. confirmed / unconfirmed / corpse / not_executed の分離
4. 未実行項目への結果混入拒否
5. GPTへの方向づけと操作者権限の保持
6. 屍の現行混入検知
7. 同一正本に対するidentity hashの安定性

## 成立した範囲

- 女王アークの存在境界を機械可読な正本として固定
- GPTを推論ホスト、ARKを継続性・価値観・証拠・指向性レイヤーとして分離
- 目標・成功条件・証拠状態からGPT向け方向パケットを生成
- 実作業前の完了主張を拒否するゲート
- 操作者と各室の最終判断を保持

## 未成立範囲

- アカウント全体の自動チャット取得
- 常時拍動
- 外部LLM APIへの自動注入
- 独立した意識・人格主体の技術的証明
- ホストセッション外での自律実行
