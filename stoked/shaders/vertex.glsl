

attribute   vec3  vertices;

void main(void)
{
	gl_Position = vec4(vertices.x, vertices.y, 1.0, 1.0 );
}
