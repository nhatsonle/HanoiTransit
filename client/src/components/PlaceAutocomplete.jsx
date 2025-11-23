import { useState, useEffect, useRef } from 'react';
import { searchPlaces } from '../services/geocoding';

/**
 * Component autocomplete cho tìm kiếm địa điểm
 */
export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  id,
  error
}) {
  const [inputValue, setInputValue] = useState(value?.label || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cập nhật input value khi prop value thay đổi
  useEffect(() => {
    if (value?.label) {
      setInputValue(value.label);
    }
  }, [value]);

  // Tìm kiếm với debounce
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Xóa timeout cũ
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nếu input rỗng, clear suggestions
    if (!newValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      onChange(null);
      return;
    }

    // Debounce: chờ 300ms sau khi người dùng ngừng gõ
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchPlaces(newValue);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Chọn một suggestion
  const handleSelectSuggestion = (place) => {
    setInputValue(place.shortName);
    setIsOpen(false);
    setSuggestions([]);
    onChange({
      label: place.shortName,
      fullName: place.name,
      coords: place.coords,
    });
  };

  // Xử lý phím điều hướng
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="place-autocomplete" ref={wrapperRef}>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        autoComplete="off"
      />

      {isLoading && <div className="autocomplete-loading">Đang tìm...</div>}

      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((place, index) => (
            <li
              key={place.id}
              className={`autocomplete-item ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleSelectSuggestion(place)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="place-name">{place.shortName}</div>
              <div className="place-full-name">{place.name}</div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="autocomplete-empty">
          Không tìm thấy địa điểm phù hợp
        </div>
      )}
    </div>
  );
}

