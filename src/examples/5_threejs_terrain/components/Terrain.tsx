import React from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  uniform sampler2D uHeightmap;
  varying vec2 vUv;
  varying float vHeight;

  void main() {
    vUv = uv;
    
    vec4 heightData = texture2D(uHeightmap, uv);
    vHeight = -10000.0 + (heightData.r * 256.0 * 256.0 + heightData.g * 256.0 + heightData.b) * 0.1;
    // vHeight = 0.0;
    // vHeight = heightData.r;
    
    vec3 transformed = position;
    // transformed.z = (vHeight + 10000.0); // Scale the height
    // transformed.z = (vHeight + 10000.0) * 250.0;
    // transformed.z = vHeight;
    transformed.z = vHeight - 100.0;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
uniform sampler2D uHeightmap;
uniform sampler2D uOrtho;
  varying float vHeight;
  varying vec2 vUv;
 

float rescale(float x, float a, float b, float d, float e) {
    return d + (x - a) * (e - d) / (b - a);
}


  void main() {
    // float height = rescale(vHeight, -10000.0, -9600.0, 0.0, 1.0);
    // gl_FragColor = vec4(height, height, height, 1.0); // Simple grayscale based on height
    vec4 heightMapSample = texture2D(uHeightmap, vUv);
    vec4 orthoSample = texture2D(uOrtho, vUv);
    gl_FragColor = orthoSample * heightMapSample;
}
`;

interface Props {
  heightmapUrl: string;
  orthoUrl: string;
}

export const Terrain: React.FC<Props> = ({ heightmapUrl, orthoUrl }) => {
  const heightmapTexture = useLoader(THREE.TextureLoader, heightmapUrl);
  const orthoTexture = useLoader(THREE.TextureLoader, orthoUrl);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uHeightmap: { value: heightmapTexture },
      uOrtho: { value: orthoTexture }
    },
    vertexShader,
    fragmentShader
  });

  return (
    <mesh material={shaderMaterial}>
      <planeGeometry args={[100, 100, 256, 256]} />
    </mesh>
  );
};
