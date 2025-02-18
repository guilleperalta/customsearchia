<!DOCTYPE html>
<html lang="es">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Búsqueda de Productos</title>
        <link rel="stylesheet" href="{$base_dir}modules/customsearchia/views/css/front.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link rel="icon" type="image/vnd.microsoft.icon"
            href="https://aco-web.globalthink.io/img/favicon.ico?1733846870">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
        <script src="{$base_dir}modules/customsearchia/views/js/front.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet">
    </head>

    <body id="customsearchia">
        {include file="layouts/layout-both-columns.tpl"}
        <div id="url_webhook" style="display:none;">
            {$url_webhook|escape:'html':'UTF-8'}
        </div>
        <div class="full-screen-container">
            <div id="notifications-chat"></div> <!-- Contenedor para notificaciones -->
            <div class="content-container">
                <div class="product-column">
                    <div class="product-grid" id="result">
                        <!-- Aquí irán los productos -->
                    </div>
                    <div id="no-results" style="display:none;">
                        <p>No se encontraron productos para la búsqueda realizada.</p>
                    </div>
                </div>
                <div class="chat-column">
                    <button class="close-chat">&times;</button>
                    <div class="chat-header">
                        <img src="{$base_dir}modules/customsearchia/img/logo-chat.png" alt="Logo" width="34px"
                            height="34px" style="border-radius: 50%;" />
                        <div class="chat-header-text">
                            <h3>ACO Asistente</h3>
                            <span><span id="puntito"></span>Activo</span>
                        </div>
                    </div>
                    <div id="chat">
                        <!-- Aquí irán los mensajes del chat -->
                    </div>
                    <div class="chat-input-container">
                        <img src="{$base_dir}modules/customsearchia/img/trash.svg" alt="borrar chat" id="clear-chat" style="margin-right: 6px;" />
                        <input type="text" id="search" class="form-control" placeholder="Escribe tu mensaje"
                            value="{$search_query|escape:'html':'UTF-8'}" />

                        <img src="{$base_dir}modules/customsearchia/img/send.svg" alt="Enviar" id="send" />
                    </div>
                </div>
                <button class="floating-chat-button" style="display: none;">💬</button>
            </div>
        </div>
        <div id="url" style="display:none;">
            {$url_ajax|escape:'html':'UTF-8'}
        </div>
    </body>

</html>