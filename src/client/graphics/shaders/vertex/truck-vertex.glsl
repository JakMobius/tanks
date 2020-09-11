#version 100

uniform vec4 u_truck_texture;
uniform mat3 u_matrix;
uniform float u_radius;
uniform float u_truck_length;

attribute vec2 a_vertex_position;
attribute vec2 a_truck_position;
attribute float a_truck_distance;

varying vec2 v_truck_position;
varying float f_distance;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_vertex_position, 1)).xy, 0.0, 1.0);
    v_truck_position = a_truck_position;
    f_distance = a_truck_distance;
}
