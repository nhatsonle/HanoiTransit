import { useMemo, useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { STOPS } from '../data/stops';

export default function SearchForm({ onSubmit, initialFrom, initialTo }) {
  const [fromInput, setFromInput] = useState(initialFrom?.label || '');
  const [toInput, setToInput] = useState(initialTo?.label || '');
  const [fromCoords, setFromCoords] = useState(initialFrom?.coords || null);
  const [toCoords, setToCoords] = useState(initialTo?.coords || null);
  const [errors, setErrors] = useState({});
  const { requestPosition, loading: locating, error: geoError } = useGeolocation();

  const stopOptions = useMemo(() => STOPS, []);

  const handleStopSelection = (value, setter, setCoordSetter, field) => {
    setter(value);
    const stop = stopOptions.find(
      (option) => option.name.toLowerCase() === value.trim().toLowerCase()
    );
    if (stop) {
      setCoordSetter(stop.coords);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } else {
      setCoordSetter(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fromCoords) newErrors.from = 'Vui lòng nhập điểm đi';
    if (!toCoords) newErrors.to = 'Vui lòng nhập điểm đến';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      from: { label: fromInput, coords: fromCoords },
      to: { label: toInput, coords: toCoords },
    });
  };

  const handleUseLocation = async () => {
    try {
      const coords = await requestPosition();
      setFromCoords(coords);
      setFromInput('Vị trí của tôi');
      setErrors((prev) => ({ ...prev, from: undefined }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        from: err.message || geoError,
      }));
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="from">Điểm đi</label>
        <div className="input-with-addon">
          <input
            id="from"
            value={fromInput}
            onChange={(e) =>
            handleStopSelection(e.target.value, setFromInput, setFromCoords, 'from')
            }
            placeholder="Ví dụ: Ga Trung Tâm"
            list="stop-options"
          />
          <button
            type="button"
            className="ghost-btn"
            onClick={handleUseLocation}
            disabled={locating}
          >
            {locating ? 'Đang xác định...' : 'Vị trí của tôi'}
          </button>
        </div>
        {errors.from && <p className="error-text">{errors.from}</p>}
      </div>

      <div className="form-row">
        <label htmlFor="to">Điểm đến</label>
        <input
          id="to"
          value={toInput}
          onChange={(e) =>
            handleStopSelection(e.target.value, setToInput, setToCoords, 'to')
          }
          placeholder="Ví dụ: Sân Bay Mới"
          list="stop-options"
        />
        {errors.to && <p className="error-text">{errors.to}</p>}
      </div>

      <datalist id="stop-options">
        {stopOptions.map((stop) => (
          <option value={stop.name} key={stop.id} />
        ))}
      </datalist>

      {geoError && <p className="error-text">{geoError}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-btn">
          Tìm kiếm
        </button>
        <p className="helper">
          Dùng danh sách gợi ý để đảm bảo hệ thống hiểu chính xác trạm bạn chọn.
        </p>
      </div>
    </form>
  );
}

