<!DOCTYPE html>
<html>

<head>

    <title>Test CROMA Canvas</title>

    <style>
        .video-container {
            position: relative;
            display: inline-block;
        }
        
        #localVideo {

            border: 3px solid blue;
            top: 0;
            left: 0;
            display: none;
        }
        
        #cromaVideo {
            border: 3px solid blue;
            display: inline-block;
            float: left;
            margin: 5px;
        }
        
        #canvas-croma {
            border: 3px solid red;
            display: inline-block;
            float: left;
            margin: 5px;
        }
        
        .controls-container {
            /* position: absolute;*/
            border: 3px solid green;
            display: inline-block;
            float: left;
            padding: 10px;
            margin: 5px;
        }

        button {
            height: 50px;
            width: 100px;
        }
        span { 
            display: inline-block;
            width: 150px;
        }
    </style>
</head>

<body >

    <div class='video-container'>

        <video id="localVideo" autoplay muted playsinline></video>

      

        <video id="cromaVideo" autoplay playsinline controls="false" loop>
			<source src="test.mp4" type="video/mp4">
		</video>


        <canvas id="canvas-croma" width=404 height=720></canvas>

        <div class='controls-container'>
            <button id='play' onClick='playVideo()'>Play</button>
            <button id='pause' onClick='pauseVideo()'>Pause</button>
            <br/><br/>
            <span>Tolerancia </span>
            <input type="range" min="0" max=".1" step=".005" onchange="cambioTolerancia(this.value)">
            <br/><br/>
            <span>Claro RED</span>
            <input type="range" min="0" max="255" value="100"  onchange="cambioL_R(this.value)">
            <br/>
            <span>Claro GREEN</span>
            <input type="range" min="0" max="255" value="200" onchange="cambioL_G(this.value)">
            <br/>
            <span>Claro BLUE</span>
            <input type="range" min="0" max="255" value="100"  onchange="cambioL_B(this.value)">
            <br/><br/>
            <span>Oscuro RED</span>
            <input type="range" min="0" max="255" value="50" onchange="cambioD_R(this.value)">
            <br/>
            <span>Oscuro GREEN</span>
            <input type="range" min="0" max="255" value="150" onchange="cambioD_G(this.value)">
            <br/>
            <span>Oscuro BLUE</span>
            <input type="range" min="0" max="255" value="50" onchange="cambioD_B(this.value)">

            <br/><br/>
            <span>Background CANVAS</span>
            <br/>
            <span>RED</span>
            <input type="range" min="0" max="255" value="255" onchange="cambioG_R(this.value)">
            <br/>
            <span>GREEN</span>
            <input type="range" min="0" max="255" value="255" onchange="cambioG_G(this.value)">
            <br/>
            <span>BLUE</span>
            <input type="range" min="0" max="255" value="255" onchange="cambioG_B(this.value)">

        </div>
    </div>

    <script>

        // video local ------------------------------------------
       /* var localVideo = document.getElementById('localVideo');
        localVideo.setAttribute('autoplay', '');
        localVideo.setAttribute('muted', '');
        localVideo.setAttribute('playsinline', '');

        if (navigator.mediaDevices.getUserMedia) {
            var successCallback = function(stream) {
                localVideo.srcObject = stream;
            };
            var errorCallback = function(error) {
                console.log(error);
            };
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        ideal: 'environment'
                    }
                } // prefer rear-facing camera
            }).then(successCallback, errorCallback);
        }
*/

        // croma ------------------------------------------------
        var vid = document.getElementById("cromaVideo");
        var canvas = document.getElementById("canvas-croma");

        var back_r = 255;
        var back_g = 255;
        var back_b = 255;

        var l_r = 100;
        var l_g = 200;
        var l_b = 100;

        var d_r = 50;
        var d_g = 150;
        var d_b = 50;

        function playVideo() {
            document.getElementById('cromaVideo').play()
        }

        function pauseVideo() {
            document.getElementById('cromaVideo').pause()
        }

        function cambioTolerancia(val){ tolerance = val; }

        function cambioL_R(val){ l_r = val; }
        function cambioL_G(val){ l_g = val; }
        function cambioL_B(val){ l_b = val; }

        function cambioD_R(val){ d_r = val; }
        function cambioD_G(val){ d_g = val; }
        function cambioD_B(val){ d_b = val; }

        function cambioG_R(val){ back_r = val; cambiarfondo(); }
        function cambioG_G(val){ back_g = val; cambiarfondo(); }
        function cambioG_B(val){ back_b = val; cambiarfondo(); }

        function cambiarfondo(){
            let c1 = document.getElementById("canvas-croma");
            c1.style.backgroundColor = 'rgb('+back_r+','+back_g+','+back_b+')'; 
        }


        let tolerance = 0.1;

        let processor = {
            timerCallback: function() {
                if (this.video.paused || this.video.ended) {
                    return;
                }
                this.computeFrame();
                let self = this;
                setTimeout(function () {
                    self.timerCallback();
                }, 10);
            },

            doLoad: function() {
                this.video = document.getElementById("cromaVideo");
                this.c1 = document.getElementById("canvas-croma");
                this.ctx1 = this.c1.getContext("2d");
    
                let self = this;
                this.video.addEventListener("play", function() {
                    self.width = self.video.videoWidth;
                    self.height = self.video.videoHeight;
                    self.timerCallback();
                }, false);
            },

            calculateDistance: function(c, min, max) {
                if(c < min) return min - c;
                if(c > max) return c - max;

                return 0;
            },

            computeFrame: function() {
                this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
                let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
                let l = frame.data.length / 4;

                for (let i = 0; i < l; i++) {
                    let _r = frame.data[i * 4 + 0];
                    let _g = frame.data[i * 4 + 1];
                    let _b = frame.data[i * 4 + 2];

                    let difference = this.calculateDistance(_r, d_r, l_r) + 
                                     this.calculateDistance(_g, d_g, l_g) +
                                     this.calculateDistance(_b, d_b, l_b);

                    difference /= (255 * 3); // convert to percent
                    if (difference < tolerance)
                        frame.data[i * 4 + 3] = 0;
                }
                this.ctx1.putImageData(frame, 0, 0);
                return;
            }
        };


        window.onload = function() {
            processor.doLoad();
        };
    </script>

</body>
</html>