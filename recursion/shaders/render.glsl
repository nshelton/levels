#ifdef GL_ES
	precision highp float;
#endif

uniform sampler2D 	source0; 	// low res
uniform sampler2D 	source1; 	// noise
uniform sampler2D 	colormap; 	// colormap


uniform 	float 	width;
uniform 	float 	height;
uniform 	float 	time;
uniform 	float 	palette;
uniform 	float 	ao;
uniform 	float 	shadow;

uniform sampler2D audio_freq;
uniform sampler2D audio_time;

void main()
{

	//  get reconstructino info
	vec2 uv =  gl_FragCoord.xy / vec2(width, height);

	vec4 p = texture2D(source0, uv);
	vec4 n = texture2D(source1, fract(uv + time*10.)) - 0.5;
	// basic color
	// vec3 color = mix(vec3(1.,0.,1.), vec3(0.,1.,1.), p.z);
	float color_param = (palette >= 1.0) ?  p.y : 1.0 - p.y;
	vec3 color = texture2D(colormap, vec2(fract(palette + 1.0/32.0), (color_param))).rgb;

	// color *= p.z * (1.0 - p.y);
	// vignette
	color *= (1. - length(uv-0.5));
	// color *= exp(1. - (p.x + n.y));
	// color *= exp(- p.y);
	color += n.xxx / 7.;


	// vec3 d_col = vec3( 1. / p.x );

	float scanline = pow(sin(uv.y*height) + 1., .2)  ;
	// color *= scanline;


	gl_FragColor = vec4(color * (ao +  (1.0 - p.y * (1.0 - ao))) * (shadow +  p.z * (1.0 - shadow)) , 1.0) ;
	// gl_FragColor = vec4((p.xyz / 100.) , 1.0) ;

}