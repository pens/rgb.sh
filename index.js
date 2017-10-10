/*
    Copyright (c) 2017 Seth Pendergrass. See LICENSE.
*/

"use strict";

window.onload = function() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    const fbWidth = 360;
    const fbHeight = 240;
    var crtEnable = true;
    var forceCrt = false;
    gl.viewport(0, 0, fbWidth, fbHeight);

    var proj = mat4.create();
    mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), canvas.clientWidth / canvas.clientHeight, .01, 100);

    function setDims() {
        if (canvas.clientWidth >= 700 && canvas.clientHeight >= 500) {
            crtEnable = true;
            canvas.width = fbWidth * 3;
            canvas.height = fbHeight * 3;
        }
        else {
            crtEnable = false;
            canvas.width = fbWidth;
            canvas.height = fbHeight;
        }
    }

    setDims();

    window.addEventListener('resize', function() {
        mat4.perspective(proj, 1 / Math.tan(Math.PI / 4), canvas.clientWidth / canvas.clientHeight, .01, 100);
        if (!forceCrt) setDims();
    });

    document.getElementById('crt').onclick = function() {
        forceCrt = true;
        crtEnable = !crtEnable;
        if (!crtEnable) {
            canvas.width = fbWidth;
            canvas.height = fbHeight;
        }
        else {
            canvas.width = fbWidth * 3;
            canvas.height = fbHeight * 3;
        }
    };

    const terVS = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTex;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform ivec2 uDims;
        varying lowp vec2 vTex;
        void main() {
            vec4 pos = aVertexPosition;
            pos.y = pos.y / sqrt(float(uDims.x * uDims.x * 2)) - 1.; 
            gl_Position = uProjectionMatrix * uModelViewMatrix * pos; 
            vTex = aTex;
        }
    `;

    const terFS = `
        precision lowp float;
        varying lowp vec2 vTex;
        void main() {
            float thr = .01;
            float dist = min(min(vTex.x, 1.0 - vTex.x), min(vTex.y, 1.0 - vTex.y)); 
            float inten = max((thr - dist) / thr, 0.0);
            float alpha = 0.1;

            if (vTex.x < thr || vTex.x > 1.0 - thr || vTex.y < thr || vTex.y > 1.0 - thr ||
                (vTex.y + vTex.x > 1.0 - thr && vTex.y + vTex.x < 1.0 + thr))
                alpha = 1.0;

            gl_FragColor = vec4(1, .078, .576, alpha);
        }
    `;

    const sunVS = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    const sunFS = `
        precision lowp float;
        uniform ivec4 uDims;
        void main() {
            const vec3 light = vec3(1, .549, 0);
            const vec3 dark = vec3(1, 0, 0);

            float x = (gl_FragCoord.x / float(uDims.x) - .5) * float(uDims.z) / float(uDims.w);
            float y = gl_FragCoord.y / float(uDims.y) - .5;

            float inten = 2. * y + .5;
            float y2 = clamp(inten, 0., 1.);
        
            if (x * x + y * y <= .125 && sin(y2 * y2 * 64.) >= 0.)
                gl_FragColor = vec4(inten * light + (1. - inten) * dark, inten);
        }
    `;

    const crtVS = `
        attribute vec4 aVertexPosition;
        attribute vec2 aPos;
        varying lowp vec2 vPos;
        void main() {
            gl_Position = aVertexPosition;
            vPos = aPos;
        }
    `;

    const crtFS = `
        precision lowp float;
        uniform sampler2D uSampler;
        varying lowp vec2 vPos;
        void main() {
            vec4 color = vec4(1, 1, 1, 1);
            vec4 t = texture2D(uSampler, vPos);
            int x = int(gl_FragCoord.x);
            int mx = x - x / 3 * 3;
            int y = int(gl_FragCoord.y);
            int my = y - y / 3 * 3;

            if (mx == 0)
                color = vec4(1, 0, 0, 1);
            else if (mx == 1)
                color = vec4(0, 1, 0, 1);
            else
                color = vec4(0, 0, 1, 1);

            float a = my == 0 ? 1. : 3.;

            gl_FragColor = t * color * a;
        }
    `;

    function MakeShaderProgram(vssrc, fssrc) {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vssrc);
        gl.compileShader(vs);

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fssrc);
        gl.compileShader(fs);

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        
        return prog; 

    };

    const terrainProg = MakeShaderProgram(terVS, terFS);
    const sunProg = MakeShaderProgram(sunVS, sunFS);
    const crtProg = MakeShaderProgram(crtVS, crtFS);

    var uProjectionMatrix = gl.getUniformLocation(terrainProg, 'uProjectionMatrix');
    var uModelViewMatrix = gl.getUniformLocation(terrainProg, 'uModelViewMatrix');
    var vertexPosition = gl.getAttribLocation(terrainProg, 'aVertexPosition');
    var aTex = gl.getAttribLocation(terrainProg, 'aTex');
    var uDims = gl.getUniformLocation(terrainProg, 'uDims');

    var vertexPositionSun = gl.getAttribLocation(sunProg, 'aVertexPosition');
    var uDimsSun = gl.getUniformLocation(sunProg, 'uDims');

    var crtVertPos = gl.getAttribLocation(crtProg, 'aVertexPosition');
    var aPos = gl.getAttribLocation(crtProg, 'aPos');
    var uSampler = gl.getUniformLocation(crtProg, 'uSampler');

    var terPos = [ 0, -1, 0, 1, -1, 0, 0, -1, 1, 1, -1, 1 ];
    const terBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
    gl.enableVertexAttribArray(vertexPosition);

    const terIdxs = [ 0, 1, 2, 1, 3, 2 ];
    const terIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terIdxs), gl.STATIC_DRAW);

    const terTex = [ 0, 0, 1, 0, 0, 1, 1, 1 ];
    const terTexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terTexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terTex), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aTex);

    const screenTri = [ -1, -1, 0, 3, -1, 0, -1, 3, 0 ];
    const screenTriBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenTriBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenTri), gl.STATIC_DRAW);
    gl.vertexAttribPointer(crtVertPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(crtVertPos);

    const screenIdxs = [ 0, 1, 2 ];
    const screenIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(screenIdxs), gl.STATIC_DRAW);

    const screenTex = [ 0, 0, 2, 0, 0, 2 ];
    const screenTexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenTex), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    const target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fbWidth, fbHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.clearColor(0, 0, 0.502, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const width = 10;
    const dim = 2 * width;
    var heights = Array(dim * dim).fill(-1);
    for (var i = 0; i < heights.length; ++i)
        heights[i] = Math.random() * Math.PI * 2;

    var matA = mat4.create();
    var matB = mat4.create();
    var rot = 0;
    var time = 0;
    function frame(timestamp) {
        gl.useProgram(sunProg);

        if (crtEnable) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
        }
            gl.viewport(0, 0, fbWidth, fbHeight);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, screenTriBuf);
        gl.vertexAttribPointer(vertexPositionSun, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4i(uDimsSun, fbWidth, fbHeight, canvas.clientWidth, canvas.clientHeight);
        gl.drawElements(gl.TRIANGLE_FAN, screenIdxs.length, gl.UNSIGNED_SHORT, 0);

        gl.useProgram(terrainProg);

        gl.uniformMatrix4fv(uProjectionMatrix, false, proj);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terIdxBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, terTexBuf);
        gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2i(uDims, width, width);

        function calcPos(i, j) {
            i -= width;
            j -= width;
            var dist = Math.sqrt(i * i + j * j);
            return dist * Math.sin(heights[(i + width) * dim + j + width] + time);
        }

        time += .01;
        for (var k = 0; k < 4 * width * width; ++k) {
            var i = k % (2 * width); 
            var j = Math.floor(k / (2 * width));

            terPos[1] = calcPos(i, j);
            terPos[4] = calcPos(i + 1, j);
            terPos[7] = calcPos(i, j + 1);
            terPos[10] = calcPos(i + 1, j + 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, terBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terPos), gl.STATIC_DRAW);

            mat4.fromYRotation(matA, time * .2);
            mat4.translate(matB, matA, vec3.fromValues(i - width, 0, j - width));
            gl.uniformMatrix4fv(uModelViewMatrix, false, matB);

            gl.drawElements(gl.TRIANGLES, terIdxs.length, gl.UNSIGNED_SHORT, 0);
        } 

        if (crtEnable) {
            gl.useProgram(crtProg);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIdxBuf);
            gl.bindBuffer(gl.ARRAY_BUFFER, screenTriBuf);
            gl.vertexAttribPointer(crtVertPos, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, screenTexBuf);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.uniform1i(uSampler, 0);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.drawElements(gl.TRIANGLES, screenIdxs.length, gl.UNSIGNED_SHORT, 0);
        }

        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
};
