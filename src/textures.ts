import type Phaser from "phaser";

export const BALLOON_COLORS = [0x2f7fc8, 0xe0523c, 0x2fa585];
export const GOLD = 0xffc83d;

// 白い風船の絵を作っておき、出すときに色をつける
export function makeTextures(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  // ① 風船の「ヒモ」を描く
  g.lineStyle(2, 0xffffff, 0.6); // 太さ2px、白、不透明度60%の線
  g.lineBetween(32, 70, 32, 108); // (32, 70) から (32, 108) まで縦の線を引く

  // ② 風船の「本体（楕円）」を描く
  g.fillStyle(0xffffff); // 塗りつぶし色を「白」に
  g.fillEllipse(32, 34, 56, 64); // 中心(32, 34)、幅56、高さ64 の楕円を描く

  // ③ 風船の「結び目（三角形）」を描く
  g.fillTriangle(32, 64, 26, 72, 38, 72); // 頂点3つを結ぶ三角形を描く

  // ④ 画像（テクスチャ）として保存する！
  g.generateTexture("balloon", 64, 110);

  // ⑤ 割れたときのかけら用の小さな四角
  g.clear();
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 8, 8);
  g.generateTexture("bit", 8, 8);

  g.destroy();
}
