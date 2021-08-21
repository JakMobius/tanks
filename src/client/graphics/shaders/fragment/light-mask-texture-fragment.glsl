#version 100
precision mediump float;

uniform float u_angle;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

varying vec2 v_dark_texture_position;
varying vec2 v_bright_texture_position;
varying vec2 v_mask_position;
varying float v_angle;

vec4 pixel(vec2 delta) {
    vec4 dark = texture2D(u_texture, v_dark_texture_position + delta);
    vec4 bright = texture2D(u_texture, v_bright_texture_position + delta);
    vec4 mask = texture2D(u_texture, v_mask_position + delta);

    float intense = mask.a;
    float angle = mask.r + mod(u_angle - v_angle, 1.0);

    if(angle > 1.0) angle = angle - 1.0;
    if(angle > 0.75) angle = 1.0 - angle;
    if(angle > 0.25) angle = 0.25;

    float interpolation = (1.0 - angle * 4.0) * intense;

    return dark * (1.0 - interpolation) + bright * interpolation;
}

vec4 smoothPixel(vec2 position) {

    float horizontal = abs(position.x - 0.5);
    float vertical = abs(position.y - 0.5);

    int ax, ay;

    if(position.x == 0.5) ax = 0;
    else if(position.x > 0.5) ax = 1;
    else ax = -1;

    if(position.y == 0.5) ay = 0;
    else if(position.y > 0.5) ay = 1;
    else ay = -1;

    float dx = float(ax) / u_texture_size.x;
    float dy = float(ay) / u_texture_size.y;
    vec2 base = (vec2(0.5, 0.5) - position) / u_texture_size;

    vec4 result;

    if(ax == 0) {
        result = pixel(base);
    } else {
        result = pixel(base) * (1.0 - horizontal) + pixel(base + vec2(dx, 0.0)) * (horizontal);
    }

    if(ay != 0) {
        vec4 component;

        if(ax != 0) {
            component = pixel(base + vec2(0.0, dy)) * (1.0 - horizontal) + pixel(base + vec2(dx, dy)) * horizontal;
        } else {
            component = pixel(base + vec2(0.0, dy));
        }

        result = result * (1.0 - vertical) + component * vertical;
    }

    return result;
}

void main() {
    vec2 position = v_mask_position * u_texture_size;
    position.x -= floor(position.x);
    position.y -= floor(position.y);

    vec4 color = smoothPixel(position);
    if(color.a == 0.0) discard;

    gl_FragColor = color;
}