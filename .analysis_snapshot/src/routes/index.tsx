import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, MessageSquare, Users, Zap, Palette } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Real Conversations
            <br />
            <span className="text-blue-600">Without the Noise</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
            Experience messaging the way it should be: simple, fast, and focused
            on what matters most—your connections.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg"
          >
            <MessageSquare size={20} className="sm:size-24" />
            Start Chatting
            <ArrowRight size={20} className="sm:size-24" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Lightning Fast
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Messages deliver instantly. No delays, no loading screens—just
              smooth, real-time conversations.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Connect Simply
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Start conversations with ease. Clean interface designed for
              meaningful one-on-one connections.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-6 sm:p-8 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Palette className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Draw & Chat
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Express yourself beyond words. Draw sketches, diagrams, or doodles
              and share them instantly in your conversations.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/60 backdrop-blur rounded-full text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-sm sm:text-base">
              Join thousands having better conversations
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
