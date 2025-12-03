"use client"

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3
        })
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    resize()
    window.addEventListener('resize', resize)

    const drawHexagon = (x: number, y: number, size: number, mouseX: number, mouseY: number, time: number) => {
      const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2)
      const intensity = Math.max(0, 1 - distance / 150)
      const pulse = Math.sin(time * 0.002 + distance * 0.01) * 0.3 + 0.7
      const isDark = document.documentElement.classList.contains('dark')

      const baseOpacity = isDark ? 0.1 : 0.05
      const hoverOpacity = isDark ? 0.4 : 0.3

      ctx.strokeStyle = `rgba(59, 130, 246, ${(baseOpacity + intensity * hoverOpacity) * pulse})`
      ctx.lineWidth = intensity * 2 + 0.5

      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const px = x + size * Math.cos(angle)
        const py = y + size * Math.sin(angle)
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }

    const drawParticles = () => {
      const isDark = document.documentElement.classList.contains('dark')

      particlesRef.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.y = particle.y < 0 ? canvas.height : 0
        }

        const mouseDistance = Math.sqrt((particle.x - mouseRef.current.x) ** 2 + (particle.y - mouseRef.current.y) ** 2)
        const mouseEffect = Math.max(0, 1 - mouseDistance / 120)
        const finalOpacity = particle.opacity + mouseEffect * 0.4

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 51, 234, ${finalOpacity * (isDark ? 0.7 : 0.5)})`
        ctx.fill()
      })
    }

    const animate = () => {
      timeRef.current += 16
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const hexSize = 20
      const hexWidth = hexSize * 2
      const hexHeight = hexSize * Math.sqrt(3)

      for (let row = 0; row * hexHeight * 0.75 < canvas.height + hexHeight; row++) {
        for (let col = 0; col * hexWidth * 0.75 < canvas.width + hexWidth; col++) {
          const x = col * hexWidth * 0.75 + (row % 2) * hexWidth * 0.375
          const y = row * hexHeight * 0.75
          drawHexagon(x, y, hexSize, mouseRef.current.x, mouseRef.current.y, timeRef.current)
        }
      }

      drawParticles()
      requestAnimationFrame(animate)
    }
    animate()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />
}