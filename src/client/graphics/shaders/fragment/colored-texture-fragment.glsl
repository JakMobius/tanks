#version 100
precision mediump float;

varying vec4 v_color;
varying vec2 v_texture_position;
uniform sampler2D u_texture;

void main() {
    vec4 color = texture2D(u_texture, v_texture_position);
    if(color.a == 0.0) discard;
    gl_FragColor = color * v_color;
}
