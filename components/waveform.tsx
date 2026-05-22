"use client";

type WaveformProps = {
  levels: number[];
  active: boolean;
};

export function Waveform({ levels, active }: WaveformProps) {
  return (
    <div className="flex h-16 items-end gap-1 overflow-hidden rounded-md border border-border/70 bg-canvas/70 px-3 py-2">
      {levels.map((level, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`${index}-${level.toFixed(3)}`}
          className={`block w-1.5 origin-bottom rounded-full bg-ink/85 transition-transform duration-150 ${
            active ? "animate-pulseSoft" : ""
          }`}
          style={{
            height: `${Math.max(18, level * 100)}%`,
            animationDelay: `${index * 40}ms`
          }}
        />
      ))}
    </div>
  );
}
