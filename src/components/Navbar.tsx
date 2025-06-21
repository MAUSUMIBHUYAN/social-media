import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const { signInWithGitHub, signInWithGoogle, signOut, user } = useAuth();

  const displayName = user?.user_metadata?.full_name || 
                     user?.user_metadata?.name || 
                     user?.user_metadata?.user_name || 
                     user?.email;

  const avatarUrl = user?.user_metadata?.avatar_url || 
                   user?.user_metadata?.picture ||
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || '')}&background=random`;

  return (
    <nav className="fixed top-0 w-full z-40 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-mono text-xl font-bold text-white">
            Zappy<span className="text-purple-500">.app</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Create Post
            </Link>
            {user && (
              <Link
                to="/my-posts"
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                My Posts
              </Link>
            )}
            <Link
              to="/communities"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Communities
            </Link>
            <Link
              to="/community/create"
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              Create Community
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || '')}&background=random`;
                    }}
                  />
                  <span className="text-gray-300 text-sm">{displayName}</span>
                </div>
                <button
                  onClick={signOut}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 border border-gray-700 hover:border-gray-600 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 border border-gray-700 hover:border-gray-600 cursor-pointer"
                >
                  Sign In
                </button>
                
                {authDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          signInWithGitHub();
                          setAuthDropdownOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>GitHub</span>
                      </button>
                      <button
                        onClick={() => {
                          signInWithGoogle();
                          setAuthDropdownOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <FcGoogle className="w-4 h-4" />
                        <span>Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Create Post
            </Link>
            {user && (
              <Link
                to="/my-posts"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                My Posts
              </Link>
            )}
            <Link
              to="/communities"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Communities
            </Link>
            <Link
              to="/community/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Create Community
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-800">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || '')}&background=random`;
                      }}
                    />
                    <span className="text-gray-300 text-sm">{displayName}</span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      signInWithGitHub();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Sign in with GitHub</span>
                  </button>
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    <FcGoogle className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};