import { useEffect, useState } from 'react';
import LineInfoPanel from '../components/LineInfoPanel';
import { getLineDetails, searchLines } from '../services/api';

export default function LineLookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchLines(query);
        setResults(response.results.filter((item) => item.type === 'line'));
        setError(null);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Không tìm thấy thông tin cho tuyến bạn yêu cầu.'
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = async (lineId) => {
    try {
      setLoading(true);
      const data = await getLineDetails(lineId);
      setSelected(data);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Không tìm thấy thông tin cho tuyến bạn yêu cầu.'
      );
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page line-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tra cứu tuyến</p>
          <h1>Tìm tuyến xe buýt / tàu</h1>
        </div>
        <div className="search-field">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập số hiệu, ví dụ: 5B"
          />
        </div>
      </header>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="line-search-content">
        <aside>
          <ul>
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={selected?.id === item.id ? 'list-btn active' : 'list-btn'}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.name}
                </button>
              </li>
            ))}
            {!results.length && <li>Nhập từ khoá để hiển thị gợi ý.</li>}
          </ul>
        </aside>
        <section>
          <LineInfoPanel line={selected} />
        </section>
      </div>
    </div>
  );
}

