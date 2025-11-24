import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const AboutUs = () => {
  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-h2 md:text-3xl font-heading font-semibold text-gray-900 mb-6">
              About Us
            </h2>
            <div className="space-y-4 text-gray-700 font-body">
              <p className="text-body">
                KLU Marketplace is a student-driven platform designed to foster a vibrant community
                of buyers and sellers within the KLU campus. We believe in creating sustainable
                practices by encouraging the reuse and resale of items among students.
              </p>
              <p className="text-body">
                Our mission is to make it easy for students to find what they need, sell what they
                don't use, and build connections within the campus community. Whether you're looking
                for textbooks, electronics, furniture, or clothing, KLU Marketplace is your
                one-stop solution.
              </p>
              <p className="text-body">
                We're committed to providing a safe, user-friendly platform that promotes
                sustainability and community engagement. Join thousands of students who are already
                making the most of their campus experience through KLU Marketplace.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-gradient-to-br from-royal-blue-50 to-teal-50 p-8 rounded-lg border border-royal-blue-100 shadow-sm">
              <h3 className="text-h3 font-heading font-semibold text-royal-blue mb-4">
                Our Vision
              </h3>
              <p className="text-body text-gray-700 font-body mb-6">
                To become the leading campus marketplace platform, connecting students and
                promoting sustainable consumption practices across universities.
              </p>
              <h3 className="text-h3 font-heading font-semibold text-royal-blue mb-4">
                Our Values
              </h3>
              <ul className="space-y-2 text-body text-gray-700 font-body">
                <li className="flex items-start group">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-royal-blue mr-2 mt-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:text-royal-blue transition-colors">Community First</span>
                </li>
                <li className="flex items-start group">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-teal mr-2 mt-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:text-teal transition-colors">Sustainability</span>
                </li>
                <li className="flex items-start group">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-coral mr-2 mt-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:text-coral transition-colors">Trust & Safety</span>
                </li>
                <li className="flex items-start group">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-amber mr-2 mt-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:text-amber transition-colors">User Experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

