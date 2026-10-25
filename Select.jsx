export default function Select({ label, children, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <select {...props}>{children}</select>
    </label>
  );
}
