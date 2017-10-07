"use strict";
window.onload = function() {
    /*
        TODO:
        - low res disable subpixels
        - refactor code
        - switch lines to tristrip
        - do all transforms in vertex shader
        - github
    */
    const canvas = document.getElementById('canvas');
    canvas.width = 640 * 3;
    canvas.height = 480 * 3;

    const gl = canvas.getContext('webgl');

    const meshVSSrc = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTex;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec2 tex;
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            tex = aTex;
        }
    `;

    const meshFSSrc = `
        precision lowp float;
        varying lowp vec2 tex;
        uniform vec3 uColor;
        void main() {
            float thr = .01;
            float dist = min(min(tex.x, 1.0 - tex.x), min(tex.y, 1.0 - tex.y)); 
            float inten = max((thr - dist) / thr, 0.0);

            float alpha = 0.1;

            if (tex.x < thr || tex.x > 1.0 - thr || tex.y < thr || tex.y > 1.0 - thr ||
                (tex.y + tex.x > 1.0 - thr && tex.y + tex.x < 1.0 + thr))
                alpha = 1.0;

            gl_FragColor = vec4(uColor, alpha);

            if (uColor.b == 0.0) {
                inten = min(max(gl_FragCoord.y - 180.0, 0.0) * 2.0, 480.0) / 480.0;
                gl_FragColor = vec4(uColor * inten, inten);
            }
        }
    `;

    const crtVSSrc = `
        attribute vec4 aVertexPosition;
        attribute vec2 aPos;
        varying lowp vec2 pos;
        void main() {
            gl_Position = aVertexPosition;
            pos = aPos;
        }
    `;

    const crtFSSrc = `
        precision lowp float;
        uniform sampler2D uSampler;
        uniform ivec4 dims;
        varying lowp vec2 pos;
        void main() {
            vec4 color = vec4(1, 1, 1, 1);

            int wi = dims.x;
            int hi = dims.y;
            int wo = dims.z;
            int ho = dims.w;

            vec4 t = texture2D(uSampler, pos);
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

            if (wo <= 1000) {
                color = vec4(1, 1, 1, 1);
                a = 1.;
            }

            gl_FragColor = t * color * a;
        }
    `;

    /*
    Data
    */

    const indices = [
        0, 1, 2,
        1, 3, 2
    ];
    const tex = [
        0, 0,
        1, 0,
        0, 1,
        1, 1        
    ];
    const screenTri = [
        -1, -1, 0,
        3, -1, 0,
        -1, 3, 0
    ];
    const indices2 = [
        0, 1, 2
    ];
    const tex2 = [
        0, 0,
        2, 0,
        0, 2,
    ];
    const tex3 = [
        0, 0,
        1, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 0,
        0, 1
    ];
    const indices3 = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 1
    ];
    const pos3 = [
        0, 0, -30,
        -10, 0, -30,
        -7.07, -7.07, -30,
        0, -10, -30,
        7.07, -7.07, -30,
        10, 0, -30,
        7.07, 7.07, -30,
        0, 10, -30,
        -7.07, 7.07, -30,
    ];

    const meshVS = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(meshVS, meshVSSrc);
    gl.compileShader(meshVS);

    const meshFS = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(meshFS, meshFSSrc);
    gl.compileShader(meshFS);

    const meshProg = gl.createProgram();
    gl.attachShader(meshProg, meshVS);
    gl.attachShader(meshProg, meshFS);
    gl.linkProgram(meshProg);

    var uProjectionMatrix = gl.getUniformLocation(meshProg, 'uProjectionMatrix');
    var uModelViewMatrix = gl.getUniformLocation(meshProg, 'uModelViewMatrix');
    var vertexPosition = gl.getAttribLocation(meshProg, 'aVertexPosition');
    var aTex = gl.getAttribLocation(meshProg, 'aTex');
    var uColor = gl.getUniformLocation(meshProg, 'uColor');

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aTex);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(vertexPosition);

    const crtVS = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(crtVS, crtVSSrc);
    gl.compileShader(crtVS);

    const crtFS = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(crtFS, crtFSSrc);
    gl.compileShader(crtFS);

    console.log(gl.getShaderInfoLog(crtFS));

    const crtProg = gl.createProgram();
    gl.attachShader(crtProg, crtVS);
    gl.attachShader(crtProg, crtFS);
    gl.linkProgram(crtProg);

    var crtVertPos = gl.getAttribLocation(crtProg, 'aVertexPosition');
    var aPos = gl.getAttribLocation(crtProg, 'aPos');
    var uSampler = gl.getUniformLocation(crtProg, 'uSampler');
    var dims = gl.getUniformLocation(crtProg, 'dims');

    const indexBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices2), gl.STATIC_DRAW);

    const screenTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screenTriBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenTri), gl.STATIC_DRAW);
    gl.vertexAttribPointer(crtVertPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(crtVertPos);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex2), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    const indexBuffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices3), gl.STATIC_DRAW);

    const posBuffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos3), gl.STATIC_DRAW);

    const texBuf3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex3), gl.STATIC_DRAW);

    gl.clearColor(0, 0, 0.502, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var positions = [
        0, -1, 0,
        1, -1, 0,
        0, -1, 1,
        1, -1, 1
    ];
    const fbWidth = canvas.width / 3;
    const fbHeight = canvas.width / 3;

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
        gl.useProgram(meshProg);

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
        gl.viewport(0, 0, fbWidth, fbHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(matA, 1 / Math.tan(Math.PI / 4), canvas.clientWidth / canvas.clientHeight, .01, 100);
        gl.uniformMatrix4fv(uProjectionMatrix, false, matA);
        gl.uniformMatrix4fv(uModelViewMatrix, false, mat4.identity(matB));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer3);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuf3);
        gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);
        gl.uniform3f(uColor, 1, 0.549, 0);
        mat4.fromZRotation(matA, rot);
        gl.uniformMatrix4fv(uModelViewMatrix, false, matA);
        gl.drawElements(gl.TRIANGLE_FAN, indices3.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

        rot += .002;
        time += .01;
        if (rot > Math.PI * 2)
            rot = 0;

        for (var i = -width; i < width; ++i) {
            for (var j = -width; j < width; ++j) {
                function calcPos(i, j) {
                    var dist = Math.sqrt(i * i + j * j) / Math.sqrt(width * width * 2);
                    return dist * Math.sin(heights[(i + width) * dim + j + width] + time) - 1;
                }
                positions[1] = calcPos(i, j);
                positions[4] = calcPos(i + 1, j);
                positions[7] = calcPos(i, j + 1);
                positions[10] = calcPos(i + 1, j + 1);

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

                mat4.fromYRotation(matA, rot);
                mat4.translate(matB, matA, vec3.fromValues(i, 0, j));
                gl.uniformMatrix4fv(uModelViewMatrix, false, matB);
                gl.uniform3f(uColor, 1, 0.078, .576);

                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            }
        } 

        gl.useProgram(crtProg);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
        gl.bindBuffer(gl.ARRAY_BUFFER, screenTriBuffer);
        gl.vertexAttribPointer(crtVertPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.uniform1i(uSampler, 0);
        gl.uniform4i(dims, fbWidth, fbHeight, canvas.clientWidth, canvas.clientHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.drawElements(gl.TRIANGLES, indices2.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
};
