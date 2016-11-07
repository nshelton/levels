// GLOW.js r1.1 - http://github.com/empaempa/GLOW
var GLOW = function() {
        function b(a, c, b) {
            this.flags = a;
            this.callback = c;
            this.context = b
        }
        var a = {},
            c = {},
            f = -1,
            e = [];
        b.prototype.dispatch = function(a, c) {
            this.flags === a && (this.context ? this.callback.call(this.context, c) : this.callback(c))
        };
        a.LOGS = 1;
        a.WARNINGS = 2;
        a.ERRORS = 4;
        a.logFlags = a.ERRORS;
        a.currentContext = {};
        a.registerContext = function(b) {
            c[b.id] = b;
            a.enableContext(b)
        };
        a.getContextById = function(b) {
            if (c[b]) return c[b];
            GLOW.error("Couldn't find context id " + b + ", returning current with id " + a.currentContext.id);
            return a.currentContext
        };
        a.enableContext = function(c) {
            a.currentContext = typeof c === "string" ? getContextById(c) : c;
            GL = a.GL = a.currentContext.GL
        };
        a.uniqueId = function() {
            return ++f
        };
        a.log = function(c) {
            a.logFlags & a.LOGS && console.log(c);
            a.dispatch(a.LOGS, c)
        };
        a.warn = function(c) {
            a.logFlags & a.WARNINGS && console.warn(c);
            a.dispatch(a.WARNINGS, c)
        };
        a.error = function(c) {
            a.logFlags & a.ERRORS && console.error(c);
            a.dispatch(a.ERRORS, c)
        };
        a.addEventListener = function(a, c, f) {
            e.push(new b(a, c, f));
            return e[e.length - 1]
        };
        a.removeEventListener = function(c) {
            c =
                e.indexOf(c);
            c !== -1 ? e.splice(c, 1) : a.warn("GLOW.removeEventListener: Couldn't find listener object")
        };
        a.dispatch = function(a, c) {
            for (var b = e.length; b--;) e[b].dispatch(a, c)
        };
        return a
    }(),
    GL = {};
GLOW.Context = function() {
    function b(a) {
        a === void 0 && (a = {});
        this.id = a.id !== void 0 ? a.id : GLOW.uniqueId();
        this.alpha = a.alpha !== void 0 ? a.alpha : !0;
        this.depth = a.depth !== void 0 ? a.depth : !0;
        this.antialias = a.antialias !== void 0 ? a.antialias : !0;
        this.stencil = a.stencil !== void 0 ? a.stencil : !1;
        this.premultipliedAlpha = a.premultipliedAlpha !== void 0 ? a.premultipliedAlpha : !0;
        this.preserveDrawingBuffer = a.preserveDrawingBuffer !== void 0 ? a.preserveDrawingBuffer : !1;
        this.width = a.width !== void 0 ? a.width : window.innerWidth;
        this.height =
            a.height !== void 0 ? a.height : window.innerHeight;
        this.cache = new GLOW.Cache;
        this.debug = a.debug !== void 0 ? a.debug : !1;
        if (a.context) this.GL = a.context, GLOW.registerContext(this);
        else {
            try {
                this.domElement = document.createElement("canvas");
                if (this.debug && window.WebGLDebugUtils) this.domElement = WebGLDebugUtils.makeLostContextSimulatingCanvas(this.domElement);
                this.GL = this.domElement.getContext("experimental-webgl", {
                    alpha: this.alpha,
                    depth: this.depth,
                    antialias: this.antialias,
                    stencil: this.stencil,
                    premultipliedAlpha: this.premultipliedAlpha,
                    preserveDrawingBuffer: this.preserveDrawingBuffer
                })
            } catch (c) {
                GLOW.error("GLOW.Context.construct: " + c)
            }
            if (this.GL !== null) {
                GLOW.registerContext(this);
                this.domElement.width = this.width;
                this.domElement.height = this.height;
                this.viewport = a.viewport ? {
                    x: a.viewport.x !== void 0 ? a.viewport.x : 0,
                    y: a.viewport.y !== void 0 ? a.viewport.y : 0,
                    width: a.viewport.width !== void 0 ? a.viewport.width : this.width,
                    height: a.viewport.height !== void 0 ? a.viewport.height : this.height
                } : {
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height
                };
                if (a.clear) {
                    if (this.clearSettings = {
                            r: a.clear.red !== void 0 ? a.clear.red : 0,
                            g: a.clear.green !== void 0 ? a.clear.green : 0,
                            b: a.clear.blue !== void 0 ? a.clear.blue : 0,
                            a: a.clear.alpha !== void 0 ? a.clear.alpha : 1,
                            depth: a.clear.depth !== void 0 ? a.clear.depth : 1,
                            bits: a.clear.bits !== void 0 ? a.clear.bits : -1
                        }, this.clearSettings.bits === -1) this.clearSettings.bits = GL.COLOR_BUFFER_BIT, this.clearSettings.bits |= this.depth ? GL.DEPTH_BUFFER_BIT : 0, this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0
                } else this.clearSettings = {
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 1,
                        depth: 1,
                        bits: 0
                    }, this.clearSettings.bits =
                    GL.COLOR_BUFFER_BIT, this.clearSettings.bits |= this.depth ? GL.DEPTH_BUFFER_BIT : 0, this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
                this.enableCulling(!0, {
                    frontFace: GL.CCW,
                    cullFace: GL.BACK
                });
                this.enableDepthTest(!0, {
                    func: GL.LEQUAL,
                    write: !0,
                    zNear: 0,
                    zFar: 1
                });
                this.enableBlend(!1);
                this.setViewport();
                this.clear()
            } else GLOW.error("GLOW.Context.construct: unable to initialize WebGL")
        }
    }
    b.prototype.setupClear = function(a) {
        if (a !== void 0) this.clearSettings.r = a.red !== void 0 ? Math.min(1, Math.max(0, a.red)) :
            this.clearSettings.r, this.clearSettings.g = a.green !== void 0 ? Math.min(1, Math.max(0, a.green)) : this.clearSettings.g, this.clearSettings.b = a.blue !== void 0 ? Math.min(1, Math.max(0, a.blue)) : this.clearSettings.b, this.clearSettings.a = a.alpha !== void 0 ? Math.min(1, Math.max(0, a.alpha)) : this.clearSettings.a, this.clearSettings.depth = a.depth !== void 0 ? Math.min(1, Math.max(0, a.depth)) : this.clearSettings.depth, this.clearSettings.bits = a.bits !== void 0 ? a.bits : this.clearSettings.bits;
        GL.clearColor(this.clearSettings.r, this.clearSettings.g,
            this.clearSettings.b, this.clearSettings.a);
        GL.clearDepth(this.clearSettings.depth);
        return this
    };
    b.prototype.clear = function(a) {
        this.setupClear(a);
        GL.clear(this.clearSettings.bits);
        return this
    };
    b.prototype.enableBlend = function(a, c) {
        a ? (GL.enable(GL.BLEND), c && this.setupBlend(c)) : GL.disable(GL.BLEND);
        return this
    };
    b.prototype.setupBlend = function(a) {
        a.equationRGB ? (a.equationAlpha && GL.blendEquationSeparate(a.equationRGB, a.equationAlpha), a.srcRGB && GL.blendFuncSeparate(a.srcRGB, a.dstRGB, a.srcAlpha, a.dstAlpha)) :
            (a.equation && GL.blendEquation(a.equation), a.src && GL.blendFunc(a.src, a.dst));
        return this
    };
    b.prototype.enableDepthTest = function(a, c) {
        a ? (GL.enable(GL.DEPTH_TEST), c && this.setupDepthTest(c)) : GL.disable(GL.DEPTH_TEST);
        return this
    };
    b.prototype.setupDepthTest = function(a) {
        a.func !== void 0 && GL.depthFunc(a.func);
        a.write !== void 0 && GL.depthMask(a.write);
        a.zNear !== void 0 && a.zFar !== void 0 && a.zNear <= a.zFar && GL.depthRange(Math.max(0, Math.min(1, a.zNear)), Math.max(0, Math.min(1, a.zFar)));
        return this
    };
    b.prototype.enablePolygonOffset =
        function(a, c) {
            a ? (GL.enable(GL.POLYGON_OFFSET_FILL), c && this.setupPolygonOffset(c)) : GL.disable(GL.POLYGON_OFFSET_FILL);
            return this
        };
    b.prototype.setupPolygonOffset = function(a) {
        a.factor && a.units && GL.polygonOffset(a.factor, a.units)
    };
    b.prototype.enableStencilTest = function(a, c) {
        a ? (GL.enable(GL.STENCIL_TEST), c && this.setupStencilTest(c)) : GL.disable(GL.STENCIL_TEST);
        return this
    };
    b.prototype.setupStencilTest = function(a) {
        a.func && a.funcFace ? GL.stencilFuncSeparate(a.funcFace, a.func, a.funcRef, a.funcMask) : a.func &&
            GL.stencilFunc(a.func, a.funcRef, a.funcMask);
        a.mask && a.maskFace ? GL.stencilMaskSeparate(a.maskFace, a.mask) : a.mask && GL.stencilMask(a.mask);
        a.opFail && a.opFace ? GL.stencilOpSeparate(a.opFace, a.opFail, a.opZfail, a.opZpass) : a.opFail && GL.stencilOp(a.opFail, a.opZfail, a.opZpass);
        return this
    };
    b.prototype.enableCulling = function(a, c) {
        a ? (GL.enable(GL.CULL_FACE), c && this.setupCulling(c)) : GL.disable(GL.CULL_FACE);
        return this
    };
    b.prototype.setupCulling = function(a) {
        try {
            a.frontFace && GL.frontFace(a.frontFace), a.cullFace &&
                GL.cullFace(a.cullFace)
        } catch (c) {
            GLOW.error("GLOW.Context.setupCulling: " + c)
        }
        return this
    };
    b.prototype.enableScissor = function(a, c) {
        a ? (GL.enable(GL.SCISSOR_TEST), c && this.setupScissor(c)) : GL.disable(GL.SCISSOR_TEST);
        return this
    };
    b.prototype.setupScissor = function(a) {
        try {
            GL.scissor(a.x, a.y, a.width, a.height)
        } catch (c) {
            GLOW.error("GLOW.Context.setupScissorTest: " + c)
        }
        return this
    };
    b.prototype.setViewport = function() {
        this.setupViewport()
    };
    b.prototype.setupViewport = function(a) {
        if (a) this.viewport.x = a.x !== void 0 ?
            a.x : this.viewport.x, this.viewport.y = a.y !== void 0 ? a.y : this.viewport.y, this.viewport.width = a.width !== void 0 ? a.width : this.viewport.width, this.viewport.height = a.height !== void 0 ? a.height : this.viewport.height;
        GL.viewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
        return this
    };
    b.prototype.availableExtensions = function() {
        return GL.getSupportedExtensions()
    };
    b.prototype.enableExtension = function(a) {
        for (var c = GL.getSupportedExtensions(), b = 0, e = c.length; b < e; b++)
            if (a.toLowerCase() ===
                c[b].toLowerCase()) break;
        if (b !== e) return GL.getExtension(c[b])
    };
    b.prototype.getParameter = function(a) {
        return GL.getParameter(a)
    };
    b.prototype.maxVertexTextureImageUnits = function() {
        return this.getParameter(GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS)
    };
    b.prototype.resize = function(a, c) {
        var b = c / this.height;
        this.viewport.width *= a / this.width;
        this.viewport.height *= b;
        this.domElement.width = this.width = a;
        this.domElement.height = this.height = c
    };
    return b
}();
GLOW.Compiler = function() {
    var b = {};
    b.compile = function(a) {
        var c = GLOW.currentContext.cache.codeCompiled(a.vertexShader, a.fragmentShader);
        c === void 0 && (c = b.linkProgram(b.compileVertexShader(a.vertexShader), b.compileFragmentShader(a.fragmentShader)), GLOW.currentContext.cache.addCompiledProgram(c));
        var f = b.createUniforms(b.extractUniforms(c), a.data),
            e = b.createAttributes(b.extractAttributes(c), a.data, a.usage, a.interleave),
            h = b.interleaveAttributes(e, a.interleave);
        if (a.elements) GLOW.error("GLOW.Compiler.compile: .elements is no longer supported, please use .indices combined with .primitives");
        else {
            var g = a.indices,
                i = a.primitives !== void 0 ? a.primitives : GL.TRIANGLES,
                j = a.usage !== void 0 ? a.usage : {},
                k = j.primitives;
            if (a.triangles) g = a.triangles, k = j.triangles;
            else if (a.triangleStrip) g = a.triangleStrip, i = GL.TRIANGLE_STRIP, k = j.triangleStrip;
            else if (a.triangleFan) g = a.triangleFan, i = GL.TRIANGLE_FAN, k = j.triangleFan;
            else if (a.points) g = a.points, i = GL.POINTS, k = j.points;
            else if (a.lines) g = a.lines, i = GL.LINES, k = j.lines;
            else if (a.lineLoop) g = a.lineLoop, i = GL.LINE_LOOP, k = j.lineLoop;
            else if (a.lineStrip) g = a.lineStrip,
                i = GL.LINE_STRIP, k = j.lineStrip;
            if (g === void 0) {
                for (var l in e)
                    if (e[l].data) {
                        g = e[l].data.length / e[l].size;
                        break
                    }
                if (g === void 0)
                    for (var m in h) {
                        for (l in h[m].attributes) {
                            g = h[m].attributes[l].data.length / h[m].attributes[l].size;
                            break
                        }
                        break
                    }
                g === void 0 && (g = 0)
            }
            g = b.createElements(g, i, k);
            return new GLOW.CompiledData(c, f, e, h, g, a)
        }
    };
    b.compileVertexShader = function(a) {
        var c;
        c = GL.createShader(GL.VERTEX_SHADER);
        c.id = GLOW.uniqueId();
        GL.shaderSource(c, a);
        GL.compileShader(c);
        !GL.getShaderParameter(c, GL.COMPILE_STATUS) &&
            !GL.isContextLost() && GLOW.error("GLOW.Compiler.compileVertexShader: " + GL.getShaderInfoLog(c));
        return c
    };
    b.compileFragmentShader = function(a) {
        var c;
        c = GL.createShader(GL.FRAGMENT_SHADER);
        c.id = GLOW.uniqueId();
        GL.shaderSource(c, a);
        GL.compileShader(c);
        !GL.getShaderParameter(c, GL.COMPILE_STATUS) && !GL.isContextLost() && GLOW.error("GLOW.Compiler.compileFragmentShader: " + GL.getShaderInfoLog(c));
        return c
    };
    b.linkProgram = function(a, c) {
        var b = GL.createProgram();
        b || GLOW.error("GLOW.Compiler.linkProgram: Could not create program");
        b.id = GLOW.uniqueId();
        GL.attachShader(b, a);
        GL.attachShader(b, c);
        GL.linkProgram(b);
        !GL.getProgramParameter(b, GL.LINK_STATUS) && !GL.isContextLost() && GLOW.error("GLOW.Compiler.linkProgram: Could not initialise program");
        return b
    };
    b.extractUniforms = function(a) {
        for (var c = {}, b, e = 0, h = GL.getProgramParameter(a, GL.ACTIVE_UNIFORMS); e < h; e++)
            if (b = GL.getActiveUniform(a, e), b !== null && b !== -1 && b !== void 0) b = {
                    name: b.name.split("[")[0],
                    size: b.size,
                    type: b.type,
                    location: GL.getUniformLocation(a, b.name.split("[")[0]),
                    locationNumber: e
                },
                c[b.name] = b;
            else break;
        return c
    };
    b.extractAttributes = function(a) {
        for (var c = {}, b, e = 0, h = GL.getProgramParameter(a, GL.ACTIVE_ATTRIBUTES); e < h; e++)
            if (b = GL.getActiveAttrib(a, e), b !== null && b !== -1 && b !== void 0) b = {
                name: b.name,
                size: b.size,
                type: b.type,
                location: GL.getAttribLocation(a, b.name),
                locationNumber: e
            }, c[b.name] = b;
            else break;
        a.highestAttributeNumber = e - 1;
        return c
    };
    b.createUniforms = function(a, c) {
        var b, e = {},
            h, g, i = 0;
        for (b in a)
            if (h = a[b], g = h.name, c[g] instanceof GLOW.Uniform) e[g] = c[g];
            else if (c[g] === void 0 && GLOW.warn("GLOW.Compiler.createUniforms: missing data for uniform " +
                g + ". Creating anyway, but make sure to set data before drawing."), e[g] = new GLOW.Uniform(h, c[g]), e[g].type === GL.SAMPLER_2D || e[g].type === GL.SAMPLER_CUBE) e[g].textureUnit = i++, e[g].data !== void 0 && e[g].data.init();
        return e
    };
    b.createAttributes = function(a, c, b, e) {
        var h, g, i, j = {},
            k = !0,
            e = e !== void 0 ? e : {};
        e === !1 && (k = !1);
        b = b !== void 0 ? b : {};
        for (h in a) g = a[h], i = g.name, c[i] instanceof GLOW.Attribute ? j[i] = c[i] : (c[i] === void 0 && GLOW.warn("GLOW.Compiler.createAttributes: missing data for attribute " + i + ". Creating anyway, but make sure to set data before drawing."),
            j[i] = new GLOW.Attribute(g, c[i], b[i], e[i] !== void 0 ? e[i] : k));
        return j
    };
    b.interleaveAttributes = function(a, c) {
        c = c !== void 0 ? c : {};
        if (c === !1) return {};
        var b, e, h, g, i;
        h = 0;
        var j = [];
        e = 0;
        for (b in a) e++;
        if (e === 1)
            for (b in a) {
                if (a[b].interleaved === !0) a[b].interleaved = !1, a[b].data && a[b].bufferData()
            } else {
                for (b in a) c[b] !== void 0 && c[b] !== !1 && (h = Math.max(h - 1, c[b]) + 1);
                for (b in a) c[b] === void 0 && (c[b] = h);
                for (i in c) c[i] !== !1 && (j[c[i]] === void 0 && (j[c[i]] = []), j[c[i]].push(a[i]));
                var k, l;
                b = 0;
                for (e = j.length; b < e; b++)
                    if (j[b] !==
                        void 0) {
                        h = k = 0;
                        for (g = j[b].length; h < g; h++)
                            if (k + j[b][h].size * 4 > 255) {
                                GLOW.warn("GLOW.Compiler.interleaveAttributes: Stride owerflow, moving attributes to new interleave index. Please check your interleave setup!");
                                l = j.length;
                                for (j[l] = []; h < g;) j[l].push(j[b][h]), j[b].splice(h, 1), g--
                            } else k += j[b][h].size * 4
                    }
                l = {};
                b = 0;
                for (e = j.length; b < e; b++)
                    if (j[b] !== void 0) {
                        k = "";
                        h = 0;
                        for (g = j[b].length; h < g; h++) k += h !== g - 1 ? j[b][h].name + "_" : j[b][h].name;
                        l[k] = new GLOW.InterleavedAttributes(j[b])
                    }
                for (i in c) c[i] !== !1 && delete a[i];
                return l
            }
    };
    b.createElements = function(a, c, b) {
        return a instanceof GLOW.Elements ? a : new GLOW.Elements(a, c, b)
    };
    return b
}();
GLOW.CompiledData = function() {
    function b(a, c, b, e, h) {
        this.id = GLOW.uniqueId();
        this.program = a;
        this.uniforms = c || {};
        this.attributes = b || {};
        this.interleavedAttributes = e || {};
        this.elements = h;
        this.interleavedAttributeArray = this.attributeArray = this.uniformArray = void 0;
        this.createArrays()
    }
    b.prototype.createArrays = function() {
        this.uniformArray = [];
        this.attributeArray = [];
        this.interleavedAttributeArray = [];
        var a, c, b;
        for (a in this.uniforms) this.uniformArray.push(this.uniforms[a]);
        for (c in this.attributes) this.attributeArray.push(this.attributes[c]);
        for (b in this.interleavedAttributes) this.interleavedAttributeArray.push(this.interleavedAttributes[b])
    };
    b.prototype.clone = function(a) {
        var c = new GLOW.CompiledData,
            a = a || {},
            b;
        for (b in this.uniforms)
            if (a[b])
                if (a[b] instanceof GLOW.Uniform) c.uniforms[b] = a[b];
                else {
                    if (c.uniforms[b] = new GLOW.Uniform(this.uniforms[b], a[b]), c.uniforms[b].type === GL.SAMPLER_2D || c.uniforms[b].type === GL.SAMPLER_CUBE) c.uniforms[b].textureUnit = this.uniforms[b].textureUnit, c.uniforms[b].data && c.uniforms[b].data.init()
                }
        else c.uniforms[b] =
            this.uniforms[b];
        for (var e in this.attributes) c.attributes[e] = a[e] ? a[e] instanceof GLOW.Attribute ? a[e] : new GLOW.Attribute(this.attributes[e], a[e]) : this.attributes[e];
        for (var h in this.interleavedAttributes) c.interleavedAttributes[h] = a[h] ? a[h] : this.interleavedAttributes[h];
        c.elements = a.indices ? new GLOW.Elements(a.indices, a.primitives) : a.elements instanceof GLOW.Elements ? a.elements : this.elements;
        c.program = a.program ? a.program : this.program;
        c.createArrays();
        return c
    };
    b.prototype.dispose = function(a, c, b) {
        if (a) {
            for (a =
                this.uniformArray.length; a--;) this.uniformArray[a].dispose(b);
            for (b = this.attributeArray.length; b--;) this.attributeArray[b].dispose();
            for (b = this.interleavedAttributeArray.length; b--;) this.interleavedAttributeArray[b].dispose();
            this.elements.dispose()
        }
        if (c && GL.isProgram(this.program) && (c = GL.getAttachedShaders(this.program))) {
            for (b = c.length; b--;) GL.detachShader(this.program, c[b]), GL.deleteShader(c[b]);
            GL.deleteProgram(this.program)
        }
        delete this.program;
        delete this.uniforms;
        delete this.attributes;
        delete this.interleavedAttributes;
        delete this.elements;
        delete this.uniformArray;
        delete this.attributeArray;
        delete this.interleavedAttributeArray
    };
    return b
}();
GLOW.Cache = function() {
    function b() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation = [];
        this.attributeByLocation = [];
        this.textureByLocation = [];
        this.compiledCode = [];
        this.programId = this.elementId = -1;
        this.active = !0
    }
    b.prototype.codeCompiled = function(a, c) {
        var b, e, h = this.compiledCode.length;
        for (e = 0; e < h; e++)
            if (b = this.compiledCode[e], a === b.vertexShader && c === b.fragmentShader) break;
        if (e === h) this.compiledCode.push({
            vertexShader: a,
            fragmentShader: c
        });
        else return this.compiledCode[e].program
    };
    b.prototype.addCompiledProgram =
        function(a) {
            this.compiledCode[this.compiledCode.length - 1].program = a
        };
    b.prototype.programCached = function(a) {
        if (this.active) {
            if (a.id === this.programId) return !0;
            this.programId = a.id;
            this.uniformByLocation.length = 0;
            this.attributeByLocation.length = 0;
            this.textureByLocation.length = 0;
            this.elementId = -1
        }
        return !1
    };
    b.prototype.setProgramHighestAttributeNumber = function(a) {
        var c = this.highestAttributeNumber;
        this.highestAttributeNumber = a.highestAttributeNumber;
        return a.highestAttributeNumber - c
    };
    b.prototype.uniformCached =
        function(a) {
            if (this.active) {
                if (this.uniformByLocation[a.locationNumber] === a.id) return !0;
                this.uniformByLocation[a.locationNumber] = a.id
            }
            return !1
        };
    b.prototype.invalidateUniform = function(a) {
        this.uniformByLocation[a.locationNumber] = void 0
    };
    b.prototype.attributeCached = function(a) {
        if (this.active) {
            if (this.attributeByLocation[a.locationNumber] === a.id) return !0;
            this.attributeByLocation[a.locationNumber] = a.id
        }
        return !1
    };
    b.prototype.interleavedAttributeCached = function(a) {
        if (this.active)
            for (var c = 0, b = a.attributes.length,
                    e; c < b; c++) {
                e = a.attributes[c];
                if (this.attributeByLocation[e.locationNumber] === e.id) return !0;
                this.attributeByLocation[e.locationNumber] = e.id
            }
        return !1
    };
    b.prototype.invalidateAttribute = function(a) {
        this.attributeByLocation[a.locationNumber] = void 0
    };
    b.prototype.textureCached = function(a, c) {
        if (this.active) {
            if (this.textureByLocation[a] === c.id) return !0;
            this.textureByLocation[a] = c.id
        }
        return !1
    };
    b.prototype.invalidateTexture = function(a) {
        this.textureByLocation[a] = void 0
    };
    b.prototype.elementsCached = function(a) {
        if (this.active) {
            if (a.id ===
                this.elementId) return !0;
            this.elementId = a.id
        }
        return !1
    };
    b.prototype.invalidateElements = function() {
        this.elementId = -1
    };
    b.prototype.clear = function() {
        this.highestAttributeNumber = -1;
        this.uniformByLocation.length = 0;
        this.attributeByLocation.length = 0;
        this.textureByLocation.length = 0;
        this.programId = this.elementId = -1
    };
    return b
}();
GLOW.FBO = function() {
    function b(a) {
        a = a !== void 0 ? a : {};
        this.id = GLOW.uniqueId();
        this.width = a.width || a.size || window.innerWidth;
        this.height = a.height || a.size || window.innerHeight;
        this.wrapS = a.wrapS || a.wrap || GL.CLAMP_TO_EDGE;
        this.wrapT = a.wrapT || a.wrap || GL.CLAMP_TO_EDGE;
        this.magFilter = a.magFilter || a.filter || GL.LINEAR;
        this.minFilter = a.minFilter || a.filter || GL.LINEAR;
        this.internalFormat = a.internalFormat || GL.RGBA;
        this.format = a.format || GL.RGBA;
        this.type = a.type || GL.UNSIGNED_BYTE;
        this.depth = a.depth !== void 0 ? a.depth :
            !0;
        this.stencil = a.stencil !== void 0 ? a.stencil : !1;
        this.data = a.data || null;
        this.isBound = !1;
        this.textureUnit = -1;
        this.textureType = a.cube !== !0 ? GL.TEXTURE_2D : GL.TEXTURE_CUBE_MAP;
        this.viewport = a.viewport ? {
            x: a.viewport.x !== void 0 ? a.viewport.x : 0,
            y: a.viewport.y !== void 0 ? a.viewport.y : 0,
            width: a.viewport.width !== void 0 ? a.viewport.width : this.width,
            height: a.viewport.height !== void 0 ? a.viewport.height : this.height
        } : {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        if (a.clear) {
            if (this.clearSettings = {
                    r: a.clear.red !== void 0 ?
                        a.clear.red : 0,
                    g: a.clear.green !== void 0 ? a.clear.green : 0,
                    b: a.clear.blue !== void 0 ? a.clear.blue : 0,
                    a: a.clear.alpha !== void 0 ? a.clear.alpha : 1,
                    depth: a.clear.depth !== void 0 ? a.clear.depth : 1,
                    bits: a.clear.bits !== void 0 ? a.clear.bits : -1
                }, this.clearSettings.bits === -1) this.clearSettings.bits = GL.COLOR_BUFFER_BIT, this.clearSettings.bits |= this.depth ? GL.DEPTH_BUFFER_BIT : 0, this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0
        } else this.clearSettings = {
                r: 0,
                g: 0,
                b: 0,
                a: 1,
                depth: 1,
                bits: 0
            }, this.clearSettings.bits = GL.COLOR_BUFFER_BIT,
            this.clearSettings.bits |= this.depth ? GL.DEPTH_BUFFER_BIT : 0, this.clearSettings.bits |= this.stencil ? GL.STENCIL_BUFFER_BIT : 0;
        this.createBuffers()
    }
    var a = {
        posX: 0,
        negX: 1,
        posY: 2,
        negY: 3,
        posZ: 4,
        negZ: 5
    };
    b.prototype.createBuffers = function() {
        this.texture = GL.createTexture();
        var c = GL.getError();
        if (c !== GL.NO_ERROR && c !== GL.CONTEXT_LOST_WEBGL) GLOW.error("GLOW.FBO.createBuffers: Error creating render texture.");
        else {
            GL.bindTexture(this.textureType, this.texture);
            GL.texParameteri(this.textureType, GL.TEXTURE_WRAP_S, this.wrapS);
            GL.texParameteri(this.textureType, GL.TEXTURE_WRAP_T, this.wrapT);
            GL.texParameteri(this.textureType, GL.TEXTURE_MAG_FILTER, this.magFilter);
            GL.texParameteri(this.textureType, GL.TEXTURE_MIN_FILTER, this.minFilter);
            if (this.textureType === GL.TEXTURE_2D) this.data === null || this.data instanceof Uint8Array || this.data instanceof Float32Array ? GL.texImage2D(this.textureType, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data) : GL.texImage2D(this.textureType, 0, this.internalFormat, this.format,
                this.type, this.data);
            else
                for (var b in a) GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[b], 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.data[b]);
            if (this.depth || this.stencil) {
                this.renderBuffer = GL.createRenderbuffer();
                c = GL.getError();
                if (c !== GL.NO_ERROR && c !== GL.CONTEXT_LOST_WEBGL) {
                    GLOW.error("GLOW.FBO.createBuffers: Error creating render buffer.");
                    return
                }
                GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderBuffer);
                this.depth && !this.stencil ? GL.renderbufferStorage(GL.RENDERBUFFER,
                    GL.DEPTH_COMPONENT16, this.width, this.height) : !this.depth && this.stencil ? GL.renderbufferStorage(GL.RENDERBUFFER, GL.STENCIL_INDEX8, this.width, this.height) : this.depth && this.stencil && GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_STENCIL, this.width, this.height)
            }
            if (this.textureType === GL.TEXTURE_2D) {
                this.frameBuffer = GL.createFramebuffer();
                c = GL.getError();
                if (c !== GL.NO_ERROR && c !== GL.CONTEXT_LOST_WEBGL) {
                    GLOW.error("GLOW.FBO.createBuffers: Error creating frame buffer.");
                    return
                }
                GL.bindFramebuffer(GL.FRAMEBUFFER,
                    this.frameBuffer);
                GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.texture, 0);
                this.depth && !this.stencil ? GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer) : !this.depth && this.stencil ? GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer) : this.depth && this.stencil && GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer)
            } else {
                this.frameBuffers = {};
                for (var e in a) {
                    this.frameBuffers[e] = GL.createFramebuffer();
                    c = GL.getError();
                    if (c !== GL.NO_ERROR && c !== GL.CONTEXT_LOST_WEBGL) {
                        GLOW.error("GLOW.FBO.createBuffers: Error creating frame buffer for side " + e);
                        return
                    }
                    GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffers[e]);
                    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[e], this.texture, 0);
                    this.depth && !this.stencil ? GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer) :
                        !this.depth && this.stencil ? GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer) : this.depth && this.stencil && GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.renderBuffer)
                }
            }
            GL.bindTexture(this.textureType, null);
            GL.bindRenderbuffer(GL.RENDERBUFFER, null);
            GL.bindFramebuffer(GL.FRAMEBUFFER, null)
        }
    };
    b.prototype.deleteBuffers = function() {
        this.texture && GL.deleteTexture(this.texture);
        this.renderBuffer && GL.deleteRenderbuffer(this.renderBuffer);
        if (this.textureType === GL.TEXTURE_2D) this.frameBuffer && GL.deleteFramebuffer(this.frameBuffer);
        else
            for (var c in a) GL.deleteFramebuffer(this.frameBuffers[c])
    };
    b.prototype.init = function() {};
    b.prototype.bind = function(a, b) {
        if (!this.isBound) this.isBound = !0, (a || a === void 0) && this.setupViewport(a), this.textureType === GL.TEXTURE_2D ? GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer) : GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffers[b !== void 0 ? b : "posX"]);
        return this
    };
    b.prototype.unbind = function(a) {
        if (this.isBound) this.isBound = !1, GL.bindFramebuffer(GL.FRAMEBUFFER, null), (a === void 0 || a === !0) && GL.viewport(GLOW.currentContext.viewport.x, GLOW.currentContext.viewport.y, GLOW.currentContext.viewport.width, GLOW.currentContext.viewport.height);
        return this
    };
    b.prototype.setViewport = function() {
        this.setupViewport()
    };
    b.prototype.setupViewport = function(a) {
        if (a) this.viewport.x = a.x !== void 0 ? a.x : this.viewport.x, this.viewport.y = a.y !== void 0 ? a.y : this.viewport.y, this.viewport.width = a.width !== void 0 ? a.width : this.viewport.width, this.viewport.height =
            a.height !== void 0 ? a.height : this.viewport.height;
        GL.viewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
        return this
    };
    b.prototype.setupClear = function(a) {
        if (a !== void 0) this.clearSettings.r = a.red !== void 0 ? Math.min(1, Math.max(0, a.red)) : this.clearSettings.r, this.clearSettings.g = a.green !== void 0 ? Math.min(1, Math.max(0, a.green)) : this.clearSettings.g, this.clearSettings.b = a.blue !== void 0 ? Math.min(1, Math.max(0, a.blue)) : this.clearSettings.b, this.clearSettings.a = a.alpha !== void 0 ?
            Math.min(1, Math.max(0, a.alpha)) : this.clearSettings.a, this.clearSettings.depth = a.depth !== void 0 ? Math.min(1, Math.max(0, a.depth)) : this.clearSettings.depth, this.clearSettings.bits = a.bits !== void 0 ? a.bits : this.clearSettings.bits;
        GL.clearColor(this.clearSettings.r, this.clearSettings.g, this.clearSettings.b, this.clearSettings.a);
        GL.clearDepth(this.clearSettings.depth);
        return this
    };
    b.prototype.clear = function(a) {
        this.isBound && (this.setupClear(a), GL.clear(this.clearSettings.bits));
        return this
    };
    b.prototype.resize =
        function(a, b) {
            var e = b / this.height;
            this.viewport.width *= a / this.width;
            this.viewport.height *= e;
            this.width = a;
            this.height = b;
            this.deleteBuffers();
            this.createBuffers();
            return this
        };
    b.prototype.generateMipMaps = function() {
        GL.bindTexture(this.textureType, this.texture);
        GL.generateMipmap(this.textureType);
        GL.bindTexture(this.textureType, null);
        return this
    };
    b.prototype.dispose = function() {
        this.deleteBuffers();
        delete this.data;
        delete this.viewport;
        delete this.texture;
        delete this.renderBuffer;
        delete this.frameBuffer;
        delete this.frameBuffers;
        delete this.viewport;
        delete this.clearSettings
    };
    return b
}();
GLOW.Texture = function() {
    function b(a) {
        if (a.url !== void 0) a.data = a.url;
        this.id = GLOW.uniqueId();
        this.data = a.data;
        this.autoUpdate = a.autoUpdate;
        this.internalFormat = a.internalFormat || GL.RGBA;
        this.format = a.format || GL.RGBA;
        this.type = a.type || GL.UNSIGNED_BYTE;
        this.wrapS = a.wrapS || a.wrap || GL.REPEAT;
        this.wrapT = a.wrapT || a.wrap || GL.REPEAT;
        this.magFilter = a.magFilter || a.filter || GL.LINEAR;
        this.minFilter = a.minFilter || a.filter || GL.LINEAR_MIPMAP_LINEAR;
        this.width = a.width;
        this.height = a.height;
        this.onLoadComplete = a.onLoadComplete;
        this.onLoadError = a.onLoadError;
        this.onLoadContext = a.onLoadContext;
        this.texture = void 0;
        this.flipY = a.flipY || 0
    }
    var a = {
        posX: 0,
        negX: 1,
        posY: 2,
        negY: 3,
        posZ: 4,
        negZ: 5
    };
    b.prototype.init = function() {
        if (this.texture !== void 0) return this;
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, this.flipY);
        if (this.data === void 0 && this.width !== void 0 && this.height !== void 0) this.data = this.type === GL.UNSIGNED_BYTE ? new Uint8Array(this.width * this.height * (this.format === GL.RGBA ? 4 : 3)) : new Float32Array(this.width * this.height * (this.format === GL.RGBA ?
            4 : 3));
        else if (typeof this.data === "string") {
            this.textureType = GL.TEXTURE_2D;
            var c = this.data,
                b = c.toLowerCase();
            if (b.indexOf(".jpg") !== -1 || b.indexOf(".png") !== -1 || b.indexOf(".gif") !== -1 || b.indexOf("jpeg") !== -1) this.data = new Image, this.data.scope = this, this.data.onerror = this.onLoadError, this.data.onload = this.onLoadImage;
            else {
                if (this.autoUpdate === void 0) this.autoUpdate = !0;
                this.data = document.createElement("video");
                this.data.scope = this;
                this.data.addEventListener("loadeddata", this.onLoadVideo, !1)
            }
            this.data.src =
                c
        } else if (this.data instanceof HTMLImageElement || this.data instanceof HTMLVideoElement || this.data instanceof HTMLCanvasElement || this.data instanceof Uint8Array || this.data instanceof Float32Array) this.textureType = GL.TEXTURE_2D, this.createTexture();
        else {
            this.textureType = GL.TEXTURE_CUBE_MAP;
            this.itemsToLoad = 0;
            for (var e in a) this.data[e] !== void 0 ? typeof this.data[e] === "string" && this.itemsToLoad++ : GLOW.error("GLOW.Texture.init: data type error. Did you forget cube map " + e + "? If not, the data type is not supported");
            if (this.itemsToLoad === 0) this.createTexture();
            else
                for (e in a)
                    if (typeof this.data[e] === "string") c = this.data[e], b = c.toLowerCase(), b.indexOf(".jpg") !== -1 || b.indexOf(".png") !== -1 || b.indexOf(".gif") !== -1 || b.indexOf("jpeg") !== -1 ? (this.data[e] = new Image, this.data[e].scope = this, this.data[e].onload = this.onLoadCubeImage) : (this.autoUpdate !== void 0 ? this.autoUpdate[e] = this.autoUpdate[e] !== void 0 ? this.autoUpdate[e] : !0 : (this.autoUpdate = {}, this.autoUpdate[e] = !0), this.data[e] = document.createElement("video"), this.data[e].scope =
                        this, this.data[e].addEventListener("loadeddata", this.onLoadCubeVideo, !1)), this.data[e].src = c
        }
        return this
    };
    b.prototype.createTexture = function() {
        this.texture !== void 0 && GL.deleteTexture(this.texture);
        this.texture = GL.createTexture();
        GL.bindTexture(this.textureType, this.texture);
        if (this.textureType === GL.TEXTURE_2D)
            if (this.data instanceof Uint8Array || this.data instanceof Float32Array)
                if (this.width !== void 0 && this.height !== void 0) GL.texImage2D(this.textureType, 0, this.internalFormat, this.width, this.height,
                    0, this.format, this.type, this.data);
                else {
                    GLOW.error("GLOW.Texture.createTexture: Textures of type Uint8Array/Float32Array requires width and height parameters. Quitting.");
                    return
                }
        else GL.texImage2D(this.textureType, 0, this.internalFormat, this.format, this.type, this.data);
        else
            for (var c in a)
                if (this.data[c] instanceof Uint8Array || this.data[c] instanceof Float32Array)
                    if (this.width !== void 0 && this.height !== void 0) GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[c], 0, this.internalFormat, this.width, this.height,
                        0, this.format, this.type, this.data[c]);
                    else {
                        GLOW.error("GLOW.Texture.createTexture: Textures of type Uint8Array/Float32Array requires width and height parameters. Quitting.");
                        return
                    }
        else GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[c], 0, this.internalFormat, this.format, this.type, this.data[c]);
        GL.texParameteri(this.textureType, GL.TEXTURE_WRAP_S, this.wrapS);
        GL.texParameteri(this.textureType, GL.TEXTURE_WRAP_T, this.wrapT);
        GL.texParameteri(this.textureType, GL.TEXTURE_MIN_FILTER, this.minFilter);
        GL.texParameteri(this.textureType,
            GL.TEXTURE_MAG_FILTER, this.magFilter);
        this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR && GL.generateMipmap(this.textureType);
        return this
    };
    b.prototype.updateTexture = function(c) {
        if (this.texture !== void 0) {
            var c = c !== void 0 ? c : {},
                b = c.level || 0,
                e = c.xOffset || 0,
                h = c.yOffset || 0,
                g = c.updateMipmap !== void 0 ? c.updateMipmap : !0;
            this.data = c.data || this.data;
            GL.bindTexture(this.textureType, this.texture);
            if (this.textureType == GL.TEXTURE_2D) this.data instanceof Uint8Array ? GL.texSubImage2D(this.textureType, b, e, h, this.width,
                this.height, this.format, this.type, this.data) : GL.texSubImage2D(this.textureType, b, e, h, this.format, this.type, this.data);
            else
                for (var i in c) a[i] !== void 0 && (this.data[i] instanceof Uint8Array ? GL.texSubImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[i], b, e, h, this.width, this.height, this.format, this.type, this.data[i]) : GL.texSubImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + a[i], b, e, h, this.format, this.type, this.data[i]));
            this.minFilter !== GL.NEAREST && this.minFilter !== GL.LINEAR && g === !0 && GL.generateMipmap(this.textureType)
        }
    };
    b.prototype.swapTexture = function(a) {
        this.dispose();
        this.data = a;
        this.init()
    };
    b.prototype.onLoadImage = function() {
        this.scope.createTexture();
        this.scope.onLoadComplete && this.scope.onLoadComplete.call(this.scope.onLoadContext, this.scope)
    };
    b.prototype.onLoadError = function() {
        this.scope.onLoadError && this.scope.onLoadError.call(this.scope.onLoadContext, this.scope)
    };
    b.prototype.onLoadCubeImage = function() {
        this.scope.itemsToLoad--;
        this.scope.itemsToLoad === 0 && this.scope.createTexture()
    };
    b.prototype.onLoadVideo =
        function() {
            this.removeEventListener("loadeddata", this.scope.onLoadVideo, !1);
            this.scope.createTexture()
        };
    b.prototype.onLoadCubeVideo = function() {
        this.removeEventListener("loadeddata", this.scope.onLoadVideo, !1);
        this.scope.itemsToLoad--;
        this.scope.itemsToLoad === 0 && this.scope.createTexture()
    };
    b.prototype.play = function() {
        if (this.textureType === GL.TEXTURE_2D) this.data instanceof HTMLVideoElement && this.data.play();
        else
            for (var c in a) this.data[c] instanceof HTMLVideoElement && this.data[c].play()
    };
    b.prototype.dispose =
        function() {
            if (this.texture !== void 0) GL.deleteTexture(this.texture), this.texture = void 0;
            this.data = void 0
        };
    return b
}();
GLOW.Shader = function() {
    function b(a) {
        this.id = GLOW.uniqueId();
        this.compiledData = a.use ? a.use.clone(a.except) : GLOW.Compiler.compile(a);
        this.uniforms = this.compiledData.uniforms;
        this.elements = this.compiledData.elements;
        this.program = this.compiledData.program;
        this.attachData()
    }
    b.prototype.attachData = function() {
        var a, c, b;
        for (a in this.uniforms) this[a] === void 0 ? this.uniforms[a].data !== void 0 ? this[a] = this.uniforms[a].data : GLOW.warn("GLOW.Shader.attachUniformAndAttributeData: no data for uniform " + a + ", not attaching for easy access. Please use Shader.uniforms." +
            a + ".data to set data.") : this[a] !== this.uniforms[a].data && GLOW.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on uniform " + a + ", not attaching for easy access. Please use Shader.uniforms." + a + ".data to access data.");
        for (c in this.compiledData.attributes) {
            if (this.attributes === void 0) this.attributes = this.compiledData.attributes;
            this[c] === void 0 ? this[c] = this.compiledData.attributes[c] : this[c] !== this.compiledData.attributes[c] && GLOW.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on attribute " +
                c + ", not attaching for easy access. Please use Shader.attributes." + c + ".data to access data.")
        }
        for (b in this.compiledData.interleavedAttributes) {
            if (this.interleavedAttributes === void 0) this.interleavedAttributes = this.compiledData.interleavedAttributes;
            this[b] === void 0 ? this[b] = this.compiledData.interleavedAttributes[b] : this[b] !== this.compiledData.interleavedAttributes[b] && GLOW.warn("GLOW.Shader.attachUniformAndAttributeData: name collision on interleavedAttribute " + c + ", not attaching for easy access. Please use Shader.interleavedAttributes." +
                c + ".data to access data.")
        }
    };
    b.prototype.draw = function() {
        var a = this.compiledData,
            c = GLOW.currentContext.cache,
            b = c.attributeByLocation,
            e = c.uniformByLocation,
            h = a.attributeArray,
            g = a.interleavedAttributeArray,
            i = a.uniformArray,
            j, k, l, m;
        if (!c.programCached(a.program) && (GL.useProgram(a.program), j = c.setProgramHighestAttributeNumber(a.program)))
            if (k = a.program.highestAttributeNumber, l = k - j + 1, j > 0)
                for (; l <= k; l++) GL.enableVertexAttribArray(l);
            else
                for (l--; l > k; l--) GL.disableVertexAttribArray(l);
        if (c.active) {
            for (c =
                h.length; c--;)
                if (j = h[c], j.interleaved === !1 && b[j.locationNumber] !== j.id) b[j.locationNumber] = j.id, j.bind();
            for (c = g.length; c--;) {
                h = g[c];
                k = h.attributes;
                l = k.length;
                for (m = !1; l--;) {
                    j = k[l];
                    if (b[j.locationNumber] === j.id) {
                        m = !0;
                        break
                    }
                    b[j.locationNumber] = j.id
                }
                m || h.bind()
            }
            for (c = i.length; c--;)
                if (b = i[c], e[b.locationNumber] !== b.id) e[b.locationNumber] = b.id, b.load()
        } else {
            for (c = h.length; c--;) h[c].interleaved === !1 && h[c].bind();
            for (c = g.length; c--;) g[c].bind();
            for (c = i.length; c--;) i[c].load()
        }
        a.elements.draw()
    };
    b.prototype.clone =
        function(a) {
            return new GLOW.Shader({
                use: this.compiledData,
                except: a
            })
        };
    b.prototype.applyUniformData = function(a, c) {
        if (this.compiledData.uniforms[a] !== void 0) {
            this[a] = c;
            this.compiledData.uniforms[a].data = c;
            for (var b = this.compiledData.uniformArray.length; b--;)
                if (this.compiledData.uniformArray[b].name === a) {
                    this.compiledData.uniformArray[b].data = c;
                    break
                }
        }
    };
    b.prototype.dispose = function(a, c, b) {
        var e, h, g;
        for (e in this.compiledData.uniforms) delete this[e];
        for (h in this.compiledData.attributes) delete this[h];
        for (g in this.compiledData.interleavedAttributes) delete this[g];
        delete this.program;
        delete this.elements;
        delete this.uniforms;
        delete this.attributes;
        delete this.interleavedAttributes;
        this.compiledData.dispose(a, c, b);
        delete this.compiledData
    };
    return b
}();
GLOW.Elements = function() {
    function b(a, c, b, e) {
        this.id = GLOW.uniqueId();
        this.type = c !== void 0 ? c : GL.TRIANGLES;
        this.offset = e !== void 0 ? e : 0;
        typeof a === "number" || a === void 0 ? this.length = a : (a instanceof Uint16Array || (a = new Uint16Array(a)), this.length = a.length, this.elements = GL.createBuffer(), GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.elements), GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, a, b ? b : GL.STATIC_DRAW))
    }
    b.prototype.draw = function() {
        this.elements !== void 0 ? (GLOW.currentContext.cache.elementsCached(this) || GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER,
            this.elements), GL.drawElements(this.type, this.length, GL.UNSIGNED_SHORT, this.offset)) : GL.drawArrays(this.type, this.offset, this.length)
    };
    b.prototype.clone = function(a) {
        a = a || {};
        return new GLOW.Elements(a.data || this.data, a.type || this.type, a.usage, a.offset || this.offset)
    };
    b.prototype.dispose = function() {
        this.elements !== void 0 && (GL.deleteBuffer(this.elements), delete this.elements)
    };
    return b
}();
GLOW.Uniform = function() {
    function b() {
        f[GL.INT] = function() {
            GL.uniform1iv(this.location, this.getNativeValue())
        };
        f[GL.FLOAT] = function() {
            GL.uniform1fv(this.location, this.getNativeValue())
        };
        f[GL.INT_VEC2] = function() {
            GL.uniform2iv(this.location, this.getNativeValue())
        };
        f[GL.INT_VEC3] = function() {
            GL.uniform3iv(this.location, this.getNativeValue())
        };
        f[GL.INT_VEC4] = function() {
            GL.uniform4iv(this.location, this.getNativeValue())
        };
        f[GL.BOOL] = function() {
            GL.uniform1iv(this.location, this.getNativeValue())
        };
        f[GL.BOOL_VEC2] =
            function() {
                GL.uniform2iv(this.location, this.getNativeValue())
            };
        f[GL.BOOL_VEC3] = function() {
            GL.uniform3iv(this.location, this.getNativeValue())
        };
        f[GL.BOOL_VEC4] = function() {
            GL.uniform4iv(this.location, this.getNativeValue())
        };
        f[GL.FLOAT_VEC2] = function() {
            GL.uniform2fv(this.location, this.getNativeValue())
        };
        f[GL.FLOAT_VEC3] = function() {
            GL.uniform3fv(this.location, this.getNativeValue())
        };
        f[GL.FLOAT_VEC4] = function() {
            GL.uniform4fv(this.location, this.getNativeValue())
        };
        f[GL.FLOAT_MAT2] = function() {
            GL.uniformMatrix2fv(this.location, !1, this.getNativeValue())
        };
        f[GL.FLOAT_MAT3] = function() {
            GL.uniformMatrix3fv(this.location, !1, this.getNativeValue())
        };
        f[GL.FLOAT_MAT4] = function() {
            GL.uniformMatrix4fv(this.location, !1, this.getNativeValue())
        };
        f[GL.SAMPLER_2D] = function() {
            this.data.texture !== void 0 && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(this.textureUnit, this.data) && (GL.uniform1i(this.location, this.textureUnit), GL.activeTexture(GL.TEXTURE0 + this.textureUnit), GL.bindTexture(GL.TEXTURE_2D, this.data.texture), this.data.autoUpdate &&
                this.data.updateTexture(this.data.autoUpdate))
        };
        f[GL.SAMPLER_CUBE] = function() {
            this.data.texture !== void 0 && this.textureUnit !== -1 && !GLOW.currentContext.cache.textureCached(this.textureUnit, this.data) && (GL.uniform1i(this.location, this.textureUnit), GL.activeTexture(GL.TEXTURE0 + this.textureUnit), GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.data.texture), this.data.autoUpdate && this.data.updateTexture(this.data.autoUpdate))
        }
    }

    function a(a, h) {
        c || (c = !0, b());
        this.id = GLOW.uniqueId();
        this.data = h;
        this.name = a.name;
        this.length =
            a.length;
        this.type = a.type;
        this.location = a.location;
        this.locationNumber = a.locationNumber;
        this.textureUnit = a.textureUnit !== void 0 ? a.textureUnit : -1;
        this.load = a.loadFunction || f[this.type]
    }
    var c = !1,
        f = [];
    a.prototype.getNativeValue = function() {
        return this.data.value
    };
    a.prototype.clone = function(a) {
        return new GLOW.Uniform(this, a || this.data)
    };
    a.prototype.dispose = function(a) {
        this.data !== void 0 && this.type === GL.SAMPLER_2D && a && this.data.dispose();
        delete this.data;
        delete this.load;
        delete this.location
    };
    return a
}();
GLOW.Attribute = function() {
    function b(b, e, h, g) {
        a || (a = !0, c[GL.INT] = 1, c[GL.INT_VEC2] = 2, c[GL.INT_VEC3] = 3, c[GL.INT_VEC4] = 4, c[GL.BOOL] = 1, c[GL.BOOL_VEC2] = 2, c[GL.BOOL_VEC3] = 3, c[GL.BOOL_VEC4] = 4, c[GL.FLOAT] = 1, c[GL.FLOAT_VEC2] = 2, c[GL.FLOAT_VEC3] = 3, c[GL.FLOAT_VEC4] = 4, c[GL.FLOAT_MAT2] = 4, c[GL.FLOAT_MAT3] = 9, c[GL.FLOAT_MAT4] = 16);
        this.id = GLOW.uniqueId();
        this.data = e;
        this.location = b.location;
        this.locationNumber = b.locationNumber;
        this.offset = this.stride = 0;
        this.usage = h !== void 0 ? h : GL.STATIC_DRAW;
        this.interleaved = g !== void 0 ?
            g : !1;
        this.size = c[b.type];
        this.name = b.name;
        this.type = b.type;
        this.data && (this.data.length / this.size > 65536 && GLOW.warn("GLOW.Attribute.constructor: Unreachable attribute? Please activate GL.drawArrays or split into multiple shaders. Indexed elements cannot reach attribute data beyond 65535."), this.interleaved === !1 && this.bufferData(this.data, this.usage))
    }
    var a = !1,
        c = [];
    b.prototype.setupInterleave = function(a, b) {
        this.interleaved = !0;
        this.offset = a;
        this.stride = b
    };
    b.prototype.bufferData = function(a, b) {
        if (a !==
            void 0 && this.data !== a) this.data = a;
        if (b !== void 0 && this.usage !== b) this.usage = b;
        if (this.buffer === void 0) this.buffer = GL.createBuffer();
        if (this.data.constructor.toString().indexOf(" Array()") !== -1) this.data = new Float32Array(this.data);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.bufferData(GL.ARRAY_BUFFER, this.data, this.usage)
    };
    b.prototype.bind = function() {
        this.interleaved === !1 && GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.vertexAttribPointer(this.location, this.size, GL.FLOAT, !1, this.stride, this.offset)
    };
    b.prototype.clone = function(a) {
        if (this.interleaved) GLOW.error("GLOW.Attribute.clone: Cannot clone interleaved attribute. Please check your interleave setup.");
        else return a = a || {}, new GLOW.Attribute(this, a.data || this.data, a.usage || this.usage, a.interleaved || this.interleaved)
    };
    b.prototype.dispose = function() {
        this.buffer && (GL.deleteBuffer(this.buffer), delete this.buffer);
        delete this.data
    };
    return b
}();
GLOW.InterleavedAttributes = function() {
    function b(a) {
        this.id = GLOW.uniqueId();
        this.attributes = a;
        var b, f = a[0].data.length / a[0].size,
            e, h = a.length,
            g, i, j, k = [],
            l, m = [];
        for (e = 0; e < h; e++) k[e] = 0;
        for (b = 0; b < f; b++)
            for (e = 0; e < h; e++) {
                l = a[e].data;
                j = k[e];
                g = 0;
                for (i = a[e].size; g < i; g++) m.push(l[j++]);
                k[e] = j
            }
        this.data = new Float32Array(m);
        this.usage = a[0].usage;
        for (e = 0; e < h; e++)
            if (this.usage !== a[e].usage) {
                GLOW.warn("GLOW.InterleavedAttributes.construct: Attribute " + a[e].name + " has different usage, defaulting to STATIC_DRAW.");
                this.usage = GL.STATIC_DRAW;
                break
            }
        this.bufferData(this.data, this.usage);
        for (e = b = 0; e < h; e++) b += a[e].size * 4;
        for (e = f = 0; e < h; e++) a[e].setupInterleave(f, b), f += a[e].size * 4
    }
    b.prototype.bufferData = function(a, b) {
        if (a !== void 0 && this.data !== a) this.data = a;
        if (this.buffer === void 0) this.buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        GL.bufferData(GL.ARRAY_BUFFER, this.data, b ? b : GL.STATIC_DRAW)
    };
    b.prototype.bind = function() {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
        for (var a = this.attributes.length; a--;) this.attributes[a].bind()
    };
    b.prototype.dispose = function() {
        this.buffer && (GL.deleteBuffer(this.buffer), delete this.buffer);
        delete this.data;
        if (this.attributes) {
            for (var a = this.attributes.length; a--;) this.attributes[a].dispose();
            delete this.attributes
        }
    };
    return b
}();
GLOW.Float = function() {
    function b(a) {
        a !== void 0 && a.length ? this.value = new Float32Array(a) : (this.value = new Float32Array(1), this.value[0] = a !== void 0 ? a : 0)
    }
    b.prototype.set = function(a) {
        this.value[0] = a;
        return this
    };
    b.prototype.add = function(a) {
        this.value[0] += a;
        return this
    };
    b.prototype.sub = function(a) {
        this.value[0] -= a;
        return this
    };
    b.prototype.multiply = function(a) {
        this.value[0] *= a;
        return this
    };
    b.prototype.divide = function(a) {
        this.value[0] /= a;
        return this
    };
    b.prototype.modulo = function(a) {
        this.value[0] %= a;
        return this
    };
    return b
}();
GLOW.Int = function() {
    function b(a) {
        a !== void 0 && a.length ? this.value = new Int32Array(a) : (this.value = new Int32Array(1), this.value[0] = a !== void 0 ? a : 0)
    }
    b.prototype.set = function(a) {
        this.value[0] = a;
        return this
    };
    b.prototype.add = function(a) {
        this.value[0] += a;
        return this
    };
    b.prototype.sub = function(a) {
        this.value[0] -= a;
        return this
    };
    b.prototype.multiply = function(a) {
        this.value[0] *= a;
        return this
    };
    b.prototype.divide = function(a) {
        this.value[0] /= a;
        return this
    };
    b.prototype.modulo = function(a) {
        this.value[0] %= a;
        return this
    };
    return b
}();
GLOW.Bool = function() {
    function b(a) {
        this.value = [];
        this.value[0] = a !== void 0 ? !!a : !1
    }
    b.prototype.set = function(a) {
        this.value[0] = !!a;
        return this
    };
    return b
}();
GLOW.Bool2 = function() {
    function b(a, b) {
        this.value = [];
        this.value[0] = a !== void 0 ? !!a : !1;
        this.value[1] = b !== void 0 ? !!b : !1
    }
    b.prototype.set = function(a, b) {
        this.value[0] = !!a;
        this.value[1] = !!b;
        return this
    };
    return b
}();
GLOW.Bool3 = function() {
    function b(a, b, f) {
        this.value = [];
        this.value[0] = a !== void 0 ? !!a : !1;
        this.value[1] = b !== void 0 ? !!b : !1;
        this.value[2] = f !== void 0 ? !!f : !1
    }
    b.prototype.set = function(a, b, f) {
        this.value[0] = !!a;
        this.value[1] = !!b;
        this.value[2] = !!f;
        return this
    };
    return b
}();
GLOW.Bool4 = function() {
    function b(a, b, f, e) {
        this.value = [];
        this.value[0] = a !== void 0 ? !!a : !1;
        this.value[1] = b !== void 0 ? !!b : !1;
        this.value[2] = f !== void 0 ? !!f : !1;
        this.value[3] = e !== void 0 ? !!e : !1
    }
    b.prototype.set = function(a, b, f, e) {
        this.value[0] = !!a;
        this.value[1] = !!b;
        this.value[2] = !!f;
        this.value[3] = !!e;
        return this
    };
    return b
}();
GLOW.Vector2 = function() {
    function b(a, b) {
        this.value = new Float32Array(2);
        this.value[0] = a !== void 0 ? a : 0;
        this.value[1] = b !== void 0 ? b : 0
    }
    b.prototype.set = function(a, b) {
        this.value[0] = a;
        this.value[1] = b;
        return this
    };
    b.prototype.copy = function(a) {
        this.value[0] = a.value[0];
        this.value[1] = a.value[1];
        return this
    };
    b.prototype.addSelf = function(a) {
        this.value[0] += a.value[0];
        this.value[1] += a.value[1];
        return this
    };
    b.prototype.add = function(a, b) {
        this.value[0] = a.value[0] + b.value[0];
        this.value[1] = a.value[1] + b.value[1];
        return this
    };
    b.prototype.addScalar = function(a) {
        this.value[0] += a;
        this.value[1] += a;
        return this
    };
    b.prototype.subSelf = function(a) {
        this.value[0] -= a.x;
        this.value[1] -= a.y;
        return this
    };
    b.prototype.sub = function(a, b) {
        this.value[0] = a.value[0] - b.value[0];
        this.value[1] = a.value[1] - b.value[1];
        return this
    };
    b.prototype.multiplySelf = function(a) {
        this.value[0] *= a.value[0];
        this.value[1] *= a.value[1];
        return this
    };
    b.prototype.multiply = function(a, b) {
        this.value[0] = a.value[0] * b.value[0];
        this.value[1] = a.value[1] * b.value[1];
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[1] *= a;
        return this
    };
    b.prototype.negate = function() {
        this.value[0] = -this.value[0];
        this.value[1] = -this.value[1];
        return this
    };
    b.prototype.normalize = function() {
        this.multiplyScalar(1 / this.length());
        return this
    };
    b.prototype.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    b.prototype.lengthSq = function() {
        return this.value[0] * this.value[0] + this.value[1] * this.value[1]
    };
    b.prototype.clone = function() {
        return new GLOW.Vector2(this.value[0], this.value[1])
    };
    return b
}();
GLOW.Vector3 = function() {
    function b(a, b, f) {
        this.value = new Float32Array(3);
        this.value[0] = a !== void 0 ? a : 0;
        this.value[1] = b !== void 0 ? b : 0;
        this.value[2] = f !== void 0 ? f : 0
    }
    b.prototype.set = function(a, b, f) {
        this.value[0] = a;
        this.value[1] = b;
        this.value[2] = f;
        return this
    };
    b.prototype.copy = function(a) {
        this.set(a.value[0], a.value[1], a.value[2]);
        return this
    };
    b.prototype.add = function(a, b) {
        a = a.value;
        b = b.value;
        this.value[0] = a[0] + b[0];
        this.value[1] = a[1] + b[1];
        this.value[2] = a[2] + b[2];
        return this
    };
    b.prototype.addSelf = function(a) {
        a =
            a.value;
        this.value[0] += a[0];
        this.value[1] += a[1];
        this.value[2] += a[2];
        return this
    };
    b.prototype.addScalar = function(a) {
        this.value[0] += a;
        this.value[1] += a;
        this.value[2] += a;
        return this
    };
    b.prototype.sub = function(a, b) {
        a = a.value;
        b = b.value;
        this.value[0] = a[0] - b[0];
        this.value[1] = a[1] - b[1];
        this.value[2] = a[2] - b[2];
        return this
    };
    b.prototype.subSelf = function(a) {
        a = a.value;
        this.value[0] -= a[0];
        this.value[1] -= a[1];
        this.value[2] -= a[2];
        return this
    };
    b.prototype.cross = function(a, b) {
        a = a.value;
        b = b.value;
        this.value[0] = a[1] * b[2] -
            a[2] * b[1];
        this.value[1] = a[2] * b[0] - a[0] * b[2];
        this.value[2] = a[0] * b[1] - a[1] * b[0];
        return this
    };
    b.prototype.crossSelf = function(a) {
        var a = a.value,
            b = a[0],
            f = a[1],
            a = a[2],
            e = this.value[0],
            h = this.value[1],
            g = this.value[2];
        this.value[0] = f * g - a * h;
        this.value[1] = a * e - b * g;
        this.value[2] = b * h - f * e;
        return this
    };
    b.prototype.multiply = function(a, b) {
        a = a.value;
        b = b.value;
        this.value[0] = a[0] * b[0];
        this.value[1] = a[1] * b[1];
        this.value[2] = a[2] * b[2];
        return this
    };
    b.prototype.multiplySelf = function(a) {
        a = a.value;
        this.value[0] *= a[0];
        this.value[1] *=
            a[1];
        this.value[2] *= a[2];
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[1] *= a;
        this.value[2] *= a;
        return this
    };
    b.prototype.divideSelf = function(a) {
        a = a.value;
        this.value[0] /= a[0];
        this.value[1] /= a[1];
        this.value[2] /= a[2];
        return this
    };
    b.prototype.divideScalar = function(a) {
        this.value[0] /= a;
        this.value[1] /= a;
        this.value[2] /= a;
        return this
    };
    b.prototype.negate = function() {
        this.value[0] = -this.value[0];
        this.value[1] = -this.value[1];
        this.value[2] = -this.value[2];
        return this
    };
    b.prototype.dot =
        function(a) {
            a = a.value;
            return this.value[0] * a[0] + this.value[1] * a[1] + this.value[2] * a[2]
        };
    b.prototype.distanceTo = function(a) {
        return Math.sqrt(this.distanceToSquared(a))
    };
    b.prototype.distanceToSquared = function(a) {
        var a = a.value,
            b = this.value[0] - a[0],
            f = this.value[1] - a[1],
            a = this.value[2] - a[2];
        return b * b + f * f + a * a
    };
    b.prototype.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    b.prototype.lengthSq = function() {
        return this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2]
    };
    b.prototype.lengthManhattan =
        function() {
            return this.value[0] + this.value[1] + this.value[2]
        };
    b.prototype.normalize = function() {
        var a = Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2]);
        a > 0 ? this.multiplyScalar(1 / a) : this.set(0, 0, 0);
        return this
    };
    b.prototype.setPositionFromMatrix = function(a) {
        a = a.value;
        this.value[0] = a[12];
        this.value[1] = a[13];
        this.value[2] = a[14]
    };
    b.prototype.setLength = function(a) {
        return this.normalize().multiplyScalar(a)
    };
    b.prototype.isZero = function() {
        return Math.abs(this.value[0]) <
            1.0E-4 && Math.abs(this.value[1]) < 1.0E-4 && Math.abs(this.value[2]) < 1.0E-4
    };
    b.prototype.clone = function() {
        return new GLOW.Vector3(this.value[0], this.value[1], this.value[2])
    };
    return b
}();
GLOW.Vector4 = function() {
    function b(a, b, f, e) {
        this.value = new Float32Array(4);
        this.value[0] = a !== void 0 ? a : 0;
        this.value[1] = b !== void 0 ? b : 0;
        this.value[2] = f !== void 0 ? f : 0;
        this.value[3] = e !== void 0 ? e : 0
    }
    b.prototype.set = function(a, b, f, e) {
        this.value[0] = a;
        this.value[1] = b;
        this.value[2] = f;
        this.value[3] = e;
        return this
    };
    b.prototype.copy = function(a) {
        this.value[0] = a.value[0];
        this.value[1] = a.value[1];
        this.value[2] = a.value[2];
        this.value[3] = a.value[3];
        return this
    };
    b.prototype.add = function(a, b) {
        this.value[0] = a.value[0] + b.value[0];
        this.value[1] = a.value[1] + b.value[1];
        this.value[2] = a.value[2] + b.value[2];
        this.value[3] = a.value[3] + b.value[3];
        return this
    };
    b.prototype.addSelf = function(a) {
        this.value[0] += a.value[0];
        this.value[1] += a.value[1];
        this.value[2] += a.value[2];
        this.value[3] += a.value[3];
        return this
    };
    b.prototype.sub = function(a, b) {
        this.value[0] = a.value[0] - b.value[0];
        this.value[1] = a.value[1] - b.value[1];
        this.value[2] = a.value[2] - b.value[2];
        this.value[3] = a.value[3] - b.value[3];
        return this
    };
    b.prototype.subSelf = function(a) {
        this.value[0] -=
            a.value[0];
        this.value[1] -= a.value[1];
        this.value[2] -= a.value[2];
        this.value[3] -= a.value[3];
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[1] *= a;
        this.value[2] *= a;
        this.value[3] *= a;
        return this
    };
    b.prototype.divideScalar = function(a) {
        this.value[0] /= a;
        this.value[1] /= a;
        this.value[2] /= a;
        this.value[3] /= a;
        return this
    };
    b.prototype.normalize = function() {
        var a = Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2] + this.value[3] * this.value[3]);
        a > 0 ? this.multiplyScalar(1 / a) : this.set(0, 0, 0, 1);
        return this
    };
    b.prototype.lerpSelf = function(a, b) {
        this.value[0] += (a.x - this.value[0]) * b;
        this.value[1] += (a.y - this.value[1]) * b;
        this.value[2] += (a.z - this.value[2]) * b;
        this.value[3] += (a.w - this.value[3]) * b;
        return this
    };
    b.prototype.lengthOfXYZ = function() {
        return Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2])
    };
    b.prototype.clone = function() {
        return new GLOW.Vector4(this.value[0], this.value[1], this.value[2], this.value[3])
    };
    return b
}();
GLOW.Quaternion = function() {
    function b(a, b, f, e) {
        this.value = new Float32Array(4);
        this.value[0] = a !== void 0 ? a : 0;
        this.value[1] = b !== void 0 ? b : 0;
        this.value[2] = f !== void 0 ? f : 0;
        this.value[3] = e !== void 0 ? e : 0
    }
    b.prototype.set = function(a, b, f, e) {
        this.value[0] = a;
        this.value[1] = b;
        this.value[2] = f;
        this.value[3] = e;
        return this
    };
    b.prototype.copy = function(a) {
        this.value[0] = a.value[0];
        this.value[1] = a.value[1];
        this.value[2] = a.value[2];
        this.value[3] = a.value[3];
        return this
    };
    b.prototype.add = function(a, b) {
        this.value[0] = a.value[0] +
            b.value[0];
        this.value[1] = a.value[1] + b.value[1];
        this.value[2] = a.value[2] + b.value[2];
        this.value[3] = a.value[3] + b.value[3];
        return this
    };
    b.prototype.addSelf = function(a) {
        this.value[0] += a.value[0];
        this.value[1] += a.value[1];
        this.value[2] += a.value[2];
        this.value[3] += a.value[3];
        return this
    };
    b.prototype.sub = function(a, b) {
        this.value[0] = a.value[0] - b.value[0];
        this.value[1] = a.value[1] - b.value[1];
        this.value[2] = a.value[2] - b.value[2];
        this.value[3] = a.value[3] - b.value[3];
        return this
    };
    b.prototype.subSelf = function(a) {
        this.value[0] -=
            a.value[0];
        this.value[1] -= a.value[1];
        this.value[2] -= a.value[2];
        this.value[3] -= a.value[3];
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[1] *= a;
        this.value[2] *= a;
        this.value[3] *= a;
        return this
    };
    b.prototype.divideScalar = function(a) {
        this.value[0] /= a;
        this.value[1] /= a;
        this.value[2] /= a;
        this.value[3] /= a;
        return this
    };
    b.prototype.normalize = function() {
        var a = Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2] + this.value[3] * this.value[3]);
        a > 0 ? this.multiplyScalar(1 / a) : this.set(0, 0, 0, 1);
        return this
    };
    b.prototype.lerpSelf = function(a, b) {
        this.value[0] += (a.x - this.value[0]) * b;
        this.value[1] += (a.y - this.value[1]) * b;
        this.value[2] += (a.z - this.value[2]) * b;
        this.value[3] += (a.w - this.value[3]) * b;
        return this
    };
    b.prototype.clone = function() {
        return new GLOW.Quaternion(this.value[0], this.value[1], this.value[2], this.value[3])
    };
    return b
}();
GLOW.Matrix3 = function() {
    function b() {
        this.value = new Float32Array(9);
        this.identity()
    }
    b.prototype.set = function(a, b, f, e, h, g, i, j, k) {
        this.value[0] = a;
        this.value[3] = b;
        this.value[6] = f;
        this.value[1] = e;
        this.value[4] = h;
        this.value[7] = g;
        this.value[2] = i;
        this.value[5] = j;
        this.value[8] = k;
        return this
    };
    b.prototype.identity = function() {
        this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
        return this
    };
    b.prototype.extractFromMatrix4 = function(a) {
        this.set(a.value[0], a.value[4], a.value[8], a.value[1], a.value[5], a.value[9], a.value[2], a.value[6], a.value[10]);
        return this
    };
    b.prototype.multiplyVector3 = function(a) {
        var b = a.value[0],
            f = a.value[1],
            e = a.value[2];
        a.value[0] = this.value[0] * b + this.value[3] * f + this.value[6] * e;
        a.value[1] = this.value[1] * b + this.value[4] * f + this.value[7] * e;
        a.value[2] = this.value[2] * b + this.value[5] * f + this.value[8] * e;
        return a
    };
    b.prototype.scale = function(a, b, f) {
        var e;
        b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
        this.value[0] *= e;
        this.value[3] *= b;
        this.value[6] *= f;
        this.value[1] *= e;
        this.value[4] *= b;
        this.value[7] *= f;
        this.value[2] *=
            e;
        this.value[5] *= b;
        this.value[8] *= f;
        return this
    };
    return b
}();
GLOW.Matrix4 = function() {
    function b() {
        this.value = new Float32Array(16);
        this.rotation = new GLOW.Vector3;
        this.position = new GLOW.Vector3;
        this.columnX = new GLOW.Vector3;
        this.columnY = new GLOW.Vector3;
        this.columnZ = new GLOW.Vector3;
        this.identity()
    }
    b.prototype.set = function(a, b, f, e, h, g, i, j, k, l, m, n, o, p, r, q) {
        this.value[0] = a;
        this.value[4] = b;
        this.value[8] = f;
        this.value[12] = e;
        this.value[1] = h;
        this.value[5] = g;
        this.value[9] = i;
        this.value[13] = j;
        this.value[2] = k;
        this.value[6] = l;
        this.value[10] = m;
        this.value[14] = n;
        this.value[3] =
            o;
        this.value[7] = p;
        this.value[11] = r;
        this.value[15] = q;
        return this
    };
    b.prototype.identity = function() {
        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this
    };
    b.prototype.copy = function(a) {
        a = a.value;
        this.set(a[0], a[4], a[8], a[12], a[1], a[5], a[9], a[13], a[2], a[6], a[10], a[14], a[3], a[7], a[11], a[15]);
        return this
    };
    b.prototype.lookAt = function(a, b) {
        var f = GLOW.Matrix4.tempVector3A,
            e = GLOW.Matrix4.tempVector3B,
            h = GLOW.Matrix4.tempVector3C,
            g = this.getPosition();
        g.value[0] = this.value[12];
        g.value[1] = this.value[13];
        g.value[2] =
            this.value[14];
        h.sub(g, a).normalize();
        h.length() === 0 && (h.value[3] = 1);
        f.cross(b, h).normalize();
        f.length() === 0 && (h.value[0] += 1.0E-4, f.cross(b, h).normalize());
        e.cross(h, f).normalize();
        f = f.value;
        e = e.value;
        h = h.value;
        this.value[0] = f[0];
        this.value[4] = e[0];
        this.value[8] = h[0];
        this.value[1] = f[1];
        this.value[5] = e[1];
        this.value[9] = h[1];
        this.value[2] = f[2];
        this.value[6] = e[2];
        this.value[10] = h[2];
        return this
    };
    b.prototype.multiplyVector3 = function(a) {
        var b = a.value[0],
            f = a.value[1],
            e = a.value[2],
            h = 1 / (this.value[3] * b + this.value[7] *
                f + this.value[11] * e + this.value[15]);
        a.value[0] = (this.value[0] * b + this.value[4] * f + this.value[8] * e + this.value[12]) * h;
        a.value[1] = (this.value[1] * b + this.value[5] * f + this.value[9] * e + this.value[13]) * h;
        a.value[2] = (this.value[2] * b + this.value[6] * f + this.value[10] * e + this.value[14]) * h;
        return a
    };
    b.prototype.multiplyVector4 = function(a) {
        var b = a.value[0],
            f = a.value[1],
            e = a.value[2],
            h = a.value[3];
        a.value[0] = this.value[0] * b + this.value[4] * f + this.value[8] * e + this.value[12] * h;
        a.value[1] = this.value[1] * b + this.value[5] * f + this.value[9] *
            e + this.value[13] * h;
        a.value[2] = this.value[2] * b + this.value[6] * f + this.value[10] * e + this.value[14] * h;
        a.value[3] = this.value[3] * b + this.value[7] * f + this.value[11] * e + this.value[15] * h;
        return a
    };
    b.prototype.rotateAxis = function(a) {
        var b = a.value[0],
            f = a.value[1],
            e = a.value[2];
        a.value[0] = b * this.value[0] + f * this.value[4] + e * this.value[8];
        a.value[1] = b * this.value[1] + f * this.value[5] + e * this.value[9];
        a.value[2] = b * this.value[2] + f * this.value[6] + e * this.value[10];
        a.normalize();
        return a
    };
    b.prototype.crossVector = function(a) {
        var b =
            GLOW.Vector4(),
            f = a.value[0],
            e = a.value[1],
            h = a.value[2],
            a = a.value[3];
        b.value[0] = this.value[0] * f + this.value[4] * e + this.value[8] * h + this.value[12] * a;
        b.value[1] = this.value[1] * f + this.value[5] * e + this.value[9] * h + this.value[13] * a;
        b.value[2] = this.value[2] * f + this.value[6] * e + this.value[10] * h + this.value[14] * a;
        b.value[3] = a ? this.value[3] * f + this.value[7] * e + this.value[11] * h + this.value[15] * a : 1;
        return b
    };
    b.prototype.multiply = function(a, b) {
        var a = a.value,
            b = b.value,
            f = a[0],
            e = a[4],
            h = a[8],
            g = a[12],
            i = a[1],
            j = a[5],
            k = a[9],
            l = a[13],
            m = a[2],
            n = a[6],
            o = a[10],
            p = a[14],
            r = a[3],
            q = a[7],
            s = a[11],
            t = a[15],
            w = b[0],
            u = b[4],
            v = b[8],
            y = b[12],
            x = b[1],
            z = b[5],
            A = b[9],
            B = b[13],
            C = b[2],
            D = b[6],
            E = b[10],
            F = b[14];
        this.value[0] = f * w + e * x + h * C;
        this.value[4] = f * u + e * z + h * D;
        this.value[8] = f * v + e * A + h * E;
        this.value[12] = f * y + e * B + h * F + g;
        this.value[1] = i * w + j * x + k * C;
        this.value[5] = i * u + j * z + k * D;
        this.value[9] = i * v + j * A + k * E;
        this.value[13] = i * y + j * B + k * F + l;
        this.value[2] = m * w + n * x + o * C;
        this.value[6] = m * u + n * z + o * D;
        this.value[10] = m * v + n * A + o * E;
        this.value[14] = m * y + n * B + o * F + p;
        this.value[3] = r * w + q * x + s * C;
        this.value[7] =
            r * u + q * z + s * D;
        this.value[11] = r * v + q * A + s * E;
        this.value[15] = r * y + q * B + s * F + t;
        return this
    };
    b.prototype.multiplySelf = function(a) {
        this.multiply(this, a);
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[4] *= a;
        this.value[8] *= a;
        this.value[12] *= a;
        this.value[1] *= a;
        this.value[5] *= a;
        this.value[9] *= a;
        this.value[13] *= a;
        this.value[2] *= a;
        this.value[6] *= a;
        this.value[10] *= a;
        this.value[14] *= a;
        this.value[3] *= a;
        this.value[7] *= a;
        this.value[11] *= a;
        this.value[15] *= a;
        return this
    };
    b.prototype.determinant =
        function() {
            var a = this.value[0],
                b = this.value[4],
                f = this.value[8],
                e = this.value[12],
                h = this.value[1],
                g = this.value[5],
                i = this.value[9],
                j = this.value[13],
                k = this.value[2],
                l = this.value[6],
                m = this.value[10],
                n = this.value[14],
                o = this.value[3],
                p = this.value[7],
                r = this.value[11],
                q = this.value[15];
            return e * i * l * o - f * j * l * o - e * g * m * o + b * j * m * o + f * g * n * o - b * i * n * o - e * i * k * p + f * j * k * p + e * h * m * p - a * j * m * p - f * h * n * p + a * i * n * p + e * g * k * r - b * j * k * r - e * h * l * r + a * j * l * r + b * h * n * r - a * g * n * r - f * g * k * q + b * i * k * q + f * h * l * q - a * i * l * q - b * h * m * q + a * g * m * q
        };
    b.prototype.transpose = function() {
        var a;
        a = this.value[1];
        this.value[1] = this.value[4];
        this.value[4] = a;
        a = this.value[2];
        this.value[2] = this.value[8];
        this.value[8] = a;
        a = this.value[6];
        this.value[6] = this.value[9];
        this.value[9] = a;
        a = this.value[3];
        this.value[3] = this.value[12];
        this.value[12] = a;
        a = this.value[7];
        this.value[7] = this.value[13];
        this.value[13] = a;
        a = this.value[11];
        this.value[11] = this.value[14];
        this.value[11] = a;
        return this
    };
    b.prototype.clone = function() {
        var a = new GLOW.Matrix4;
        a.value = new Float32Array(this.value);
        return a
    };
    b.prototype.setPosition =
        function(a, b, f) {
            var e;
            b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
            this.value[12] = e;
            this.value[13] = b;
            this.value[14] = f;
            return this
        };
    b.prototype.addPosition = function(a, b, f) {
        var e;
        b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
        this.value[12] += e;
        this.value[13] += b;
        this.value[14] += f
    };
    b.prototype.setRotation = function(a, b, f) {
        var e;
        b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
        var a = Math.cos(b),
            b = Math.sin(b),
            h = Math.cos(f),
            f = Math.sin(f),
            g = Math.cos(e);
        e = Math.sin(e);
        this.value[0] = a * h;
        this.value[4] = b * e - a * f * g;
        this.value[8] = a * f * e + b * g;
        this.value[1] = f;
        this.value[5] = h * g;
        this.value[9] = -h * e;
        this.value[2] = -b * h;
        this.value[6] = b * f * g + a * e;
        this.value[10] = -b * f * e + a * g;
        return this
    };
    b.prototype.getRotation = function() {
        var a = this.value,
            b = this.rotation.value;
        if (a[1] > 0.998) return b[0] = 0, b[1] = Math.atan2(a[8], a[10]), b[2] = Math.PI / 2, this.rotation;
        else if (a[1] < -0.998) return b[0] = 0, b[1] = Math.atan2(a[8], a[10]), b[2] = -Math.PI / 2, this.rotation;
        b[0] = Math.atan2(-a[9], a[5]);
        b[1] = Math.atan2(-a[2],
            a[0]);
        b[2] = Math.asin(a[1]);
        return this.rotation
    };
    b.prototype.addRotation = function(a, b, f) {
        var e;
        b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
        this.rotation.value[0] += e;
        this.rotation.value[1] += b;
        this.rotation.value[2] += f;
        this.setRotation(this.rotation.value[0], this.rotation.value[1], this.rotation.value[2])
    };
    b.prototype.setQuaternion = function(a) {
        var b = this.value,
            f = a.value,
            a = f[0],
            e = f[1],
            h = f[2],
            f = f[3],
            g = a * a,
            i = e * e,
            j = h * h;
        b[0] = 1 - 2 * i - 2 * j;
        b[1] = 2 * a * e - 2 * h * f;
        b[2] = 2 * a * h + 2 * e * f;
        b[4] = 2 * a * e + 2 *
            h * f;
        b[5] = 1 - 2 * g - 2 * j;
        b[6] = 2 * e * h - 2 * a * f;
        b[8] = 2 * a * h - 2 * e * f;
        b[9] = 2 * e * h + 2 * a * f;
        b[10] = 1 - 2 * g - 2 * i;
        return this
    };
    b.prototype.getPosition = function() {
        this.position.set(this.value[12], this.value[13], this.value[14]);
        return this.position
    };
    b.prototype.getColumnX = function() {
        this.columnX.set(this.value[0], this.value[1], this.value[2]);
        return this.columnX
    };
    b.prototype.getColumnY = function() {
        this.columnY.set(this.value[4], this.value[5], this.value[6]);
        return this.columnY
    };
    b.prototype.getColumnZ = function() {
        this.columnZ.set(this.value[8],
            this.value[9], this.value[10]);
        return this.columnZ
    };
    b.prototype.scale = function(a, b, f) {
        var e;
        b !== void 0 && f !== void 0 ? e = a : (e = a.value[0], b = a.value[1], f = a.value[2]);
        this.value[0] *= e;
        this.value[4] *= b;
        this.value[8] *= f;
        this.value[1] *= e;
        this.value[5] *= b;
        this.value[9] *= f;
        this.value[2] *= e;
        this.value[6] *= b;
        this.value[10] *= f;
        this.value[3] *= e;
        this.value[7] *= b;
        this.value[11] *= f;
        return this
    };
    b.prototype.invert = function() {
        GLOW.Matrix4.makeInverse(this, this);
        return this
    };
    return b
}();
GLOW.Matrix4.makeInverse = function(b, a) {
    a === void 0 && (a = new GLOW.Matrix4);
    var c = b.value,
        f = a.value,
        e = c[0],
        h = c[4],
        g = c[8],
        i = c[12],
        j = c[1],
        k = c[5],
        l = c[9],
        m = c[13],
        n = c[2],
        o = c[6],
        p = c[10],
        r = c[14],
        q = c[3],
        s = c[7],
        t = c[11],
        c = c[15];
    f[0] = l * r * s - m * p * s + m * o * t - k * r * t - l * o * c + k * p * c;
    f[1] = m * p * q - l * r * q - m * n * t + j * r * t + l * n * c - j * p * c;
    f[2] = k * r * q - m * o * q + m * n * s - j * r * s - k * n * c + j * o * c;
    f[3] = l * o * q - k * p * q - l * n * s + j * p * s + k * n * t - j * o * t;
    f[4] = i * p * s - g * r * s - i * o * t + h * r * t + g * o * c - h * p * c;
    f[5] = g * r * q - i * p * q + i * n * t - e * r * t - g * n * c + e * p * c;
    f[6] = i * o * q - h * r * q - i * n * s + e * r * s + h * n * c - e * o * c;
    f[7] = h * p * q - g * o * q + g * n * s - e * p * s - h * n * t + e * o * t;
    f[8] = g * m * s - i * l * s + i * k * t - h * m * t - g * k * c + h * l * c;
    f[9] = i * l * q - g * m * q - i * j * t + e * m * t + g * j * c - e * l * c;
    f[10] = g * m * q - i * k * q + i * j * s - e * m * s - h * j * c + e * k * c;
    f[11] = g * k * q - h * l * q - g * j * s + e * l * s + h * j * t - e * k * t;
    f[12] = i * l * o - g * m * o - i * k * p + h * m * p + g * k * r - h * l * r;
    f[13] = g * m * n - i * l * n + i * j * p - e * m * p - g * j * r + e * l * r;
    f[14] = i * k * n - h * m * n - i * j * o + e * m * o + h * j * r - e * k * r;
    f[15] = h * l * n - g * k * n + g * j * o - e * l * o - h * j * p + e * k * p;
    a.multiplyScalar(1 / b.determinant());
    return a
};
GLOW.Matrix4.makeFrustum = function(b, a, c, f, e, h, g) {
    var i, g = g || new GLOW.Matrix4;
    i = g.value;
    i[0] = 2 * e / (a - b);
    i[4] = 0;
    i[8] = (a + b) / (a - b);
    i[12] = 0;
    i[1] = 0;
    i[5] = 2 * e / (f - c);
    i[9] = (f + c) / (f - c);
    i[13] = 0;
    i[2] = 0;
    i[6] = 0;
    i[10] = -(h + e) / (h - e);
    i[14] = -2 * h * e / (h - e);
    i[3] = 0;
    i[7] = 0;
    i[11] = -1;
    i[15] = 0;
    return g
};
GLOW.Matrix4.makeProjection = function(b, a, c, f, e) {
    var h, b = c * Math.tan(b * Math.PI / 360);
    h = -b;
    return GLOW.Matrix4.makeFrustum(h * a, b * a, h, b, c, f, e)
};
GLOW.Matrix4.makeOrtho = function(b, a, c, f, e, h, g) {
    var i, j, k, l, g = g || new GLOW.Matrix4;
    j = Math.abs(a - b);
    k = Math.abs(c - f);
    l = Math.abs(h - e);
    i = g.value;
    i[0] = 2 / j;
    i[4] = 0;
    i[8] = 0;
    i[12] = -((a + b) / j);
    i[1] = 0;
    i[5] = 2 / k;
    i[9] = 0;
    i[13] = -((c + f) / k);
    i[2] = 0;
    i[6] = 0;
    i[10] = -2 / l;
    i[14] = -((h + e) / l);
    i[3] = 0;
    i[7] = 0;
    i[11] = 0;
    i[15] = 1;
    return g
};
GLOW.Matrix4.tempVector3A = new GLOW.Vector3;
GLOW.Matrix4.tempVector3B = new GLOW.Vector3;
GLOW.Matrix4.tempVector3C = new GLOW.Vector3;
GLOW.Matrix4.tempVector3D = new GLOW.Vector3;
GLOW.Color = function() {
    function b(a, b, f) {
        this.value = new Float32Array(3);
        b === void 0 && f === void 0 ? this.setHex(a || 0) : this.setRGB(a, b, f)
    }
    b.prototype.setRGB = function(a, b, f) {
        this.value[0] = a !== void 0 ? a / 255 : 1;
        this.value[1] = b !== void 0 ? b / 255 : 1;
        this.value[2] = f !== void 0 ? f / 255 : 1;
        return this
    };
    b.prototype.setHex = function(a) {
        this.value[0] = ((a & 16711680) >> 16) / 255;
        this.value[1] = ((a & 65280) >> 8) / 255;
        this.value[2] = (a & 255) / 255;
        return this
    };
    b.prototype.multiplyScalar = function(a) {
        this.value[0] *= a;
        this.value[1] *= a;
        this.value[2] *=
            a;
        return this
    };
    b.prototype.mix = function(a, b) {
        var f = 1 - b;
        this.value[0] = this.value[0] * f + a.value[0] * b;
        this.value[1] = this.value[1] * f + a.value[1] * b;
        this.value[2] = this.value[2] * f + a.value[2] * b;
        return this
    };
    b.prototype.copy = function(a) {
        this.value[0] = a.value[0];
        this.value[1] = a.value[1];
        this.value[2] = a.value[2];
        return this
    };
    b.prototype.setHSV = function(a, b, f) {
        var e, h, g, i, j, k;
        if (f == 0) e = h = g = 0;
        else switch (i = Math.floor(a * 6), j = a * 6 - i, a = f * (1 - b), k = f * (1 - b * j), b = f * (1 - b * (1 - j)), i) {
            case 1:
                e = k;
                h = f;
                g = a;
                break;
            case 2:
                e = a;
                h = f;
                g =
                    b;
                break;
            case 3:
                e = a;
                h = k;
                g = f;
                break;
            case 4:
                e = b;
                h = a;
                g = f;
                break;
            case 5:
                e = f;
                h = a;
                g = k;
                break;
            case 6:
            case 0:
                e = f, h = b, g = a
        }
        this.value[0] = e;
        this.value[1] = h;
        this.value[2] = g;
        return this
    };
    return b
}();
GLOW.Geometry = {
    randomVector3Array: function(b, a) {
        var a = a !== void 0 ? a : 1,
            c, f = [],
            e = a * 2;
        for (c = 0; c < b; c++) f.push(GLOW.Vector3(Math.random() * e - a, Math.random() * e - a, Math.random() * e - a));
        return f
    },
    randomArray: function(b, a, c, f) {
        var e = [],
            h = 0,
            g, i;
        for (i = 0; i < b / f; i++) {
            h = a + Math.random() * c;
            for (g = 0; g < f; g++) e.push(h)
        }
        return e
    },
    triangles: function(b) {
        return this.elements(b)
    },
    elements: function(b) {
        var a = 0,
            c, f = new Uint16Array(b * 3);
        for (c = 0; c < b; c++) f[a] = a++, f[a] = a++, f[a] = a++;
        return f
    },
    faceNormals: function(b, a) {
        var c = Array(b.length),
            f, e = a.length,
            h, g, i, j = new GLOW.Vector3,
            k = new GLOW.Vector3,
            l = new GLOW.Vector3,
            m = new GLOW.Vector3;
        for (f = 0; f < e;) h = a[f++] * 3, g = a[f++] * 3, i = a[f++] * 3, j.set(b[h + 0], b[h + 1], b[h + 2]), k.set(b[g + 0], b[g + 1], b[g + 2]), l.set(b[i + 0], b[i + 1], b[i + 2]), k.subSelf(j), l.subSelf(j), m.cross(k, l).normalize(), c[h + 0] = m.value[0], c[h + 1] = m.value[1], c[h + 2] = m.value[2], c[g + 0] = m.value[0], c[g + 1] = m.value[1], c[g + 2] = m.value[2], c[i + 0] = m.value[0], c[i + 1] = m.value[1], c[i + 2] = m.value[2];
        return c
    },
    flatShade: function(b, a) {
        if (b.triangles === void 0 || b.data ===
            void 0) GLOW.error("GLOW.Geometry.flatShade: missing .data and/or .triangles in shader config object. Quitting.");
        else if (a === void 0) GLOW.error("GLOW.Geometry.flatShade: missing attribute data sizes. Quitting.");
        else {
            var c = b.triangles,
                f = c.length / 3,
                e = b.data,
                h = [],
                g, i, j, k, l, m, n;
            for (j in a)
                if (e[j]) {
                    g = e[j];
                    flatShadedAttribute = [];
                    i = a[j];
                    k = 0;
                    for (l = f * 3; k < l; k++) {
                        m = 0;
                        for (n = i; m < n; m++) flatShadedAttribute.push(g[c[k] * i + m])
                    }
                    k = g.length = 0;
                    for (l = flatShadedAttribute.length; k < l; k++) g[k] = flatShadedAttribute[k]
                }
            k = 0;
            l =
                f;
            for (m = 0; k < l; k++) h[m] = m++, h[m] = m++, h[m] = m++;
            b.triangles = h
        }
    }
};
GLOW.Geometry.Cube = {
    vertices: function(b) {
        var a = new Float32Array(72),
            c = 0,
            b = b !== void 0 ? b * 0.5 : 5;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = +b;
        a[c++] = -b;
        a[c++] = -b;
        a[c++] = +b;
        return a
    },
    indices: function() {
        var b = new Uint16Array(36),
            a = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 2;
        b[a++] = 0;
        b[a++] = 2;
        b[a++] = 3;
        b[a++] = 4;
        b[a++] = 5;
        b[a++] = 6;
        b[a++] = 4;
        b[a++] = 6;
        b[a++] = 7;
        b[a++] = 8;
        b[a++] = 9;
        b[a++] =
            10;
        b[a++] = 8;
        b[a++] = 10;
        b[a++] = 11;
        b[a++] = 12;
        b[a++] = 13;
        b[a++] = 14;
        b[a++] = 12;
        b[a++] = 14;
        b[a++] = 15;
        b[a++] = 16;
        b[a++] = 17;
        b[a++] = 18;
        b[a++] = 16;
        b[a++] = 18;
        b[a++] = 19;
        b[a++] = 20;
        b[a++] = 21;
        b[a++] = 22;
        b[a++] = 20;
        b[a++] = 22;
        b[a++] = 23;
        return b
    },
    primitives: function() {
        return GL.TRIANGLES
    },
    uvs: function() {
        var b = new Float32Array(48),
            a = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] =
            0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 0;
        b[a++] = 0;
        return b
    },
    normals: function() {
        return GLOW.Geometry.faceNormals(GLOW.Geometry.Cube.vertices(), GLOW.Geometry.Cube.indices())
    }
};
GLOW.Geometry.Cylinder = {
    vertices: function(b, a, c, f) {
        b |= 7;
        a |= 1;
        c |= 1;
        f |= 1;
        for (var e = [], h = Math.PI * 2, g = f * 0.5, f = 0; f < b; f++) e.push(Math.sin(h * f / b) * a), e.push(g), e.push(Math.cos(h * f / b) * a);
        for (f = 0; f < b; f++) e.push(Math.sin(h * f / b) * c), e.push(-g), e.push(Math.cos(h * f / b) * c);
        e.push(0);
        e.push(g);
        e.push(0);
        e.push(0);
        e.push(-g);
        e.push(0);
        return e
    },
    indices: function(b) {
        b |= 7;
        var a, c, f, e, h, g = [];
        for (h = 0; h < b; h++) a = h, c = h + b, f = b + (h + 1) % b, e = (h + 1) % b, g.push(a), g.push(c), g.push(f), g.push(a), g.push(f), g.push(e);
        for (h = b; h < b + b * 0.5; h++) a =
            2 * b, c = (2 * h - 2 * b + 0) % b, f = (2 * h - 2 * b + 1) % b, e = (2 * h - 2 * b + 2) % b, g.push(a), g.push(c), g.push(f), g.push(a), g.push(f), g.push(e);
        for (h = b + b * 0.5; h < 2 * b; h++) a = 2 * b + 1, c = (2 * h - 2 * b + 2) % b + b, f = (2 * h - 2 * b + 1) % b + b, e = (2 * h - 2 * b + 0) % b + b, g.push(a), g.push(c), g.push(f), g.push(a), g.push(f), g.push(e);
        return g
    },
    uvs: function() {},
    primitives: function() {
        return GL.TRIANGLES
    },
    normals: function(b) {
        return GLOW.Geometry.faceNormals(GLOW.Geometry.Cylinder.vertices(b), GLOW.Geometry.Cylinder.indices(b))
    }
};
GLOW.Geometry.Plane = {
    vertices: function(b, a) {
        var c = new Float32Array(12),
            f = 0,
            b = b !== void 0 ? b * 0.5 : 1;
        a ? (c[f++] = -b, c[f++] = 0, c[f++] = -b, c[f++] = -b, c[f++] = 0, c[f++] = +b, c[f++] = +b, c[f++] = 0, c[f++] = +b, c[f++] = +b, c[f++] = 0, c[f++] = -b) : (c[f++] = +b, c[f++] = -b, c[f++] = 0, c[f++] = +b, c[f++] = +b, c[f++] = 0, c[f++] = -b, c[f++] = +b, c[f++] = 0, c[f++] = -b, c[f++] = -b, c[f++] = 0);
        return c
    },
    indices: function() {
        var b = new Uint16Array(6),
            a = 0;
        b[a++] = 0;
        b[a++] = 1;
        b[a++] = 2;
        b[a++] = 0;
        b[a++] = 2;
        b[a++] = 3;
        return b
    },
    indicesFlipped: function() {
        var b = new Uint16Array(6),
            a = 0;
        b[a++] = 0;
        b[a++] = 2;
        b[a++] = 1;
        b[a++] = 0;
        b[a++] = 3;
        b[a++] = 2;
        return b
    },
    uvs: function(b) {
        var a = new Float32Array(8),
            c = 0;
        b ? (a[c++] = 0, a[c++] = 0, a[c++] = 0, a[c++] = 1, a[c++] = 1, a[c++] = 1, a[c++] = 1) : (a[c++] = 1, a[c++] = 0, a[c++] = 1, a[c++] = 1, a[c++] = 0, a[c++] = 1, a[c++] = 0);
        a[c++] = 0;
        return a
    },
    primitives: function() {
        return GL.TRIANGLES
    }
};
GLOW.Node = function(b) {
    this.localMatrix = new GLOW.Matrix4;
    this.globalMatrix = new GLOW.Matrix4;
    this.viewMatrix = new GLOW.Matrix4;
    this.updateRotationMatrix = !1;
    this.rotationMatrix = new GLOW.Matrix3;
    this.useXYZStyleTransform = !1;
    this.position = {
        x: 0,
        y: 0,
        z: 0
    };
    this.rotation = {
        x: 0,
        y: 0,
        z: 0
    };
    this.scale = {
        x: 1,
        y: 1,
        z: 1
    };
    this.children = [];
    this.parent = void 0;
    if (b) this.shader = b, this.draw = b.draw
};
GLOW.Node.prototype.update = function(b, a) {
    this.useXYZStyleTransform && (this.localMatrix.setPosition(this.position.x, this.position.y, this.position.z), this.localMatrix.setRotation(this.rotation.x, this.rotation.y, this.rotation.z), this.localMatrix.scale(this.scale.x, this.scale.y, this.scale.z));
    b ? this.globalMatrix.multiply(b, this.localMatrix) : this.globalMatrix.copy(this.localMatrix);
    this.updateRotationMatrix && this.rotationMatrix.extractFromMatrix4(this.globalMatrix);
    a && this.viewMatrix.multiply(a, this.globalMatrix);
    var c, f = this.children.length;
    for (c = 0; c < f; c++) this.children[c].update(this.globalMatrix, a);
    return this
};
GLOW.Node.prototype.addChild = function(b) {
    if (this.children.indexOf(b) === -1) this.children.push(b), b.parent && b.parent.removeChild(b), b.parent = this;
    return this
};
GLOW.Node.prototype.removeChild = function(b) {
    var a = this.children.indexOf(b);
    if (a !== -1) this.children.splice(1, a), b.parent = void 0;
    return this
};
GLOW.Camera = function(b) {
    GLOW.Node.call(this);
    b = b !== void 0 ? b : {};
    this.fov = b.fov !== void 0 ? b.fov : 40;
    this.aspect = b.aspect !== void 0 ? b.aspect : window.innerWidth / window.innerHeight;
    this.near = b.near !== void 0 ? b.near : 0.1;
    this.far = b.far !== void 0 ? b.far : 1E4;
    this.useTarget = b.useTarget !== void 0 ? b.useTarget : !0;
    this.projection = b.ortho !== void 0 ? GLOW.Matrix4.makeOrtho(b.ortho.left, b.ortho.right, b.ortho.top, b.ortho.bottom, this.near, this.far) : GLOW.Matrix4.makeProjection(this.fov, this.aspect, this.near, this.far);
    this.inverse =
        new GLOW.Matrix4;
    this.target = new GLOW.Vector3(0, 0, -100);
    this.up = new GLOW.Vector3(0, 1, 0);
    this.update()
};
GLOW.Camera.prototype = new GLOW.Node;
GLOW.Camera.prototype.constructor = GLOW.Camera;
GLOW.Camera.prototype.supr = GLOW.Node.prototype;
GLOW.Camera.prototype.update = function(b, a) {
    this.useXYZStyleTransform ? (this.localMatrix.setPosition(this.position.x, this.position.y, this.position.z), this.useTarget ? this.localMatrix.lookAt(this.target, this.up) : this.localMatrix.setRotation(this.rotation.x, this.rotation.y, this.rotation.z), this.localMatrix.scale(this.scale.x, this.scale.y, this.scale.z)) : this.useTarget && this.localMatrix.lookAt(this.target, this.up);
    b ? this.globalMatrix.multiply(b, this.localMatrix) : this.globalMatrix.copy(this.localMatrix);
    GLOW.Matrix4.makeInverse(this.globalMatrix, this.inverse);
    var c, f = this.children.length;
    for (c = 0; c < f; c++) this.children[c].update(this.globalMatrix, a)
};
GLOW.defaultCamera = new GLOW.Camera;
GLOW.Load = function() {
    function b(a) {
        this.parameters = a;
        this.onLoadComplete = void 0;
        this.onLoadContext = null;
        this.onLoadItem = void 0;
        this.numItemsLeftToLoad = this.numItemsToLoad = 0;
        for (var b in a) b !== "onLoadComplete" && b !== "onLoadItem" && b !== "dontParseJS" && b !== "onLoadContext" ? this.numItemsToLoad++ : (this[b] = a[b], delete a[b]);
        this.numItemsLeftToLoad = this.numItemsToLoad;
        for (b in a) {
            var e = a[b],
                h = a[b];
            h.indexOf(".png") !== -1 || h.indexOf(".gif") !== -1 || h.indexOf(".jpg") !== -1 || h.indexOf("jpeg") !== -1 ? (a[b] = new Image,
                a[b].scope = this, a[b].onload = this.onLoadImage, a[b].onerror = this.onLoadError, a[b].onabort = this.onLoadError, a[b].src = e) : h.indexOf(".glsl") !== -1 ? (a[b] = new XMLHttpRequest, a[b].scope = this, a[b].parametersProperty = b, a[b].open("GET", e), a[b].onreadystatechange = this.onLoadGLSL, a[b].onerror = this.onLoadError, a[b].onabort = this.onLoadError, a[b].send()) : h.indexOf(".js") !== -1 || h.indexOf(".json") !== -1 ? (a[b] = new XMLHttpRequest, a[b].scope = this, a[b].parametersProperty = b, a[b].open("GET", e), a[b].onreadystatechange = this.onLoadJSON,
                a[b].onerror = this.onLoadError, a[b].onabort = this.onLoadError, a[b].send()) : (a[b] = document.createElement("video"), a[b].scope = this, a[b].addEventListener("loadeddata", this.onLoadVideo, !1), a[b].src = e)
        }
    }
    var a = "";
    b.prototype.handleLoadedItem = function() {
        this.numItemsLeftToLoad--;
        this.onLoadItem !== void 0 && this.onLoadItem.call(this.onLoadContext, 1 - this.numItemsLeftToLoad / this.numItemsToLoad);
        this.numItemsLeftToLoad <= 0 && this.onLoadComplete.call(this.onLoadContext, this.parameters)
    };
    b.prototype.onLoadJSON = function() {
        this.readyState ===
            4 && (this.scope.parameters[this.parametersProperty] = JSON.parse(this.responseText), this.scope.handleLoadedItem())
    };
    b.prototype.onLoadImage = function() {
        this.scope.handleLoadedItem()
    };
    b.prototype.onLoadVideo = function() {
        this.removeEventListener("loadeddata", this.scope.onLoadVideo, !1);
        this.scope.handleLoadedItem()
    };
    b.prototype.onLoadGLSL = function() {
        if (this.readyState === 4) {
            for (var b = "", f = "", f = this.responseText.split("\n"), e = "", h = 0; h < f.length; h++)
                if (f[h].indexOf("//#") > -1) f[h].indexOf("Fragment") > -1 && (b = e,
                    e = "");
                else {
                    var g = f[h];
                    g.indexOf("//") > -1 && (g = g.substring(0, g.indexOf("//")));
                    g.indexOf(";") === -1 && (g += "\n");
                    e += g
                }
            f = e;
            a === "" && (typeof GL === "object" && typeof GL.getShaderPrecisionFormat === "function" ? (e = GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT), a = e.rangeMax >= 62 && e.rangeMin >= 62 && e.precision >= 16 ? "precision highp float;" : "precision mediump float;") : a = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n#if GL_FRAGMENT_PRECISION_HIGH == 1\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n#else\nprecision mediump float;\n#endif");
            this.scope.parameters[this.parametersProperty] = {
                fragmentShader: a + "\n" + f,
                vertexShader: b
            };
            this.scope.handleLoadedItem()
        }
    };
    b.prototype.onLoadError = function(a) {
        GLOW.error("GLOW.Load.onLoadError: Error " + a.target.status)
    };
    b.prototype.parseThreeJS = function(a) {
        var b = {},
            e = a.scale !== void 0 ? 1 / a.scale : 1;
        (function(e) {
            if (a.version === void 0 || a.version != 2) GLOW.error("Deprecated file format.");
            else {
                var g, i, j, k, l, m, n, o, p, r, q, s, t, w, u = a.faces;
                m = a.vertices;
                var v = a.normals,
                    y = a.colors,
                    x = 0;
                for (g = 0; g < a.uvs.length; g++) a.uvs[g].length &&
                    x++;
                for (g = 0; g < x; g++) b.faceUvs[g] = [], b.faceVertexUvs[g] = [];
                k = 0;
                for (l = m.length; k < l;) n = new THREE.Vertex, n.position.x = m[k++] * e, n.position.y = m[k++] * e, n.position.z = m[k++] * e, b.vertices.push(n);
                k = 0;
                for (l = u.length; k < l;) {
                    e = u[k++];
                    m = e & 1;
                    j = e & 2;
                    g = e & 4;
                    i = e & 8;
                    o = e & 16;
                    n = e & 32;
                    r = e & 64;
                    e &= 128;
                    m ? (q = new THREE.Face4, q.a = u[k++], q.b = u[k++], q.c = u[k++], q.d = u[k++], m = 4) : (q = new THREE.Face3, q.a = u[k++], q.b = u[k++], q.c = u[k++], m = 3);
                    if (j) j = u[k++], q.materials = b.materials[j];
                    j = b.faces.length;
                    if (g)
                        for (g = 0; g < x; g++) s = a.uvs[g], p = u[k++], w = s[p *
                            2], p = s[p * 2 + 1], b.faceUvs[g][j] = new THREE.UV(w, p);
                    if (i)
                        for (g = 0; g < x; g++) {
                            s = a.uvs[g];
                            t = [];
                            for (i = 0; i < m; i++) p = u[k++], w = s[p * 2], p = s[p * 2 + 1], t[i] = new THREE.UV(w, p);
                            b.faceVertexUvs[g][j] = t
                        }
                    if (o) o = u[k++] * 3, i = new THREE.Vector3, i.x = v[o++], i.y = v[o++], i.z = v[o], q.normal = i;
                    if (n)
                        for (g = 0; g < m; g++) o = u[k++] * 3, i = new THREE.Vector3, i.x = v[o++], i.y = v[o++], i.z = v[o], q.vertexNormals.push(i);
                    if (r) n = u[k++], n = new THREE.Color(y[n]), q.color = n;
                    if (e)
                        for (g = 0; g < m; g++) n = u[k++], n = new THREE.Color(y[n]), q.vertexColors.push(n);
                    b.faces.push(q)
                }
            }
        })(e);
        (function() {
            var e, g, i, j;
            if (a.skinWeights) {
                e = 0;
                for (g = a.skinWeights.length; e < g; e += 2) i = a.skinWeights[e], j = a.skinWeights[e + 1], b.skinWeights.push(new THREE.Vector4(i, j, 0, 0))
            }
            if (a.skinIndices) {
                e = 0;
                for (g = a.skinIndices.length; e < g; e += 2) i = a.skinIndices[e], j = a.skinIndices[e + 1], b.skinIndices.push(new THREE.Vector4(i, j, 0, 0))
            }
            b.bones = a.bones;
            b.animation = a.animation
        })();
        (function(e) {
            if (a.morphTargets !== void 0) {
                var g, i, j, k, l, m, n, o, p;
                g = 0;
                for (i = a.morphTargets.length; g < i; g++) {
                    b.morphTargets[g] = {};
                    b.morphTargets[g].name =
                        a.morphTargets[g].name;
                    b.morphTargets[g].vertices = [];
                    o = b.morphTargets[g].vertices;
                    p = a.morphTargets[g].vertices;
                    j = 0;
                    for (k = p.length; j < k; j += 3) l = p[j] * e, m = p[j + 1] * e, n = p[j + 2] * e, o.push(new THREE.Vertex(new THREE.Vector3(l, m, n)))
                }
            }
            if (a.morphColors !== void 0) {
                g = 0;
                for (i = a.morphColors.length; g < i; g++) {
                    b.morphColors[g] = {};
                    b.morphColors[g].name = a.morphColors[g].name;
                    b.morphColors[g].colors = [];
                    k = b.morphColors[g].colors;
                    l = a.morphColors[g].colors;
                    e = 0;
                    for (j = l.length; e < j; e += 3) m = new THREE.Color(16755200), m.setRGB(l[e],
                        l[e + 1], l[e + 2]), k.push(m)
                }
            }
        })(e);
        (function() {
            if (a.edges !== void 0) {
                var e, g, i;
                for (e = 0; e < a.edges.length; e += 2) g = a.edges[e], i = a.edges[e + 1], b.edges.push(new THREE.Edge(b.vertices[g], b.vertices[i], g, i))
            }
        })()
    };
    return b
}();
GLOW.ShaderUtils = {
    createMultiple: function(b, a) {
        if (b.triangles === void 0 || b.data === void 0) GLOW.error("GLOW.ShaderUtils.createMultiple: missing .data and/or .triangles in shader config object. Quitting.");
        else {
            var c, f = b.triangles,
                e = b.data,
                h, g = [],
                i, j, k, l, m, n, o = 0,
                p = f.length;
            do {
                g.push(h = {
                    elements: []
                });
                c = h.elements;
                for (k in a)
                    if (e[k]) h[k] = [];
                    else {
                        GLOW.error("GLOW.ShaderUtils.createMultiple: attribute " + d + " doesn't exist in originalShaderConfig.data. Quitting.");
                        return
                    }
                for (j = 0; o < p; o += 3) {
                    if (j > 65533) {
                        o -= 3;
                        break
                    }
                    c[j] = j++;
                    c[j] = j++;
                    c[j] = j++;
                    for (k in a) {
                        i = e[k];
                        size = a[k];
                        for (n = 0; n < 3; n++) {
                            l = 0;
                            for (m = size; l < m; l++) h[k].push(i[f[o + n] * size + l])
                        }
                    }
                }
            } while (o < p);
            for (k in a) b.data[k] = g[0][k];
            b.triangles = g[0].elements;
            c = new GLOW.Shader(b);
            f = [c];
            for (o = 1; o < g.length; o++) {
                for (k in a) b.data[k] = g[o][k];
                e = GLOW.Compiler.createAttributes(GLOW.Compiler.extractAttributes(c.compiledData.program), b.data, b.usage, b.interleave);
                e = GLOW.Compiler.interleaveAttributes(e, b.interleave);
                for (l in e) g[o][l] = e[l];
                f[o] = c.clone(g[o])
            }
            return f
        }
    }
};