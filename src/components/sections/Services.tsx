import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faDollarSign, faSearch, faComments } from '@fortawesome/free-solid-svg-icons';

const Services = () => {
  const services = [
    {
      icon: faShoppingCart,
      title: 'Buy Items',
      description: 'Browse through thousands of items from fellow students. Find textbooks, electronics, furniture, and more at great prices.',
      color: 'royal-blue',
    },
    {
      icon: faDollarSign,
      title: 'Sell Items',
      description: 'List your unused items and turn them into cash. Easy listing process with photo uploads and detailed descriptions.',
      color: 'coral',
    },
    {
      icon: faSearch,
      title: 'Browse Categories',
      description: 'Explore items by category - Electronics, Books, Clothing, Furniture, Sports, and more. Find exactly what you need.',
      color: 'teal',
    },
    {
      icon: faComments,
      title: 'Connect & Chat',
      description: 'Message sellers directly, ask questions, negotiate prices, and arrange safe meetups on campus.',
      color: 'amber',
    },
  ];

  return (
    <section id="services" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-3xl font-heading font-semibold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-body text-gray-600 font-body max-w-2xl mx-auto">
            Everything you need to buy and sell within the KLU community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const colorClasses: Record<string, string> = {
              'royal-blue': 'text-royal-blue hover:border-royal-blue',
              'coral': 'text-coral hover:border-coral',
              'teal': 'text-teal hover:border-teal',
              'amber': 'text-amber hover:border-amber',
            };
            return (
              <div
                key={index}
                className={`bg-white p-8 rounded-lg border border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorClasses[service.color]}`}
              >
                <div className="mb-4 flex justify-center">
                  <FontAwesomeIcon icon={service.icon} className={`text-5xl ${colorClasses[service.color].split(' ')[0]}`} />
                </div>
                <h3 className="text-h3 font-heading font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-body-sm text-gray-600 font-body">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;

