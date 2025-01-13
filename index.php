<!DOCTYPE html>
<html>

<head>

    <title>Test CROMA Canvas</title>

    <style>
        .video-container {
            position: relative;
        }
        
        #localVideo {
            height: 480px;
            width: 640px;
            border: 3px solid blue;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        #cromaVideo {

            border: 5px solid green;
            position: absolute;
            top: 0;
            left: 420px;
            display: none;
        }
        
        #canvas-croma {
            width: 202px;
            position: absolute;
            top: 120px;
            left: 200px;
        }
        
        .controls-container {
            position: absolute;
            top: 500px;
        }

        button {
            height: 50px;
            width: 100px;
        }
    </style>
</head>

<body >

    <div class='video-container'>

        <video id="localVideo" autoplay muted playsinline></video>

        <canvas id="canvas-croma" width=404 height=720></canvas>

        <video id="cromaVideo" autoplay playsinline controls="false" loop>
			<source src="Test-Croma.mp4" type="video/mp4">
		</video>

    </div>

    <div class='controls-container'>
        <button id='play' onClick='playVideo()'>Play</button>
        <button id='pause' onClick='pauseVideo()'>Pause</button>
    </div>

    <script>

        // video local ------------------------------------------
        var localVideo = document.getElementById('localVideo');
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


        // croma ------------------------------------------------
        function playVideo() {
            document.getElementById('cromaVideo').play()
        }

        function pauseVideo() {
            document.getElementById('cromaVideo').pause()
        }

        let vid = document.getElementById("cromaVideo");
        let canvas = document.getElementById("canvas-croma");
        let ctx = canvas.getContext("2d");

        // damos al canvas la misma altura y anchura que al video
        let cw = (canvas.width = 404);
        let ch = (canvas.height = 720);

        vid.addEventListener(
            "play", ()=> { pintarVideo(vid, ctx, cw, ch);}, false
        );

        function pintarVideo() {
            requestAnimationFrame(pintarVideo);

            // si el video esta parado o se ha acabado no hagas nada y sal de aquí
            if (vid.paused || vid.ended){ return;}

            // pinta el video en el canvas quitando el color deseado
            ctx.drawImage(vid, 0, 0, cw, ch);
            let frame = ctx.getImageData(0, 0, cw, ch);
            let l = frame.data.length / 4 ;

            // recorro cada pixel por cada frame
            for (let i = 0; i < l; i++) {
                let r = frame.data[i * 4 + 0];
                let g = frame.data[i * 4 + 1];
                let b = frame.data[i * 4 + 2];
                if (g >= 125 && r < 100 && b < 100) 
                    // si coincide cambio el alpha del frame a 0 (trasparente)    
                    frame.data[i * 4 + 3] = 0;
            }

            ctx.putImageData(frame, 0, 0);

        }

    </script>

</body>
</html>