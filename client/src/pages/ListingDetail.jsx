import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ListingMap from "../components/ListingMap";

const DAY = 1000 * 60 * 60 * 24;

function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingError, setBookingError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadBooked = async () => {
    const res = await api.get(`/bookings/listing/${id}`);
    setBooked(res.data);
  };

  useEffect(() => {
    Promise.all([
      api.get(`/listings/${id}`),
      api.get(`/reviews/listing/${id}`),
      api.get(`/bookings/listing/${id}`),
    ])
      .then(([l, r, b]) => {
        setListing(l.data);
        setReviews(r.data);
        setBooked(b.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load listing")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container muted">Loading...</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!listing) return null;

  const excluded = booked.map((b) => {
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    end.setDate(end.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return { start, end };
  });

  const nights =
    startDate && endDate ? Math.round((endDate - startDate) / DAY) : 0;
  const total = nights * listing.pricePerNight;
  const isOwner = user && listing.host?._id === user.id;

  const handleDates = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setBookingError("");
    setSuccess("");
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setBookingError("Please select check-in and check-out dates");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        listingId: id,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        guests: Number(guests),
      });
      setSuccess(`Booking confirmed for ${nights} night(s). Total ₹${total}`);
      setStartDate(null);
      setEndDate(null);
      await loadBooked();
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← Back to listings
      </Link>

      <div className="detail-hero">
        <span className="badge">{listing.propertyType}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <h1>{listing.title}</h1>
          <p className="muted">
            {listing.city}
            {listing.address ? `, ${listing.address}` : ""}
          </p>
          <p className="detail-meta">
            {listing.maxGuests} guests · {listing.bedrooms} bedroom(s)
            {listing.numReviews > 0 &&
              ` · ★ ${listing.avgRating} (${listing.numReviews} reviews)`}
          </p>

          <h3>About this place</h3>
          <p>{listing.description}</p>

          {listing.amenities?.length > 0 && (
            <>
              <h3>Amenities</h3>
              <div className="amenities">
                {listing.amenities.map((a) => (
                  <span key={a} className="chip">
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}

          <h3>Hosted by</h3>
          <p>{listing.host?.name}</p>
                    <h3>Location</h3>
          <ListingMap listings={[listing]} height={300} />

          <h3>Reviews</h3>
          {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          {reviews.map((r) => (
            <div className="review" key={r._id}>
              <div className="review-top">
                <strong>{r.guest?.name || "Guest"}</strong>
                <span>{"★".repeat(r.rating)}</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>

        <aside className="booking-box">
          <p className="price">
            <strong>₹{listing.pricePerNight}</strong> / night
          </p>

          {!user && (
            <p className="muted">
              <Link to="/login" className="link">
                Login
              </Link>{" "}
              to book this place.
            </p>
          )}

          {isOwner && <p className="muted">This is your listing.</p>}

          {user && !isOwner && (
            <form onSubmit={handleBook}>
              <DatePicker
                selectsRange
                inline
                startDate={startDate}
                endDate={endDate}
                onChange={handleDates}
                minDate={new Date()}
                excludeDateIntervals={excluded}
              />

              <label className="field-label">Guests</label>
              <input
                type="number"
                min="1"
                max={listing.maxGuests}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="guest-input"
              />

              {nights > 0 && (
                <p className="total">
                  {nights} night(s) × ₹{listing.pricePerNight} ={" "}
                  <strong>₹{total}</strong>
                </p>
              )}

              {bookingError && <p className="error">{bookingError}</p>}
              {success && <p className="success">{success}</p>}

              <button type="submit" disabled={submitting}>
                {submitting ? "Booking..." : "Reserve"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ListingDetail;