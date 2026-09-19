// 引擎C 校准滑块：只呈现语义标签与操作控件，不泄露答案区间或接近度。

interface Props {
  value: number
  labels: [string, string]
  onChange: (v: number) => void
  /** 松手/键盘松开时判定 */
  onRelease: (v: number) => void
}

export default function CalibrationSlider({ value, labels, onChange, onRelease }: Props) {
  return (
    <div className="relative">
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>

      {/* 滑块轨道 */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => onRelease(value)}
        onKeyUp={() => onRelease(value)}
        className="scale-slider block w-full"
      />
    </div>
  )
}
