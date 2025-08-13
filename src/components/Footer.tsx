import { ZapIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-black/80 backdrop-blur-sm">
      {/* Top border glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="Elite Gym Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">
                ELITE GYM
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} EliteGym - All rights reserved
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2 text-sm">
            <Link
              href="/about"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/blog"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/help"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Help
            </Link>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-700 rounded-md bg-black/50">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-mono text-white">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
