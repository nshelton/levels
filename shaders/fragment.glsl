
      uniform vec2 resolution;
      uniform float time;

      varying vec2 vUv;
      varying float distortion;


      float bump(float alpha)
      {
        float lineWidth = 0.01;
        return smoothstep(0.0, lineWidth * 0.25, alpha) * (1.0 - smoothstep(lineWidth * 0.75, lineWidth, alpha));
      }

      void main(void)
      {
        float colormap =  distortion * 10.;
        float freq = 100.; // + 5.0 * sin(time);
        vec3 color = vec3(1.0 - colormap, colormap, 1.0) * colormap;
        color = vec3( bump( fract(vUv.x * freq )),
                      bump( fract(distortion * freq )),
                      bump( fract(vUv.y * freq )) );

        float topo = bump( fract(distortion * freq ));
        float xmod = bump( fract(vUv.x * freq ));

        color = vec3(topo, 1.0-topo, 1.0);


        gl_FragColor = vec4(xmod * colormap);

      }
