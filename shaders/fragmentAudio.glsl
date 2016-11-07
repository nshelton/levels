	vec3 hsv2rgb(vec3 c)
	{
	    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
	}
	// Audio data textures
	uniform sampler2D freqData;
	uniform sampler2D timeData;

	// Offset and sample size for sampling data textures
	uniform float audioOffset;
	uniform vec2 audioStep;

	// Beat detection. Is = 0 or 1, Was = smoothed value.
	uniform float audioIsBeat;
	uniform float audioWasBeat;

	// Precalculated audio levels, the components being (all, bass, mid, treble).
	// Contains raw levels, smoothed levels and instantaneous change in levels.
	uniform float audioLevels[4];
	uniform float audioLevelsSmooth[4];
	uniform float audioLevelsChange[4];

	// Pass UVs into fragment shader
	varying vec2 vUV;
	varying vec2 vAudioUV;
	varying float distortion;



        float bump(float alpha)
      {
        float lineWidth = 0.1;
        return smoothstep(0.0, lineWidth * 0.25, alpha) * (1.0 - smoothstep(lineWidth * 0.75, lineWidth, alpha));
      }

	// void main() {
	//   float alpha = texture2D(freqData, vAudioUV).a;
	//   vec3 beat = vec3(1.0,0.0,1.0) * audioWasBeat;
	//   vec3 freq = hsv2rgb(vec3(1.0-alpha,1.0,1.0)) * alpha;

	//   vec4 color = vec4(freq+beat, 1.0);

	//   gl_FragColor = color;





      void main(void)
      {
        float colormap = 0.5 + 0.5 * distortion;
        float freq = 64.; // + 5.0 * sin(time);
        vec3 color = vec3(1.0 - colormap, colormap, 1.0) * colormap;
        color = vec3( bump( fract(vUV.x * freq )),
                      bump( fract(distortion * freq )),
                      bump( fract(vUV.y * freq )) );

        float topo = bump( fract(distortion * freq ));
        float xmod = bump( fract(vUV.x * freq ));

        color = vec3(vUV.y, colormap, vUV.x);
        color = vec3(distortion);


        gl_FragColor = vec4(xmod * color, 1.0);
	}