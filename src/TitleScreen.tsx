type Props = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">ふうせんポップ</h1>
      <p>30秒で、風船をいくつ割れるかな？</p>
      <button
        className="rounded-full bg-indigo-950 px-10 py-3.5 text-xl font-bold text-white"
        onClick={onStart}
      >
        スタート
      </button>
    </div>
  );
}
