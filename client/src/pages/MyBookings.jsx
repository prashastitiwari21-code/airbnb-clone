import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openId, setOpenId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [reviewed, setReviewed] = useState([]);

  const load = () =>
    api
      .get("/bookings/mine")
      .then((res) => setBookings(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load bookings")
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel");
    }
  };

  const openReview = (id) => {
    setOpenId(id);
    setRating(5);
    setComment("");
    setFormError("");
  };

  const submitReview = async (e, booking) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.post("/reviews", {
        listingId: booking.listing._id,
        rating: Number(rating),
        comment,
      });
      setReviewed([...reviewed, booking.listing._id]);
      setOpenId(null);
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not post review");
    }
  };

  const now = new Date();

  if (loading) return <div className="container muted">Loading...</div>;

  return (
    <div className="container">
      <h1>My bookings</h1>

      {error && <p className="error">{error}</p>}
      {!error && bookings.length === 0 && (
        <p className="muted">
          You have no bookings yet. <Link to="/" className="link">Browse stays</Link>
        </p>
      )}

      <div className="booking-list">
        {bookings.map((b) => {
          const upcoming = new Date(b.checkIn) > now;
          const completed = new Date(b.checkOut) < now;
          const confirmed = b.status === "confirmed";
          const listingId = b.listing?._id;

          return (
            <div className="booking-item" key={b._id}>
              <div className="booking-top">
                <div>
                  <h3>
                    {b.listing ? (
                      <Link to={`/listings/${listingId}`}>{b.listing.title}</Link>
                    ) : (
                      "Listing removed"
                    )}
                  </h3>
                  <p className="muted">{b.listing?.city}</p>
                </div>
                <span className={`status ${b.status}`}>{b.status}</span>
              </div>

              <p>
                {fmt(b.checkIn)} → {fmt(b.checkOut)} · {b.guests} guest(s)
              </p>
              <p>
                Total: <strong>₹{b.totalPrice}</strong>
              </p>

              <div className="booking-actions">
                {confirmed && upcoming && (
                  <button className="danger" onClick={() => handleCancel(b._id)}>
                    Cancel booking
                  </button>
                )}

                {confirmed &&
                  completed &&
                  b.listing &&
                  !reviewed.includes(listingId) &&
                  openId !== b._id && (
                    <button onClick={() => openReview(b._id)}>Write a review</button>
                  )}

                {reviewed.includes(listingId) && (
                  <span className="success">Thanks for your review!</span>
                )}
              </div>

              {openId === b._id && (
                <form className="review-form" onSubmit={(e) => submitReview(e, b)}>
                  <label className="field-label">Rating</label>
                  <select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Okay</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>

                  <label className="field-label">Comment</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was your stay?"
                    required
                  />

                  {formError && <p className="error">{formError}</p>}

                  <div className="booking-actions">
                    <button type="submit">Post review</button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setOpenId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyBookings;