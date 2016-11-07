function shaderPass(context, shader, tgt) {
	context.cache.clear();
	tgt.bind();
	shader.draw();
	tgt.unbind();
}

function emptyTexture(w) {
  return new GLOW.Texture( { 
    data: new Uint8Array(w),
    format: GL.ALPHA,       
    internalFormat: GL.ALPHA,
    autoUpdate: true,
    width: w,
    height: 1
  });
}

	function buildShader(frag_id, in_textures, shaders, uniforms, audio) {

	var GLOW_uniforms = {
		vertices	: [1, -1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0],
		uvs			: [1, 0, 1, 1, 0, 1, 0, 0],
		indices		: [0, 1, 2, 0, 2, 3],
		camMat 		: new GLOW.Matrix4(),
		modelView   : new GLOW.Matrix4(),
		colormap	: new GLOW.Texture( { 
			data		:"../img/colormap.png", 
			minFilter:  GL.LINEAR, 
			wrap : 		GL.CLAMP_TO_EDGE
		} ),
		audio_time : emptyTexture(512),
		audio_freq : emptyTexture(512),

		audioLevels : new GLOW.Vector4(),
		audioLevelsSmooth : new GLOW.Vector4(),
		audioLevelsAccum : new GLOW.Vector4(),
		audioIsBeat : new GLOW.Float(0),
		beatAccum : new GLOW.Float(0)
	};

    GLOW_uniforms.audio_time.data = audio.data.time;
    GLOW_uniforms.audio_freq.data = audio.data.freq;

	for( var i = 0; i < in_textures.length; i ++) {
		GLOW_uniforms["source"+i] = in_textures[i];
	}

	for (i in uniforms) {
		GLOW_uniforms[i] = new GLOW.Float(uniforms[i]);
	}

	console.log(GLOW_uniforms);

	return new GLOW.Shader({
		data : GLOW_uniforms,
			vertexShader:  shaders.vertex.fragmentShader,
        fragmentShader: shaders[frag_id].fragmentShader,
		indices: GLOW.Geometry.Plane.indices()
	});
}

function buildFBO(w, h, data) {
	if (!data)
		data = w * h * 4;

	return new GLOW.FBO( { 
		width: w, 
		height: h,
	    depth: false,
	    data: new Float32Array(data),
		type: GL.FLOAT,
		// minFilter: GL.NEAREST,
		// magFilter: GL.NEAREST
	});
};

function init(context) {
	context.enableExtension("OES_texture_float" );
	context.enableExtension("OES_texture_float_linear");

	var container = document.getElementById( 'container' );
	container.appendChild( context.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	camera = new THREE.PerspectiveCamera( 60, 1.0, 0.1, 1000);

	controls = new THREE.TrackballControls(camera, context.domElement);
	controls.target.set(0,0, 0);
	camera.position.set(0,0, 100);
	controls.noZoom = false;
	controls.noPan = false;


	controls.rotateSpeed = 0.5;
	controls.zoomSpeed = 2.;
	controls.panSpeed = 0.3;
	controls.dynamicDampingFactor = .6;


}

function genNoise(w, h) {
	data = []
	for ( var i = 0; i < w * h * 4; i++ )
		data.push(Math.random())

	return data; 
}
function syncAudio(shader, audio) {
	if (!shader)
		return;

    shader.beatAccum.add(audio.data.beat.was);

    shader.audioIsBeat.set(audio.data.beat.confidence);

    shader.audioLevels.set(
    	audio.data.levels.direct[0],
    	audio.data.levels.direct[1],
    	audio.data.levels.direct[2], 
    	audio.data.levels.direct[3]);

    shader.audioLevelsSmooth.set( 
    	audio.data.levels.smooth[0],
    	audio.data.levels.smooth[1], 
    	audio.data.levels.smooth[2],
    	audio.data.levels.smooth[3] );

    shader.audioLevelsAccum.addSelf(
    	new GLOW.Vector4( 
    	audio.data.levels.smooth[0],
    	audio.data.levels.smooth[1], 
    	audio.data.levels.smooth[2], 
    	audio.data.levels.smooth[3]) 
    	);

}

function setPreset(preset0, preset1, alpha, uniforms, gui)
{
	var controllers = gui.__controllers;
	for (var i = 0; i < controllers.length; i ++) {

		var name = controllers[i].property;

		if (preset0[name] && preset1[name]) {
			// LERP
			uniforms[name] = alpha * preset0[name] + (1.0 - alpha) * preset1[name];
			controllers[i].setValue(uniforms[name]);
		}
	}
}