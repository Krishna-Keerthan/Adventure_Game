import { useState, useEffect, useRef } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function TypewriterText({
  text,
  speed = 28,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const prevTextRef = useRef("")

  useEffect(() => {
    // Reset when text changes
    if (text !== prevTextRef.current) {
      prevTextRef.current = text
      setDisplayed("")
      setDone(false)
      indexRef.current = 0
    }

    if (done) return

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current += 1
      } else {
        setDone(true)
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, done, onComplete])

  return (
    <span className={`${className} ${!done ? "typewriter-cursor" : ""}`}>
      {displayed}
    </span>
  )
}