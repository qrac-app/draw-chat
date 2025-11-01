import { UserIdentity } from 'convex/server'
import { Id } from '../_generated/dataModel'


export function getUserIdfromAuthIdentity(identity: UserIdentity) {
  return identity.subject.split('|')[0] as Id<'users'>;
}

