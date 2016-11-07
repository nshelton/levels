
// var shader_raymarch, shader_render, shader_post, audio;
    var TWO_PI = 3.141519 * 2.0

var Uniforms = function() {
  this.rotationy        = 0.0;
  this.rotationz        = 0.0;
  this.rotationx        = 0.0;

  this.dimy             = 0.0;
  this.dimz             = 0.0;
  this.dimx             = 0.0;
  this.thickness        = 0.01;
  this.palette          = 0.0;
  this.ao               = 0.0;
  this.shadow           = 0.0;
  this.scale            = 1.1;
  this.iterCount        = 3;
  this.stepRatio        = 1;

	this.time             = 1.0;
	this.width            = window.innerWidth;
	this.height           = window.innerHeight;
	this.shadeDelta   	  = 0.001;
  this.termThres        = 0.001;
  this.audioAmount      = 1.0;
	this.rgbShift		      = 1.0;
};

// this.update = function() {

//     	uniformName
// 		shader_raymarch.[uniformName].setPosition(a.x, a.y, a.z);
//     	// shader_raymarch
//     }


function setupUI(){

    uniforms = new Uniforms();

    gui = new dat.GUI();
    gui.remember(uniforms);
    gui.add(uniforms, "rotationx", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationx.set(value); });
    gui.add(uniforms, "rotationy", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationy.set(value); });
    gui.add(uniforms, "rotationz", 0,TWO_PI).onChange(function(value) { shader_raymarch.rotationz.set(value); });


    gui.add(uniforms, "dimx", 0, 50).onChange(function(value) { shader_raymarch.dimx.set(value); });
    gui.add(uniforms, "dimy", 0, 50).onChange(function(value) { shader_raymarch.dimy.set(value); });
    gui.add(uniforms, "dimz", 0, 50).onChange(function(value) { shader_raymarch.dimz.set(value); });

    gui.add(uniforms, "thickness", 0, 1).onChange(function(value) { shader_raymarch.thickness.set(value); });
    gui.add(uniforms, "palette", 0, 2).step(1.0/15.0).onChange(function(value) { shader_render.palette.set(value); });
    gui.add(uniforms, "scale", 1, 5).onChange(function(value) { shader_raymarch.scale.set(value); });
    gui.add(uniforms, "iterCount", 0, 8).onChange(function(value) { shader_raymarch.iterCount.set(value); });
    gui.add(uniforms, "stepRatio", 0, 1).onChange(function(value) { shader_raymarch.stepRatio.set(value); });
    gui.add(uniforms, "audioAmount", 0, 1).onChange(function(value) { shader_raymarch.audioAmount.set(value); });

    gui.add(uniforms, "ao", 0, 1).step(0.1).onChange(function(value) { shader_render.ao.set(value); });
    gui.add(uniforms, "shadow", 0, 1).step(0.1).onChange(function(value) { shader_render.shadow.set(value); });
}


$(document).ready(function() {

  new GLOW.Load({
    vertex:		"./shaders/vertex.glsl",
    bloom:		"./shaders/bloom.glsl",
    raymarch:	"./shaders/raymarch.glsl",
    render:		"./shaders/render.glsl",

    onLoadComplete: run

  });
});


function randomPreset(last) {


  var channel = Math.floor(Math.random() * 3);


  return {
    rotationy  : Math.random() * TWO_PI,
    rotationz  : Math.random() * TWO_PI,
    rotationx  : Math.random() * TWO_PI,

    dimy       : last.dimy,
    dimz       : last.dimz,
    dimx       : last.dimx,
    // scale      : Math.random()*4 + 1.0
  }
}


run = function(shaders) {
  setupUI();

  audio = new ThreeAudio.Source().mic();

	context = new GLOW.Context();
	init(context);

	var w = window.innerWidth;
	var h = window.innerHeight;
	scale = 1;
	
	var fbo_march 			= buildFBO(w/scale, h/scale);
	var fbo_render			= buildFBO(w, h);
	var fbo_noise 			= buildFBO(w, h, genNoise(w,h));

	 shader_raymarch		= buildShader("raymarch", [fbo_noise], shaders, uniforms, audio);
	 shader_render 			= buildShader("render", [fbo_march, fbo_noise], shaders, uniforms, audio);
	 shader_post 			  = buildShader("bloom", [fbo_render, fbo_noise], shaders, uniforms, audio);

  var time = 0.0;

  var rotDelta = new GLOW.Matrix4();
  rotDelta.setRotation(0.001, 0.001, 0.001);

// Transition logic ===================
  var transitioning = true;
  var lastPreset = randomPreset(PRESETS[0]);
  var nextPreset = randomPreset(lastPreset);
  var alpha = 0.0;
  var transitionspeed = 0.001;
  var lfo = 0.0;
  var wait = 0.0;


  // ================ ===================

  var accumulator = 0;
	function render() {
		controls.update();
    stats.update();
    audio.update();
      syncAudio(shader_raymarch, audio);

    time =  Date.now() * 1000.;


		var a = camera.position;
		var r = camera.rotation;

		var t = controls.target;
		var u = camera.up;


		shader_raymarch.camMat.setPosition(a.x, a.y, a.z);
		shader_raymarch.camMat.lookAt(
			{value:[t.x, t.y, t.z]},
			{value:[u.x, u.y, u.z]}
		);


    shader_post.rgbShift.set(audio.data.levels.smooth[3])

    // shader_raymarch.thickness.set(Math.sin(lfo)* 0.25  + uniforms.thickness);

		shader_raymarch.time.set(time);
		shader_render.time.set(time);

		requestAnimationFrame(render);
    if(transitioning) {
      if(alpha >1.0 ) {// done transitioning
        alpha = 0.0
        transitioning = false;
        lastPreset = nextPreset;
        nextPreset = randomPreset(lastPreset);
      }

      setPreset(nextPreset, lastPreset, alpha, uniforms, gui);
      alpha += transitionspeed;

    } else{
      wait += transitionspeed /2.;

      if(wait > 1.0) {
        transitioning = true;
        wait = 0;
      }

    }
    // nice n easy / constant
    // transitionspeed = 1/128 * (audio.data.beat.bpm / 360);

    transitionspeed = 1/16 * (audio.data.beat.bpm / 360);
    lfo += 4.0 * transitionspeed* TWO_PI;

    // if(audio.data.beat.is)
      // alpha = 0.0;

    shaderPass(context, shader_raymarch, fbo_march)
    shaderPass(context, shader_render, fbo_render)

    shader_post.draw();
	}


	render();

}