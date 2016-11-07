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

	void main() {
	  // Calculate correct UV offset for sampling cyclic audio buffer.
	  vec2 audioUV = vec2(uv.x, uv.y + audioOffset);
	  vUV = uv;

		distortion =   texture2D(freqData, audioUV).a ;

	  // Render time data on a grid.
	  vec3 pos = vec3(
	    position.x,
	    position.z + distortion,
	    position.y);

	  // Pass correct UV offset to fragment shader.
	  vAudioUV = audioUV;

	  // Project vertex into screen space.
	  gl_Position = projectionMatrix *
	                modelViewMatrix *
	                vec4(pos, 1.0);
	}