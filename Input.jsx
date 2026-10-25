export default function Input({ label, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input {...props} />
    </label>
  );
}
