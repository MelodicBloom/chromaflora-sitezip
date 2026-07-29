precision highp float;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uComplexity;
void main() {
  vec3 p = position;
  p.xy += vec2(sin(p.y * 0.02 + uTime), cos(p.x * 0.02 + uTime)) * 0.5 * uComplexity;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = 1.5;
}
