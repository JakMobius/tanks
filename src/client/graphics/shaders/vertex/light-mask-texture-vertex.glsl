#version 100
precision mediump float;

attribute vec2 a_vertex_position;
attribute float a_vertex_angle;
attribute vec2 a_bright_texture_position;
attribute vec2 a_dark_texture_position;
attribute vec2 a_mask_position;

uniform float u_angle;
uniform mat3 u_matrix;
uniform vec2 u_texture_size;

varying vec2 v_dark_texture_position;
varying vec2 v_bright_texture_position;
varying vec2 v_mask_position;
varying float v_angle;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_vertex_position, 1)).xy, 0.0, 1.0);
    v_bright_texture_position = a_bright_texture_position;
    v_dark_texture_position = a_dark_texture_position;
    v_mask_position = a_mask_position;
    v_angle = a_vertex_angle;
}