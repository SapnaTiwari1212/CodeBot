import { LANGUAGES } from '../../utils/languages.js'

/**
 * Language selector. `id` must stay unique on a page because the label is wired
 * to it with htmlFor.
 */
export default function LanguageSelector({
  id = 'language',
  label = 'Language',
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {LANGUAGES.map((language) => (
          <option key={language.id} value={language.id}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  )
}