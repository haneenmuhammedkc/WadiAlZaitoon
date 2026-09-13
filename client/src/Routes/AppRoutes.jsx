import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "../Routes/AdminRoute";
import PrivateRoute from "../Routes/PrivateRoute";

import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyResetOtp from "../pages/auth/VerifyResetOtp";
import ResetPassword from "../pages/auth/ResetPassword";

import Home from "../pages/landing/Home";
import Hotels from "../pages/hotel/Hotels";

import BookingLayout from "../layouts/BookingLayout";
import TravelDetails from "../pages/booking/TravelDetails";
import HotelRoom from "../pages/booking/HotelRoom";
import AddOns from "../pages/booking/AddOns";
import TravellerDetails from "../pages/booking/TravellerDetails";
import ReviewBooking from "../pages/booking/ReviewBooking";
import PaymentStep from "../pages/booking/PaymentStep";
import BookingConfirmation from "../pages/booking/BookingConfirmation";

import Profile from "../pages/profile/Profile";
import Package from "../pages/package/Package";
import RatingsPage from "../pages/RatingsPage";
import HotelDetails from "../pages/hotel/HotelDetails";
import UpdatePackage from "../pages/admin/UpdatePackage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProfile from "../pages/admin/AdminProfile";
import PackageDetails from "../pages/package/PackageDetails";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTHENTICATION ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Package />} />
          <Route path="/packages" element={<Package />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/reviews" element={<RatingsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/package/ratings/:id" element={<RatingsPage />} />

          {/* User Protected Routes */}
          <Route path="/profile" element={<PrivateRoute allowAdmin={false} />}>
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

        {/* ADMIN ROUTES */}
        <Route path="/profile" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/profile" element={<AdminProfile />} />
            <Route path="admin/update-package/:id" element={<UpdatePackage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;