import { useEffect } from 'react'

export function useScrollReveal(selector = '.fade-up') {
  useEffect(() => {
    const elements = document.querySelectorAll(selector)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            // Unobserve after triggering — mirrors GSAP toggleActions: 'play none none none'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector])
}
