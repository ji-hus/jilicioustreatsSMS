
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bakery-cream/30">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-serif font-bold text-bakery-brown mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! We can't find the page you're looking for</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-bakery-brown hover:bg-bakery-light">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
