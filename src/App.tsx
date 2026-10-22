import { useEffect, useState } from "react";

import { EventBus } from "./EventBus";
import { PhaserGame } from "./PhaserGame";
import { ResultScreen } from "./ResultScreen";
import { TitleScreen } from "./TitleScreen";

type Screen = "title" | "playing" | "result";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState(0);

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
    const timeLimit = 7;
    setTimeLeft(timeLimit);
    setScreen("playing");

    // Phaser にゲーム開始のイベントを送信
    EventBus.emit("game:start", { timeLimit });
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 1. Phaser（ゲーム本体）は常に一番奥に常駐させる */}
      <div className="absolute inset-0">
        <PhaserGame />
      </div>

      {/* 2. プレイ中の HUD（スコア・残り時間） */}
      {screen === "playing" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-4 py-3 text-xl font-bold text-white">
          <span>スコア {score}</span>
          <span>のこり {timeLeft}秒</span>
        </div>
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
