var camera;

// var shader_raymarch, shader_render, shader_post, audio;
    var M_PI = 3.141519 ;
    var TWO_PI = 3.141519 * 2.0;

var Uniforms = function() {
  this.rotationy        = 0.0;
  this.rotationz        = 0.0;
  this.rotationx        = 0.0;

  this.dimx             = 5.0;
  this.dimy             = 10.0;
  this.dimz             = 1.0;

  this.translationx             = 0.0;
  this.translationy             = 0.0;
  this.translationz             = 0.0;

  this.thickness        = 0.2;
  this.palette          = 0.26;
  this.ao               = 0.8;
  // this.shadow           = 0.2;
  this.scale            = 2.0;
  this.iterCount        = 1;
  this.stepRatio        = 1;

	this.time             = 1.0;
	this.width            = window.innerWidth;
	this.height           = window.innerHeight;
	this.shadeDelta   	  = 0.001;
  this.termThres        = 0.001;
  this.audioAmount      =  0.4;
  this.audioScale       =  0.4;
  this.rgbShift         = 1.0;
  this.absMirror        = 1.0;
  this.circleSize       = 5.0;

  this.beatSync    = true;
  this.automate    = 1;
  this.automateCam = 0.0;

  this.camX = -10;
  this.camY = -10;
  this.camZ = -10;

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

    f1 = gui.addFolder('Geometry');

    f1.add(uniforms, "rotationx", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationx.set(value); }).listen();
    f1.add(uniforms, "rotationy", 0, TWO_PI).onChange(function(value) { shader_raymarch.rotationy.set(value); }).listen();
    f1.add(uniforms, "rotationz", 0,TWO_PI).onChange(function(value) { shader_raymarch.rotationz.set(value); }).listen();


    f1.add(uniforms, "dimx", 0, 50).onChange(function(value) { shader_raymarch.dimx.set(value); }).listen();
    f1.add(uniforms, "dimy", 0, 50).onChange(function(value) { shader_raymarch.dimy.set(value); }).listen();
    f1.add(uniforms, "dimz", 0, 50).onChange(function(value) { shader_raymarch.dimz.set(value); }).listen();


    f1.add(uniforms, "translationx", 0, 50).listen();
    f1.add(uniforms, "translationy", 0, 50).listen();
    f1.add(uniforms, "translationz", 0, 50).listen();
    // f1.add(uniforms, "thickness", 0, 1).onChange(function(value) { shader_raymarch.thickness.set(value); }).listen();
    f1.add(uniforms, "scale", 0, 5).onChange(function(value) { shader_raymarch.scale.set(value); }).listen();
    f1.add(uniforms, "iterCount", 1, 8).step(1.0).onChange(function(value) { shader_raymarch.iterCount.set(value); }).listen();
    f1.add(uniforms, "audioAmount", 0, 40).onChange(function(value) { shader_raymarch.audioAmount.set(value); }).listen();
    f1.add(uniforms, "audioScale", 0, 1).onChange(function(value) { shader_raymarch.audioScale.set(value); }).listen();

    f2 = gui.addFolder('Render');

    f2.add(uniforms, "palette", 0, 2).step(1.0/15.0).onChange(function(value) { shader_raymarch.palette.set(value); }).listen();
    f2.add(uniforms, "stepRatio", 0, 1).onChange(function(value) { shader_raymarch.stepRatio.set(value); }).listen();
    
    f2.add(uniforms, "ao", 0, 1).step(0.1).onChange(function(value) { shader_raymarch.ao.set(value); }).listen();
    // f2.add(uniforms, "shadow", 0, 1).step(0.1).onChange(function(value) { shader_raymarch.shadow.set(value); }).listen();
   
    f3 = gui.addFolder('Camera');
    f3.add(uniforms, "camX",-500, 500).onChange(function(value) { camera.position.x = value; }).listen();
    f3.add(uniforms, "camY",-500, 500).onChange(function(value) { camera.position.y = value; }).listen();
    f3.add(uniforms, "camZ",-500, 500).onChange(function(value) { camera.position.z = value; }).listen();
    f3.add(uniforms, "automateCam", -1, 1);


    gui.add(uniforms, "absMirror", 0, 1).onChange(function(value) { shader_raymarch.absMirror.set(value); }).listen();
    gui.add(uniforms, "circleSize", 0, 10).onChange(function(value) { shader_raymarch.circleSize.set(value); }).listen();
    // gui.add(uniforms, "animationSpeed", 0, 1).onChange(function(value) { shader_raymarch.absMirror.set(value); }).listen();
    gui.add(uniforms, "beatSync");
    gui.add(uniforms, "automate", 1, 5);
}


$(document).ready(function() {

  new GLOW.Load({
    vertex:		"./shaders/vertex.glsl",
    bloom:		"./shaders/bloom.glsl",
    raymarch:	"./shaders/raymarch.glsl",
    render:   "./shaders/render.glsl",
    fxaa:		  "./shaders/fxaa.glsl",

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
	scale = 3;

	// var fbo_march 			= buildFBO(w/scale, h/scale);
  var fbo_render      = buildFBO(w/scale, h/scale);
  var fbo_fxaa        = buildFBO(w, h);
  var fbo_fxaa_swap   = buildFBO(w, h);
	var fbo_noise 			= buildFBO(w, h, genNoise(w,h));

	shader_raymarch		  = buildShader("raymarch", [fbo_noise], shaders, uniforms, audio);
	// shader_render 			= buildShader("render", [fbo_march, fbo_noise], shaders, uniforms, audio);
  shader_post         = buildShader("fxaa", [fbo_render], shaders, uniforms, audio);
  shader_post2        = buildShader("fxaa", [fbo_fxaa], shaders, uniforms, audio);
  shader_post3        = buildShader("fxaa", [fbo_fxaa_swap], shaders, uniforms, audio);
  shader_display        = buildShader("bloom", [fbo_render], shaders, uniforms, audio);
	// shader_copy 	    = buildShader("copy", [fbo_render, fbo_noise], shaders, uniforms, audio);

  var time = 0.0;

  var rotDelta = new GLOW.Matrix4();
  rotDelta.setRotation(0.001, 0.001, 0.001);
  var rotMag = 0.0;
  var rotateImpulse = true;
  var rotationDir = new GLOW.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();



// Transition logic ===================
  var transitioning = true;
  var thisPreset = PRESETS[0];
  var nextPreset = PRESETS[1]
   alpha = 0.0;
  var preset_index = 2;
  var transitionspeed = 0.001;
   lfo = 0.0;
  var wait = 0.0;


  // ================ ===================
  var accumulator = 0;
  beat = 0;
  smoothBPM = 12;
  startTime = Date.now() ;

	function render() {

		controls.update();
    stats.update();
    if(uniforms.beatSync)
    {
      syncAudio(shader_raymarch, audio);
      audio.update();
    }


    time = (Date.now() - startTime) / 1000;
    // beat = audio.data.beat.bpm;

    if ( uniforms.automateCam != 0 ) {
      camera.position.set(uniforms.camX * Math.sin(time* uniforms.automateCam), 
                          uniforms.camY * Math.cos(time* uniforms.automateCam),
                           uniforms.camZ * Math.cos(time* uniforms.automateCam));
    } else {
      uniforms.camX = camera.position.x;
      uniforms.camY = camera.position.y;
      uniforms.camZ = camera.position.z;

    }


		var a = camera.position;
		var r = camera.rotation;

		var t = controls.target;
		var u = camera.up;

		shader_raymarch.camMat.setPosition(a.x, a.y, a.z);
		shader_raymarch.camMat.lookAt(
			{value:[t.x, t.y, t.z]},
			{value:[u.x, u.y, u.z]}
		);


    shader_post.rgbShift.set(audio.data.levels.smooth[3] * uniforms.audioAmount)

    // shader_raymarch.thickness.set(Math.sin(lfo)* 0.25  + uniforms.thickness);
    shader_display.rgbShift.set(audio.data.levels.smooth[2] + 0.1);

		shader_raymarch.time.set(time);
		// shader_render.time.set(time);

		requestAnimationFrame(render);


    if ( uniforms.automate ) {
          function envelope(t) {
            var t_attack = 0.2;
            var t_sustain = 1;
            var t_decay = 2;

            if(t < t_attack) {
              return 0.1
            } else if (t < t_sustain) {
              return 0.001
            } else if (t < t_decay) {
              return 0.001
            } else {
              return 0.001
            }
      }



      // if ( beat < 2) {
      //   if(rotateImpulse) {
      //     thisPreset = $.extend(true, {}, nextPreset);
      //     nextPreset = $.extend(true, {}, PRESETS[(preset_index++) % PRESETS.length]);
      //     rotationDir = new GLOW.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      //     rotateImpulse = false;
      //     console.log(preset_index)

      //   }

      // setPreset(thisPreset, nextPreset, 1.0 -  beat / 2, uniforms, [f3, f1])

      // // console.log(thisPreset, nextPreset, beat* 2)

      // } else {
      //     rotateImpulse = true;
      //     alpha= 0.0;
      // }
      setUniform(shader_raymarch, "circleSize", audio.data.levels.smooth[3] * uniforms.audioAmount);


      // strictly adding
       rotMag = Math.pow(10.0, -uniforms.automate); //envelope(beat);

      // rotmag = Math.easeInOutQuart(beat, 0, 1, 1);
        // setUniform(shader_raymarch, "rotationx",  last.rotationx, target.rotationx)
        setUniform(shader_raymarch, "rotationx",  uniforms.rotationx + rotationDir.value[0] * rotMag)
        setUniform(shader_raymarch, "rotationy",  uniforms.rotationy + rotationDir.value[1] * rotMag)
        setUniform(shader_raymarch, "rotationz",  uniforms.rotationz + rotationDir.value[2] * rotMag)


        uniforms.translationx += Math.sin(lfo/ 12.) * rotMag;
        uniforms.translationy += Math.sin(lfo/ 18.) * rotMag;
        uniforms.translationz += Math.sin(lfo/ 24.) * rotMag


        // setUniform(shader_raymarch, "dimx",  Math.sin(lfo/ 4.) * 25 + 25);
        setUniform(shader_raymarch, "dimy",  uniforms.dimy + rotMag * Math.sin(lfo/ 16.));
        setUniform(shader_raymarch, "dimz",  uniforms.dimz + rotMag * Math.sin(lfo/ 64.)) ;
        // setUniform(shader_raymarch, "absMirror",  Math.sin(lfo/ 8.) * 0.5 + 0.5  ) ;
        // setUniform(shader_raymarch, "scale",  Math.sin(lfo/ 8.) * 0.25 + 1.25 ) ;

      // nice n easy / constantv
      // transitionspeed = 1/128 * (audio.data.beat.bpm / 360);

    }

      shader_raymarch.modelView.setRotation(uniforms.rotationx, uniforms.rotationy, uniforms.rotationz) ;
      shader_raymarch.modelView.setPosition(uniforms.translationx, uniforms.translationy, uniforms.translationz) ;


    if (uniforms.beatSync) {
        var weight =  audio.data.beat.confidence * 0.001;
        smoothBPM = audio.data.beat.bpm * weight + smoothBPM * (1.0 - weight);
    }

    lfo =  (TWO_PI * time / 60) * smoothBPM;
    beat = (lfo/16.0) % 4;


    // now do all the rendering
    shaderPass(context, shader_raymarch, fbo_render)

    // 3x fxaa is kind of whack, neeed to consolidate these maybe. Or just add a blur
    // shaderPass(context, shader_post, fbo_fxaa)
    // shaderPass(context, shader_post2, fbo_fxaa_swap)
    // shaderPass(context, shader_post3, fbo_fxaa)


    shader_display.draw();
    // shader_post.draw();

	}


	render();

}
