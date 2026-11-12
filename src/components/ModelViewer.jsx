import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

const cssColor = (name) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

// Draws a CAD model the way a drafter would: paper-coloured faces, ink edges.
// `notes` pin numbered balloons to points given in the model's own coordinates.
export default function ModelViewer({ src, notes = [], zUp = true, alt, interactive = true, look = "lines" }) {
  const wrap = useRef(null);
  const tags = useRef([]);
  const [state, setState] = useState("loading");
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.prepend(renderer.domElement);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", alt || "3D model");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = !still;
    controls.autoRotateSpeed = interactive ? 0.9 : 1.6;
    if (!interactive) {
      controls.enabled = false;
      renderer.domElement.style.pointerEvents = "none";
    }
    // Let a vertical swipe scroll the page; a sideways drag turns the model.
    renderer.domElement.style.touchAction = "pan-y";
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      setMoved(true);
    });

    const root = new THREE.Group();
    scene.add(root);
    const lineMat = new LineMaterial({ color: cssColor("--ink"), linewidth: 1.25, worldUnits: false });
    const faceMat = new THREE.MeshBasicMaterial({ color: cssColor("--paper"), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    // Redraw in the new colours when the page switches between print and blueprint.
    const themeWatch = new MutationObserver(() => {
      lineMat.color.copy(cssColor("--ink"));
      faceMat.color.copy(cssColor("--paper"));
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (look === "shaded") {
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 2.2));
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(2, 5, 3);
      scene.add(sun);
    }
    const anchors = [];
    let alive = true;
    let visible = false;
    let raf = 0;

    new GLTFLoader().load(
      src,
      (gltf) => {
        if (!alive) return;
        const model = gltf.scene;
        if (zUp) model.rotation.x = -Math.PI / 2;
        root.add(model);
        model.updateWorldMatrix(true, true);
        const meshes = [];
        model.traverse((o) => o.isMesh && meshes.push(o));
        meshes.forEach((m) => {
          if (look === "shaded") return;
          m.material = faceMat;
          const edges = new THREE.EdgesGeometry(m.geometry, 24);
          const lines = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(edges), lineMat);
          edges.dispose();
          m.add(lines);
        });
        notes.forEach((n) => {
          const a = new THREE.Object3D();
          a.position.set(...n.p);
          model.add(a);
          anchors.push(a);
        });
        const box = new THREE.Box3().setFromObject(model);
        const c = box.getCenter(new THREE.Vector3());
        fitR = box.getSize(new THREE.Vector3()).length() / 2;
        controls.target.copy(c);
        camera.position.copy(c).add(new THREE.Vector3(0.62, 0.42, 0.66).normalize());
        fit();
        setState("ready");
      },
      undefined,
      () => alive && setState("error")
    );

    // Keep the whole model in frame for any aspect ratio (narrow phones included).
    let fitR = 0;
    const fit = () => {
      if (!fitR) return;
      const v = (camera.fov * Math.PI) / 360;
      const half = Math.min(v, Math.atan(Math.tan(v) * camera.aspect));
      const d = (fitR / Math.sin(half)) * 0.74;
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(dir.multiplyScalar(d));
      camera.near = d / 50;
      camera.far = d * 10;
      camera.updateProjectionMatrix();
    };

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      lineMat.resolution.set(w, h);
      fit();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    const v = new THREE.Vector3();
    const frame = () => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      controls.update();
      renderer.render(scene, camera);
      const w = el.clientWidth;
      const h = el.clientHeight;
      anchors.forEach((a, i) => {
        const t = tags.current[i];
        if (!t) return;
        a.getWorldPosition(v).project(camera);
        t.style.left = ((v.x + 1) / 2) * w + "px";
        t.style.top = ((1 - v.y) / 2) * h + "px";
      });
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(el);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      controls.dispose();
      scene.traverse((o) => o.geometry && o.geometry.dispose());
      lineMat.dispose();
      faceMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, zUp, interactive, look]);

  return (
    <div ref={wrap} className="model">
      {state === "ready" &&
        notes.map((n, i) => (
          <span key={i} ref={(el) => (tags.current[i] = el)} className="balloon model__tag" aria-hidden="true">
            {i + 1}
          </span>
        ))}
      {state === "loading" && interactive && <div className="model__wait">Loading the 3D model</div>}
      {state === "error" && <div className="model__wait">The 3D model could not be loaded.</div>}
      {state === "ready" && interactive && !moved && <span className="model__hint">Drag to turn it</span>}
    </div>
  );
}
