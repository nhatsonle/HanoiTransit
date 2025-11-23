/**
 * Geocoding service sử dụng Nominatim API (OpenStreetMap)
 * API miễn phí, không cần key
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Giới hạn tìm kiếm khu vực Hà Nội và lân cận
const HANOI_BOUNDS = {
  viewbox: '105.3,20.7,106.0,21.4', // [minLon,minLat,maxLon,maxLat]
  bounded: 1, // Ưu tiên kết quả trong bounds
};

/**
 * Tìm kiếm địa điểm theo query string
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách địa điểm gợi ý
 */
export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 8,
      countrycodes: 'vn', // Chỉ tìm ở Việt Nam
      ...HANOI_BOUNDS,
      'accept-language': 'vi',
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: {
        'User-Agent': 'HanoiTransit/1.0', // Nominatim yêu cầu User-Agent
      },
    });

    if (!response.ok) {
      throw new Error('Không thể tìm kiếm địa điểm');
    }

    const data = await response.json();

    return data.map((place) => ({
      id: place.place_id,
      name: place.display_name,
      shortName: formatShortName(place),
      coords: { lat: parseFloat(place.lat), lng: parseFloat(place.lon) },
      address: place.address || {},
      type: place.type,
      importance: place.importance,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocoding - Lấy địa chỉ từ tọa độ
 * @param {Array} coords - [lat, lon]
 * @returns {Promise<Object>} Thông tin địa điểm
 */
export const reverseGeocode = async (coords) => {
  try {
    const [lat, lon] = coords;
    const params = new URLSearchParams({
      lat,
      lon,
      format: 'json',
      addressdetails: 1,
      'accept-language': 'vi',
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: {
        'User-Agent': 'HanoiTransit/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Không thể xác định địa chỉ');
    }

    const data = await response.json();

    return {
      name: data.display_name,
      shortName: formatShortName(data),
      coords: { lat: parseFloat(data.lat), lng: parseFloat(data.lon) },
      address: data.address || {},
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

/**
 * Format tên ngắn gọn hơn từ dữ liệu địa chỉ
 */
function formatShortName(place) {
  const addr = place.address || {};

  // Ưu tiên hiển thị: tên địa điểm cụ thể > đường > quận/huyện
  const parts = [
    addr.amenity,
    addr.building,
    addr.tourism,
    addr.road,
    addr.suburb,
    addr.district,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.slice(0, 2).join(', ');
  }

  // Fallback về display_name rút gọn
  const fullName = place.display_name || '';
  const tokens = fullName.split(',').slice(0, 3);
  return tokens.join(',');
}

