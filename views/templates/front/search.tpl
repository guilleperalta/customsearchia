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
    </head>

    <body id="customsearchia">
        {include file="layouts/layout-both-columns.tpl"}
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
                    <div id="chat">
                        <!-- Aquí irán los mensajes del chat -->
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="search" class="form-control" placeholder="buscar"
                            value="{$search_query|escape:'html':'UTF-8'}"
                            onkeypress="if(event.key === 'Enter') searchProduct(this.value)" />
                        <button id="clear-chat" class="btn btn-danger">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
                <button class="floating-chat-button" style="display: none;">💬</button>
            </div>
        </div>
        <div id="url" style="display:none;">
            {$url_ajax|escape:'html':'UTF-8'}
        </div>
        <script src="{$base_dir}modules/customsearchia/views/js/front.js"></script>
        <script>
            $(document).ready(function() {
                var urlParams = new URLSearchParams(window.location.search);
                var searchQuery = urlParams.get('search');
                if (searchQuery) {
                    $('#search').val(searchQuery);
                    searchProduct(searchQuery);
                    window.history.replaceState(null, null, "?search=" + searchQuery);
                }
            });
        </script>
    </body>

</html>