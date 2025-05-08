import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Index';
import MenuPage from './pages/Menu';
import OrderPage from './pages/Order';
import BulkOrderPage from './pages/BulkOrder';
import FAQPage from './pages/FAQ';
import ContactPage from './pages/Contact';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
      <Route path="/order" element={<Layout><OrderPage /></Layout>} />
      <Route path="/bulk-order" element={<Layout><BulkOrderPage /></Layout>} />
      <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 