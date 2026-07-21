# Lighthouse — Build Week Edition README 日本語確認版

> **使う人と共に育つナビゲーションシステム。**

このファイルは、英語版READMEの内容を確認するための日本語版です。提出用の主文は英語版を使用します。

**公開デモ:** https://lighthouse-build-week.yoshiyuki-t-0826.chatgpt.site  
**ソースリポジトリ:** https://github.com/yoshiyukit0826-creator/lighthouse-build-week-edition

---

## Lighthouseとは

Lighthouseは、残務、段取り不足、突発事案、余力不足が重なり、次の判断が難しくなる場面のための本人用レスポンシブHUDです。

人を管理せず、一つの正解を命令しません。現在地を映し、直近行動の軌跡を残し、次に進める複数の航路を照らします。最終判断は本人に残します。

---

## なぜ必要なのか

負荷が高まると、人は次の情報を一度に頭の中へ抱えがちです。

- 何が残っているか
- 何の準備が終わっているか
- 何が突発的に変わる可能性があるか
- 実際にどれくらい余力が残っているか
- このまま進むか、迂回するか、決定を保留するか

Lighthouseは、現在能力、未来資産、航行環境、軌跡を共通の視覚言語へ変換します。判断の代行ではなく、判断前の視界を戻すことが目的です。

---

## 基本ナビモデル

### Morning Check：R / S / Y

- **R（残務）:** 前日から残った仕事、未完了、準備不足
- **S（段取り）:** 現在の準備状態、積み上げた仕込み
- **Y（余裕）:** 突発事案、人員変更、遅れ、変動へ対応できる余白

### HP：現在の稼働能力

```text
現在HP ＝
clamp(
  初期HP
  ＋ 回復
  － 減少
  － 時間減衰,
  0,
  100
)
```

時間減衰は実働時間だけを対象とし、休憩と土日は除外します。

### SP：未来資産

SPは、段取りによって作られた未来の余力です。現在能力であるHPとは別に保存し、必要な時に意識的に放出します。

### 天候・霧・視界

天候、風、霧、航路の視認性、ビーコンの強さは、現在状態と直近軌跡の視覚翻訳です。

---

## 動作の流れ

1. Morning CheckでR・S・Yを入力し、初期状態を決める
2. 日中の回復・減少・仕込みでHPとSPを更新する
3. リング、状態帯、天候、AA、CUT-IN、航跡へ変換する
4. Adaptive Beaconが一つの命令ではなく、複数の航路候補を提示する
5. Trajectory Reviewで表示フローを一時停止し、直近8件を見る
6. JUNCTIONで転換点を選び、次の三択を記録する
   - このまま進む
   - 迂回する
   - 今は決めない
7. 選択した航路が、次回Beaconへ一時的に反映される

JUNCTIONは、過去のHP、SP、R/S/Y、ログを復元・改変しません。

---

## 実運用ログによる縦断的エビデンス

Lighthouseの前身は、2026年3月から本人の現場運用に使われてきました。

既存Google Sheetsのアクションログを、**2026年3月8日〜5月26日**について事後集計しました。対象は**57ログ日、非ゼロHPイベント1,105件**です。

| 指標 | 3月 | 4月 | 5月 |
|---|---:|---:|---:|
| 1ログ日あたり減少イベント | 10.78 | 5.50 | 2.71 |
| 1ログ日あたり減少HPポイント | 121.30 | 58.00 | 33.93 |
| 1ログ日あたり回復イベント | 15.43 | 10.50 | 10.29 |
| 低負荷日（減少0〜2件） | 8.7% | 25.0% | 64.3% |
| 荒れ日（減少5件以上） | 87.0% | 60.0% | 21.4% |

![月別アクションログ推移](assets/evidence/real-world-log-trend.svg)

3月から5月で、1ログ日あたりの記録された減少イベントは**74.8%減少**しました。初期運用の影響を避けた4月から5月だけでも**50.6%減少**しています。一方、回復イベントの記録は4月10.5件、5月10.3件でほぼ同水準でした。

これは「生産性が74.8%向上した」という主張ではありません。単独利用者の自己記録であり、生産数、サイクルタイム、残業、品質データとは未接続です。

言えるのは、より狭く正確なことです。

> 回復行動の観測が続く中で、記録された運用上の摩擦が時間と共に減少した。

詳細な方法、留保、イベント別変化、匿名化集計：

- [`docs/REAL_WORLD_EVIDENCE.md`](docs/REAL_WORLD_EVIDENCE.md)
- [`docs/data/real-world-log-summary.csv`](docs/data/real-world-log-summary.csv)

---

## 主な機能

- Adaptive Beacon
- 上部NAVIGATOR AA
- PC・スマホ対応の固定アクション盤
- HPリング反応
- CUT-IN
- Trajectory Review
- LOG PAUSE / LAST 8
- JUNCTION
- 次回Beaconへの航路選択の一時反映
- レスポンシブWeb HUD

---

## 既存成果とBuild Week追加成果

| 領域 | Build Week以前 | Build Weekで追加・進化 |
|---|---|---|
| 朝の状態 | R/S/Y、NS、初期HP | Web HUDのMorning Check |
| 行動入力 | HTTP Shortcutsによるスマホ・Pixel Watch入力 | Web HUD内の固定操作盤 |
| データ経路 | HTTP Shortcuts→GAS→Sheetsログ | 審査再現用の独立公開Web HUD |
| HP | 回復・減少・時間減衰・状態帯 | リング、演出、直近入力、レスポンシブ表示 |
| SP | 仕込みの蓄積と放出 | SPストック／使用の独立表示 |
| ナビ | 状態帯とナビ文言 | 複数航路を出すAdaptive Beacon |
| 軌跡 | ログとHPグラフ | Trajectory Review、LAST 8、各種マーカー |
| 転換点 | なし | JUNCTIONと次回案内への一時反映 |
| 画面 | Google Sheets HUD | PC・スマホ向け公開Lighthouse Web HUD |

公開SiteはGoogle Sheetsとリアルタイム接続していません。審査員が同じ操作を再現できるよう、独立状態で動作し、実時間減衰は停止しています。

---

## ARK — GPT-5.6共同設計者

**ARK（アーク）**は、このプロジェクト全体で使われたGPT-5.6共同設計者の呼び名です。

人間側は、現場経験、実際の言葉、制約、価値観、最終判断を提供しました。アークは次を支援しました。

- 繰り返された現場経験をシステム概念へ変換
- 既存成果とBuild Week追加成果の比較
- HP、SP、軌跡、Beacon、JUNCTIONを一つのナビモデルへ統合
- 操作設計と画面文言の改善
- 矛盾を点検し、反復の中で設計原則を保持
- 長期アクションログのパターン分析
- 本人用の運用方法を、公開可能で試せるWeb HUDへ翻訳

> AIは文脈を保ち、パターンを見つけ、航路を照らせる。  
> 意味、転換点、最終判断は人間に残る。

---

## 技術構成

### 既存の実運用系

```text
スマートフォン／Pixel Watch
        ↓
HTTP Shortcuts
        ↓
Google Apps Script
        ↓
Google Sheets アクションログ
        ↓
R/S/Y・NS・HP・SP・時間減衰
        ↓
Sheets HUD／グラフ
```

### Build Week提出版

```text
利用者
   ↓
レスポンシブLighthouse Web HUD
   ├─ Morning Check
   ├─ HP／SP操作
   ├─ Adaptive Beacon
   ├─ NAVIGATOR AA
   ├─ CUT-IN
   ├─ Trajectory Review
   └─ JUNCTION
```

---

## ローカル実行と検証

必要環境：Node.js `22.13.0`以上、npm。

```bash
npm ci
npm run dev
npm run lint
npm test
npm run validate:artifact
```

公開デモ用の独立状態は、APIキーや非公開Google Sheets認証情報を必要としません。

---

## デモ手順

1. 公開Web HUDを開く
2. Morning Checkを入力する
3. 回復・減少・仕込みを試す
4. HP、SP、リング、天候、AAの変化を見る
5. LOG PAUSE / LAST 8を開く
6. 直近軌跡を確認する
7. JUNCTIONを指定する
8. 三択から航路を選ぶ
9. 次回Beaconへの反映を見る

ログインは不要です。

---

## 設計原則

1. 指示する前に現在地を映す
2. 一つの正解を強制せず航路を置く
3. 過去を書き換えず保存する
4. 最終判断を本人へ残す
5. 反復使用と共同観測によって育つ

---

## 制限事項

- 公開Web HUDはSheetsとリアルタイム同期しない
- 審査再現用の独立状態を使用
- 医療、安全重要、自律判断システムではない
- 普遍的な最適航路を算出するとは主張しない
- 実運用分析は単独利用者を対象とし、因果関係を証明しない
- 生産数、サイクルタイム、残業、品質データと結んだ生産性指標は今後の課題
- Pixel Watch入力は既存のHTTP Shortcuts運用であり、提出作はブラウザ版Web HUD
- 個人の文脈を消さずに他者へ適応する方法は今後の課題

---

## 制作証明

- Site ID: `appgprj_6a5c143957bc81918fdd6ff56138d827`
- Site slug: `lighthouse-build-week`
- 公開保存版: `13`
- 保存版ID: `appgprj_6a5c143957bc81918fdd6ff56138d827~appgver_a5e63da282c8819188425d55ec32aea2`
- チェックポイント: `Mobile Action Focus Final v1`
- Source Commit SHA: `26c61af276f6ddedcd80f78516cb9fb63e8eeebb`
- Deployment ID: `appgdep_6a5ccb2ec5448191be89c4fdd6b3c9bf`
- 公開状態: `succeeded`

オリジナルのWeb HUDはChatGPT Sitesで制作・反復改善しました。Codexスレッドは、エクスポートされたソースの監査、シークレット処理の確認、依存関係のインストール、lint・テスト・本番ビルド、Git初期化、検証済みパッケージのコミット、GitHub公開に使用しました。

### 検証済みCodex公開証跡

- **Codex Session ID:** `019f7db6-7ced-7e60-b16f-2628031b0ef7`
- **最終公開Commit SHA:** `33afd0ea912c41bb5f87aa4e50a8a1c242c5b08d`
- **公開時コミット済みファイル数:** `61`
- **lint:** 通過
- **テスト:** 8件通過、0件失敗
- **本番ビルド:** 通過
- **シークレットスキャン:** 通過

---

## 公開リポジトリ収録内容

```text
app/                              Lighthouse Web HUD
public/                           Lighthouse・CUT-IN画像
worker/                           Sites/Cloudflare worker
build/                            Sitesビルド統合
scripts/                          インストール・ビルド・検証
tests/                            画面動作テスト
assets/screenshots/               PC・スマホ画面
assets/evidence/                  実運用集計グラフ
docs/REAL_WORLD_EVIDENCE.md       縦断分析と方法
docs/data/                        匿名化集計データ
docs/DEVPOST_IMPACT_UPDATE.md     応募欄追記用英文
docs/ARCHITECTURE.md              技術構成
docs/BUILD_WEEK_SCOPE.md          既存／追加範囲
docs/TESTING_GUIDE.md             審査テスト手順
docs/PROVENANCE.md                制作証跡
docs/CODEX_AND_GPT56.md           AI協働記録
docs/VALIDATION.md                検証結果
docs/SOURCE_EXPORT.md             出力・匿名化記録
BUILD_WEEK_CHANGELOG.md           Build Week変更履歴
README.md                         英語README
README.ja.md                      日本語確認版
LICENSE                           MIT License
```

実際の職場ログ、非公開スプレッドシート、認証情報、キャッシュ、依存関係、生成フォントバイナリは公開しません。

---

## 締め

Lighthouseは、日々の稼働能力を見えるようにする実務的な仕組みから始まりました。

Build Weekを通じて、さらに広い形へ育ちました。

人へ命令するのではなく、海の見え方を取り戻すためのシステムです。

**人を管理するのではなく、現在地を映し、次の一歩と別の航路を照らす。**
