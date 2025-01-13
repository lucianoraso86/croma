<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Croma</title>

        <script type="text/javascript" src="croma.js"></script> 
        
    </head>
    <body>
        

        <!--Source Video -->
        <video id="sourceVideo" controls loop>
            <source src="videos/temporal.mp4" type="video/mp4">
        </video>

        <!--Contenedor Croma -->
        <div id="cromaContainer"></div>

        <!--Main Script -->
        <script type="text/javascript">

            var cr = croma({
                sourceId : 'sourceVideo',
                containerId : 'cromaContainer',
                webcamVideo : true,
                viewControls: true,
                viewVideo : false
            });

            
            /*      
            // IMPLEMENTACION BASICA --------------------------
            var cr = croma({
                sourceId : 'sourceVideo',
                containerId : 'cromaContainer'
            }); 
            */
            
            
            /*
            // IMPLEMENTACION CON CONFIGURACION ---------------
            var cr = croma({
                sourceId : 'sourceVideo',
                containerId : 'cromaContainer',
                light : {
                    r : 44,
                    g : 273,
                    b : 121
                },
                dark : {
                    r: 55,
                    g: 167,
                    b: 71
                },
                bg : {
                    r : 255,
                    g : 255,
                    b : 255
                },
                tolerance : 0.1
            });
            */
            
        </script>

    </body>
</html>
