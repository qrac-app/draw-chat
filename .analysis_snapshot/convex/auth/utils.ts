import type { UserIdentity } from 'convex/server'
import type { Id } from '../_generated/dataModel'

export function getUserIdfromAuthIdentity(identity: UserIdentity) {
  return identity.subject.split('|')[0] as Id<'users'>
}
