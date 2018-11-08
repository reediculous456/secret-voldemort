const getTouchSupport = () => {
	let maxTouchPoints = 0;
	let touchEvent = false;
	if (typeof navigator.maxTouchPoints !== 'undefined') {
		maxTouchPoints = navigator.maxTouchPoints;
	} else if (typeof navigator.msMaxTouchPoints !== 'undefined') {
		maxTouchPoints = navigator.msMaxTouchPoints;
	}
	try {
		document.createEvent('TouchEvent');
		touchEvent = true;
	} catch (_) {}
	let touchStart = 'ontouchstart' in window;
	return [maxTouchPoints, touchEvent, touchStart];
};
const getWebglVendorAndRenderer = () => {
	/* This a subset of the WebGL fingerprint with a lot of entropy, while being reasonably browser-independent */
	try {
		let canvas = document.createElement('canvas');
		let gl = null;
		try {
			gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		} catch (e) {}
		if (!gl) return null;
		let extensionDebugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
		return gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL) + '~' + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL);
	} catch (e) {
		return null;
	}
};

module.exports.simpleFingerprint = () => {
	let keys = [];
	keys.push({ key: 'user_agent', value: navigator.userAgent });
	keys.push({ key: 'language', value: navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || '' });
	keys.push({ key: 'device_memory', value: navigator.deviceMemory || -1 });
	keys.push({ key: 'pixel_ratio', value: window.devicePixelRatio || '' });
	keys.push({ key: 'hardware_concurrency', value: navigator.hardwareConcurrency || 'unknown' });

	let res = [];
	if (window.screen.availWidth && window.screen.availHeight) {
		res =
			window.screen.availHeight > window.screen.availWidth
				? [window.screen.availHeight, window.screen.availWidth]
				: [window.screen.availWidth, window.screen.availHeight];
	} else {
		res = window.screen.height > window.screen.width ? [window.screen.height, window.screen.width] : [window.screen.width, window.screen.height];
	}
	keys.push({ key: 'resolution', value: res[0] + 'x' + res[1] + '@' + (window.screen.colorDepth || -1) });

	keys.push({ key: 'timezone_offset', value: new Date().getTimezoneOffset() });
	keys.push({ key: 'navigator_platform', value: navigator.platform || 'unknown' });
	keys.push({ key: 'webgl_vendor', value: getWebglVendorAndRenderer() });
	keys.push({ key: 'touch_support', value: getTouchSupport() });
	return keys;
};

const getWebglFp = function() {
	let gl;
	let fa2s = function(fa) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		return '[' + fa[0] + ', ' + fa[1] + ']';
	};
	let maxAnisotropy = function(gl) {
		let ext =
			gl.getExtension('EXT_texture_filter_anisotropic') ||
			gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
			gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
		if (ext) {
			let anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			if (anisotropy === 0) {
				anisotropy = 2;
			}
			return anisotropy;
		} else {
			return null;
		}
	};

	let canvas = document.createElement('canvas');
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	if (!gl) {
		return null;
	}
	// WebGL fingerprinting is a combination of techniques, found in MaxMind antifraud script & Augur fingerprinting.
	// First it draws a gradient object with shaders and convers the image to the Base64 string.
	// Then it enumerates all WebGL extensions & capabilities and appends them to the Base64 string, resulting in a huge WebGL string, potentially very unique on each device
	// Since iOS supports webgl starting from version 8.1 and 8.1 runs on several graphics chips, the results may be different across ios devices, but we need to verify it.
	let result = [];
	let vShaderTemplate =
		'attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}';
	let fShaderTemplate = 'precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}';
	let vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
	let vertices = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0]);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	vertexPosBuffer.itemSize = 3;
	vertexPosBuffer.numItems = 3;
	let program = gl.createProgram();
	let vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshader, vShaderTemplate);
	gl.compileShader(vshader);
	let fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fshader, fShaderTemplate);
	gl.compileShader(fshader);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	gl.useProgram(program);
	program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex');
	program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset');
	gl.enableVertexAttribArray(program.vertexPosArray);
	gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
	gl.uniform2f(program.offsetUniform, 1, 1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
	result.push(gl.canvas.toDataURL());
	result.push('extensions:' + (gl.getSupportedExtensions() || []).join(';'));
	result.push('webgl aliased line width range:' + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
	result.push('webgl aliased point size range:' + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
	result.push('webgl alpha bits:' + gl.getParameter(gl.ALPHA_BITS));
	result.push('webgl antialiasing:' + (gl.getContextAttributes().antialias ? 'yes' : 'no'));
	result.push('webgl blue bits:' + gl.getParameter(gl.BLUE_BITS));
	result.push('webgl depth bits:' + gl.getParameter(gl.DEPTH_BITS));
	result.push('webgl green bits:' + gl.getParameter(gl.GREEN_BITS));
	result.push('webgl max anisotropy:' + maxAnisotropy(gl));
	result.push('webgl max combined texture image units:' + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	result.push('webgl max cube map texture size:' + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
	result.push('webgl max fragment uniform vectors:' + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
	result.push('webgl max render buffer size:' + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
	result.push('webgl max texture image units:' + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
	result.push('webgl max texture size:' + gl.getParameter(gl.MAX_TEXTURE_SIZE));
	result.push('webgl max varying vectors:' + gl.getParameter(gl.MAX_VARYING_VECTORS));
	result.push('webgl max vertex attribs:' + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
	result.push('webgl max vertex texture image units:' + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
	result.push('webgl max vertex uniform vectors:' + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
	result.push('webgl max viewport dims:' + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
	result.push('webgl red bits:' + gl.getParameter(gl.RED_BITS));
	result.push('webgl renderer:' + gl.getParameter(gl.RENDERER));
	result.push('webgl shading language version:' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
	result.push('webgl stencil bits:' + gl.getParameter(gl.STENCIL_BITS));
	result.push('webgl vendor:' + gl.getParameter(gl.VENDOR));
	result.push('webgl version:' + gl.getParameter(gl.VERSION));

	try {
		// Add the unmasked vendor and unmasked renderer if the debug_renderer_info extension is available
		let extensionDebugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
		if (extensionDebugRendererInfo) {
			result.push('webgl unmasked vendor:' + gl.getParameter(extensionDebugRendererInfo.UNMASKED_VENDOR_WEBGL));
			result.push('webgl unmasked renderer:' + gl.getParameter(extensionDebugRendererInfo.UNMASKED_RENDERER_WEBGL));
		}
	} catch (e) {
		/* squelch */
	}

	if (!gl.getShaderPrecisionFormat) {
		return result;
	}

	const each = (obj, iterator) => {
		if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
			obj.forEach(iterator);
		} else if (obj.length === +obj.length) {
			for (let i = 0, l = obj.length; i < l; i++) {
				iterator(obj[i], i, obj);
			}
		} else {
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					iterator(obj[key], key, obj);
				}
			}
		}
	};
	each(['FLOAT', 'INT'], function(numType) {
		each(['VERTEX', 'FRAGMENT'], function(shader) {
			each(['HIGH', 'MEDIUM', 'LOW'], function(numSize) {
				each(['precision', 'rangeMin', 'rangeMax'], function(key) {
					let format = gl.getShaderPrecisionFormat(gl[shader + '_SHADER'], gl[numSize + '_' + numType])[key];
					if (key !== 'precision') {
						key = 'precision ' + key;
					}
					let line = ['webgl ', shader.toLowerCase(), ' shader ', numSize.toLowerCase(), ' ', numType.toLowerCase(), ' ', key, ':', format].join('');
					result.push(line);
				});
			});
		});
	});
	return result;
};

module.exports.dataFingerprint = () => {
	const hashCode = str => {
		const charList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
		let hashValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (let i = 0; i < str.length; i++) {
			hashValues[i % 16] ^= str.charCodeAt(i);
		}
		return hashValues.map(v => charList[(v >> 4) & 0xf] + charList[v & 0xf]).join('');
	};
	return hashCode(getWebglFp().toString());
};
