import { useEffect, useState } from "react";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";
import ListingMap from "../components/ListingMap";

const emptyFilters = { city: "", type: "", guests: "", minPrice: "", maxPrice: "" };

function Home() {
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list");

  useEffect(() => {
    setLoading(true);
    setError("");

    const params = {};
    Object.entries(applied).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    api
      .get("/listings", { params })
      .then((res) => setListings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [applied]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(filters);
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
  };

  return (
    <div className="container">
      <h1>Find your stay</h1>

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleChange}
        />
        <select name="type" value={filters.type} onChange={handleChange}>
          <option value="">Any type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="cabin">Cabin</option>
          <option value="room">Room</option>
        </select>
        <input
          name="guests"
          type="number"
          min="1"
          placeholder="Guests"
          value={filters.guests}
          onChange={handleChange}
        />
        <input
          name="minPrice"
          type="number"
          min="0"
          placeholder="Min ₹"
          value={filters.minPrice}
          onChange={handleChange}
        />
        <input
          name="maxPrice"
          type="number"
          min="0"
          placeholder="Max ₹"
          value={filters.maxPrice}
          onChange={handleChange}
        />
        <button type="submit">Search</button>
        <button type="button" className="secondary" onClick={handleClear}>
          Clear
        </button>
      </form>

      <div className="view-toggle">
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={view === "map" ? "active" : ""}
          onClick={() => setView("map")}
        >
          Map
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading listings...</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="muted">No listings match your search.</p>
      )}

      {view === "list" && (
        <div className="listing-grid">
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}

      {view === "map" && !loading && listings.length > 0 && (
        <ListingMap listings={listings} height={520} />
      )}
    </div>
  );
}

export default Home;