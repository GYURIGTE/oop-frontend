
import "@/styles/globals.css";

import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router";

import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import AuthProvider from "@/context/AuthProvider";
import NotificationsProvider from "@/context/NotificationsProvider";
import ListingsProvider from "@/context/ListingsProvider";
import GuestOnly from "@/components/auth/GuestOnly";
import RequireAuth from "@/components/auth/RequireAuth";
import Dashboard from "@/pages/seller/Dashboard";
import MyListing from "@/pages/seller/MyListing";
import ListingForm from "@/pages/seller/ListingForm";
import BrowseMarket from "@/pages/seller/BrowseMarket";
import MarketListing from "@/pages/seller/MarketListing";
import Messages from "@/pages/seller/Messages";
import MessageListing from "@/pages/seller/MessageListing";
import Profile from "@/pages/seller/Profile";
import Settings from "@/pages/seller/Settings";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationsProvider>
        <ListingsProvider>
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* Authentication Pages */}
            <Route element={<GuestOnly />}>
              <Route path="/auth">
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
              </Route>
            </Route>

            {/* Password reset must work even when a session is still active. */}
            <Route
              path="/auth/reset-password"
              element={<ResetPassword />}
            />

            {/* Seller Workspace */}
            <Route path="/seller" element={<RequireAuth />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="listings" element={<MyListing />} />
              <Route path="listings/new" element={<ListingForm />} />
              <Route
                path="listings/:listingId/edit"
                element={<ListingForm />}
              />
              <Route path="market" element={<BrowseMarket />} />
              <Route path="market/:productId" element={<MarketListing />} />
              <Route path="messages" element={<Messages />} />
              <Route
                path="messages/:conversationId/listing"
                element={<MessageListing />}
              />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Unknown Routes */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </ListingsProvider>
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>,
);
