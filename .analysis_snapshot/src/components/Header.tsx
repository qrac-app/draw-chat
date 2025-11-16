import { Link } from '@tanstack/react-router'
import { List, LogOut, MessageSquare, Settings, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const { isAuthenticated, signOut, user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Chat App
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chats"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  activeProps={{
                    className:
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors',
                  }}
                >
                  <List size={18} />
                  <span>My Chats</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  activeProps={{
                    className:
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors',
                  }}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>

                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {user?.displayName || user?.username}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <MessageSquare size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
