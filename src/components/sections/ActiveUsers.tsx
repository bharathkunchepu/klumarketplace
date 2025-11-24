import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBox, faCheckCircle, faStar } from '@fortawesome/free-solid-svg-icons';

const ActiveUsers = () => {
  const stats = [
    {
      number: '10,000+',
      label: 'Active Users',
      icon: faUsers,
    },
    {
      number: '5,000+',
      label: 'Items Listed',
      icon: faBox,
    },
    {
      number: '2,500+',
      label: 'Successful Sales',
      icon: faCheckCircle,
    },
    {
      number: '98%',
      label: 'Satisfaction Rate',
      icon: faStar,
    },
  ];

  return (
    <section className="bg-royal-blue py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-h2 md:text-3xl font-heading font-semibold text-white mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-body text-royal-blue-100 font-body max-w-2xl mx-auto">
            Thousands of students trust KLU Marketplace for their buying and selling needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="mb-4 flex justify-center">
                <FontAwesomeIcon icon={stat.icon} className="text-4xl text-white" />
              </div>
              <div className="text-price md:text-4xl font-heading font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-body-sm text-royal-blue-100 font-body">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveUsers;

