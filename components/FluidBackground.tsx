"use client"

import { useEffect, useRef } from 'react'

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const drawHexagon = (x: number, y: number, size: number, mouseX: number, mouseY: number) => {
      const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2)
      const intensity = Math.max(0, 1 - distance / 100)
      const isDark = document.documentElement.classList.contains('dark')
      
      const baseOpacity = isDark ? 0.15 : 0.08
      const hoverOpacity = isDark ? 0.6 : 0.4
      
      ctx.strokeStyle = `rgba(59, 130, 246, ${baseOpacity + intensity * hoverOpacity})`
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const hexSize = 20
      const hexWidth = hexSize * 2
      const hexHeight = hexSize * Math.sqrt(3)
      
      for (let row = 0; row * hexHeight * 0.75 < canvas.height + hexHeight; row++) {
        for (let col = 0; col * hexWidth * 0.75 < canvas.width + hexWidth; col++) {
          const x = col * hexWidth * 0.75 + (row % 2) * hexWidth * 0.375
          const y = row * hexHeight * 0.75
          drawHexagon(x, y, hexSize, mouseRef.current.x, mouseRef.current.y)
        }
      }
      
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