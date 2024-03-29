#version 100
precision mediump float;

attribute vec3 a_vertex_position;
attribute vec2 a_texture_position;

varying vec2 v_texture_position;
uniform mat3 u_matrix;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_vertex_position.xy, 1)).xy, a_vertex_position.z, 1.0);
    v_texture_position = a_texture_position;
}