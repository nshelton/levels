	#ifdef GL_ES
				precision highp float;
			#endif

			varying vec2  		uv;
			varying vec2  		coord;
			uniform sampler2D 	source0; 	// final

			uniform 	float 	width;
			uniform 	float 	height;
			uniform 	float 	time;

			void main()
			{

				//  delta 
				vec2 del = (1. / vec2(width, height)) * 2.;

				vec4 p = texture2D(source0, uv);
				vec4 l = texture2D(source0, uv + vec2(del.x, 0.0));
				vec4 r = texture2D(source0, uv - vec2(del.x, 0.0));
				vec4 u = texture2D(source0, uv + vec2(0.0, del.y));
				vec4 d = texture2D(source0, uv - vec2(0.0, del.y));

				vec4 max = max(max(max(u,d), max(r,l)),p);

				// gl_FragColor = p+max ;
				gl_FragColor = vec4(uv.x, 1.0, uv.y, 1.0) ;
			}