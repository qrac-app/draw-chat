import { useRef } from 'react'
import { useQuery } from 'convex/react'

// A hook that returns the last value if the current value is undefined (loading)
export const useStableQuery = ((name, ...args) => {
  const result = useQuery(name, ...args)
  const stableResult = useRef(result)

  if (result !== undefined) {
    stableResult.current = result
  }

  return stableResult.current
}) as typeof useQuery;
