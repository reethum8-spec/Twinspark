import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Layers, Eye, RotateCw, Sparkles, Box, Cpu, EyeOff } from 'lucide-react';
import { ProductSpec, ComponentItem } from '../types/twinspark';

interface ThreeDProductLayoutProps {
  spec: ProductSpec;
  selectedComponentId?: string;
  onSelectComponent?: (compId: string) => void;
}

interface ComponentLabel3D {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export default function ThreeDProductLayout({ spec, selectedComponentId, onSelectComponent }: ThreeDProductLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [explodedVal, setExplodedVal] = useState(0.2);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [labels, setLabels] = useState<ComponentLabel3D[]>([]);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const label3dPositionsRef = useRef<{ id: string; name: string; category: string; pos: THREE.Vector3 }[]>([]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070913');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(110, 120, 150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#38bdf8', 1.6);
    keyLight.position.set(90, 140, 90);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const greenRim = new THREE.DirectionalLight('#10b981', 1.4);
    greenRim.position.set(-90, 80, -90);
    scene.add(greenRim);

    const gridHelper = new THREE.GridHelper(240, 24, '#1e293b', '#0f172a');
    gridHelper.position.y = -45;
    scene.add(gridHelper);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshesRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.compId && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.compId) {
          setHoveredCompId(obj.userData.compId);
          containerRef.current.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredCompId(null);
      containerRef.current.style.cursor = 'default';
    };

    const handleClick = () => {
      if (hoveredCompId && onSelectComponent) {
        onSelectComponent(hoveredCompId);
      }
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousemove', handleMouseMove);
    canvasElem.addEventListener('click', handleClick);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      if (cameraRef.current && containerRef.current && label3dPositionsRef.current.length > 0) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;

        const updatedLabels: ComponentLabel3D[] = label3dPositionsRef.current.map(item => {
          const worldPos = item.pos.clone();
          worldPos.project(cameraRef.current!);

          const x = (worldPos.x * 0.5 + 0.5) * w;
          const y = (-(worldPos.y * 0.5) + 0.5) * h;
          const visible = worldPos.z < 1.0 && x >= 0 && x <= w && y >= 0 && y <= h;

          return {
            id: item.id,
            name: item.name,
            category: item.category,
            x: item.pos.x,
            y: item.pos.y,
            z: item.pos.z,
            screenX: x,
            screenY: y,
            visible
          };
        });

        setLabels(updatedLabels);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvasElem.removeEventListener('mousemove', handleMouseMove);
      canvasElem.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Dynamic Scene Re-build for custom moved, rotated, resized 3D blocks
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const oldAssembly = scene.getObjectByName('twinspark-3d-assembly');
    if (oldAssembly) {
      scene.remove(oldAssembly);
    }

    meshesRef.current = [];
    label3dPositionsRef.current = [];

    const assembly = new THREE.Group();
    assembly.name = 'twinspark-3d-assembly';

    const enc = spec.enclosure3D || { lengthMm: 80, widthMm: 50, heightMm: 25, shape: 'box', color: '#0f172a', hidden: false };
    const explodeDist = explodedVal * 50;

    // 1. Enclosure Bottom Case
    if (!enc.hidden) {
      const botMat = new THREE.MeshPhysicalMaterial({
        color: wireframeMode ? '#38bdf8' : (enc.color || '#0f172a'),
        transparent: true,
        opacity: wireframeMode ? 0.25 : 0.65,
        wireframe: wireframeMode,
        roughness: 0.2,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      const botGeo = new THREE.BoxGeometry(enc.lengthMm, enc.heightMm / 2, enc.widthMm);
      const botMesh = new THREE.Mesh(botGeo, botMat);
      botMesh.position.y = -(enc.heightMm / 4) - explodeDist * 1.2;
      botMesh.userData = { compId: 'enclosure', name: 'Enclosure Bottom Case' };
      assembly.add(botMesh);
      meshesRef.current.push(botMesh);

      // 2. Enclosure Top Lid
      const topMat = new THREE.MeshPhysicalMaterial({
        color: wireframeMode ? '#38bdf8' : '#1e293b',
        transparent: true,
        opacity: wireframeMode ? 0.15 : 0.3,
        wireframe: wireframeMode,
        roughness: 0.1,
        transmission: 0.7,
        side: THREE.DoubleSide
      });
      const topGeo = new THREE.BoxGeometry(enc.lengthMm, enc.heightMm / 2, enc.widthMm);
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = (enc.heightMm / 4) + (enc.heightMm / 2) + explodeDist * 1.5;
      topMesh.userData = { compId: 'enclosure-top', name: 'Enclosure Top Glass Lid' };
      assembly.add(topMesh);
      meshesRef.current.push(topMesh);
    }

    // 3. PCB Substrate
    const pcbLength = Math.max(10, enc.lengthMm - 6);
    const pcbWidth = Math.max(10, enc.widthMm - 6);
    const pcbMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.3, metalness: 0.2 });
    const pcbGeo = new THREE.BoxGeometry(pcbLength, 1.6, pcbWidth);
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.y = 0;
    pcbMesh.userData = { compId: 'pcb', name: 'PCB Board' };
    assembly.add(pcbMesh);
    meshesRef.current.push(pcbMesh);

    label3dPositionsRef.current.push({
      id: 'pcb',
      name: 'PCB Substrate',
      category: 'pcb',
      pos: new THREE.Vector3(0, 5, -pcbWidth / 2)
    });

    // Gather all active components with 3D blocks
    const components: ComponentItem[] = [
      ...(spec.controller ? [spec.controller] : []),
      ...spec.sensors,
      ...(spec.display ? [spec.display] : []),
      ...(spec.wireless && spec.wireless.id !== spec.controller?.id ? [spec.wireless] : []),
      ...spec.outputs,
      ...(spec.battery ? [spec.battery] : []),
      ...(spec.customComponents || [])
    ].filter(Boolean);

    components.forEach(comp => {
      const tf = comp.transform3D || { x: 0, y: 3, z: 0, length: 12, width: 12, height: 3 };
      if (tf.hidden) return;

      const compGroup = new THREE.Group();
      compGroup.position.set(tf.x || 0, tf.y || 2.5, tf.z || 0);

      if (tf.rotX) compGroup.rotation.x = tf.rotX * (Math.PI / 180);
      if (tf.rotY) compGroup.rotation.y = tf.rotY * (Math.PI / 180);
      if (tf.rotZ) compGroup.rotation.z = tf.rotZ * (Math.PI / 180);

      const isSelected = selectedComponentId === comp.id;
      const isHovered = hoveredCompId === comp.id;

      const compColor = isSelected ? '#f59e0b' : (isHovered ? '#38bdf8' : (tf.color || '#0284c7'));

      let compMesh: THREE.Mesh;

      if (tf.shape === 'sphere') {
        const radius = tf.radius || 2.5;
        const geo = new THREE.SphereGeometry(radius, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: compColor, emissive: compColor, emissiveIntensity: 0.6 });
        compMesh = new THREE.Mesh(geo, mat);
      } else if (tf.shape === 'cylinder' || tf.shape === 'disc') {
        const radius = tf.radius || 9;
        const height = tf.height || 20;
        const geo = new THREE.CylinderGeometry(radius, radius, height, 32);
        const mat = new THREE.MeshStandardMaterial({ color: compColor, metalness: 0.6, roughness: 0.3 });
        compMesh = new THREE.Mesh(geo, mat);
      } else {
        // Default Box / Pouch
        const len = tf.length || 12;
        const wid = tf.width || 12;
        const hgt = tf.height || 3;
        const geo = new THREE.BoxGeometry(len, hgt, wid);
        const mat = new THREE.MeshStandardMaterial({ color: compColor, roughness: 0.2, metalness: 0.3 });
        compMesh = new THREE.Mesh(geo, mat);
      }

      compMesh.castShadow = true;
      compMesh.receiveShadow = true;
      compGroup.add(compMesh);

      compGroup.userData = { compId: comp.id, name: comp.name };
      compMesh.userData = { compId: comp.id, name: comp.name };

      assembly.add(compGroup);
      meshesRef.current.push(compMesh);

      label3dPositionsRef.current.push({
        id: comp.id,
        name: comp.name,
        category: comp.category,
        pos: new THREE.Vector3(tf.x || 0, (tf.y || 2.5) + (tf.height || 4), tf.z || 0)
      });
    });

    scene.add(assembly);
  }, [spec, explodedVal, wireframeMode, selectedComponentId, hoveredCompId]);

  return (
    <div className="relative w-full h-[480px] bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden group">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />

        {/* Dynamic 2D Projected Screen Labels */}
        {labels.map(lbl => {
          if (!lbl.visible) return null;
          const isHovered = hoveredCompId === lbl.id;
          const isSelected = selectedComponentId === lbl.id;

          return (
            <div
              key={lbl.id}
              onClick={() => onSelectComponent && onSelectComponent(lbl.id)}
              style={{
                left: `${lbl.screenX}px`,
                top: `${lbl.screenY}px`,
                transform: 'translate(-50%, -100%)'
              }}
              className={`absolute pointer-events-auto cursor-pointer transition-all px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md border flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-500/20 scale-110'
                  : isHovered
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-cyan-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-cyan-400'}`} />
              <span>{lbl.name}</span>
            </div>
          );
        })}
      </div>

      {/* Floating Header Tag */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg text-xs text-cyan-400 font-semibold">
        <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>3D Digital Twin Layout (Editable Blocks)</span>
      </div>

      {/* Dimensions Badge */}
      <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300 shadow-lg">
        {spec.enclosure3D?.lengthMm || 80} × {spec.enclosure3D?.widthMm || 50} × {spec.enclosure3D?.heightMm || 25} mm
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Explode View</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explodedVal}
            onChange={(e) => setExplodedVal(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono text-cyan-400 w-9">{Math.round(explodedVal * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle X-Ray Glass Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">X-Ray</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              autoRotate
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Auto Orbit Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
