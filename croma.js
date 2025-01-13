
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

function maxAndMin(value,clase){
            if (parseFloat(value) > parseFloat(document.getElementsByClassName(clase)[1].max)) {
                value = document.getElementsByClassName(clase)[1].max;
            }
            if (parseFloat(value) < parseFloat(document.getElementsByClassName(clase)[1].min) || isNaN(parseFloat(value))) {
                value = document.getElementsByClassName(clase)[1].min;
            }
            return parseFloat(value);
        }
function setValueSetting(value,id){
            document.getElementById(id).value = parseFloat(value);
            return;
        }
//aca de debe reemplazar por todos los guardados en alguna base de datos
function croma (params) {
    // configuration --------------------------------------
    let config = {
        light : {
            r : params != undefined && params.light != undefined ? params.light.r : params.light_red,
            g : params != undefined && params.light != undefined ? params.light.g : params.light_green,
            b : params != undefined && params.light != undefined ?  params.light.b :params.light_blue,
        },
        dark : {
            r: params != undefined && params.dark != undefined ? params.dark.r : params.dark_red,
            g: params != undefined && params.dark != undefined ? params.dark.g : params.dark_green,
            b: params != undefined && params.dark != undefined ? params.dark.b : params.dark_blue,
        },
        //video agregado
        video : {
            w: params != undefined && params.video != undefined ? params.video.w : params.video_width,
            h: params != undefined && params.video != undefined ? params.video.h : params.video_height,
            x: params != undefined && params.video != undefined ? params.video.x : params.video_x,
            y: params != undefined && params.video != undefined ? params.video.y : params.video_y,
        },
        camera : {
            h: params != undefined && params.camera != undefined ? params.camera.h : params.camera_h,
            w: params != undefined && params.camera != undefined ? params.camera.w : params.camera_w,
        }, 
        tolerance : params != undefined && params.tolerance != undefined ? params.tolerance : params.bd_tolerance,
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
            if (this.video.ended) {
                return;
            }
            this.changeSize();
            this.computeFrame();
            this.changePosition();
            this.changeCamera();
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
            //container.style.border = '1px solid black';
            //container.style.borderRadius = '2px';
            container.style.height = config.camera.h + 'px';
            /*editado para color*/
            //container.style.backgroundColor = 'black';
            container.style.background='-moz-linear-gradient(0deg, rgba(110,35,37,1) -15%, rgba(215,46,53,1) 100%)' ;
            container.style.background='-webkit-linear-gradient(0deg, rgba(110,35,37,1) 0%, rgba(215,46,53,1) 100%)' ;
            container.style.background='linear-gradient(0deg, rgba(110,35,37,1) -15%, rgba(215,46,53,1) 100%)' ;


            if(config.webcamVideo){
                container.style.display = 'none';
                this.createWebcam();
            }

            this.video.addEventListener( "loadedmetadata", function (e) {
                processor.c1.width = this.videoWidth*(config.video.w/100);
                processor.c1.height = this.videoHeight*(config.video.w/100);
                // posicion inicial del video
                //processor.c1.width = config.video.w;
                //processor.c1.height = config.video.h;
                if(config.webcamVideo){
                    processor.c1.style.position = 'absolute';
                    processor.c1.style.left = config.video.x + '%';
                    processor.c1.style.bottom = config.video.y + '%';

                    //document.getElementById('webcamVideo').height = this.videoHeight;
                    //altura de la camara
                    document.getElementById('webcamVideo').height = config.camera.h;
                    document.getElementById('webcamVideo').width = config.camera.w;

                }
            }, false );

            this.ctx1 = this.c1.getContext("2d");

            if(!config.viewVideo){
                this.video.style.opacity = 0;
                this.video.style.position = 'absolute';
            }

            if(params.activeSetting==1){
                this.createControls();
            }
        
            let self = this;
            this.video.addEventListener("play", function() {
                self.width = self.video.videoWidth;
                self.height = self.video.videoHeight;
                //self.width = config.video.w;
                //self.height = config.video.h;
                self.timerCallback();
            }, false);

        },

        // calculate distance -
        calculateDistance (c, min, max) {
            if(c < min) return min - c;
            if(c > max) return c - max;

            return 0;
        },

        changeCamera(){
            document.getElementById('webcamVideo').height = config.camera.h;
            document.getElementById('webcamVideo').width = config.camera.w;
            document.getElementById('cromaContainer').style.height = config.camera.h+'px';
            return;
        },

        changePosition(){
            processor.c1.style.left = config.video.x + '%';
            processor.c1.style.bottom = config.video.y + '%';
            return;
        },

        changeSize(){
            processor.c1.width = this.width*(config.video.w/100);
            processor.c1.height = this.height*(config.video.w/100);
            return;
        },

        // replace color -
        computeFrame () {
            //reemplaza el tamaño del video
            this.ctx1.clearRect(0, 0, 15000, 15000);
            //this.ctx1.drawImage(this.video, 0, 0, config.video.w, config.video.h);
            this.ctx1.drawImage(this.video, 0, 0, this.width*(config.video.w/100), this.height*(config.video.w/100));
            //let frame = this.ctx1.getImageData(0, 0, config.video.w, config.video.h);
            let frame = this.ctx1.getImageData(0, 0, this.width*(config.video.w/100), this.height*(config.video.w/100));
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
            //this.ctx1.clearRect(0, 0, config.video.w, config.video.h);
            this.ctx1.clearRect(0, 0, this.width*(config.video.w/100), this.height*(config.video.w/100));
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
                <div class='controls-container' style="float: left; padding: 10px; margin:2px; border: 1px solid; border-radius: 2px;">
                    <span>Controles de video:</span><br/><br/>
                    <button class="playVideo">Play</button>
                    <button class="pauseVideo">Pause</button>
                    <button class="mutedVideo">Mute</button><br/><br/>
                    <span>Controles de configuración:</span><br/><br/>
                    <button class="saveSetting">Guardar config</button>
                    <span style= "padding-left: 27px;">
                    <button class="refreshSetting">Reestablecer config</button>
                    </span>
                    <br/><br/>
                    <span>Cambiar video:</span><br/><br/>
                    <form class="row" id="fomrVideo"action="controller.php?action=updateVideo" method="post" enctype="multipart/form-data">
                        <input type="file" name="imagen" accept=".mp4" required>
                        <button type="submit" name="enviar">Guardar</button>
                    </form><br/><br/>
                    <span>Tolerancia</span>
                    <span id="c_toleracia">${config.tolerance}</span><br/>
                    <span style="width: 80px; display: inline-block;">Valor</span>
                    <input type="range" min="0" max="0.5" step="0.005" value="${config.tolerance}"  class="tolerance">
                    <input type="number" style="width:65px" min="0" max="0.5" step="0.005" value="${config.tolerance}"  class="tolerance" required><br/><br/>

                    <span>Tonos Claros</span>
                    <span id="c_claros">(${config.light.r}, ${config.light.g}, ${config.light.b})</span><br/>
                    <span style="width: 80px; display: inline-block;">RED</span>
                    <input type="range" min="0" max="255" value="${config.light.r}" class="light_R">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.light.r}" class="light_R"><br/>
                    <span style="width: 80px; display: inline-block;">GREEN</span>
                    <input type="range" min="0" max="255" value="${config.light.g}" class="light_G">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.light.g}" class="light_G"><br/>
                    <span style="width: 80px; display: inline-block;">BLUE</span>
                    <input type="range" min="0" max="255" value="${config.light.b}" class="light_B">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.light.b}" class="light_B"><br/><br/>

                    <span>Tonos Oscuros</span>
                    <span id="c_oscuros">(${config.dark.r}, ${config.dark.g}, ${config.dark.b})</span><br/>
                    <span style="width: 80px; display: inline-block;">RED</span>
                    <input type="range" min="0" max="255" value="${config.dark.r}"  class="dark_R">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.dark.r}"  class="dark_R"><br/>
                    <span style="width: 80px; display: inline-block;">GREEN</span>
                    <input type="range" min="0" max="255" value="${config.dark.g}"  class="dark_G">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.dark.g}"  class="dark_G"><br/>
                    <span style="width: 80px; display: inline-block;">BLUE</span>
                    <input type="range" min="0" max="255" value="${config.dark.b}"  class="dark_B">
                    <input type="number"  style="width:65px" min="0" max="255" value="${config.dark.b}"  class="dark_B"><br/><br/>

                    <span>Tamaño de video</span>
                    <span id="t_video">${config.video.w}%</span><br/>
                    <span style="width: 80px; display: inline-block;">Porcentaje</span>
                    <input type="range" min="1" max="400" value="${config.video.w}"  class="video_w">
                    <input type="number"  style="width:65px" min="1" max="400" value="${config.video.w}"  class="video_w"><br/><br/>

                    <span>Posición del video</span>
                    <span id="p_video">(${config.video.x}, ${config.video.y})</span><br/>
                    <span style="width: 80px; display: inline-block;">Posición X</span>
                    <input type="range" min="0" max="100" value="${config.video.x}"  class="video_x">
                    <input type="number"  style="width:65px" min="0" max="100" value="${config.video.x}"  class="video_x"><br/>
                    <span style="width: 80px; display: inline-block;">Posición Y</span>
                    <input type="range" min="0" max="100" value="${config.video.y}"  class="video_y">
                    <input type="number"  style="width:65px" min="0" max="100" value="${config.video.y}"  class="video_y"><br/><br/>

                    <span>Tamaño de camara</span>
                    <span id="t_camera">(${config.camera.w},${config.camera.h})</span><br/>
                    <span style="width: 80px; display: inline-block;">Eje X</span>
                    <input type="range" min="0" max="1000" value="${config.camera.w}"  class="camera_w">
                    <input type="number"  style="width:65px" min="0" max="1000" value="${config.camera.w}"  class="camera_w"><br/>
                    <span style="width: 80px; display: inline-block;">Eje Y</span>
                    <input type="range" min="0" max="2000" value="${config.camera.h}"  class="camera_h">
                    <input type="number"  style="width:65px" min="0" max="2000" value="${config.camera.h}"  class="camera_h"><br/>                    `;


                    if(config.opacityBG){
                        template += `
                        <span>Background</span>
                        <span id="c_bg">(${config.bg.r}, ${config.bg.g}, ${config.bg.b})</span><br/>
                        <span style="width: 80px; display: inline-block;">RED</span>
                        <input type="range" min="0" max="255" value="${config.bg.r}" class="bg_R"><br/>
                        <span style="width: 80px; display: inline-block;">GREEN</span>
                        <input type="range" min="0" max="255" value="${config.bg.g}" class="bg_G"><br/>
                        <span style="width: 80px; display: inline-block;">BLUE</span>
                        <input type="range" min="0" max="255" value="${config.bg.b}" class="bg_B"><br/><br/>`;
                    }
                    
                    template +=`</div>`;

            document.getElementById(config.containerId).insertAdjacentHTML('beforebegin', template);    

            //tolerance
            document.getElementsByClassName('tolerance')[0].addEventListener("change", function() {
                document.getElementsByClassName('tolerance')[1].value = this.value;
                setValueSetting(this.value,'tolerance');
                config.tolerance = this.value;
                document.getElementById('c_toleracia').innerHTML = config.tolerance;
            });
            document.getElementsByClassName('tolerance')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'tolerance');
                document.getElementsByClassName('tolerance')[0].value = this.value;
                setValueSetting(this.value,'tolerance');
                config.tolerance = this.value;
                document.getElementById('c_toleracia').innerHTML = config.tolerance;
            });
            //light_R
            document.getElementsByClassName('light_R')[0].addEventListener("change", function() {
                document.getElementsByClassName('light_R')[1].value = this.value;
                //setea en los inputs hiddenn
                setValueSetting(this.value,'light_red');
                config.light.r = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });
            document.getElementsByClassName('light_R')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'light_R');
                document.getElementsByClassName('light_R')[0].value = this.value;
                setValueSetting(this.value,'light_red');
                config.light.r = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });     
            //light_G
            document.getElementsByClassName('light_G')[0].addEventListener("change", function() {
                document.getElementsByClassName('light_G')[1].value = this.value;
                setValueSetting(this.value,'light_green');
                config.light.g = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });  
            document.getElementsByClassName('light_G')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'light_G');
                document.getElementsByClassName('light_G')[0].value = this.value;
                setValueSetting(this.value,'light_green');
                config.light.g = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });   
            //light_B             
            document.getElementsByClassName('light_B')[0].addEventListener("change", function() {
                document.getElementsByClassName('light_B')[1].value = this.value;
                setValueSetting(this.value,'light_blue');
                config.light.b = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });      
            document.getElementsByClassName('light_B')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'light_B');
                document.getElementsByClassName('light_B')[0].value = this.value;
                setValueSetting(this.value,'light_blue');
                config.light.b = this.value;
                document.getElementById('c_claros').innerHTML = `(${config.light.r}, ${config.light.g}, ${config.light.b})`;
            });       
            //dark_R  
            document.getElementsByClassName('dark_R')[0].addEventListener("change", function() {
                document.getElementsByClassName('dark_R')[1].value = this.value;
                setValueSetting(this.value,'dark_red');
                config.dark.r = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });   
            document.getElementsByClassName('dark_R')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'dark_R');
                document.getElementsByClassName('dark_R')[0].value = this.value;
                setValueSetting(this.value,'dark_red');
                config.dark.r = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });   
            //dark_G          
            document.getElementsByClassName('dark_G')[0].addEventListener("change", function() {
                document.getElementsByClassName('dark_G')[1].value = this.value;
                setValueSetting(this.value,'dark_green');
                config.dark.g = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });           
            document.getElementsByClassName('dark_G')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'dark_G');
                document.getElementsByClassName('dark_G')[0].value = this.value;
                setValueSetting(this.value,'dark_green');
                config.dark.g = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });      
            //dark_B       
            document.getElementsByClassName('dark_B')[0].addEventListener("change", function() {
                document.getElementsByClassName('dark_B')[1].value = this.value;
                setValueSetting(this.value,'dark_blue');
                config.dark.b = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });       
            document.getElementsByClassName('dark_B')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'dark_B');
                document.getElementsByClassName('dark_B')[0].value = this.value;
                setValueSetting(this.value,'dark_blue');
                config.dark.b = this.value;
                document.getElementById('c_oscuros').innerHTML = `(${config.dark.r}, ${config.dark.g}, ${config.dark.b})`;
            });      
            //agrego tamaño de video          
            //video_h
            /*
            document.getElementsByClassName('video_h')[0].addEventListener("change", function() {
                document.getElementsByClassName('video_h')[1].value = this.value;
                setValueSetting(this.value,'video_height');
                config.video.h = this.value;
                document.getElementById('t_video').innerHTML = `(${config.video.w}, ${config.video.h})`;
            });
            document.getElementsByClassName('video_h')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'video_h');
                document.getElementsByClassName('video_h')[0].value = this.value;
                setValueSetting(this.value,'video_height');
                config.video.h = this.value;
                document.getElementById('t_video').innerHTML = `(${config.video.w}, ${config.video.h})`;
            });             
            */
            //video_w        
            document.getElementsByClassName('video_w')[0].addEventListener("change", function() {
                document.getElementsByClassName('video_w')[1].value = this.value;
                setValueSetting(this.value,'video_width');
                config.video.w = this.value;
                document.getElementById('t_video').innerHTML = `(${config.video.w})`;
            });          
            document.getElementsByClassName('video_w')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'video_w');
                document.getElementsByClassName('video_w')[0].value = this.value;
                setValueSetting(this.value,'video_width');
                config.video.w = this.value;
                document.getElementById('t_video').innerHTML = `(${config.video.w})`;
            });    
            //posicion del video   
            //video_x         
            document.getElementsByClassName('video_x')[0].addEventListener("change", function() {
                document.getElementsByClassName('video_x')[1].value = this.value;
                setValueSetting(this.value,'video_x');
                config.video.x = this.value;
                document.getElementById('p_video').innerHTML = `(${config.video.x}, ${config.video.y})`;
            });         
            document.getElementsByClassName('video_x')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'video_x');
                document.getElementsByClassName('video_x')[0].value = this.value;
                setValueSetting(this.value,'video_x');
                config.video.x = this.value;
                document.getElementById('p_video').innerHTML = `(${config.video.x}, ${config.video.y})`;
            });      
            //video_y        
            document.getElementsByClassName('video_y')[0].addEventListener("change", function() {
                document.getElementsByClassName('video_y')[1].value = this.value;
                setValueSetting(this.value,'video_y');
                config.video.y = this.value;
                document.getElementById('p_video').innerHTML = `(${config.video.x}, ${config.video.y})`;
            });        
            document.getElementsByClassName('video_y')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'video_y');
                document.getElementsByClassName('video_y')[0].value = this.value;
                setValueSetting(this.value,'video_y');
                config.video.y = this.value;
                document.getElementById('p_video').innerHTML = `(${config.video.x}, ${config.video.y})`;
            });       
            //agrego tamaño de camara  
            document.getElementsByClassName('camera_w')[0].addEventListener("change", function() {
                document.getElementsByClassName('camera_w')[1].value = this.value;
                setValueSetting(this.value,'camera_w');
                config.camera.w = this.value;
                document.getElementById('t_camera').innerHTML = `(${config.camera.w},${config.camera.h})`;
            });          
            document.getElementsByClassName('camera_w')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'camera_w');
                document.getElementsByClassName('camera_w')[0].value = this.value;
                setValueSetting(this.value,'camera_w');
                config.camera.w = this.value;
                document.getElementById('t_camera').innerHTML = `(${config.camera.w},${config.camera.h})`;
            });          
            document.getElementsByClassName('camera_h')[0].addEventListener("change", function() {
                document.getElementsByClassName('camera_h')[1].value = this.value;
                setValueSetting(this.value,'camera_h');
                config.camera.h = this.value;
                document.getElementById('t_camera').innerHTML = `(${config.camera.w},${config.camera.h})`;
            });          
            document.getElementsByClassName('camera_h')[1].addEventListener("change", function() {
                this.value = maxAndMin(this.value,'camera_h');
                document.getElementsByClassName('camera_h')[0].value = this.value;
                setValueSetting(this.value,'camera_h');
                config.camera.h = this.value;
                document.getElementById('t_camera').innerHTML = `(${config.camera.w},${config.camera.h})`;
            });  

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
            document.getElementsByClassName('saveSetting')[0].addEventListener("click", function() {
                let opcion = confirm("¿Está seguro que desea actualizar los ajustes?");
                    if (opcion == true) {
                        document.getElementById("saveSettings").click();
                    }                 
            }); 
            document.getElementsByClassName('refreshSetting')[0].addEventListener("click", function() {
                let opcion = confirm("¿Está seguro que desea reestablecer los ajustes?");
                    if (opcion == true) {
                        document.getElementById("refreshSettings").click();
                    }                 
            });
            document.getElementById('fomrVideo').addEventListener("submit", function() {
                    document.getElementById("loader").style.display = "flex";
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

        setVideo(h,w,x,y){
            config.video.h = h;
            config.video.w = w;
            config.video.x = x;
            config.video.y = y;
        },

        setCamera(w,h){
            config.camera.h = h;
            config.camera.w = w;
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



