import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import LoginPage from "./LoginPage";
import ErrorPage from "./ErrorPage";
import UserRegisterPage from "./UserRegisterPage";
import HomePage from "./HomePage";
import ForgetPasswordPage from "./ForgetPasswordPage";
import Profile from "./profile";
import Tentang from "./tentang";
import Kontak from "./kontak";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import WishlistPage from "./WishlistPage";
import ChatPage from "./ChatPage";
import FAQ from "./FAQ";
import Terms from "./Terms";
import Privacy from "./Privacy";
import SellerDashboard from "./SellerDashboard";
import SearchPage from './SearchPage';
import ProductsPage from './ProductsPage';
import OrderHistoryPage from './OrderHistoryPage';
import ProductDetail from '../components/ProductDetail';
import PaymentPage from './PaymentPage';

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },  
  {
    path: "/register",
    element: <UserRegisterPage />,
  },
  {
    path: "/forgot",
    element: <ForgetPasswordPage />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/about",
        element: <Tentang />,
      },
      {
        path: "/contact",
        element: <Kontak />,
      },
      {
        path: "/kontak",
        element: <Kontak />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "/seller",
        element: <SellerDashboard />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "/orders",
        element: <OrderHistoryPage />,
      },
      {
        path: "/payment/:orderId?",
        element: <PaymentPage />,
      },
    ],
  },
]);