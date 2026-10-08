import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const empty = {
  title: "",
  description: "",
  pricePerNight: "",
  city: "",
  address: "",
  propertyType: "apartment",
  maxGuests: 2,
  bedrooms: 1,
  lat: "",
  lng: "",
  amenities: "",
};

function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/listings/${id}`)
      .then((res) => {
        const l = res.data;
        setForm({
          title: l.title,
          description: l.description,
          pricePerNight: l.pricePerNight,
          city: l.city,
          address: l.address || "",
          propertyType: l.propertyType,
          maxGuests: l.maxGuests,
          bedrooms: l.bedrooms,
          lat: l.lat ?? "",
          lng: l.lng ?? "",
          amenities: (l.amenities || []).join(", "),
        });
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load listing")
      )
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      pricePerNight: Number(form.pricePerNight),
      city: form.city,
      address: form.address,
      propertyType: form.propertyType,
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };
    if (form.lat !== "") payload.lat = Number(form.lat);
    if (form.lng !== "") payload.lng = Number(form.lng);

    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, payload);
      } else {
        await api.post("/listings", payload);
      }
      navigate("/host");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container muted">Loading...</div>;

  return (
    <div className="container">
      <Link to="/host" className="back-link">
        ← Back to my listings
      </Link>

      <form className="listing-form" onSubmit={handleSubmit}>
        <h2>{isEdit ? "Edit listing" : "Add a new listing"}</h2>

        {error && <p className="error">{error}</p>}

        <label className="field-label">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label className="field-label">Description</label>
        <textarea
          name="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <div>
            <label className="field-label">Price per night (₹)</label>
            <input
              name="pricePerNight"
              type="number"
              min="1"
              value={form.pricePerNight}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="field-label">Type</label>
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="cabin">Cabin</option>
              <option value="room">Room</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label className="field-label">City</label>
            <input name="city" value={form.city} onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">Address (optional)</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label className="field-label">Max guests</label>
            <input
              name="maxGuests"
              type="number"
              min="1"
              value={form.maxGuests}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="field-label">Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              min="1"
              value={form.bedrooms}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label className="field-label">Latitude (for the map)</label>
            <input
              name="lat"
              type="number"
              step="any"
              value={form.lat}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="field-label">Longitude (for the map)</label>
            <input
              name="lng"
              type="number"
              step="any"
              value={form.lng}
              onChange={handleChange}
            />
          </div>
        </div>

        <label className="field-label">Amenities (separate with commas)</label>
        <input
          name="amenities"
          placeholder="wifi, kitchen, parking"
          value={form.amenities}
          onChange={handleChange}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create listing"}
        </button>
      </form>
    </div>
  );
}

export default ListingForm;