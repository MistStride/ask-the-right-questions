// 引擎E 候选回应卡：点选，选错红边抖动（可再选）。
export interface TamerOption {
  key: string
  text: string
}

interface Props {
  options: TamerOption[]
  lastWrongKey: string | null
  disabled: boolean
  onSelect: (key: string) => void
}

export default function OptionCards({ options, lastWrongKey, disabled, onSelect }: Props) {
  return (
    <div className="grid gap-2.5">
      {options.map((opt) => {
        const wasWrong = lastWrongKey === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.key)}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
              wasWrong
                ? 'tamer-shake border-red-500 bg-red-50 text-red-700'
                : 'border-line bg-panel-2 text-slate-700 hover:border-tamer/60 hover:bg-tamer/5'
            } ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
          >
            {opt.text}
          </button>
        )
      })}
    </div>
  )
}
