import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faList, faComments, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      icon: faUserPlus,
      title: 'Sign Up',
      description: 'Create your account with your KLU email and university ID to join the marketplace community.',
    },
    {
      number: '2',
      icon: faList,
      title: 'Browse or List',
      description: 'Explore items from fellow students or list your own items for sale with photos and details.',
    },
    {
      number: '3',
      icon: faComments,
      title: 'Connect',
      description: 'Message sellers directly, negotiate prices, and arrange meetups on campus.',
    },
    {
      number: '4',
      icon: faCheckCircle,
      title: 'Complete Transaction',
      description: 'Meet up safely on campus, exchange items, and enjoy your new purchase or successful sale.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-3xl font-heading font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-body text-gray-600 font-body max-w-2xl mx-auto">
            Getting started is simple. Follow these easy steps to begin buying and selling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-royal-blue text-white rounded-full flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                <FontAwesomeIcon icon={step.icon} className="text-2xl" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-body-sm font-heading font-semibold text-royal-blue">STEP {step.number}</span>
              </div>
              <h3 className="text-h3 font-heading font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-body-sm text-gray-600 font-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

