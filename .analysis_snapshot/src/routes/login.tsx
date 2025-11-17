import { createFileRoute } from '@tanstack/react-router'
import { MessageCircle, Sparkles, Users, Zap } from 'lucide-react'
import { SignInWithGoogle } from '@/components/auth/SignInWithGoogle'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="relative max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900">Drawing Chat</h1>
          </div>
          <p className="text-gray-600 text-lg mb-2">
            Connect, Create, and Chat
          </p>
          <p className="text-gray-500 text-sm">
            Sign in to start drawing and messaging with friends
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Zap className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              Real-time Chat
            </h3>
            <p className="text-gray-500 text-xs">
              Instant messaging with drawing support
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Sparkles className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              Draw Together
            </h3>
            <p className="text-gray-500 text-xs">
              Share drawings and express yourself
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Users className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              Profile Setup
            </h3>
            <p className="text-gray-500 text-xs">
              Customize your username and avatar
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <MessageCircle className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              Easy Access
            </h3>
            <p className="text-gray-500 text-xs">
              Sign in with Google in seconds
            </p>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-gray-900 text-lg font-semibold mb-4 text-center">
            Get Started Now
          </h2>
          <SignInWithGoogle />
          <p className="text-gray-500 text-xs text-center mt-4">
            By signing in, you agree to create a profile and join our community
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <a
              href="/chat"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Go to chat
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
