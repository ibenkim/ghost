type Segment<T extends string> = { value: T; label: string }

type SegmentedControlProps<T extends string> = {
  value: T
  segments: Segment<T>[]
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({
  value,
  segments,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented">
      {segments.map((seg) => (
        <button
          key={seg.value}
          className={`segment ${value === seg.value ? 'segment-active' : ''}`}
          onClick={() => onChange(seg.value)}
        >
          {seg.label}
        </button>
      ))}
    </div>
  )
}
