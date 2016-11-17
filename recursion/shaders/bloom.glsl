uniform sampler2D 	source0; 	// final

uniform 	float 	width;
uniform 	float 	height;
uniform 	float 	time;
uniform 	float 	rgbShift;

void main()
{
	vec2 uv = gl_FragCoord.xy / vec2(width, height);
	//  delta 
	vec2 c = uv * 2.0 - 1.0;
	// c.x *= width/height;
	vec2 del = c * rgbShift * 0.01;

	vec4 r = texture2D(source0, uv - del);
	vec4 g = texture2D(source0, uv );
	vec4 b = texture2D(source0, uv + del);


	vec4 total = vec4(r.r, g.g, b.b, 1.0);

	gl_FragColor = total ; //pow(total, vec4(1.0/2.2));

	// gl_FragColor = vec4(del.xy, 1.0, 1.0) ;

}