

mat3 inv(mat3 m_in) {
	vec3 i0 = m_in[0];
	vec3 i1 = m_in[1];
	vec3 i2 = m_in[2];

	mat3 m_out = mat3(
	                 vec3(i0.x, i1.x, i2.x),
	                 vec3(i0.y, i1.y, i2.y),
	                 vec3(i0.z, i1.z, i2.z)
	                 );
	return m_out;
	}

mat3 rotationMatrix(vec3 axis, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

vec2 rot2D (vec2 q, float a)
{
  return q * cos (a) + q.yx * sin (a) * vec2 (-1., 1.);
}

uniform	sampler2D 	source0; //noise
uniform sampler2D   colormap;
uniform	float 		time;
uniform	float 		mouseX;
uniform	float 		mouseY;

uniform	float 		shadeDelta;
uniform	float 		termThres;
uniform	float 		width;
uniform	float 		height;
uniform mat4        camMat;
uniform mat4        modelView;
uniform float       g_frameScale;

uniform	float 		rotationx;
uniform	float 		rotationy;
uniform float       rotationz;
uniform	float 		absMirror;

uniform	float     dimx;
uniform	float     dimy;
uniform float     ao;
uniform	float     dimz;
uniform	float     thickness;
uniform	float     scale;
uniform float     iterCount;
uniform float     stepRatio;
uniform float     audioAmount;
uniform float     audioScale;
uniform float     palette;
uniform float     shadow;
uniform float     circleSize;

// THREE AUdio=================================
uniform	sampler2D 	audio_time;
uniform	sampler2D 	audio_freq;

// Beat detection. Is = 0 or 1, Was = smoothed value.
uniform float audioIsBeat;
uniform float beatAccum;
// Precalculated audio levels, the components being (all, bass, mid, treble).
// Contains raw levels, smoothed levels and instantaneous change in levels.
uniform vec4 audioLevels;
uniform vec4 audioLevelsSmooth;
uniform vec4 audioLevelsAccum;



// float DE(vec3 z)
// {
// 	z = rotationMatrix(normalize(vec3(1., sin( time / 20. ), 0.)), time/5.) * z;
//     return length(z) - 0.4;
// }



float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}




vec2 DE0(vec3 p){

    // p *= inv(mat3(modelView));
    // p.yz = rot2D(p.yz, time);

    mat4 s_modelview = modelView;
    vec4 _audioChange = audioLevelsSmooth;
    vec4 _audioAccum = audioLevelsAccum;
    vec4 _audioLevels = audioLevels;
    float b = audioIsBeat + beatAccum;

 	vec3 rot = vec3(rotationx, rotationy, rotationz);
 	// rot += sin(p/10.0) /20.;
    // rot += 0.01 * (audioLevelsAccum.gba) * audioAmount;


        // p.xy = rot2D(p.xy, time/5.);
        // p.yz = rot2D(p.yz, time/2.);
        // p.zx = rot2D(p.zx, time/4.);


    // return udBox(p, vec3(0.5));
    vec3 offs = vec3(dimx, dimy, dimz) ;// Offset point.


    // float freq = sin(length(p)+ time*2.) * 0.5 + 0.5;
    // freq *= 6.0 * audioLevelsSmooth.z;

    float s = scale ;

    float d = 1e5; // Distance.
    float orbit = 0.0;
    float dp = d; // Distance.


    // p  = abs(fract(p*.5)*2. - 1.); // Standard spacial repetition.

    float index = length(p)/max(max(dimx, dimy), dimz);
    index/=4.0;

    float amp = 1./s; // Analogous to layer amplitude.

    for(int i=0; i<10; i++){
        if( float(i) > iterCount)
          break;

        p.xy = rot2D(p.xy, rot.z);
        p.yz = rot2D(p.yz, rot.x);
        p.zx = rot2D(p.zx, rot.y);

        if ( absMirror > 0.5 ) {
            p = abs(p);

            //mirrors
            p.xy += step(p.x, p.y)*(p.yx - p.xy);
            p.xz += step(p.x, p.z)*(p.zx - p.xz);
            p.yz += step(p.y, p.z)*(p.zy - p.yz);
            p=abs(p);

            // Stretching about an offset.
            p = p*s + offs*(1. - s);
            p -= step(p, offs*(1. - s)*.5)*offs*(1. - s);

            p=abs(p);
        }



        // d = min(d, (p.x+ p.y +p.z)*amp *0.5);

        d = max(-d, max(max(p.x, p.y), p.z)*amp);
        // d = min(d, max(max(p.x, p.y), p.z)*amp);


        // d = min(d, udBox(p * amp, offs) / s);

        if ( dp!= d)
            orbit ++;

        dp = d;
        amp /= s; // Decrease the amplitude by the scaling factor.
    }

     // index = 0.5 * (orbit / iterCount);
    // index = d/max(max(dimx, dimy), dimz);
    float freq = texture2D(audio_freq, vec2(index, 0.5)).a;
    freq = (audioAmount == 0.0) ? 0.0 : 0.3 *  pow(freq, (1.0 - audioAmount) * 10.);

    return vec2(d -  (thickness + freq) * s , orbit);

}


// vec4 box(vec3 p, float w){
//     p = abs(p);
//     float dx = p.x-w;
//     float dy = p.y-w;
//     float dz = p.z-w;
//     float m = max(p.x-w, max(p.y-w, p.z-w));
//     return vec4(m,dx,dy,dz);
// }

vec3 opRep( vec3 p, vec3 c )
{
    return  mod(p,c)-0.5*c;
}

vec2 DE(vec3 p){
    vec3 t = (modelView[3].xyz);

    vec3 offs =  vec3(dimx, dimy, dimz);


    vec4 _audioChange = audioLevelsSmooth;
    vec4 _audioAccum = audioLevelsAccum;
    vec4 _audioLevels = audioLevels;
    float b = audioIsBeat + beatAccum;

    vec3 rot = vec3(rotationx, rotationy, rotationz);

    float d = 1e10;

    mat3 modelView_s = inv(mat3(modelView));

    float s = 1.0;

    float index = length(p)/(max(max(dimx, dimy), dimz) * iterCount);
    index*= audioScale;
    float freq = texture2D(audio_freq, vec2(index, 0.5)).a;
    freq = (audioAmount == 0.0) ? 0.0 : audioAmount *  pow(freq, 4.0);
    // float freq = audioAmount * pow(audioLevelsSmooth.g,  2.0);
    p += t; 

    for (int i = 0; i < 10; i++){
        if( float(i) > iterCount)
          break;

        p = (modelView_s * (p-t/s));

        if(absMirror>0.25)
            p.x = abs(p.x);

        if(absMirror>0.5)
            p.y = abs(p.y);

        if(absMirror>0.75)
            p.z = abs(p.z);

        d = min	(d, udBox(p.xyz*s, offs + freq  )/s ) ;

        d = min(d, length(p - t) - audioLevelsSmooth.a * 20. * circleSize);

        freq *= scale;


        // d = max(d, udBox(p.xyz*scale  , offs)/scale ) ;

        s *= scale * scale;
        // d *= scale;
        // offs *= scale;
        // modelView_s*=scale;
    }

    float level = 0.0;


    return vec2(d, level);
}




vec3 gradient(vec3 p) {
	vec2 e = vec2(0., shadeDelta);

	return normalize(
		vec3(
			DE(p+e.yxx).x - DE(p-e.yxx).x,
			DE(p+e.xyx).x - DE(p-e.xyx).x,
			DE(p+e.xxy).x - DE(p-e.xxy).x
		)
	);
}

float de_shadow( in vec3 ro, in vec3 rd)
{
    float t = 0.05;
    float res = 1.0;
    float k = 1.0;

    for(int i = 0; i < 5; i ++)
    {
        float h = DE(ro + rd*t).x;
        if( h< shadeDelta )
            return 0.0;

        res = min( res, k*h/t );
        t += h;
    }
    return res;
}

#define MAX_ITER 100

#define PI 3.1415

void main() {
    //raymarcher!
    // vec3 camera = vec3(0.,0.,-2.);
    vec3 camera = camMat[3].xyz;

    vec3 point;
    bool hit = false;

	vec3 ray = vec3(2.*gl_FragCoord.xy - vec2(width, height)/g_frameScale, height/g_frameScale);
	vec4 n = texture2D(source0, fract(ray.xy * time/2.));
    vec2 jitter = (n.xy - 0.5) * 2.;
	ray = normalize(vec3(ray.xy + jitter, -sqrt(max(ray.z*ray.z - dot(ray.xy, ray.xy)*.2, 0.))));

    // use the ray before we transform it for screen space things
    float vignette = 1.0 - length(ray.xy);
    vec4 n_p = texture2D(source0, fract(ray.xy + time*10.)) - 0.5;

	mat3 r = inv(mat3(camMat));
	ray *= r;

    vec2 dist;
 	// raycasting parameter
 	float t = 3.0;
 	int iter = 0;

    for(int i = 0; i < MAX_ITER; i++) {
        point = camera + ray * t;

        dist = DE(point);

        if (abs(dist.x) < termThres){
        	hit = true;
			break;
        }

    	t += dist.x * stepRatio;
        iter ++;
    }

    // float shade = dot(gradient(point - ray* 0.001), ray);
    // if ( !hit)
        // shade = 1.0;

    // float shadowAmount = (hit && shadow < 1.0 )? de_shadow(point, vec3(0.0, 1.0, 1.0)) : 1.0;

    // now do the shading instead of putting this in a different shader
    float fakeAO = float(iter)/float(MAX_ITER);

    // basic color
    float color_param = (palette >= 1.0) ?  fakeAO : 1.0 - fakeAO;
    vec3 color = texture2D(colormap, vec2(fract(palette + 1.0/32.0), (color_param))).rgb;

    // vignette + noise
    // color *= vignette;
    color += n_p.xxx / 7.;

    color = color * (1.0 -fakeAO) * ao + (color * (1.0 - ao));

    gl_FragColor = vec4(color, 1.0) ;

}
