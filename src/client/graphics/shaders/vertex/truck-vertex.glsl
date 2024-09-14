#version 100
precision mediump float;

uniform mat3 u_matrix;

attribute vec4 a_truck_texture;
attribute vec3 a_vertex_position;
attribute vec2 a_truck_position;
attribute float a_truck_distance;
attribute float a_radius;
attribute float a_truck_length;

varying vec2 v_truck_position;
varying float v_distance;
varying vec4 v_truck_texture;
varying float v_radius;
varying float v_truck_length;

void main() {
    gl_Position = vec4((u_matrix * vec3(a_vertex_position.xy, 1)).xy, a_vertex_position.z, 1.0);
    v_truck_position = a_truck_position;
    v_distance = a_truck_distance;
    v_truck_length = a_truck_length;
    v_truck_texture = a_truck_texture;
    v_radius = a_radius;
}
