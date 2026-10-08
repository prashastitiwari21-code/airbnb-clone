import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function HostDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/listings/mine")
      .then((res) => setListings(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load your listings")
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete");
    }
  };

  if (loading) return <div className="container muted">Loading...</div>;

  return (
    <div className="container">
      <div className="dash-header">
        <h1>My listings</h1>
        <Link to="/host/new" className="btn-primary">
          + Add listing
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!error && listings.length === 0 && (
        <p className="muted">You haven't listed any places yet.</p>
      )}

      <div className="booking-list">
        {listings.map((l) => (
          <div className="booking-item" key={l._id}>
            <div className="booking-top">
              <div>
                <h3>
                  <Link to={`/listings/${l._id}`}>{l.title}</Link>
                </h3>
                <p className="muted">
                  {l.city} · {l.propertyType} · up to {l.maxGuests} guests
                </p>
              </div>
              <span className="rating">
                {l.numReviews > 0 ? `★ ${l.avgRating} (${l.numReviews})` : "No reviews"}
              </span>
            </div>

            <p>
              <strong>₹{l.pricePerNight}</strong> / night
            </p>

            <div className="booking-actions">
              <Link to={`/host/edit/${l._id}`} className="btn-outline">
                Edit
              </Link>
              <button className="danger" onClick={() => handleDelete(l._id, l.title)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HostDashboard;