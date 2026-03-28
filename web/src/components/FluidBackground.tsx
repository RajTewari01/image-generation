'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Ultra-premium fluid gradient shader written in GLSL.
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

// Classic Perlin 3D Noise by Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
  vec2 uv = vUv;
  float noise1 = cnoise(vec3(uv * 1.5, uTime * 0.15));
  float noise2 = cnoise(vec3(uv * 2.0 - noise1, uTime * 0.1));
  vec3 color = mix(uColor1, uColor2, noise1 + 0.5);
  color = mix(color, uColor3, noise2 + 0.3);
  float dist = distance(uv, vec2(0.5));
  color *= smoothstep(0.8, 0.2, dist * 0.8);
  gl_FragColor = vec4(color, 1.0);
}
`;

// Helper: Convert hex strings directly to THREE.Color objects via parsing
const hexToVec3 = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
};

export const THEMES = {
  Monterey: { // Deep purples, default
    c1: '#0A0A0B', c2: '#4F46E5', c3: '#9333EA' 
  },
  Sonoma: { // Warm Coral / Sunset
    c1: '#1F111E', c2: '#E11D48', c3: '#F59E0B'
  },
  Catalina: { // Deep Ocean
    c1: '#091522', c2: '#0EA5E9', c3: '#0F766E'
  },
  BigSur: { // Vibrant Apple Spring
    c1: '#111827', c2: '#EC4899', c3: '#10B981'
  },
  Sequoia: { // Dark Forest green
    c1: '#061D19', c2: '#059669', c3: '#14B8A6'
  }
};

export type ThemeName = keyof typeof THEMES;

function FluidShader({ activeTheme }: { activeTheme: ThemeName }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: hexToVec3(THEMES[activeTheme].c1) },
    uColor2: { value: hexToVec3(THEMES[activeTheme].c2) },
    uColor3: { value: hexToVec3(THEMES[activeTheme].c3) }
  }), [activeTheme]); // recreate uniforms initially, but we interpolate below dynamically

  // Create a smooth transition effect when the theme changes
  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth color interpolation via Three.js Color lerping
    const target1 = new THREE.Color(THEMES[activeTheme].c1);
    const target2 = new THREE.Color(THEMES[activeTheme].c2);
    const target3 = new THREE.Color(THEMES[activeTheme].c3);
    
    // Read current
    const current1 = new THREE.Color().fromArray(materialRef.current.uniforms.uColor1.value);
    const current2 = new THREE.Color().fromArray(materialRef.current.uniforms.uColor2.value);
    const current3 = new THREE.Color().fromArray(materialRef.current.uniforms.uColor3.value);
    
    // Lerp towards target (.05 step size)
    current1.lerp(target1, 0.05);
    current2.lerp(target2, 0.05);
    current3.lerp(target3, 0.05);
    
    // Apply back
    materialRef.current.uniforms.uColor1.value = [current1.r, current1.g, current1.b];
    materialRef.current.uniforms.uColor2.value = [current2.r, current2.g, current2.b];
    materialRef.current.uniforms.uColor3.value = [current3.r, current3.g, current3.b];
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function FluidBackground({ theme = 'Monterey' }: { theme?: ThemeName }) {
  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-black">
      <Canvas 
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <FluidShader activeTheme={theme} />
      </Canvas>
    </div>
  );
}
