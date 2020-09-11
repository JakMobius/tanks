#version 100

attribute vec2 a_vertex_position;
attribute vec4 a_color;

varying vec4 v_color;
uniform mat3 u_matrix;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_vertex_position, 1)).xy, 0.0, 1.0);

    v_color = a_color;
}