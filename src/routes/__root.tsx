import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import ConvexProvider from '../integrations/convex/provider'

import appCss from '../styles.css?url'
import { AuthProvider } from '@/contexts/AuthContext'
import { MessagesProvider } from '@/contexts/MessagesContext'
import { ChatCacheProvider } from '@/contexts/ChatCacheContext'

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
        title: 'Chat App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
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
