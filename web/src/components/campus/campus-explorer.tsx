"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { CampusSpot } from "@/lib/types";

const blockConfigs: Record<
  string,
  {
    position: [number, number, number];
    scale: [number, number, number];
    color: string;
  }
> = {
  gate: { position: [10, 0.75, -6], scale: [3.2, 1.5, 2.2], color: "#295a9e" },
  teaching: { position: [-5.3, 1.5, 6.1], scale: [7, 3, 4.8], color: "#1b7db2" },
  complex: { position: [6.8, 1.3, 6.2], scale: [6.5, 2.6, 3.2], color: "#468c72" },
  library: { position: [-11.3, 1, 0.8], scale: [3.5, 2, 3], color: "#9d7148" },
  canteen: { position: [1.4, 0.8, 5.3], scale: [5.6, 1.6, 1.8], color: "#6e7bb1" },
  playground: { position: [-0.8, 0.15, -4.3], scale: [11.5, 0.3, 8], color: "#b5645a" },
};

export function CampusExplorer({ spots }: { spots: CampusSpot[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneApiRef = useRef<{ focus: (key: string) => void } | null>(null);
  const [selectedKey, setSelectedKey] = useState("overview");
  const [touring, setTouring] = useState(false);
  const engineStatus = `Three.js 引擎运行中 · r${THREE.REVISION}`;

  const spotMap = useMemo(
    () => new Map(spots.map((spot) => [spot.key, spot])),
    [spots],
  );
  const orderedTourKeys = useMemo(
    () => spots.filter((spot) => spot.key !== "overview").map((spot) => spot.key),
    [spots],
  );
  const selectedSpot = spotMap.get(selectedKey) ?? spots[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let disposed = false;
    let animationFrame = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d8e5ee");
    scene.fog = new THREE.Fog("#d8e5ee", 24, 58);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
    const fallbackSpot = spotMap.get("overview") ?? spots[0];
    camera.position.set(...fallbackSpot.camera);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 7;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.target.set(...fallbackSpot.target);
    controls.update();

    const desiredCamera = new THREE.Vector3(...fallbackSpot.camera);
    const desiredTarget = new THREE.Vector3(...fallbackSpot.target);

    const ambient = new THREE.HemisphereLight("#f8fbff", "#5d7186", 1.35);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight("#fff8e0", 1.85);
    sun.position.set(14, 24, 18);
    sun.castShadow = true;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 32),
      new THREE.MeshStandardMaterial({
        color: "#edf4f8",
        roughness: 0.9,
        metalness: 0.02,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const walkway = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 24),
      new THREE.MeshStandardMaterial({
        color: "#dae5ed",
        roughness: 1,
      }),
    );
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.set(3.2, 0.02, -0.2);
    scene.add(walkway);

    const interactiveMeshes = new Map<string, THREE.Mesh>();

    Object.entries(blockConfigs).forEach(([key, config]) => {
      const geometry = new THREE.BoxGeometry(...config.scale);
      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.55,
        metalness: 0.04,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...config.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.spotKey = key;
      interactiveMeshes.set(key, mesh);
      scene.add(mesh);
    });

    const focus = (key: string) => {
      const targetSpot = spotMap.get(key) ?? fallbackSpot;
      desiredCamera.set(...targetSpot.camera);
      desiredTarget.set(...targetSpot.target);

      interactiveMeshes.forEach((mesh, meshKey) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissive = new THREE.Color(
          meshKey === targetSpot.key ? "#10386b" : "#000000",
        );
        material.emissiveIntensity = meshKey === targetSpot.key ? 0.22 : 0;
      });
    };

    sceneApiRef.current = { focus };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerUp = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(
        Array.from(interactiveMeshes.values()),
      );
      const nextKey = intersects[0]?.object.userData.spotKey;
      if (typeof nextKey === "string") {
        startTransition(() => setSelectedKey(nextKey));
      }
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const render = () => {
      if (disposed) {
        return;
      }

      camera.position.lerp(desiredCamera, 0.045);
      controls.target.lerp(desiredTarget, 0.055);
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    render();
    canvas.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      sceneApiRef.current = null;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [spotMap, spots]);

  useEffect(() => {
    sceneApiRef.current?.focus(selectedKey);
  }, [selectedKey]);

  useEffect(() => {
    if (!touring || orderedTourKeys.length === 0) {
      return;
    }

    let currentIndex = 0;
    const timer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % orderedTourKeys.length;
      const nextKey = orderedTourKeys[currentIndex];
      startTransition(() => setSelectedKey(nextKey));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [orderedTourKeys, touring]);

  return (
    <div className="campus-layout">
      <section className="campus-stage" aria-labelledby="campus-canvas-title">
        <h2 id="campus-canvas-title" className="sr-only">
          三维校园导览
        </h2>
        <canvas id="campus-canvas" ref={canvasRef} aria-label="校园三维导览" />

        <div className="campus-stage-overlay">
          <div className="campus-stage-top">
            <span className="campus-badge">实时三维</span>
            <span className="campus-badge campus-badge-soft">
              持续渲染，可自由观察
            </span>
          </div>

          <div className="campus-stage-bottom">
            <strong>{engineStatus}</strong>
            <p>拖拽旋转，滚轮缩放，点击楼体查看信息；下方按钮可一键切换不同观察角度。</p>
          </div>
        </div>

        <div className="campus-viewbar">
          {[
            { key: "overview", label: "总览" },
            { key: "gate", label: "校门视角" },
            { key: "teaching", label: "教学楼视角" },
            { key: "playground", label: "操场视角" },
          ].map((view) => (
            <button
              key={view.key}
              type="button"
              className={selectedKey === view.key ? "active" : undefined}
              onClick={() => setSelectedKey(view.key)}
            >
              {view.label}
            </button>
          ))}
        </div>
      </section>

      <aside className="campus-panel">
        <img
          className="campus-panel-image"
          src={selectedSpot.imageUrl}
          alt={`${selectedSpot.name}预览图`}
        />
        <p className="campus-panel-kicker">{selectedSpot.type}</p>
        <h3>{selectedSpot.name}</h3>
        <p className="campus-panel-subtitle">{selectedSpot.subtitle}</p>
        <p className="campus-panel-description">{selectedSpot.description}</p>

        <div className="spot-facts">
          {selectedSpot.facts.map((fact) => (
            <div key={`${selectedSpot.id}-${fact.label}`} className="spot-fact">
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>

        <div className="spot-tags">
          {selectedSpot.tags.map((tag) => (
            <span key={`${selectedSpot.id}-${tag}`}>{tag}</span>
          ))}
        </div>

        <div className="campus-actions">
          <button
            id="tour-toggle"
            className={`campus-btn${touring ? " is-active" : ""}`}
            type="button"
            onClick={() => setTouring((current) => !current)}
          >
            {touring ? "停止巡览" : "自动巡览"}
          </button>
          <button
            id="reset-view"
            className="campus-btn campus-btn-ghost"
            type="button"
            onClick={() => {
              setTouring(false);
              setSelectedKey("overview");
            }}
          >
            回到总览
          </button>
        </div>

        <div className="campus-quicknav">
          {spots
            .filter((spot) => spot.key !== "overview")
            .map((spot) => (
              <button
                key={spot.id}
                type="button"
                className={selectedKey === spot.key ? "active" : undefined}
                onClick={() => setSelectedKey(spot.key)}
              >
                <div>
                  <span>{spot.quickLabel}</span>
                  <small>{spot.quickDescription}</small>
                </div>
              </button>
            ))}
        </div>
      </aside>
    </div>
  );
}
