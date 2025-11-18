const FILTERS = [
  { id: 'fastest', label: 'Nhanh nhất' },
  { id: 'fewest_transfers', label: 'Ít chuyển' },
  { id: 'cheapest', label: 'Rẻ nhất' },
];

export default function FilterTabs({ activeFilter, onChange }) {
  return (
    <div className="filter-tabs">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={activeFilter === filter.id ? 'tab active' : 'tab'}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

