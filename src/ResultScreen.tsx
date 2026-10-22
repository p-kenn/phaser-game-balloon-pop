type Props = {
  score: number;
  best: number;
  onRetry: () => void;
};

export function ResultScreen({ score, best, onRetry }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">タイムアップ</h1>
      <p>{score}個 割れました</p>
      <p>ハイスコア {best}</p>
      <button
        className="rounded-full bg-indigo-950 px-10 py-3.5 text-xl font-bold text-white"
        onClick={onRetry}
      >
        もう一回
      </button>
    </div>
  );
}
