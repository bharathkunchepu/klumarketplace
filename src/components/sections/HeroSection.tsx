import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Parallax } from 'swiper/modules';

const HeroSection = () => {
  const handleLearnMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector('#how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const slides = [
    {
      id: 1,
      image: 'https://cdn.prod.website-files.com/64dbb284e8fd858cb428eb91/64dbb284e8fd858cb428f0e6_Blog_Hero-1.jpeg',
      title: 'Buy & Sell with',
      subtitle: 'KLU Marketplace',
      description: 'Connect with fellow students, discover great deals, and make the most of your campus experience.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
      title: 'Your Trusted',
      subtitle: 'Campus Marketplace',
      description: 'Find textbooks, electronics, furniture, and more from students just like you.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
      title: 'Sustainable',
      subtitle: 'Student Community',
      description: 'Promote sustainability by buying and selling within your campus community.',
    },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, Parallax]}
        spaceBetween={0}
        slidesPerView={1}
        parallax={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white !opacity-50',
          bulletActiveClass: 'swiper-pagination-bullet-active !opacity-100',
        }}
        navigation={true}
        loop={true}
        speed={800}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat swiper-parallax"
              data-swiper-parallax="-23%"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-royal-blue-900/80 via-royal-blue-800/70 to-royal-blue-900/80"></div>
            </div>
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-h1 md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
                  {slide.title}
                  <span className="text-white block mt-2 drop-shadow-lg">
                    {slide.subtitle}
                  </span>
                </h1>
                <p className="text-body md:text-lg lg:text-xl text-white/90 font-body mb-8 max-w-2xl mx-auto drop-shadow-md">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="bg-royal-blue text-white px-8 py-4 rounded-md hover:bg-royal-blue-600 transition-all duration-300 font-heading font-semibold text-button hover:shadow-lg hover:scale-105 active:scale-95 shadow-xl"
                  >
                    Get Started
                  </Link>
                  <a
                    href="#how-it-works"
                    onClick={handleLearnMore}
                    className="border-2 border-white text-white px-8 py-4 rounded-md hover:bg-white/20 transition-all duration-300 font-heading font-semibold text-button text-center hover:shadow-md backdrop-blur-sm bg-white/10"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Swiper Navigation Styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        .swiper-pagination {
          bottom: 30px !important;
        }
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          margin: 0 6px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          width: 30px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
