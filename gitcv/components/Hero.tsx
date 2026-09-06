"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OsButton } from "./magicui/osbutton"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { current: refs } = sceneRef

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [containerRef.current?.clientWidth || window.innerWidth, containerRef.current?.clientHeight || window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
      }

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms || !containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute z-0 top-0 left-0 w-full h-full block"
      />
      <div className="h-full w-full">
        <div className="absolute w-2/3 z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="rounded-sm border border-slate-200/40 flex items-center gap-2 bg-slate-100/70 px-2 py-1 text-sm font-semibold uppercase text-white">
                  <span className="p-1 bg-linear-to-b from-amber-500 to-amber-700 text-white text-xs font-bold rounded-sm">AI</span> Dynamic resume
                </span>
                <div className="mt-4 text-7xl text-center sm:text-8xl md:text-8xl font-semibold tracking-tighter text-white">
                  Turn Your GitHub Into a Resume That Gets Interviews
                </div>
                <p className="mt-4 max-w-2xl text-center text-lg md:text-xl text-slate-300 sm:text-xl">
                  Upload your resume, paste a job description, and generate a tailored, ATS-friendly resume using your most relevant projects.
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  <OsButton>
                    Generate
                  </OsButton>
                  <a href="#features" className="inline-flex min-w-50 items-center justify-center rounded-[12px] border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                    See how it works
                  </a>
              </div>
          </div>
        </div>
              <div className="absolute bottom-0 text-white border-y w-full border-zinc-800">
                <h4 className="font-medium py-10 inset-0 flex items-center justify-center text-3xl lg:text-5xl tracking-tight z-30 text-center text-balance">Supercharge Your Job Applications</h4>
              </div>
      </div>
    </div>
  )
}
