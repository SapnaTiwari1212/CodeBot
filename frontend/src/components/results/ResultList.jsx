/** Bulleted list used for the many list fields across operations. */
export default function ResultList({ items, ordered = false }) {
  if (!Array.isArray(items) || items.length === 0) return null

  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <ListTag className={`space-y-2 ${ordered ? 'list-decimal pl-5' : 'list-disc pl-5'}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} className="marker:text-slate-600">
          {item}
        </li>
      ))}
    </ListTag>
  )
}