'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

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
uniform float uTheme; // 0.0: Monterey, 1.0: Sonoma, 2.0: Catalina, 3.0: BigSur, 4.0: Sequoia
varying vec2 vUv;

// === Classic 3D Perlin Noise ===
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x); vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0); vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1); vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
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

// === Voronoi / Cellular ===
vec2 hash2( vec2 p ) {
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return fract(sin(p)*43758.5453);
}

// === Fish Simulation Helper ===
float drawFish(vec2 uv, vec2 center, float time) {
    vec2 p = uv - center;
    float s = sin(time*0.5);
    float c = cos(time*0.5);
    p = mat2(c, -s, s, c) * p;
    float body = length(p * vec2(1.0, 3.0));
    float bodyMask = smoothstep(0.15, 0.1, body);
    vec2 tailPos = p + vec2(0.0, 0.15);
    float tail = length(tailPos * vec2(1.5, 1.0) - vec2(0.0, 0.05));
    float tailMask = smoothstep(0.1, 0.05, tail) * step(p.y, -0.1);
    return max(bodyMask, tailMask);
}

void main() {
  vec2 uv = vUv;
  vec3 finalColor = uColor1;

  if (uTheme < 0.5) {
    float noise1 = cnoise(vec3(uv * 1.5, uTime * 0.15));
    float noise2 = cnoise(vec3(uv * 2.0 - noise1, uTime * 0.1));
    vec3 color = mix(uColor1, uColor2, noise1 + 0.5);
    finalColor = mix(color, uColor3, noise2 + 0.3);
  } 
  else if (uTheme < 1.5) {
    vec2 pos = uv - vec2(0.5);
    float dist = length(pos);
    float pulse = sin(uTime * 4.0) * 0.03 + 0.35;
    float glow = smoothstep(pulse + 0.2, pulse - 0.4, dist);
    float flare = 0.01 / (dist + 0.01);
    float streaks = max(0.0, 1.0 - length(pos * vec2(10.0, 0.5))) + 
                    max(0.0, 1.0 - length(pos * vec2(0.5, 10.0)));
    vec3 sunColor = mix(uColor2, uColor3, sin(uTime)*0.5+0.5);
    finalColor = mix(uColor1, sunColor, glow);
    finalColor += sunColor * flare * 0.5;
    finalColor += sunColor * streaks * 0.2;
  }
  else if (uTheme < 2.5) {
    float wave = sin(uv.x * 12.0 + uTime) * 0.05 + sin(uv.y * 8.0 + uTime * 1.5) * 0.03;
    vec3 ocean = mix(uColor1, uColor2, uv.y + wave);
    ocean = mix(ocean, uColor3, sin(uv.x * 20.0 - uTime * 2.0) * 0.1 + 0.1);
    float fish1 = drawFish(uv, vec2(sin(uTime*0.4)*0.4+0.5, cos(uTime*0.3)*0.3+0.5), uTime);
    float fish2 = drawFish(uv, vec2(sin(uTime*0.5+2.0)*0.3+0.4, cos(uTime*0.4+1.0)*0.4+0.6), uTime*1.2);
    float fish3 = drawFish(uv, vec2(sin(uTime*0.3+4.0)*0.5+0.5, cos(uTime*0.6+3.0)*0.2+0.3), uTime*0.8);
    float totalFish = max(fish1, max(fish2, fish3));
    finalColor = mix(ocean, uColor3, totalFish);
  }
  else if (uTheme < 3.5) {
    vec2 p = uv * 8.0;
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minDist = 1.0;
    for(int y = -1; y <= 1; y++) {
      for(int x = -1; x <= 1; x++) {
        vec2 pt = hash2(i + vec2(float(x), float(y)));
        pt = 0.5 + 0.5 * sin(uTime * 2.5 + 6.2831 * pt);
        minDist = min(minDist, length(vec2(float(x), float(y)) + pt - f));
      }
    }
    float cell = smoothstep(0.3, 0.7, minDist);
    float pulsing = sin(uTime + minDist * 10.0) * 0.5 + 0.5;
    finalColor = mix(uColor1, uColor2, cell);
    finalColor = mix(finalColor, uColor3, pulsing * (1.0 - cell));
  }
  else {
    // 🏔️ Sequoia: Apple Topography Contour Pattern
    float n = cnoise(vec3(uv * 2.0, uTime * 0.1));
    float topo = sin(n * 20.0 + uTime * 0.2);
    float line = smoothstep(0.02, 0.0, abs(topo));
    
    // Multi-layer topo for depth
    float n2 = cnoise(vec3(uv * 4.0, uTime * 0.05));
    float topo2 = sin(n2 * 40.0);
    float line2 = smoothstep(0.01, 0.0, abs(topo2)) * 0.5;
    
    vec3 base = mix(uColor1, uColor2, uv.y + n * 0.3);
    finalColor = mix(base, uColor3, line + line2);
    
    // Vibrant glow in the topography valleys
    finalColor += uColor3 * (1.0 - abs(topo)) * 0.15;
  }

  gl_FragColor = vec4(finalColor * smoothstep(1.0, 0.3, distance(uv, vec2(0.5)) * 0.8), 1.0);
}
`;

const hexToVec3 = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
};

export const THEMES = {
  Monterey: { index: 0, c1: '#0A0A0B', c2: '#4F46E5', c3: '#9333EA' },
  Sonoma: { index: 1, c1: '#421b1b', c2: '#ca8a04', c3: '#fde047' },
  Catalina: { index: 2, c1: '#082f49', c2: '#0ea5e9', c3: '#67e8f9' },
  BigSur: { index: 3, c1: '#064e3b', c2: '#059669', c3: '#34d399' },
  Sequoia: { index: 4, c1: '#1e1b4b', c2: '#4338ca', c3: '#f97316' } // Deep Navy to Vibrant Orange Topo
};

export type ThemeName = keyof typeof THEMES;

function FluidShader({ activeTheme }: { activeTheme: ThemeName }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const theme = THEMES[activeTheme];

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTheme: { value: theme.index },
    uColor1: { value: hexToVec3(theme.c1) },
    uColor2: { value: hexToVec3(theme.c2) },
    uColor3: { value: hexToVec3(theme.c3) }
  }), []); // Keep stable

  useFrame((state) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    
    // Snap immediately (no lerp for theme index)
    u.uTheme.value = theme.index;

    const t1 = new THREE.Color(theme.c1);
    const t2 = new THREE.Color(theme.c2);
    const t3 = new THREE.Color(theme.c3);
    
    const c1 = new THREE.Color().fromArray(u.uColor1.value).lerp(t1, 0.05);
    const c2 = new THREE.Color().fromArray(u.uColor2.value).lerp(t2, 0.05);
    const c3 = new THREE.Color().fromArray(u.uColor3.value).lerp(t3, 0.05);
    
    u.uColor1.value = [c1.r, c1.g, c1.b];
    u.uColor2.value = [c2.r, c2.g, c2.b];
    u.uColor3.value = [c3.r, c3.g, c3.b];
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
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <FluidShader key={theme} activeTheme={theme} />
      </Canvas>
    </div>
  );
}
