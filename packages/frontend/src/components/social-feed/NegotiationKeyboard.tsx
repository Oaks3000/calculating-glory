interface NegotiationKeyboardProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['.', '0', '⌫'],
];

export function NegotiationKeyboard({ value, onChange, onSubmit, disabled }: NegotiationKeyboardProps) {
  function press(key: string) {
    if (disabled) return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (key === '.' && value.includes('.')) {
      // only one decimal
    } else if (value.length >= 8) {
      // max length
    } else {
      onChange(value + key);
    }
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-bg-raised rounded-card">
      {/* Display */}
      <div className="bg-bg-deep rounded-card px-3 py-2 text-right data-font text-lg text-txt-primary min-h-[42px]">
        {value || <span className="text-txt-muted text-sm">Enter answer…</span>}
      </div>

      {/* Keys */}
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => press(key)}
                disabled={disabled}
                className={[
                  'flex-1 h-10 rounded-card text-sm font-semibold transition-all duration-100',
                  'active:scale-95',
                  disabled
                    ? 'bg-bg-surface text-txt-muted cursor-not-allowed'
                    : key === '⌫'
                    ? 'bg-bg-surface text-alert-red hover:bg-alert-red/10'
                    : 'bg-bg-surface text-txt-primary hover:bg-bg-raised',
                ].join(' ')}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={disabled || !value}
        className={[
          'w-full py-2.5 rounded-card font-semibold text-sm transition-all duration-150',
          disabled || !value
            ? 'bg-bg-surface text-txt-muted cursor-not-allowed'
            : 'bg-data-blue text-white hover:bg-data-blue/80 active:scale-95',
        ].join(' ')}
      >
        Submit Answer
      </button>
    </div>
  );
}
