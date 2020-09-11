#version 100

varying vec2 v_texture_position;
uniform sampler2D u_texture;
uniform float u_screen_width;
uniform float u_screen_height;

void main() {
    //vec2 pos = v_texture_position;

//    float r = texture2D(u_texture, pos + vec2(20.0 / u_screen_width, 0.0)).r;
//    float g = texture2D(u_texture, pos + vec2(40.0 / u_screen_width, 0.0)).g;
//    float b = texture2D(u_texture, pos + vec2(60.0 / u_screen_width, 0.0)).b;

//    float r = texture2D(u_texture, pos + vec2(20.0 / u_screen_width + sin(pos.y * 10.0) / 30.0, 0.0)).r;
//    float g = texture2D(u_texture, pos + vec2(40.0 / u_screen_width + cos(pos.y * 10.0) / 30.0, 0.0)).g;
//    float b = texture2D(u_texture, pos + vec2(60.0 / u_screen_width - sin(pos.y * 10.0) / 30.0, 0.0)).b;

    gl_FragColor = texture2D(u_texture, v_texture_position);//vec4(r, g, b, 1.0);

//    gl_FragColor = texture2D(u_texture, pos);
}
