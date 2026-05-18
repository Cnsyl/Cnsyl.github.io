(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 720px)').matches
  if (reduceMotion) return
  document.documentElement.classList.add('js-enabled')

  const canvas = document.getElementById('cyber-canvas')
  const glow = document.querySelector('.cyber-cursor-glow')

  if (canvas && !isMobile) {
    const ctx = canvas.getContext('2d')
    const particles = []
    const count = Math.min(64, Math.floor(window.innerWidth / 24))
    let active = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const reset = p => {
      p.x = Math.random() * window.innerWidth
      p.y = Math.random() * window.innerHeight
      p.vx = (Math.random() - .5) * .18
      p.vy = (Math.random() - .5) * .18
      p.size = Math.random() * 1.4 + .5
      p.alpha = Math.random() * .35 + .18
    }

    resize()
    for (let i = 0; i < count; i++) {
      const p = {}
      reset(p)
      particles.push(p)
    }

    const draw = () => {
      if (!active) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20 || p.x > window.innerWidth + 20 || p.y < -20 || p.y > window.innerHeight + 20) reset(p)

        ctx.beginPath()
        ctx.fillStyle = `rgba(53,247,255,${p.alpha})`
        ctx.shadowColor = 'rgba(53,247,255,.55)'
        ctx.shadowBlur = 8
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const n = particles[j]
          const d = Math.hypot(p.x - n.x, p.y - n.y)
          if (d < 118) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(79,124,255,${(1 - d / 118) * .11})`
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(n.x, n.y)
            ctx.stroke()
          }
        }
      })
      ctx.shadowBlur = 0
      requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', () => {
      active = !document.hidden
      if (active) requestAnimationFrame(draw)
    })
    draw()
  }

  if (glow && !isMobile) {
    let ticking = false
    let x = 0
    let y = 0

    window.addEventListener('pointermove', e => {
      x = e.clientX
      y = e.clientY
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        glow.style.left = `${x}px`
        glow.style.top = `${y}px`
        glow.style.opacity = '1'
        ticking = false
      })
    }, { passive: true })

    window.addEventListener('pointerleave', () => {
      glow.style.opacity = '0'
    })
  }

  const targets = document.querySelectorAll('.cyber-reveal, .lobster-section, .lobster-feature-card, .lobster-visual-card, .lobster-architecture-step')
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: .1, rootMargin: '0px 0px -5% 0px' })
    targets.forEach(t => observer.observe(t))
  } else {
    targets.forEach(t => t.classList.add('is-visible'))
  }

  window.addEventListener('click', e => {
    if (isMobile) return
    const ripple = document.createElement('span')
    ripple.className = 'cyber-ripple'
    ripple.style.left = `${e.clientX}px`
    ripple.style.top = `${e.clientY}px`
    document.body.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  })
})()
