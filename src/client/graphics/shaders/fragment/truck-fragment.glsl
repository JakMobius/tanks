#version 100
precision mediump float;

uniform vec4 u_truck_texture;
uniform float u_radius;
uniform float u_truck_length;
uniform sampler2D u_texture;

varying vec2 v_truck_position;
varying float f_distance;

void main() {
    vec2 position = v_truck_position;

    if(position.y < u_radius) {
        float angle = asin((u_radius - position.y) / u_radius);
        position.y = u_radius - angle * u_radius;
    }

    if(position.y > 1.0 - u_radius) {
        float angle = asin((u_radius - 1.0 + position.y) / u_radius);
        position.y = 1.0 - u_radius + angle * u_radius;
    }

    position.x = u_truck_texture.x + u_truck_texture.z * mod(position.x, 1.0);
    position.y = u_truck_texture.y + u_truck_texture.w * mod(position.y * u_truck_length + f_distance, 1.0);

    gl_FragColor = texture2D(u_texture, position);

}
