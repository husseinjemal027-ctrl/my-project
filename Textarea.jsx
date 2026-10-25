export default function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <textarea {...props} />
    </label>
  );
}
