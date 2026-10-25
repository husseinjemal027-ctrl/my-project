export default function Button({ as: Component = 'button', children, variant = 'primary', className = '', ...props }) {
  return (
    <Component className={`button button-${variant} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
