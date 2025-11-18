import { MapContainer, Polyline, Marker, Popup, TileLayer } from 'react-leaflet';
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

const DEFAULT_CENTER = [21.028511, 105.804817];

export default function MapViewer({ coordinates = [], userLocation }) {
  const positions = coordinates.map((point) => [
    point.coords.lat,
    point.coords.lng,
  ]);
  const center =
    positions[0] || (userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER);

  const toArray = (point) => [point.lat, point.lng];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 1 && (
          <Polyline positions={positions} color="#1f8eed" weight={6} />
        )}
        {coordinates.map((point) => (
          <Marker position={toArray(point.coords)} key={point.stopId}>
            <Popup>
              <strong>{point.name}</strong>
              <br />
              {point.type}
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={toArray(userLocation)}>
            <Popup>Vị trí của tôi</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

