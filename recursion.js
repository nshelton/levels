var camera;

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
  this.scale            = 0.9;
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
  this.circleSize       = 1.0;

  this.pause       = false;
  this.beatSync    = true;
  this.automate    = 1;
  this.automateCam = 0.0;

  this.camX = -10;
  this.camY = -10;
  this.camZ = -10;
  this.g_frameScale = 2;

  this.automateFreq = 1.0;

  this.autoRotX = 0;
  this.autoRotY = 0;
  this.autoRotZ = 0;

  this.autoTransX = 0;
  this.autoTransY = 0;
  this.autoTransZ = 0;

  this.autoDimX = 0;
  this.autoDimY = 0;
  this.autoDimZ = 0;

  this.paramSmoothing = 1.0;
  
};

function setupWebSockets() {
  var socket = io.connect('//localhost:3000');
  
  socket.on("data", function(data) {
    uniforms[data[0]] = data[1];

    if (shader_raymarch[data[0]]){
      console.log(data)
      shader_raymarch[data[0]].set([data[1]]);
    }

    console.log(data[0], data[1]);
  });
  
  socket.on('error', function() {
      console.error(arguments)
  });
}

function setupUI(){

    uniforms = new Uniforms();

    gui = new dat.GUI();
    gui.remember(uniforms);

    var automations = ["autoRotX", "autoRotY", "autoRotZ", "autoTransX", "autoTransY", "autoTransZ",  "autoDimX", "autoDimY", "autoDimZ"]
    f0 = gui.addFolder('Automation');

    for (var i = 0; i < automations.length; i ++) 
      f0.add(uniforms, automations[i], 0, 1);

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
    f1.add(uniforms, "scale", 0.5, 2).onChange(function(value) { shader_raymarch.scale.set(value); }).listen();
    f1.add(uniforms, "iterCount", 1, 8).step(1.0).onChange(function(value) { shader_raymarch.iterCount.set(value); }).listen();
    f1.add(uniforms, "audioAmount", 0, 40).onChange(function(value) { shader_raymarch.audioAmount.set(value); }).listen();
    f1.add(uniforms, "audioScale", 0, 1).onChange(function(value) { shader_raymarch.audioScale.set(value); }).listen();

    f2 = gui.addFolder('Render');

    f2.add(uniforms, "palette", 0, 2).step(1.0/15.0).onChange(function(value) { shader_raymarch.palette.set(value); }).listen();
    f2.add(uniforms, "stepRatio", 0, 1).onChange(function(value) { shader_raymarch.stepRatio.set(value); }).listen();
    f2.add(uniforms, "ao", 0, 1).step(0.1).onChange(function(value) { shader_raymarch.ao.set(value); }).listen();
   
    f3 = gui.addFolder('Camera');
    var camRange = 1000;
    f3.add(uniforms, "camX",-camRange, camRange).onChange(function(value) { camera.position.x = value; }).listen();
    f3.add(uniforms, "camY",-camRange, camRange).onChange(function(value) { camera.position.y = value; }).listen();
    f3.add(uniforms, "camZ",-camRange, camRange).onChange(function(value) { camera.position.z = value; }).listen();
    f3.add(uniforms, "automateCam", 0, 1);


    gui.add(uniforms, "absMirror", 0, 1).onChange(function(value) { shader_raymarch.absMirror.set(value); }).listen();
    gui.add(uniforms, "circleSize", 0, 10).onChange(function(value) { shader_raymarch.circleSize.set(value); }).listen();
    // gui.add(uniforms, "animationSpeed", 0, 1).onChange(function(value) { shader_raymarch.absMirror.set(value); }).listen();
    gui.add(uniforms, "pause");
    gui.add(uniforms, "automate", 0, 1);
    gui.add(uniforms, "automateFreq", 0.00001, 1);
    gui.add(uniforms, "paramSmoothing", 0.00001, 1).listen();

}

function handleKeypress(e) {
  // q key
  if (e.keyCode == 81) {
     uniforms.paramSmoothing = (uniforms.paramSmoothing == 0.01) ? 0.99 : 0.01
  }
}


$(document).ready(function() {
  document.addEventListener("keydown", handleKeypress);

  new GLOW.Load({
    vertex:		"./shaders/vertex.glsl",
    bloom:		"./shaders/bloom.glsl",
    raymarch:	"./shaders/raymarch.glsl",
    render:   "./shaders/render.glsl",
    fxaa:		  "./shaders/fxaa.glsl",
    onLoadComplete: run
  });
});

var newPos = new GLOW.Vector3();
var newRot = new GLOW.Vector3();

var ignoreParams = ["paramSmoothing"];
var dontLerpParams = ["palette"];

function lerpShaders(src, tgt)
{
  for(var uniform in src.uniforms) {
    if ( ignoreParams.indexOf(uniform) > -1)
      continue;

    var data = src[uniform].value;

    if ( !data )
      continue;

    if (dontLerpParams.indexOf(uniform) > -1 || uniforms.paramSmoothing > 0.9) {
      
      for (var i = 0; i < data.length; i ++){
        tgt[uniform].value[i] = data[i];
      }

      continue;
    }    

    
    if ( data.length > 4) {

      newPos.sub(src[uniform].getPosition(), tgt[uniform].getPosition())
      newPos.multiplyScalar(uniforms.paramSmoothing);
      tgt[uniform].addPosition(newPos);

      newRot.sub(src[uniform].getRotation(), tgt[uniform].getRotation())

      newRot.multiplyScalar(uniforms.paramSmoothing);
      newRot.add(newRot, tgt[uniform].getRotation());

      tgt[uniform].setRotation(newRot);

      continue;
    } 

    for (var i = 0; i < data.length; i ++){
      var diff = data[i] - tgt[uniform].value[i];

       tgt[uniform].value[i] = tgt[uniform].value[i] + diff * uniforms.paramSmoothing;

    }
  }    
}

function gup( name, url ) {
  if (!url) url = location.href
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
}

run = function(shaders) {
  setupUI();

  audio = new ThreeAudio.Source().mic();

	context = new GLOW.Context();
	init(context);

	var w = window.innerWidth;
	var h = window.innerHeight;
	uniforms.g_frameScale = parseInt(gup("res")) || 2;

	// var fbo_march 			= buildFBO(w/scale, h/scale);
  var fbo_render      = buildFBO(w/uniforms.g_frameScale, h/uniforms.g_frameScale);
  var fbo_fxaa        = buildFBO(w, h);
  var fbo_fxaa_swap   = buildFBO(w, h);
	var fbo_noise 			= buildFBO(w, h, genNoise(w,h));

  
	shader_raymarch		  = buildShader("raymarch", [fbo_noise], shaders, uniforms, audio);
	shader_raymarch_smoothed		  = buildShader("raymarch", [fbo_noise], shaders, uniforms, audio);
	// shader_render 			= buildShader("render", [fbo_march, fbo_noise], shaders, uniforms, audio);
  shader_post         = buildShader("fxaa", [fbo_render], shaders, uniforms, audio);
  shader_post2        = buildShader("fxaa", [fbo_fxaa], shaders, uniforms, audio);
  shader_post3        = buildShader("fxaa", [fbo_fxaa_swap], shaders, uniforms, audio);
  shader_display       = buildShader("bloom", [fbo_render], shaders, uniforms, audio);
	// shader_copy 	    = buildShader("copy", [fbo_render, fbo_noise], shaders, uniforms, audio);

  var time = 0.0;

  //setupWebSockets();


  var accumulator = 0;
  beat = 0;
  smoothBPM = 12;
  startTime = Date.now();
  camTime = 0;
  var LFOtime = 0;


	function render() {
    if ( uniforms.pause ) {
  		requestAnimationFrame(render);
      return;
    }

		controls.update();
    stats.update();
    syncAudio(shader_raymarch_smoothed, audio);
    //syncAudio(shader_raymarch, audio);
    audio.update();


    time = (Date.now() - startTime) / 1000;

    camTime += uniforms.automateCam * 1/60;

    if ( uniforms.automateCam != 0 ) {
      camera.position.set(uniforms.camX * Math.sin(camTime), 
                          uniforms.camY * Math.cos(camTime),
                          uniforms.camZ * Math.cos(camTime));
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
    var delta = 1/60 * uniforms.automate;
    LFOtime += 0.005 / uniforms.automateFreq;

    uniforms.rotationx += uniforms.autoRotX * delta;
    uniforms.rotationy += uniforms.autoRotY * delta;
    uniforms.rotationz += uniforms.autoRotZ * delta;

    delta *= 5.0;

    uniforms.translationx += Math.sin(LFOtime) * uniforms.autoTransX * delta;
    uniforms.translationy += Math.sin(LFOtime) * uniforms.autoTransY * delta;
    uniforms.translationz += Math.sin(LFOtime) * uniforms.autoTransZ * delta;

    uniforms.dimx += Math.sin(LFOtime) * uniforms.autoDimX * delta;
    uniforms.dimy += Math.sin(LFOtime) * uniforms.autoDimY * delta;
    uniforms.dimz += Math.sin(LFOtime) * uniforms.autoDimZ * delta;

    shader_raymarch.modelView.setRotation(uniforms.rotationx, uniforms.rotationy, uniforms.rotationz) ;
    shader_raymarch.modelView.setPosition(uniforms.translationx, uniforms.translationy, uniforms.translationz) ;


    if (uniforms.paramSmoothing < 1.0)
      lerpShaders(shader_raymarch, shader_raymarch_smoothed);
    
    shaderPass(context, shader_raymarch_smoothed, fbo_render)
    shader_display.draw();


 		requestAnimationFrame(render);

	}


	render();

}
