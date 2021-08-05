#version 100
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_truck_position;
varying float v_distance;
varying vec4 v_truck_texture;
varying float v_radius;
varying float v_truck_length;

void main() {
    vec2 position = v_truck_position;

    if(position.y < v_radius) {
        float angle = asin((v_radius - position.y) / v_radius);
        position.y = v_radius - angle * v_radius;
    }

    if(position.y > 1.0 - v_radius) {
        float angle = asin((v_radius - 1.0 + position.y) / v_radius);
        position.y = 1.0 - v_radius + angle * v_radius;
    }

    position.x = v_truck_texture.x + v_truck_texture.z * mod(position.x, 1.0);
    position.y = v_truck_texture.y + v_truck_texture.w * mod(position.y * v_truck_length + v_distance, 1.0);

    gl_FragColor = texture2D(u_texture, position);
}
