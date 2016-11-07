
// var shader_raymarch, shader_render, shader_post, audio;
    var M_PI = 3.141519 ;
    var TWO_PI = 3.141519 * 2.0;

var Uniforms = function() {
  this.rotationy        = 0.0;
  this.rotationz        = 0.0;
  this.rotationx        = 0.0;

  this.dimx             = 0.0;
  this.dimy             = 0.0;
  this.dimz             = 0.0;

  this.translationx             = 0.0;
  this.translationy             = 0.0;
  this.translationz             = 0.0;

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
  this.rgbShift         = 1.0;
	this.absMirror		      = 1.0;
};

// this.update = function() {

//     	uniformName
// 		shader_raymarch.[uniformName].setPosition(a.x, a.y, a.z);
//     	// shader_raymarch
//     }

Math.easeInOutQuart = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t*t*t + b;
  t -= 2;
  return -c/2 * (t*t*t*t - 2) + b;
};

function setupUI(){

    uniforms = new Uniforms();

    gui = new dat.GUI();
    gui.remember(uniforms);
    gui.add(uniforms, "rotationx", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationx.set(value); }).listen();
    gui.add(uniforms, "rotationy", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationy.set(value); }).listen();
    gui.add(uniforms, "rotationz", 0,TWO_PI).onChange(function(value) { shader_raymarch.rotationz.set(value); }).listen();


    gui.add(uniforms, "dimx", 0, 50).onChange(function(value) { shader_raymarch.dimx.set(value); }).listen();
    gui.add(uniforms, "dimy", 0, 50).onChange(function(value) { shader_raymarch.dimy.set(value); }).listen();
    gui.add(uniforms, "dimz", 0, 50).onChange(function(value) { shader_raymarch.dimz.set(value); }).listen();


    gui.add(uniforms, "translationx", -50, 50).listen();
    gui.add(uniforms, "translationy", -50, 50).listen();
    gui.add(uniforms, "translationz", -50, 50).listen();

    gui.add(uniforms, "thickness", 0, 1).onChange(function(value) { shader_raymarch.thickness.set(value); }).listen();
    gui.add(uniforms, "palette", 0, 2).step(1.0/15.0).onChange(function(value) { shader_render.palette.set(value); }).listen();
    gui.add(uniforms, "scale", 0, 1.5).onChange(function(value) { shader_raymarch.scale.set(value); }).listen();
    gui.add(uniforms, "iterCount", 0, 8).step(1.0).onChange(function(value) { shader_raymarch.iterCount.set(value); }).listen();
    gui.add(uniforms, "stepRatio", 0, 1).onChange(function(value) { shader_raymarch.stepRatio.set(value); }).listen();
    gui.add(uniforms, "audioAmount", 0, 1).onChange(function(value) { shader_raymarch.audioAmount.set(value); }).listen();

    gui.add(uniforms, "ao", 0, 1).step(0.1).onChange(function(value) { shader_render.ao.set(value); }).listen();
    gui.add(uniforms, "shadow", 0, 1).step(0.1).onChange(function(value) { shader_render.shadow.set(value); }).listen();
    gui.add(uniforms, "absMirror", 0, 1).onChange(function(value) { shader_raymarch.absMirror.set(value); }).listen();
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


function randomPreset(last, d_rotation) {



  var newRot = new GLOW.Vector3(Math.random(), Math.random(), Math.random());
  newRot = newRot.setLength(d_rotation);

  return {
    rotationy  : newRot.value[0],
    rotationz  : newRot.value[1],
    rotationx  : newRot.value[2]
    // scale      : Math.random()*4 + 1.0
  }
}

function setUniform(shader, id, value)
{
    uniforms[id] = value;
    shader[id].set(value);
}

run = function(shaders) {
  setupUI();

  audio = new ThreeAudio.Source().mic();

	context = new GLOW.Context();
	init(context);

	var w = window.innerWidth;
	var h = window.innerHeight;
	scale = 2;
	
	var fbo_march 			= buildFBO(w/scale, h/scale);
	var fbo_render			= buildFBO(w, h);
	var fbo_noise 			= buildFBO(w, h, genNoise(w,h));

	 shader_raymarch		= buildShader("raymarch", [fbo_noise], shaders, uniforms, audio);
	 shader_render 			= buildShader("render", [fbo_march, fbo_noise], shaders, uniforms, audio);
	 shader_post 			  = buildShader("bloom", [fbo_render, fbo_noise], shaders, uniforms, audio);

  var time = 0.0;

  var rotDelta = new GLOW.Matrix4();
  rotDelta.setRotation(0.001, 0.001, 0.001);
  var rotMag = 0.0;
  var rotateImpulse = false;
  var rotationDir ;


// Transition logic ===================
  var transitioning = true;
  var lastPreset = randomPreset(PRESETS[0], 0);
  var nextPreset = randomPreset(lastPreset, 0);
  var alpha = 0.0;
  var transitionspeed = 0.001;
  var lfo = 0.0;
  var wait = 0.0;


  // ================ ===================
  var accumulator = 0;
  var beat = 0;
  var smoothBPM = 120;

	function render() {
    var frameStart = Date.now();

		controls.update();
    stats.update();
    audio.update();
      syncAudio(shader_raymarch, audio);

    time += 1/60;
    // beat = audio.data.beat.bpm;

		var a = camera.position;
		var r = camera.rotation;

		var t = controls.target;
		var u = camera.up;


    shader_raymarch.modelView.setRotation(uniforms.rotationx, uniforms.rotationy, uniforms.rotationz) ;
    shader_raymarch.modelView.setPosition(uniforms.translationx, uniforms.translationy, uniforms.translationz) ;


		shader_raymarch.camMat.setPosition(a.x, a.y, a.z);
		shader_raymarch.camMat.lookAt(
			{value:[t.x, t.y, t.z]},
			{value:[u.x, u.y, u.z]}
		);


    // shader_post.rgbShift.set(audio.data.levels.smooth[3] * uniforms.audioAmount)

    // shader_raymarch.thickness.set(Math.sin(lfo)* 0.25  + uniforms.thickness);

		shader_raymarch.time.set(time);
		shader_render.time.set(time);

		requestAnimationFrame(render);
    // if(transitioning) {
    //   if(alpha > 1.0 ) {// done transitioning
    //     alpha = 0.0
    //     transitioning = false;
    //     lastPreset = nextPreset;
    //     nextPreset = randomPreset(lastPreset,audio.data.levels.direct[3] * 2.0);
    //   }


    //   setPreset(nextPreset, lastPreset, alpha, uniforms, gui);
    //   alpha += transitionspeed;

    // } else{
    //   wait += transitionspeed /2.;

    //   if(wait > 1.0) {
    //     transitioning = true;
    //     wait = 0;
    //   }

    // }

    if ( beat < 0.5) {
      if(!rotateImpulse) {
        rotationDir = new GLOW.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).setLength(0.0001);
        // target = 
      }
    } else {
      rotateImpulse = false;
    }

    rotmag = Math.easeInOutQuart(beat, 0, 1, 1);
      // setUniform(shader_raymarch, "rotationx",  last.rotationx, target.rotationx)
      setUniform(shader_raymarch, "rotationx",  uniforms.rotationx + rotationDir.value[0] * rotmag)
      setUniform(shader_raymarch, "rotationy",  uniforms.rotationy + rotationDir.value[1] * rotmag)
      setUniform(shader_raymarch, "rotationz",  uniforms.rotationz + rotationDir.value[2] * rotmag)


      uniforms.translationx = Math.sin(lfo/ 32.) * 10 + 10;
      uniforms.translationy = Math.sin(lfo/ 16.) * 10 + 10;
      uniforms.translationz = Math.sin(lfo/ 8.) * 10 + 10;


      // setUniform(shader_raymarch, "dimx",  audio.data.levels.smooth[0] * 40 + 1);
      // setUniform(shader_raymarch, "dimy",  audio.data.levels.smooth[1] * 40 + 1);
      // setUniform(shader_raymarch, "dimz",  audio.data.levels.smooth[2] * 40 + 1);

    // nice n easy / constantv
    // transitionspeed = 1/128 * (audio.data.beat.bpm / 360);





    // if(audio.data.beat.is)
      // alpha = 0.900;
      var weight =  audio.data.beat.confidence * 0.01;

    smoothBPM = audio.data.beat.bpm * weight + smoothBPM * (1.0 - weight)
    lfo =  (TWO_PI * 60 * time) / smoothBPM;
    beat = (lfo / 4) % 4; 

    shaderPass(context, shader_raymarch, fbo_march)
    shaderPass(context, shader_render, fbo_render)

    shader_post.draw();

	}


	render();

}