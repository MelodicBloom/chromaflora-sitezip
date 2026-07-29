precision highp float;
uniform float uAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.0, d) * uAlpha;
  gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}
