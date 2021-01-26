#version 100

uniform int u_brush_diameter;
uniform float u_brush_square_radius;
uniform float u_block_size;
uniform vec4 u_color;
uniform vec2 u_brush_center;

varying vec2 v_position;

void main() {
    if(u_brush_diameter == 0) {
        gl_FragColor = u_color;
    } else {
        vec2 delta = u_brush_center - v_position;

        if(mod(float(u_brush_diameter), 2.0) == 0.0) {
            delta.x = floor(abs(delta.x) / u_block_size) * u_block_size;
            delta.y = floor(abs(delta.y) / u_block_size) * u_block_size;
            delta.x += u_block_size / 2.0;
            delta.y += u_block_size / 2.0;
        } else {
            delta.x = floor(abs(delta.x) / u_block_size + 0.5) * u_block_size;
            delta.y = floor(abs(delta.y) / u_block_size + 0.5) * u_block_size;
        }

        float distance = delta.x * delta.x + delta.y * delta.y;

        if(distance <= u_brush_square_radius) {
            gl_FragColor = u_color;
        } else {
            discard;
        }
    }
}
