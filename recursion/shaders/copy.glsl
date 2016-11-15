uniform sampler2D 	source0; 	// final

void main()
{
	vec2 uv = gl_FragCoord.xy / vec2(width, height);
	gl_FragColor = texture2D(source0, uv);
}