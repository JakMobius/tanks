#version 100
precision mediump float;

attribute vec2 a_vertex_position;
varying vec2 v_texture_position;

void main() {
    gl_Position = vec4(a_vertex_position, 0.0, 1.0);
    v_texture_position = (a_vertex_position + vec2(1.0, 1.0)) / 2.0;
}