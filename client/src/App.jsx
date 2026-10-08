import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetail from "./pages/ListingDetail";
import MyBookings from "./pages/MyBookings";
import HostDashboard from "./pages/HostDashboard";
import ListingForm from "./pages/ListingForm";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host"
          element={
            <ProtectedRoute role="host">
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/new"
          element={
            <ProtectedRoute role="host">
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/edit/:id"
          element={
            <ProtectedRoute role="host">
              <ListingForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;