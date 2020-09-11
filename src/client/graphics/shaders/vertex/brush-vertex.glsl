#version 100

attribute vec2 a_vertex_position;

uniform mat3 u_matrix;
uniform vec4 u_color;
uniform float u_block_size;
varying vec2 v_position;

void main() {
    v_position = a_vertex_position;
    gl_Position = vec4((u_matrix * vec3(a_vertex_position, 1)).xy, 0.0, 1.0);
}