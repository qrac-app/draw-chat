import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import ConvexProvider from '../integrations/convex/provider'

import appCss from '../styles.css?url'
import { AuthProvider } from '@/contexts/AuthContext'
import { MessagesProvider } from '@/contexts/MessagesContext'
import { ChatCacheProvider } from '@/contexts/ChatCacheContext'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { InstallPrompt } from '@/components/InstallPrompt'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#0d0d0d',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'msapplication-TileColor',
        content: '#0d0d0d',
      },
      {
        name: 'msapplication-config',
        content: '/browserconfig.xml',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Chat App',
      },
      {
        name: 'description',
        content: 'A modern real-time chat application with offline support',
      },
      {
        title: 'Chat App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only register service worker in production
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <OfflineIndicator />
        <InstallPrompt />
        <ConvexProvider>
          <AuthProvider>
            <ChatCacheProvider>
              <MessagesProvider>{children}</MessagesProvider>
            </ChatCacheProvider>
          </AuthProvider>
          {/* <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />*/}
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
