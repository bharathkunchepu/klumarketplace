import HeroSection from '../components/sections/HeroSection';
import HowItWorks from '../components/sections/HowItWorks';
import AboutUs from '../components/sections/AboutUs';
import Services from '../components/sections/Services';
import Reviews from '../components/sections/Reviews';
import ActiveUsers from '../components/sections/ActiveUsers';

const Home = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <HowItWorks />
      <AboutUs />
      <Services />
      <Reviews />
      <ActiveUsers />
    </div>
  );
};

export default Home;

