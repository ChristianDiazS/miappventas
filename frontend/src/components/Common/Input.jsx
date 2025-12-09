/**
 * Input Component
 * Campo de entrada con label y validación
 * 
 * Props:
 *  - type: 'text' | 'email' | 'password' | 'number' = 'text'
 *  - label: string
 *  - placeholder: string
 *  - value: string | number
 *  - onChange: (value: string) => void
 *  - error: string | null
 *  - disabled: boolean
 *  - required: boolean
 */

export function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  ...props
}) {
  const borderStyles = error
    ? 'border-2 border-red-500 focus:border-red-600'
    : 'border-2 border-neutral-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200';

  const textStyles = error ? 'text-red-500' : 'text-gray-700';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg transition-colors ${borderStyles} ${textStyles} disabled:opacity-50 disabled:bg-gray-100`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
