import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Interactive 3D hero character — original implementation.
 *
 * Loads a single GLB from /models/character.glb (swap that one file to
 * replace the character; see README "3D hero character"). Hero mounts this
 * component lazily and only on viewports >= 1024px, so three.js and the
 * model are never requested on mobile or before first paint.
 *
 * Behaviour:
 * - The Idle clip loops gently. The character NEVER turns toward the cursor
 *   and never looks around on its own (calmed down on Anurag's feedback —
 *   the constant head-turning felt restless). All other motion is a direct
 *   response to a deliberate interaction:
 * - Hover or click the character -> Wave (with a brief "Surprised" face).
 * - Hovering the hero's primary CTAs dispatches a 'character:gesture' window
 *   event -> ThumbsUp (fallback: Yes) if the model ships those clips.
 * - prefers-reduced-motion: one static posed frame, no loop, no listeners.
 */

const MODEL_URL = '/models/character.glb'
const ACCENT_HEX = 0x38bdf8
const GESTURE_EVENT = 'character:gesture'

type GestureName = 'Wave' | 'ThumbsUp' | 'Yes'

const damp = THREE.MathUtils.damp

export default function Character3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // WebGL gate — without it the hero simply stays text-only.
    const probe = document.createElement('canvas')
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    mount.appendChild(renderer.domElement)
    const canvas = renderer.domElement

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.5

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0.2, 7)

    // Key light (casts the soft contact shadow), sky-accent rim, gentle fill.
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(3.2, 5.5, 4.5)
    keyLight.castShadow = true
    keyLight.shadow.radius = 7
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 25
    keyLight.shadow.camera.left = -3
    keyLight.shadow.camera.right = 3
    keyLight.shadow.camera.top = 4
    keyLight.shadow.camera.bottom = -2
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(ACCENT_HEX, 1.7)
    rimLight.position.set(-4.5, 3.0, -4.0)
    scene.add(rimLight)

    scene.add(new THREE.HemisphereLight(0x9db8d6, 0x0a0f16, 0.45))

    // Shadow-catcher ground (positioned at the model's feet after fitting).
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.24 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Soft pedestal glow — a faint accent disc under the feet so the
    // character feels placed on the page's ground, not pasted over it.
    // (Radial-gradient sprite texture, accent centre fading to transparent;
    // positioned at the feet alongside the shadow-catcher after fitting.)
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 256
    glowCanvas.height = 256
    const glowCtx = glowCanvas.getContext('2d')
    if (glowCtx) {
      const gradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.55)')
      gradient.addColorStop(0.55, 'rgba(56, 189, 248, 0.18)')
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0)')
      glowCtx.fillStyle = gradient
      glowCtx.fillRect(0, 0, 256, 256)
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas)
    const pedestal = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 48),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    )
    pedestal.rotation.x = -Math.PI / 2
    pedestal.renderOrder = 1
    scene.add(pedestal)

    // ---- interaction state -------------------------------------------------
    // No cursor tracking, no look-arounds, no scroll reactions: the only
    // eased value left is the brief "Surprised" morph that rides along with
    // the deliberate Wave gesture.
    let surpriseHoldUntil = 0
    let surprise = 0

    // model-bound refs (set after load)
    let mixer: THREE.AnimationMixer | null = null
    let idleAction: THREE.AnimationAction | null = null
    const gestureActions = new Map<GestureName, THREE.AnimationAction>()
    let faceMesh: THREE.Mesh | null = null
    let faceMorphIndex = -1
    let gesturing = false
    let lastCtaGestureAt = 0
    let hoverWaveReadyAt = 0

    function playGesture(name: GestureName) {
      if (disposed || reducedMotion || gesturing || !idleAction) return
      const action = gestureActions.get(name)
      if (!action) return
      gesturing = true
      action.reset()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      action.fadeIn(0.5)
      action.play()
      idleAction.fadeOut(0.5)
      if (name === 'Wave') surpriseHoldUntil = performance.now() + 900
    }

    const onCtaGesture = () => {
      const now = performance.now()
      if (now - lastCtaGestureAt < 6000) return
      lastCtaGestureAt = now
      playGesture(gestureActions.has('ThumbsUp') ? 'ThumbsUp' : 'Yes')
    }
    const onCanvasEnter = () => {
      const now = performance.now()
      if (now < hoverWaveReadyAt) return
      hoverWaveReadyAt = now + 8000
      playGesture('Wave')
    }
    const onCanvasClick = () => playGesture('Wave')

    if (!reducedMotion) {
      window.addEventListener(GESTURE_EVENT, onCtaGesture)
      canvas.addEventListener('pointerenter', onCanvasEnter)
      canvas.addEventListener('click', onCanvasClick)
    }

    // ---- sizing -------------------------------------------------------------
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reducedMotion) renderer.render(scene, camera)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    // ---- render loop (paused while the hero is off-screen) ------------------
    const clock = new THREE.Clock()
    let loopRunning = false

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const now = performance.now()
      mixer?.update(dt)

      // The only per-frame easing left: the "Surprised" face morph, driven
      // solely by surpriseHoldUntil, which only the Wave gesture sets.
      // Nothing here rotates the model or its bones — the Idle clip is the
      // whole of the character's resting motion.
      const targetSurprise = now < surpriseHoldUntil ? 0.5 : 0
      surprise = damp(surprise, targetSurprise, 5, dt)
      if (faceMesh && faceMorphIndex >= 0 && faceMesh.morphTargetInfluences) {
        faceMesh.morphTargetInfluences[faceMorphIndex] = surprise
      }

      renderer.render(scene, camera)
    }

    const startLoop = () => {
      if (loopRunning || reducedMotion) return
      loopRunning = true
      clock.start()
      renderer.setAnimationLoop(tick)
    }
    const stopLoop = () => {
      loopRunning = false
      renderer.setAnimationLoop(null)
    }
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) startLoop()
        else stopLoop()
      },
      { threshold: 0.02 },
    )
    visibilityObserver.observe(mount)

    // ---- load the model ------------------------------------------------------
    const loader = new GLTFLoader()
    loader
      .loadAsync(MODEL_URL)
      .then((gltf) => {
        if (disposed) return
        const model = gltf.scene

        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (mesh.isMesh) {
            mesh.castShadow = true
            mesh.frustumCulled = false
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              const idx = mesh.morphTargetDictionary['Surprised']
              if (idx !== undefined) {
                faceMesh = mesh
                faceMorphIndex = idx
              }
            }
          }
        })

        // Centre the model in a wrapper group; the shadow-catcher and the
        // pedestal glow stay outside it, planted on the page's ground line.
        const wrap = new THREE.Group()
        const inner = new THREE.Group()
        const bbox = new THREE.Box3().setFromObject(model)
        const size = bbox.getSize(new THREE.Vector3())
        const center = bbox.getCenter(new THREE.Vector3())
        inner.position.set(-center.x, -center.y, -center.z)
        inner.add(model)
        wrap.add(inner)
        scene.add(wrap)

        ground.position.y = -size.y / 2 - 0.001
        pedestal.position.y = -size.y / 2 + 0.002
        pedestal.scale.setScalar(Math.max(0.7, size.x * 0.75))

        // Frame by height with a little extra air (factor 1.32) so the
        // character sits slightly smaller and calmer in the hero.
        const fovRad = THREE.MathUtils.degToRad(camera.fov)
        const dist = ((size.y / 2) / Math.tan(fovRad / 2)) * 1.32
        camera.position.set(0, size.y * 0.05, dist)
        camera.lookAt(0, 0, 0)

        // Animation state machine: Idle loops; gestures play once and
        // crossfade back to Idle on the mixer's 'finished' event.
        const mix = new THREE.AnimationMixer(model)
        mixer = mix
        const clips = gltf.animations
        const findClip = (name: string) => clips.find((c) => c.name === name)

        const idleClip = findClip('Idle') ?? clips[0]
        if (idleClip) {
          const idle = mix.clipAction(idleClip)
          idle.setLoop(THREE.LoopRepeat, Infinity)
          idle.play()
          idleAction = idle
        }
        const gestureNames: GestureName[] = ['Wave', 'ThumbsUp', 'Yes']
        for (const name of gestureNames) {
          const clip = findClip(name)
          if (clip) gestureActions.set(name, mix.clipAction(clip))
        }
        mix.addEventListener('finished', (e) => {
          if (!gesturing || e.action === idleAction) return
          gesturing = false
          ;(e.action as THREE.AnimationAction).fadeOut(0.55)
          idleAction?.reset().fadeIn(0.55).play()
        })

        resize()
        if (reducedMotion) {
          // One static, naturally-posed frame.
          mix.update(0.8)
          renderer.render(scene, camera)
        } else {
          startLoop()
        }
      })
      .catch(() => {
        // Model unavailable — the hero simply stays text-only.
      })

    // ---- cleanup ---------------------------------------------------------------
    return () => {
      disposed = true
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      stopLoop()
      if (!reducedMotion) {
        window.removeEventListener(GESTURE_EVENT, onCtaGesture)
        canvas.removeEventListener('pointerenter', onCanvasEnter)
        canvas.removeEventListener('click', onCanvasClick)
      }
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          for (const mat of materials) {
            if (!mat) continue
            for (const value of Object.values(mat)) {
              if (value instanceof THREE.Texture) value.dispose()
            }
            mat.dispose()
          }
        }
      })
      pmrem.dispose()
      renderer.dispose()
      if (canvas.parentElement === mount) mount.removeChild(canvas)
    }
  }, [])

  return <div ref={mountRef} className="hero-character-mount" />
}
