import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [key, map]);

  return null;
}

function ListingMap({ listings, height = 400 }) {
  const withLocation = listings.filter(
    (l) => typeof l.lat === "number" && typeof l.lng === "number"
  );
  const points = withLocation.map((l) => [l.lat, l.lng]);

  if (withLocation.length === 0) {
    return <p className="muted">No location has been set for this listing yet.</p>;
  }

  return (
    <div className="map-wrap" style={{ height }}>
      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {withLocation.map((l) => (
          <Marker key={l._id} position={[l.lat, l.lng]} icon={defaultIcon}>
            <Popup>
              <strong>{l.title}</strong>
              <br />
              {l.city} · ₹{l.pricePerNight} / night
              <br />
              <Link to={`/listings/${l._id}`}>View listing</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ListingMap;