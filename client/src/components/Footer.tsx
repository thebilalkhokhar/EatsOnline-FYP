import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-10 px-6 shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between text-sm gap-8">
        {/* About Eatsonline */}
        <div className="sm:text-left text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            EATSONLINE
          </h3>
          <p className="max-w-md">
            Delivering fresh and tasty meals right to your doorstep. Quality and
            satisfaction guaranteed.
          </p>
        </div>

        {/* Contact & Social */}
        <div className="sm:text-right text-center space-y-3">
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Mail className="w-4 h-4 text-[#ff5733]" />
            <a
              href="mailto:support@eatsonline.com"
              className="hover:text-[#ff5733] transition-colors duration-200"
            >
              support@eatsonline.com
            </a>
          </div>

          <div className="flex justify-center sm:justify-end space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff5733] transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff5733] transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ff5733] transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-300 dark:border-gray-700" />

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        &copy; 2025 EatsOnline. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
