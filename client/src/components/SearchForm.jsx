import { useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import PlaceAutocomplete from './PlaceAutocomplete';
import { reverseGeocode } from '../services/geocoding';

export default function SearchForm({ onSubmit, initialFrom, initialTo }) {
  const [fromPlace, setFromPlace] = useState(initialFrom || null);
  const [toPlace, setToPlace] = useState(initialTo || null);
  const [errors, setErrors] = useState({});
  const { requestPosition, loading: locating, error: geoError } = useGeolocation();

  const handleFromChange = (place) => {
    setFromPlace(place);
    if (place) {
      setErrors((prev) => ({ ...prev, from: undefined }));
    }
  };

  const handleToChange = (place) => {
    setToPlace(place);
    if (place) {
      setErrors((prev) => ({ ...prev, to: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fromPlace || !fromPlace.coords) {
      newErrors.from = 'Vui lòng chọn điểm đi từ danh sách gợi ý';
    }
    if (!toPlace || !toPlace.coords) {
      newErrors.to = 'Vui lòng chọn điểm đến từ danh sách gợi ý';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      from: fromPlace,
      to: toPlace,
    });
  };

  const handleUseLocation = async () => {
    try {
      const coords = await requestPosition();

      // Thử reverse geocode để lấy tên địa chỉ
      try {
        const locationInfo = await reverseGeocode(coords);
        setFromPlace({
          label: 'Vị trí của tôi',
          fullName: locationInfo.name,
          coords: coords,
        });
      } catch {
        // Nếu reverse geocode lỗi, vẫn dùng tọa độ
        setFromPlace({
          label: 'Vị trí của tôi',
          coords: coords,
        });
      }

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
          <PlaceAutocomplete
            id="from"
            value={fromPlace}
            onChange={handleFromChange}
            placeholder="Nhập địa chỉ hoặc địa điểm..."
            error={errors.from}
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
        <PlaceAutocomplete
          id="to"
          value={toPlace}
          onChange={handleToChange}
          placeholder="Nhập địa chỉ hoặc địa điểm..."
          error={errors.to}
        />
        {errors.to && <p className="error-text">{errors.to}</p>}
      </div>

      {geoError && <p className="error-text">{geoError}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-btn">
          Tìm kiếm
        </button>
        <p className="helper">
          Nhập tối thiểu 3 ký tự để tìm kiếm địa điểm. Chọn từ danh sách gợi ý.
        </p>
      </div>
    </form>
  );
}

