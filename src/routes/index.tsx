import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, MessageSquare, Users, Zap, Shield } from 'lucide-react'
import ChatsList from '../components/ChatsList'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <ChatsList />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Real Conversations
            <br />
            <span className="text-blue-600">Without the Noise</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Experience messaging the way it should be: simple, fast, and focused
            on what matters most—your connections.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            <MessageSquare size={24} />
            Start Chatting
            <ArrowRight size={24} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur rounded-xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Lightning Fast
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Messages deliver instantly. No delays, no loading screens—just
              smooth, real-time conversations.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Connect Simply
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Start conversations with ease. Clean interface designed for
              meaningful one-on-one connections.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Secure by Design
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your conversations stay private with secure authentication and
              encrypted messaging.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur rounded-full text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              Join thousands having better conversations
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
