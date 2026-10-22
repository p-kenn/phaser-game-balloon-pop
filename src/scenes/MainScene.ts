import Phaser from "phaser";

import { EventBus } from "../EventBus";
import { BALLOON_COLORS, GOLD, makeTextures } from "../textures";

export class MainScene extends Phaser.Scene {
  private balloons!: Phaser.Physics.Arcade.Group;
  private bits!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isPlaying = false;
  private score = 0;
  private timeLeft = 30;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("MainScene");
  }

  create() {
    this.scene.pause();

    makeTextures(this);
    this.balloons = this.physics.add.group();
    this.bits = this.add.particles(0, 0, "bit", {
      speed: { min: 80, max: 220 },
      lifespan: 400,
      scale: { start: 1, end: 0 },
      gravityY: 400,
      emitting: false,
    });

    // start が押されたらゲームを開始する
    EventBus.on("game:start", this.onGameStart, this);

    // シーンが終了(shutdown)または破棄(destroy)されたときにイベントを解除する
    const cleanUp = () => {
      EventBus.off("game:start", this.onGameStart, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanUp);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanUp);

    // シーンの準備完了を通知
    EventBus.emit("current-scene-ready", this);
  }

  onGameStart({ timeLimit }: { timeLimit: number }) {
    // 安全対策：もしシーンが既に破棄されていたら何もしないガード
    if (!this.scene?.manager || !this.sys) return;

    // 前回のタイマーやバルーンをリセット
    this.cleanUpGame();

    this.isPlaying = true;
    this.score = 0;
    this.timeLeft = timeLimit;
    this.scene.resume();

    // バルーンのスポーンを開始
    this.scheduleSpawn();

    // 1秒ごとに残り時間を減らして、React に知らせる
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: this.timeLeft - 1,
      callback: () => {
        this.timeLeft -= 1;
        EventBus.emit("time:changed", this.timeLeft);
        if (this.timeLeft === 0) {
          this.onGameOver();
        }
      },
    });
  }

  onGameOver() {
    this.cleanUpGame();
    this.scene.pause();
    EventBus.emit("game:ended", this.score);
  }

  private cleanUpGame() {
    this.isPlaying = false;

    // スポーン・カウントダウンタイマーを停止
    this.spawnTimer?.destroy();
    this.spawnTimer = undefined;
    this.countdownTimer?.destroy();
    this.countdownTimer = undefined;

    // 残っているすべてのバルーンを消去・破棄
    if (this.balloons?.children) {
      this.balloons.clear(true, true);
    }
    // 実行中のアニメーション（Tween）を停止
    this.tweens?.killAll();
  }

  scheduleSpawn() {
    const delay = 600;
    // delay時間後に自分自身を呼び出すことでループする
    this.spawnTimer = this.time.delayedCall(delay, () => {
      if (!this.isPlaying) return;

      this.spawnBalloon();
      this.scheduleSpawn();
    });
  }

  spawnBalloon() {
    const x = Phaser.Math.Between(40, 320);
    const balloon: Phaser.Physics.Arcade.Image = this.balloons.create(x, 700, "balloon");

    const isGold = Math.random() < 0.25;
    this.setBalloonProperty(balloon, isGold);

    // 丸い部分だけをさわれるようにする
    balloon.setInteractive(new Phaser.Geom.Circle(32, 34, 32), Phaser.Geom.Circle.Contains);
    balloon.on("pointerdown", () => this.pop(balloon));
  }

  setBalloonProperty(balloon: Phaser.Physics.Arcade.Image, isGold: boolean) {
    // ゴールドなら金色固定、通常ならランダムな色
    const color = isGold ? GOLD : Phaser.Utils.Array.GetRandom(BALLOON_COLORS);
    balloon.setTint(color);
    balloon.setData("bit-color", color);

    // ゴールドと通常で差をつける
    if (isGold) {
      balloon.setVelocityY(-Phaser.Math.Between(300, 350));
      balloon.setScale(0.8);
      balloon.setData("points", 3);
    } else {
      balloon.setVelocityY(-Phaser.Math.Between(80, 160));
      balloon.setData("points", 1);
    }
  }

  pop(balloon: Phaser.Physics.Arcade.Image) {
    balloon.disableInteractive();
    balloon.setVelocity(0, 0);

    // ふくらんで消える
    this.tweens.add({
      targets: balloon,
      scale: 1.4,
      alpha: 0,
      duration: 150,
      onComplete: () => balloon.destroy(),
    });

    // かけらが飛び散る
    this.bits.setParticleTint(balloon.getData("bit-color"));
    this.bits.explode(12, balloon.x, balloon.y - 21);

    navigator.vibrate?.(15);

    // スコアを増やして、React に知らせる
    const points = balloon.getData("points");
    this.score += points;
    EventBus.emit("score:changed", this.score);
  }

  update() {
    // 画面の上に出ていった風船を片づける
    for (const child of [...this.balloons.getChildren()]) {
      const balloon = child as Phaser.Physics.Arcade.Image;
      if (balloon.y < -80) balloon.destroy();
    }
  }
}
