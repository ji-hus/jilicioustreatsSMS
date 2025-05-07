
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div>
      <Hero />
      
      {/* About Us Section */}
      <section className="py-16 bg-bakery-beige/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2">
              <div className="h-64 lg:h-96 bg-bakery-cream/50 flex items-center justify-center">
                <div className="text-center p-6 italic text-bakery-brown">
                  Image of our bakery space
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-bakery-brown">Our Microbakery</h2>
              <p className="text-lg text-gray-700">
                Welcome to Ji'licious Treats, a home-based microbakery created with love and passion for artisanal baked goods.
                Each of our products is crafted by hand using carefully selected ingredients and traditional methods.
              </p>
              <p className="text-lg text-gray-700">
                We focus on quality over quantity, which means our menu is small but each item is perfected through years of experience and dedication to the craft.
              </p>
              <Button 
                asChild
                className="mt-4 bg-bakery-brown hover:bg-bakery-light text-white"
              >
                <Link to="/about" className="flex items-center">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <Features />
      
      <About />
      
      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-bakery-brown text-center mb-12">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-bakery-beige/30 h-48 flex items-center justify-center rounded-full w-48 mx-auto mb-4">
                <span className="text-4xl font-serif text-bakery-brown">1</span>
              </div>
              <h3 className="font-serif font-bold text-xl mb-2">Artisanal Methods</h3>
              <p className="text-gray-700">We use traditional techniques and slow fermentation to develop flavor and texture.</p>
            </div>
            <div className="text-center">
              <div className="bg-bakery-beige/30 h-48 flex items-center justify-center rounded-full w-48 mx-auto mb-4">
                <span className="text-4xl font-serif text-bakery-brown">2</span>
              </div>
              <h3 className="font-serif font-bold text-xl mb-2">Quality Ingredients</h3>
              <p className="text-gray-700">We source local, organic ingredients whenever possible for the best flavor.</p>
            </div>
            <div className="text-center">
              <div className="bg-bakery-beige/30 h-48 flex items-center justify-center rounded-full w-48 mx-auto mb-4">
                <span className="text-4xl font-serif text-bakery-brown">3</span>
              </div>
              <h3 className="font-serif font-bold text-xl mb-2">Made With Love</h3>
              <p className="text-gray-700">Every item is handcrafted with care and attention to detail.</p>
            </div>
          </div>
        </div>
      </section>
      
      <Testimonials />
      
      {/* Call to Action Section */}
      <section className="py-16 bg-bakery-brown text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Place a pre-order for pickup and enjoy our freshly baked goods at your convenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-bakery-brown hover:bg-bakery-cream hover:text-bakery-brown"
            >
              <Link to="/menu">View Menu</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-bakery-brown hover:bg-bakery-cream hover:text-bakery-brown"
            >
              <Link to="/order">Place Your Order</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
