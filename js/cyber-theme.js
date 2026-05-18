(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  const ensureLayerOrder = () => {
    const wrap = document.querySelector('#body-wrap')
    if (wrap) wrap.style.position = 'relative'
  }

  const createCursorGlow = () => {
    const glow = document.createElement('div')
    glow.className = 'cyber-cursor-glow'
    glow.style.opacity = '0'
    document.body.appendChild(glow)

    let visible = false
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`
      glow.style.top = `${event.clientY}px`
      if (!visible) {
        glow.style.opacity = '1'
        visible = true
      }
    }, { passive: true })

    window.addEventListener('pointerleave', () => {
      glow.style.opacity = '0'
      visible = false
    })
  }

  const createParticleCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.className = 'cyber-canvas'
    document.body.prepend(canvas)

    const ctx = canvas.getContext('2d')
    const particles = []
    const particleCount = Math.min(90, Math.floor(window.innerWidth / 18))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const resetParticle = particle => {
      particle.x = Math.random() * window.innerWidth
      particle.y = Math.random() * window.innerHeight
      particle.vx = (Math.random() - 0.5) * 0.28
      particle.vy = (Math.random() - 0.5) * 0.28
      particle.size = Math.random() * 1.8 + 0.6
      particle.alpha = Math.random() * 0.5 + 0.25
    }

    resize()
    for (let i = 0; i < particleCount; i += 1) {
      const particle = {}
      resetParticle(particle)
      particles.push(particle)
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < -20 || particle.x > window.innerWidth + 20 || particle.y < -20 || particle.y > window.innerHeight + 20) {
          resetParticle(particle)
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(53, 247, 255, ${particle.alpha})`
        ctx.shadowColor = 'rgba(53, 247, 255, 0.75)'
        ctx.shadowBlur = 10
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = index + 1; j < particles.length; j += 1) {
          const next = particles[j]
          const dx = particle.x - next.x
          const dy = particle.y - next.y
          const distance = Math.hypot(dx, dy)
          if (distance < 128) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(79, 124, 255, ${(1 - distance / 128) * 0.16})`
            ctx.lineWidth = 1
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(next.x, next.y)
            ctx.stroke()
          }
        }
      })

      ctx.shadowBlur = 0
      requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize, { passive: true })
    draw()
  }

  const createReveal = () => {
    const targets = document.querySelectorAll('#recent-posts > .recent-post-item, .card-widget, #page, #post, .cnsyl-card-grid > div, .lobster-section, .lobster-feature-card, .lobster-visual-card, .lobster-architecture-step')
    targets.forEach(target => target.classList.add('cyber-reveal'))

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    targets.forEach(target => observer.observe(target))
  }

  const createClickRipple = () => {
    window.addEventListener('click', event => {
      const ripple = document.createElement('span')
      ripple.className = 'cyber-ripple'
      ripple.style.left = `${event.clientX}px`
      ripple.style.top = `${event.clientY}px`
      document.body.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    })
  }

  const boot = () => {
    ensureLayerOrder()
    createParticleCanvas()
    createCursorGlow()
    createReveal()
    createClickRipple()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }
})()
