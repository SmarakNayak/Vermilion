import { useEffect, useRef } from "react"

export function useScrollBottom(f: () => void) {
  const bottomRef = useRef(false)

  useEffect(() => {
    let scrollHeight = document.body.scrollHeight

    const onscroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight
      const threshold = window.innerHeight

      const newScrollHeight = document.body.scrollHeight
      const scrollHeightChanged = scrollHeight !== newScrollHeight
      scrollHeight = newScrollHeight

      const isReachBottom = newScrollHeight - threshold <= scrolledTo

      if (isReachBottom && (!bottomRef.current || scrollHeightChanged)) {
        bottomRef.current = true
        f()
      } else if (!isReachBottom) {
        bottomRef.current = false
      }
    }

    window.addEventListener("scroll", onscroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onscroll)
    }
  }, [bottomRef, f]) // added f dependency in case f changes (i.e. in the case of Atom families)
}
// Source: https://github.com/tim-smart/bunnings-lite/blob/b344d4591fe417dd5748608041f852b1eca42a4d/src/lib/useScrollBottom.ts