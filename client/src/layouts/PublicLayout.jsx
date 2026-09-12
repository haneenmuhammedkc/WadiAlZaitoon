import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
