
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div>
      <Hero />
      <Features />
      <About />
      <Testimonials />
      
      {/* Call to Action Section */}
      <section className="py-16 bg-bakery-brown text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Place a pre-order for pickup and enjoy our freshly baked goods at your convenience.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-bakery-brown hover:bg-bakery-cream hover:text-bakery-brown"
          >
            <Link to="/order">Place Your Order</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
