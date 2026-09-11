import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "../Routes/AdminRoute";
import PrivateRoute from "../Routes/PrivateRoute";

import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/auth/Login";
import Home from "../pages/landing/Home";
import Hotels from "../pages/hotel/Hotels";

import BookingLayout from "../components/layout/BookingLayout";
import TravelDetails from "../pages/booking/TravelDetails";
import HotelRoom from "../pages/booking/HotelRoom";
import AddOns from "../pages/booking/AddOns";
import TravellerDetails from "../pages/booking/TravellerDetails";
import ReviewBooking from "../pages/booking/ReviewBooking";
import PaymentStep from "../pages/booking/PaymentStep";
import BookingConfirmation from "../pages/booking/BookingConfirmation";

import Register from "../pages/auth/Register";
import Profile from "../pages/profile/Profile";
import Package from "../pages/package/Package";
import RatingsPage from "../pages/RatingsPage";
import HotelDetails from "../pages/hotel/HotelDetails";
import UpdatePackage from "../pages/admin/UpdatePackage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PackageDetails from "../pages/package/PackageDetails";
import PackageCollectionPage from "../pages/package/PackageCollectionPage";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLayout from "../components/layout/AdminLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC WEBSITE ROUTES (Wrapped in PublicLayout with Header & Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/search" element={<Package />} />
          <Route path="/packages" element={<PackageCollectionPage />} />
          <Route path="/packages/all" element={<Package />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/reviews" element={<RatingsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/package/ratings/:id" element={<RatingsPage />} />

          {/* User Protected Routes */}
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="user" element={<Profile />} />
          </Route>

          {/* User 7-Step Booking Checkout Flow */}
          <Route path="/booking" element={<PrivateRoute />}>
            <Route path=":packageId" element={<BookingLayout />}>
              <Route index element={<Navigate to="travel" replace />} />
              <Route path="travel" element={<TravelDetails />} />
              <Route path="hotel" element={<HotelRoom />} />
              <Route path="add-ons" element={<AddOns />} />
              <Route path="travellers" element={<TravellerDetails />} />
              <Route path="review" element={<ReviewBooking />} />
              <Route path="payment" element={<PaymentStep />} />
              <Route path="confirmation" element={<BookingConfirmation />} />
            </Route>
          </Route>
        </Route>

        {/* ADMIN APPLICATION ROUTES (NO Public Header / NO Public Footer) */}
        <Route path="/profile" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/update-package/:id" element={<UpdatePackage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;