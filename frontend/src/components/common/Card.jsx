/** Standard panel used for every card in the product. */
export default function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`panel ${className}`} {...rest}>
      {children}
    </Tag>
  )
}