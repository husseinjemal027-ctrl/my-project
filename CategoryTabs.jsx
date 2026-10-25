const categories = ['all', 'quran', 'book', 'audio', 'video', 'dhikr'];

export default function CategoryTabs({ value, onChange, t }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Content category">
      {categories.map((category) => (
        <button
          aria-selected={value === category}
          className={value === category ? 'category-tab active' : 'category-tab'}
          key={category}
          onClick={() => onChange(category)}
          role="tab"
          type="button"
        >
          {t(category)}
        </button>
      ))}
    </div>
  );
}
