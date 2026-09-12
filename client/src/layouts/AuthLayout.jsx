import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;