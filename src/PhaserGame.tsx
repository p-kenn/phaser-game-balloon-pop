import Phaser from "phaser";
import { useEffect, useRef } from "react";

import { GameScene } from "./scenes/GameScene";

export function PhaserGame() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // この部品が画面に出たら、箱の中に Phaser のゲームを作る
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: boxRef.current,
      width: 360,
      height: 640,
      backgroundColor: "#e0f2fe",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        activePointers: 3,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [GameScene],
    });

    // この部品が消えるときに、ゲームも片づける
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={boxRef} />;
}
