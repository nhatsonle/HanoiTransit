import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom transfer point icon (orange)
const transferIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#FF8C00"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#FFF"/>
      <path d="M12.5 8.5v4m0 0v4m0-4h-4m4 0h4" stroke="#FF8C00" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = [21.028511, 105.804817];

export default function MapViewer({ coordinates = [], geometries = [], userLocation, segments = [] }) {
  // Use useMemo to stabilize values and prevent unnecessary re-renders
  const positions = useMemo(() => {
    return coordinates
      .filter(point => point && point.coords)
      .map((point) => [
        point.coords.lat,
        point.coords.lng,
      ]);
  }, [coordinates]);

  const center = useMemo(() => {
    return positions[0] || (userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER);
  }, [positions, userLocation]);

  const hasGeometries = useMemo(() => {
    return geometries && geometries.length > 0 && geometries.some(g => g && g.length > 0);
  }, [geometries]);

  // Create a stable key for MapContainer based on center
  const mapKey = useMemo(() => {
    return `map-${center[0]}-${center[1]}`;
  }, [center]);

  const toArray = (point) => [point.lat, point.lng];

  // Identify transfer points and walk segments
  const { transferPoints, walkSegmentIndices } = useMemo(() => {
    const transferPts = new Set();
    const walkSegs = new Set();

    if (segments && segments.length > 0) {
      segments.forEach((segment, idx) => {
        if (segment.mode === 'walk') {
          walkSegs.add(idx);
        }
        if (idx > 0 && segment.mode !== 'walk' && segments[idx - 1].mode !== 'walk') {
          transferPts.add(segment.from);
        }
      });
    }

    return { transferPoints: transferPts, walkSegmentIndices: walkSegs };
  }, [segments]);

  // Debug logging
  console.log('🗺️ MapViewer render:', {
    coordinatesCount: coordinates.length,
    positionsCount: positions.length,
    geometriesCount: geometries?.length || 0,
    hasGeometries,
    center,
    mapKey
  });

  return (
    <div className="map-container" style={{ minHeight: '300px', width: '100%' }}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        whenCreated={(mapInstance) => {
          // Ensure map is properly initialized
          setTimeout(() => {
            mapInstance.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw route paths */}
        {hasGeometries ? (
          // Draw each segment with its actual geometry from OSRM
          geometries.map((geometry, idx) => {
            if (!geometry || geometry.length < 2) return null;
            const isWalkSegment = walkSegmentIndices.has(idx);

            return (
              <Polyline
                key={`segment-${idx}`}
                positions={geometry}
                color={isWalkSegment ? '#10b981' : (idx % 2 === 0 ? '#1f8eed' : '#ff7f50')}
                weight={isWalkSegment ? 4 : 5}
                opacity={isWalkSegment ? 0.7 : 0.8}
                dashArray={isWalkSegment ? '10, 10' : null}
              />
            );
          })
        ) : (
          // Fallback to straight line if no geometries
          positions.length > 1 && (
            <Polyline positions={positions} color="#1f8eed" weight={6} />
          )
        )}

        {/* Stop markers */}
        {coordinates.map((point, idx) => {
          const isTransferPoint = transferPoints.has(point.stopId);
          const isStartOrEnd = idx === 0 || idx === coordinates.length - 1;

          return (
            <Marker
              position={toArray(point.coords)}
              key={point.stopId || `point-${idx}`}
              icon={isTransferPoint && !isStartOrEnd ? transferIcon : undefined}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                {point.type}
                {isTransferPoint && !isStartOrEnd && (
                  <>
                    <br />
                    <span style={{ color: '#FF8C00', fontWeight: 'bold' }}>🔄 Điểm Chuyển Tuyến</span>
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}

        {/* User location marker */}
        {userLocation && (
          <Marker position={toArray(userLocation)}>
            <Popup>Vị trí của tôi</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
  } catch (error) {
    console.error('❌ MapViewer error:', error);
    return (
      <div className="map-container" style={{ minHeight: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ Không thể hiển thị bản đồ</p>
          <p style={{ color: '#666', fontSize: '14px' }}>{error.message}</p>
        </div>
      </div>
    );
  }
}

