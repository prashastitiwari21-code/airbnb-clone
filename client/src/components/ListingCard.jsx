import { Link } from "react-router-dom";

function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} className="listing-card">
      <div className="card-banner">
        <span className="badge">{listing.propertyType}</span>
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3>{listing.title}</h3>
          {listing.numReviews > 0 && (
            <span className="rating">★ {listing.avgRating}</span>
          )}
        </div>
        <p className="muted">
          {listing.city} · up to {listing.maxGuests} guests
        </p>
        <p className="price">
          <strong>₹{listing.pricePerNight}</strong> / night
        </p>
      </div>
    </Link>
  );
}

export default ListingCard;