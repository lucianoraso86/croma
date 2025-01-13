
/*
    Component: Create Croma -
    Params: 
    {
        sourceId : 'sourceId',          // id video source                              (OBLIGATORIO)
        containerId : 'containerId',    // id contenedor donde se crea el componente    (OBLIGATORIO)
        viewControls: true,             // muestra/oculta controles de configuracion    (default false = oculto)
        viewVideo : true,               // muestra/oculta video source                  (default false = oculto)
        webcamVideo : true,             // muestra/oculta el video de la webcam         (default false = oculto)
        opacityBG : true                // indica si usa background opaco con color     (default false = trasparente)
        light : {                       // RGB Configuracion tonos claros
            r : 44,
            g : 273,
            b : 121
        },
        dark : {                        // RGB configuracion tonos oscuros
            r: 55,
            g: 167,
            b: 71
        },
        bg : {                          // RGB configuracion background opaco
            r : 255,
            g : 255,
            b : 255
        },
        tolerance : 0.1                 // RGB configuracion tolerancia
    }
*/


function croma (params) {

    // configuration --------------------------------------
    let config = {
        bg : {
            r : params != undefined && params.bg != undefined ? params.bg.r : 255,
            g : params != undefined && params.bg != undefined ? params.bg.g : 255,
            b : params != undefined && params.bg != undefined ? params.bg.b : 255,
        },
        light : {
            r : params != undefined && params.light != undefined ? params.light.r : 100,
            g : params != undefined && params.light != undefined ? params.light.g : 200,
            b : params != undefined && params.light != undefined ?  params.light.b : 100,
        },
        dark : {
            r: params != undefined && params.dark != undefined ? params.dark.r : 50,
            g: params != undefined && params.dark != undefined ? params.dark.g : 150,
            b: params != undefined && params.dark != undefined ? params.dark.b : 50,
        },
        tolerance : params != undefined && params.tolerance != undefined ? params.tolerance : .1,
        viewControls : params != undefined && params.viewControls != undefined ? params.viewControls : false,
        viewVideo : params != undefined && params.viewVideo != undefined ? params.viewVideo : false,
        webcamVideo : params != undefined && params.webcamVideo != undefined ? params.webcamVideo : false,
        opacityBG : params != undefined && params.opacityBG != undefined ? params.opacityBG : false
        
    };

    if(!params.sourceId){
        alert('sourceId es Requerido!');
        return;
    }
    
    if(!params.containerId){
        alert('containerId es Requerido!');
        return;
    }

    config.sourceId = params.sourceId;
    config.containerId = params.containerId;


    // main process ---------------------------------------
    let processor = {
        
        // callback -
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

        // init -
        init(){

            this.video = document.getElementById(config.sourceId);

            this.c1 = document.createElement('canvas');
            
            if(config.opacityBG){
                this.c1.style.backgroundColor = `rgb(${config.bg.r},${config.bg.g},${config.bg.b})`; 
            }

            let container =  document.getElementById(config.containerId)
            container.appendChild(this.c1)
            container.style.display = 'inline-block';
            container.style.position = 'relative';
            container.style.border = '1px solid black';
            container.style.borderRadius = '2px';


            if(config.webcamVideo){
                container.style.display = 'none';
                this.createWebcam();
            }

            this.video.addEventListener( "loadedmetadata", function (e) {
                processor.c1.width = this.videoWidth;
                processor.c1.height = this.videoHeight;
                if(config.webcamVideo){
                    processor.c1.style.position = 'absolute';
                    processor.c1.style.left = '30%';
                    document.getElementById('webcamVideo').height = this.videoHeight;
                }
            }, false );

            this.ctx1 = this.c1.getContext("2d");

            if(!config.viewVideo){
                this.video.style.opacity = 0;
                this.video.style.position = 'absolute';
            }

            if(config.viewControls){
                this.createControls();
            }
        
            let self = this;
            this.video.addEventListener("play", function() {
                self.width = self.video.videoWidth;
                self.height = self.video.videoHeight;
                self.timerCallback();
            }, false);
    
        },

        // calculate distance -
        calculateDistance (c, min, max) {
            if(c < min) return min - c;
            if(c > max) return c - max;

            return 0;
        },

        // replace color -
        computeFrame () {
            this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
            let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
            let l = frame.data.length / 4;

            for (let i = 0; i < l; i++) {

                let _r = frame.data[i * 4 + 0];
                let _g = frame.data[i * 4 + 1];
                let _b = frame.data[i * 4 + 2];

                let difference = this.calculateDistance(_r, config.dark.r, config.light.r) + this.calculateDistance(_g, config.dark.g, config.light.g) + this.calculateDistance(_b, config.dark.b, config.light.b);

                difference /= (255 * 3); // convert to percent
                if (difference < config.tolerance) {
                    frame.data[i * 4 + 3] = 0;
                }
            }

            this.ctx1.putImageData(frame, 0, 0);
            return;
        },

        createWebcam(){
            let template = '<video id="webcamVideo" autoplay muted playsinline></video>';
            document.getElementById(config.containerId).insertAdjacentHTML('afterbegin', template); 

            let localVideo = document.getElementById('webcamVideo');
            localVideo.setAttribute('autoplay', '');
            localVideo.setAttribute('muted', '');
            localVideo.setAttribute('playsinline', '');
    
            if (navigator.mediaDevices.getUserMedia) {
                var successCallback = function(stream) {
                    localVideo.srcObject = stream;
                    document.getElementById(config.containerId).style.display = 'inline-block';
                    document.getElementById(config.sourceId).play();
                };
                var errorCallback = function(error) {
                    alert('error al iniciar la camara');
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
        },

        // create controls to configure -    
        createControls(){
            let template = `
                <div class='controls-container' style="float: right; padding: 10px; margin:2px; border: 1px solid; border-radius: 2px;">

                    <button class="playVideo">Play</button>
                    <button class="pauseVideo">Pause</button>
                    <button class="mutedVideo">Mute</button><br/><br/>

                    <span>Tolerancia</span>
                    <span id="c_toleracia">${config.tolerance}</span><br/>
                    <span style="width: 60px; display: inline-block;">Valor</span>
                    <input type="range" min="0" max=".1" step=".005" value="${config.tolerance}"  class="tolerance"><br/><br/>

                    <span>Tonos Claros</span>
                    <span id="c_claros">(${config.light.r}, ${config.light.g}, ${config.light.b})</span><br/>
                    <span style="width: 60px; display: inline-block;">RED</span>
                    <input type="range" min="0" max="255" value="${config.light.r}" class="light_R"><br/>
                    <span style="width: 60px; display: inline-block;">GREEN</span>
                    <input type="range" min="0" max="255" value="${config.light.g}" class="light_G"><br/>
                    <span style="width: 60px; display: inline-block;">BLUE</span>
                    <input type="range" min="0" max="255" value="${config.light.b}" class="light_B"><br/><br/>

                    <span>Tonos Oscuros</span>
                    <span id="c_oscuros">(${config.dark.r}, ${config.dark.g}, ${config.dark.b})</span><br/>
                    <span style="width: 60px; display: inline-block;">RED</span>
                    <input type="range" min="0" max="255" value="${config.dark.r}"  class="dark_R"><br/>
                    <span style="width: 60px; display: inline-block;">GREEN</span>
                    <input type="range" min="0" max="255" value="${config.dark.g}"  class="dark_G"><br/>
                    <span style="width: 60px; display: inline-block;">BLUE</span>
                    <input type="range" min="0" max="255" value="${config.dark.b}"  class="dark_B"><br/><br/>`;

                    if(config.opacityBG){
                        template += `
                        <span>Background</span>
                        <span id="c_bg">(${config.bg.r}, ${config.bg.g}, ${config.bg.b})</span><br/>
                        <span style="width: 60px; display: inline-block;">RED</span>
                        <input type="range" min="0" max="255" value="${config.bg.r}" class="bg_R"><br/>
                        <span style="width: 60px; display: inline-block;">GREEN</span>
                        <input type="range" min="0" max="255" value="${config.bg.g}" class="bg_G"><br/>
                        <span style="width: 60px; display: inline-block;">BLUE</span>
                        <input type="range" min="0" max="255" value="${config.bg.b}" class="bg_B"><br/><br/>`;
                    }
                    
                    template +=`</div>`;

            document.getElementById(config.containerId).insertAdjacentHTML('beforeend', template);    

            document.getElementsByClassName('tolerance')[0].addEventListener("change", function() {
                config.tolerance = this.value;
                document.getElementById('c_toleracia').innerHTML = config.tolerance;
            });
            document.getElementsByClassName('light_R')[0].addEventListener("change", function() {
                config.light.r = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });            
            document.getElementsByClassName('light_G')[0].addEventListener("change", function() {
                config.light.g = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });            
            document.getElementsByClassName('light_B')[0].addEventListener("change", function() {
                config.light.b = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });            
            document.getElementsByClassName('dark_R')[0].addEventListener("change", function() {
                config.dark.r = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });            
            document.getElementsByClassName('dark_G')[0].addEventListener("change", function() {
                config.dark.g = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });            
            document.getElementsByClassName('dark_B')[0].addEventListener("change", function() {
                config.dark.b = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });      

            if(config.opacityBG){ 
                document.getElementsByClassName('bg_R')[0].addEventListener("change", function() {
                    config.bg.r = this.value;
                    document.getElementById('c_bg').innerHTML = `(${config.bg.r}, ${config.bg.g}, ${config.bg.b})`;
                    processor.changeBg();
                });            
                document.getElementsByClassName('bg_G')[0].addEventListener("change", function() {
                    config.bg.g = this.value;
                    document.getElementById('c_bg').innerHTML = `(${config.bg.r}, ${config.bg.g}, ${config.bg.b})`;
                    processor.changeBg();
                });            
                document.getElementsByClassName('bg_B')[0].addEventListener("change", function() {
                    config.bg.b = this.value;
                    document.getElementById('c_bg').innerHTML = `(${config.bg.r}, ${config.bg.g}, ${config.bg.b})`;
                    processor.changeBg();
                });
            }

            document.getElementsByClassName('playVideo')[0].addEventListener("click", function() {
                document.getElementById(config.sourceId).play()
            });
            document.getElementsByClassName('pauseVideo')[0].addEventListener("click", function() {
                document.getElementById(config.sourceId).pause()
            });
            document.getElementsByClassName('mutedVideo')[0].addEventListener("click", function() {
                let mute = document.getElementById(config.sourceId).muted
                document.getElementById(config.sourceId).muted = !mute;
            });

        },

        // change background color -
        changeBg(){
            if(config.opacityBG){
                this.c1.style.backgroundColor = `rgb(${config.bg.r},${config.bg.g},${config.bg.b})`; 
            }
        }

    };

    // public methods -------------------------------------
    let public = {

        play: function(){
            document.getElementById(config.sourceId).play()
        },

        pause: function(){
            document.getElementById(config.sourceId).pause()
        },

        setTolerancia(val){ 
            config.tolerance = val; 
        },

        setLight(r, g, b){
            config.light.r = r;
            config.light.g = g;
            config.light.b = b; 
        },

        setDark(r, g, b){
            config.dark.r = r;
            config.dark.g = g;
            config.dark.b = b; 
        },

        setBackground(r, g, b){
            config.bg.r = r;
            config.bg.g = g;
            config.bg.b = b; 
        }
        
	};

    processor.init();
    return public;

};



