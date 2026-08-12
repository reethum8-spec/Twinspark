import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Maximize2, Minimize2, Eye, Box, Layers, RotateCw, Sparkles, Cpu } from 'lucide-react';

export default function ThreeDViewport({ spec, selectedComponentId, onSelectComponent }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [explodedVal, setExplodedVal] = useState(0.2); // 0 to 1
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredComp, setHoveredComp] = useState(null);

  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const meshesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070913'); // Deep cosmic dark
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(100, 110, 140);

    // 3. Renderer Setup
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

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight('#38bdf8', 1.5); // Cyan key light
    dirLight1.position.set(100, 150, 80);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#f59e0b', 1.2); // Gold rim light
    dirLight2.position.set(-100, 80, -100);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight('#6366f1', 2, 200);
    pointLight.position.set(0, 40, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(240, 24, '#1e293b', '#0f172a');
    gridHelper.position.y = -40;
    scene.add(gridHelper);

    // Raycaster for hover/click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshesRef.current, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== scene && !obj.userData?.compId) {
          obj = obj.parent;
        }
        if (obj.userData?.compId) {
          setHoveredComp(obj.userData.compId);
          containerRef.current.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredComp(null);
      containerRef.current.style.cursor = 'default';
    };

    const handleClick = () => {
      if (hoveredComp && onSelectComponent) {
        onSelectComponent(hoveredComp);
      }
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousemove', handleMouseMove);
    canvasElem.addEventListener('click', handleClick);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 450;
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

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Re-build 3D Scene Geometry whenever spec, explodedVal, or wireframeMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old assembly group if exists
    const oldAssembly = scene.getObjectByName('hardware-assembly');
    if (oldAssembly) {
      scene.remove(oldAssembly);
    }

    meshesRef.current = [];

    const assemblyGroup = new THREE.Group();
    assemblyGroup.name = 'hardware-assembly';

    const enc = spec.enclosure3D || {
      lengthMm: 80,
      widthMm: 50,
      heightMm: 25,
      pcbLengthMm: 72,
      pcbWidthMm: 44,
      pcbColor: '#10b981'
    };

    const explodeDist = explodedVal * 55; // 0 to 55mm separation

    // 1. Enclosure Bottom Case
    const botMaterial = new THREE.MeshPhysicalMaterial({
      color: wireframeMode ? '#38bdf8' : '#1e293b',
      transparent: true,
      opacity: wireframeMode ? 0.3 : 0.65,
      wireframe: wireframeMode,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.5,
      side: THREE.DoubleSide
    });
    const botGeo = new THREE.BoxGeometry(enc.lengthMm, enc.heightMm / 2, enc.widthMm);
    const botMesh = new THREE.Mesh(botGeo, botMaterial);
    botMesh.position.y = - (enc.heightMm / 4) - explodeDist * 1.2;
    botMesh.castShadow = true;
    botMesh.receiveShadow = true;
    botMesh.userData = { compId: 'enclosure-bottom', name: 'Enclosure Bottom Case' };
    assemblyGroup.add(botMesh);
    meshesRef.current.push(botMesh);

    // 2. Enclosure Top Lid
    const topMaterial = new THREE.MeshPhysicalMaterial({
      color: wireframeMode ? '#38bdf8' : '#334155',
      transparent: true,
      opacity: wireframeMode ? 0.2 : 0.35,
      wireframe: wireframeMode,
      roughness: 0.1,
      transmission: 0.6,
      side: THREE.DoubleSide
    });
    const topGeo = new THREE.BoxGeometry(enc.lengthMm, enc.heightMm / 2, enc.widthMm);
    const topMesh = new THREE.Mesh(topGeo, topMaterial);
    topMesh.position.y = (enc.heightMm / 4) + (enc.heightMm / 2) + explodeDist * 1.5;
    topMesh.userData = { compId: 'enclosure-top', name: 'Enclosure Top Glass Lid' };
    assemblyGroup.add(topMesh);
    meshesRef.current.push(topMesh);

    // 3. PCB Substrate
    const pcbMaterial = new THREE.MeshStandardMaterial({
      color: enc.pcbColor || '#10b981',
      roughness: 0.4,
      metalness: 0.2
    });
    const pcbGeo = new THREE.BoxGeometry(enc.pcbLengthMm, 1.6, enc.pcbWidthMm);
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMaterial);
    pcbMesh.position.y = 0; // Center origin
    pcbMesh.userData = { compId: 'pcb', name: 'Main PCB Substrate (1.6mm FR4)' };
    assemblyGroup.add(pcbMesh);
    meshesRef.current.push(pcbMesh);

    // PCB Copper Traces simulation lines on top
    const traceMaterial = new THREE.LineBasicMaterial({ color: '#f59e0b', opacity: 0.8, transparent: true });
    const tracePoints = [
      new THREE.Vector3(-enc.pcbLengthMm / 3, 0.9, -enc.pcbWidthMm / 3),
      new THREE.Vector3(0, 0.9, -enc.pcbWidthMm / 3),
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(enc.pcbLengthMm / 3, 0.9, 0),
      new THREE.Vector3(enc.pcbLengthMm / 3, 0.9, enc.pcbWidthMm / 4),
    ];
    const traceGeo = new THREE.BufferGeometry().setFromPoints(tracePoints);
    const traceLine = new THREE.Line(traceGeo, traceMaterial);
    assemblyGroup.add(traceLine);

    // 4. Components on PCB
    const components = spec.components3D || [
      { id: 'mcu', name: 'Microcontroller', type: 'chip', color: '#1e293b', width: 12, length: 12, height: 2, x: -15, y: 1.8, z: 0 },
      { id: 'battery', name: 'Battery Pack', type: 'pouch-battery', color: '#64748b', width: 30, length: 20, height: 5, x: 15, y: -4, z: 0 }
    ];

    components.forEach(comp => {
      const compGroup = new THREE.Group();
      compGroup.position.set(comp.x || 0, comp.y || 1.8, comp.z || 0);

      const isSelected = selectedComponentId === comp.id;
      const isHovered = hoveredComp === comp.id;

      const compColor = isSelected ? '#f59e0b' : (isHovered ? '#38bdf8' : (comp.color || '#3b82f6'));

      let compMesh;

      if (comp.type === 'cylinder-battery') {
        const radius = comp.radius || 9;
        const height = comp.height || 65;
        const battGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
        const battMat = new THREE.MeshStandardMaterial({ color: compColor, metalness: 0.6, roughness: 0.3 });
        compMesh = new THREE.Mesh(battGeo, battMat);
        if (comp.rotation) {
          compMesh.rotation.set(...comp.rotation);
        }
      } else if (comp.type === 'coin-battery') {
        const radius = comp.radius || 10;
        const height = comp.height || 3.2;
        const battGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
        const battMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.1 });
        compMesh = new THREE.Mesh(battGeo, battMat);
      } else if (comp.type === 'pouch-battery') {
        const battGeo = new THREE.BoxGeometry(comp.length || 30, comp.height || 4, comp.width || 20);
        const battMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.7, roughness: 0.2 });
        compMesh = new THREE.Mesh(battGeo, battMat);
      } else if (comp.type === 'chip' || comp.type === 'module') {
        const chipGeo = new THREE.BoxGeometry(comp.length || 10, comp.height || 1.5, comp.width || 10);
        const chipMat = new THREE.MeshStandardMaterial({ color: compColor, roughness: 0.2, metalness: 0.3 });
        compMesh = new THREE.Mesh(chipGeo, chipMat);

        // Add metallic pin details along edges
        const pinMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.1 });
        const pinGeo = new THREE.BoxGeometry(0.8, 0.4, 1.2);
        for (let i = - (comp.length / 2.5); i <= (comp.length / 2.5); i += 2.5) {
          const pinLeft = new THREE.Mesh(pinGeo, pinMat);
          pinLeft.position.set(i, -0.4, - (comp.width / 2) - 0.4);
          compGroup.add(pinLeft);

          const pinRight = new THREE.Mesh(pinGeo, pinMat);
          pinRight.position.set(i, -0.4, (comp.width / 2) + 0.4);
          compGroup.add(pinRight);
        }
      } else {
        // Generic sensor / module block
        const genGeo = new THREE.BoxGeometry(comp.length || 10, comp.height || 3, comp.width || 10);
        const genMat = new THREE.MeshStandardMaterial({ color: compColor, metalness: 0.4, roughness: 0.3 });
        compMesh = new THREE.Mesh(genGeo, genMat);
      }

      compMesh.castShadow = true;
      compMesh.receiveShadow = true;
      compGroup.add(compMesh);

      compGroup.userData = { compId: comp.id, name: comp.name };
      compMesh.userData = { compId: comp.id, name: comp.name };

      assemblyGroup.add(compGroup);
      meshesRef.current.push(compMesh);
    });

    scene.add(assemblyGroup);
  }, [spec, explodedVal, wireframeMode, selectedComponentId, hoveredComp]);

  return (
    <div className="relative w-full h-[480px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group">
      {/* 3D Canvas Element */}
      <div ref={containerRef} className="w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />
      </div>

      {/* Floating Header Tag */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg text-xs text-cyan-400 font-medium">
        <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>3D Hardware Twin Visualizer</span>
      </div>

      {/* Dimensions Overlay Tag */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300 shadow-lg">
        {spec.enclosure3D?.lengthMm || 80} × {spec.enclosure3D?.widthMm || 50} × {spec.enclosure3D?.heightMm || 25} mm
      </div>

      {/* Hover Component Tooltip */}
      {hoveredComp && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-cyan-950/90 border border-cyan-500/50 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-cyan-200 shadow-2xl flex items-center gap-2 pointer-events-none animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click to inspect: {hoveredComp}</span>
        </div>
      )}

      {/* Bottom Floating 3D Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
        {/* Exploded View Slider */}
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

        {/* Action Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Glass X-Ray / Wireframe Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">X-Ray</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              autoRotate
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle 3D Orbit Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
