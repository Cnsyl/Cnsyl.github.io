(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 720px)').matches
  const hero = document.querySelector('.home-hero')
  const heroVideo = hero && hero.querySelector('.home-hero-video')

  if (hero && hero.dataset.heroPoster) {
    hero.style.setProperty('--hero-poster-image', `url("${hero.dataset.heroPoster}")`)
  }

  const useHeroPoster = () => {
    if (!hero) return
    hero.classList.add('hero-static')
    if (heroVideo) {
      heroVideo.pause()
      heroVideo.removeAttribute('autoplay')
    }
  }

  // Keep a deterministic poster fallback for reduced-motion, mobile, and autoplay failures.
  if (heroVideo) {
    heroVideo.addEventListener('error', useHeroPoster, { once: true })
    if (reduceMotion || isMobile) {
      useHeroPoster()
    } else {
      const startVideo = () => {
        const playRequest = heroVideo.play()
        if (playRequest && typeof playRequest.catch === 'function') {
          playRequest.catch(useHeroPoster)
        }
      }
      // play() explicitly starts loading despite preload="none". This keeps
      // mobile and no-JS poster fallbacks from downloading the film while
      // preserving muted autoplay on capable desktop browsers.
      startVideo()
    }
  }

  const orbitNodes = hero ? hero.querySelectorAll('.orbit-node') : []
  const orbitPanel = hero && hero.querySelector('.hero-side-note')
  const orbitPanelIndex = orbitPanel && orbitPanel.querySelector('[data-orbit-index]')
  const orbitPanelTitle = orbitPanel && orbitPanel.querySelector('[data-orbit-title]')
  const orbitPanelDescription = orbitPanel && orbitPanel.querySelector('[data-orbit-description]')
  const orbitPanelLink = orbitPanel && orbitPanel.querySelector('[data-orbit-link]')
  const orbitPanelLinkLabel = orbitPanel && orbitPanel.querySelector('[data-orbit-link-label]')

  const renderOrbitPanel = node => {
    if (!orbitPanel) return
    const data = node ? node.dataset : {
      index: orbitPanel.dataset.defaultIndex,
      title: orbitPanel.dataset.defaultTitle,
      description: orbitPanel.dataset.defaultDescription,
      linkLabel: orbitPanel.dataset.defaultLinkLabel
    }
    if (orbitPanelIndex) orbitPanelIndex.textContent = data.index || orbitPanel.dataset.defaultIndex
    if (orbitPanelTitle) orbitPanelTitle.textContent = data.title || orbitPanel.dataset.defaultTitle
    if (orbitPanelDescription) orbitPanelDescription.textContent = data.description || orbitPanel.dataset.defaultDescription
    if (orbitPanelLink) orbitPanelLink.href = node ? node.href : orbitPanel.dataset.defaultHref
    if (orbitPanelLinkLabel) orbitPanelLinkLabel.textContent = data.linkLabel || orbitPanel.dataset.defaultLinkLabel
  }

  const setOrbitActive = node => {
    if (!hero || !node) return
    const id = node.dataset.orbit
    if (!id) return
    hero.dataset.orbitActive = id
    orbitNodes.forEach(item => item.classList.toggle('is-active', item === node))
    renderOrbitPanel(node)
  }

  const clearOrbitActive = node => {
    if (!hero || !node) return
    // A blur from one node can arrive immediately after focus moves to the
    // next node. Keep the newly focused node active instead of clearing the
    // shared state from the stale blur callback.
    const focusedNode = [...orbitNodes].find(item => item === document.activeElement)
    if (hero.querySelector('.orbit-node:hover') || focusedNode) return
    // Pointer hover and keyboard focus may have activated different nodes.
    // Once neither input owns the state, clear the shared marker and every
    // visual node together so the panel and highlighted rail cannot disagree.
    delete hero.dataset.orbitActive
    orbitNodes.forEach(item => item.classList.remove('is-active'))
    renderOrbitPanel()
  }

  orbitNodes.forEach(node => {
    node.addEventListener('pointerenter', () => setOrbitActive(node), { passive: true })
    node.addEventListener('pointerleave', () => clearOrbitActive(node), { passive: true })
    node.addEventListener('focus', () => setOrbitActive(node))
    node.addEventListener('blur', () => {
      window.setTimeout(() => clearOrbitActive(node), 0)
    })
  })

  if (hero && !isMobile && !reduceMotion) {
    let parallaxFrame = 0
    let pointerX = 0
    let pointerY = 0

    const resetParallax = () => {
      hero.style.setProperty('--hero-parallax-x', '0px')
      hero.style.setProperty('--hero-parallax-y', '0px')
      hero.style.setProperty('--hero-layer-x', '0px')
      hero.style.setProperty('--hero-layer-y', '0px')
    }

    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width - .5)
      pointerY = ((event.clientY - rect.top) / rect.height - .5)
      if (parallaxFrame) return
      parallaxFrame = window.requestAnimationFrame(() => {
        hero.style.setProperty('--hero-parallax-x', `${(pointerX * 12).toFixed(2)}px`)
        hero.style.setProperty('--hero-parallax-y', `${(pointerY * 8).toFixed(2)}px`)
        hero.style.setProperty('--hero-layer-x', `${(pointerX * 4).toFixed(2)}px`)
        hero.style.setProperty('--hero-layer-y', `${(pointerY * 3).toFixed(2)}px`)
        parallaxFrame = 0
      })
    }, { passive: true })

    hero.addEventListener('pointerleave', () => {
      if (parallaxFrame) {
        window.cancelAnimationFrame(parallaxFrame)
        parallaxFrame = 0
      }
      resetParallax()
    }, { passive: true })
  }

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

  if (heroVideo && !isMobile) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        heroVideo.pause()
      } else if (!hero.classList.contains('hero-static')) {
        const playRequest = heroVideo.play()
        if (playRequest && typeof playRequest.catch === 'function') playRequest.catch(useHeroPoster)
      }
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
    if (isMobile || !e.target.closest('a, button')) return
    const ripple = document.createElement('span')
    ripple.className = 'cyber-ripple'
    ripple.style.left = `${e.clientX}px`
    ripple.style.top = `${e.clientY}px`
    document.body.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  })
})()
