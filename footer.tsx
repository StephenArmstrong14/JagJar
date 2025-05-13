import { Link } from "wouter";
import { Twitter, GitPullRequest, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-4">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 rounded-md gradient-bg flex items-center justify-center mr-2">
                  <span className="text-white font-bold">J</span>
                </div>
                <span className="text-xl font-bold">JagJar</span>
              </Link>
            </div>
            <p className="text-neutral-400 mb-4">
              A fair, transparent platform for monetizing web applications based on real user engagement.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <GitPullRequest size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-neutral-400 hover:text-white transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/extension" className="text-neutral-400 hover:text-white transition-colors">Browser Extension</Link>
              </li>
              <li>
                <Link href="/dashboard/integration" className="text-neutral-400 hover:text-white transition-colors">API Documentation</Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Release Notes</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/developers" className="text-neutral-400 hover:text-white transition-colors">Documentation</Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Developer Guide</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">User Guide</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Support</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} JagJar. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Cookies</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Legal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
