import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Reviews = () => {
  const reviews = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      rating: 5,
      comment: 'Found my textbooks for this semester at half the price! The seller was super friendly and we met right on campus. Highly recommend!',
    },
    {
      name: 'Michael Chen',
      role: 'Business Student',
      rating: 5,
      comment: 'Sold my old laptop in just 2 days. The platform is easy to use and the buyer was genuine. Great experience overall.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Engineering Student',
      rating: 5,
      comment: 'Love how easy it is to browse items by category. Found the perfect desk for my dorm room. The community here is amazing!',
    },
    {
      name: 'David Kim',
      role: 'Arts Student',
      rating: 5,
      comment: 'As a seller, I appreciate how simple the listing process is. Sold multiple items and made some great connections with buyers.',
    },
  ];

  return (
    <section id="reviews" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-h2 md:text-3xl font-heading font-semibold text-gray-900 mb-4">
            What Students Say
          </h2>
          <p className="text-body text-gray-600 font-body max-w-2xl mx-auto">
            Hear from our community of satisfied buyers and sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review, index) => {
            const colors = ['royal-blue', 'coral', 'teal', 'amber'];
            const color = colors[index % colors.length];
            const colorClasses: Record<string, string> = {
              'royal-blue': 'border-royal-blue-200 bg-gradient-to-br from-royal-blue-50 to-white',
              'coral': 'border-coral-200 bg-gradient-to-br from-coral-50 to-white',
              'teal': 'border-teal-200 bg-gradient-to-br from-teal-50 to-white',
              'amber': 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
            };
            const starColors: Record<string, string> = {
              'royal-blue': 'text-royal-blue',
              'coral': 'text-coral',
              'teal': 'text-teal',
              'amber': 'text-amber',
            };
            return (
              <div
                key={index}
                className={`p-6 rounded-lg border ${colorClasses[color]} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center mb-4">
                  <div className={`flex ${starColors[color]} gap-1`}>
                    {[...Array(review.rating)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-lg" />
                    ))}
                  </div>
                </div>
                <p className="text-body text-gray-700 font-body mb-4 italic">
                  "{review.comment}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-heading font-semibold text-gray-900 text-body">
                    {review.name}
                  </p>
                  <p className="text-body-sm text-gray-600 font-body">
                    {review.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Reviews;

