import { useEffect, useRef, useState } from "react";

import { EventBus } from "./EventBus";
import { type IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { ResultScreen } from "./ResultScreen";
import { TitleScreen } from "./TitleScreen";

type Screen = "title" | "playing" | "result";

const TIME_LIMIT = 30;

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [best, setBest] = useState(0);

  // 子コンポーネント（PhaserGame）の game インスタンスや scene への参照
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    const onEnd = (final: number) => {
      const newBest = Math.max(final, Number(localStorage.getItem("balloon-best") ?? 0));
      localStorage.setItem("balloon-best", String(newBest));
      setBest(newBest);
      setScreen("result");
    };

    EventBus.on("score:changed", setScore);
    EventBus.on("time:changed", setTimeLeft);
    EventBus.on("game:ended", onEnd);

    return () => {
      EventBus.off("score:changed", setScore);
      EventBus.off("time:changed", setTimeLeft);
      EventBus.off("game:ended", onEnd);
    };
  }, []);

  function start() {
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setScreen("playing");

    // Phaser にゲーム開始のイベントを送信
    EventBus.emit("game:start", { timeLimit: TIME_LIMIT });
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* 1. Phaser（ゲーム本体） */}
      <div className="absolute inset-0">
        <PhaserGame ref={phaserRef} />
      </div>

      {/* 2. プレイ中の HUD（スコア・残り時間） */}
      {screen === "playing" && (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-4 py-3 text-xl font-bold text-white">
          <span>スコア {score}</span>
          <span>のこり {timeLeft}秒</span>
        </header>
      )}

      {/* 3. 前面に被せる React の画面（タイトル / リザルト） */}
      {screen === "title" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-sky-200">
          <TitleScreen onStart={start} />
        </div>
      )}

      {screen === "result" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-sky-200">
          <ResultScreen score={score} best={best} onRetry={start} />
        </div>
      )}
    </main>
  );
}
