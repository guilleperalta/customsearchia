$(document).ready(function () {
    var url_ajax = document.querySelector('#url').textContent;
    var defaultImageUrl = '/img/p/es-default-home_default.jpg'; // URL de la imagen por defecto
    var baseUrl = window.location.protocol + "//" + window.location.host + "/";
    var url_webhook = document.querySelector('#url_webhook').textContent.trim();

    // Conectar al servidor WebSocket
    var socket = io(url_webhook);

    // Verificar la conexión WebSocket
    socket.on('connect', function() {
        // console.log('Conectado al servidor WebSocket');
    });

    socket.on('disconnect', function() {
        // console.log('Desconectado del servidor WebSocket');
    });

    socket.on('connect_error', function(error) {
        console.error('Error de conexión:', error);
    });

    // Cargar el historial del chat y el listado de productos al cargar la página
    loadChatHistory();
    loadProductList();
    var threadId = getCookie('threadId');

    // Enviar el mensaje de búsqueda desde el header si existe
    var initialMessage = getCookie('initialMessage');
    if (initialMessage) {
        initialMessage = decodeURIComponent(initialMessage); // Decodificar el mensaje
        sendMessage(initialMessage);
        var userMessage = `<div class="message user">${initialMessage}</div>`;
        $('#chat').append(userMessage);
        var spinnerMessage = `<div class="message bot" id="spinner-message">
                                  <div class="typing-indicator">
                                      <span></span><span></span><span></span>
                                  </div>
                              </div>`;
        $('#chat').append(spinnerMessage); 
        scrollToBottom();
        document.cookie = "initialMessage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setCookie('initialMessage', '', -1);
        saveChatHistory();
    }

    // Buscar productos al presionar Enter
    $('#search').on('keypress', function (event) {
        if (event.key === 'Enter') {
            var message = $(this).val();
            sendMessage(message);
            var userMessage = `<div class="message user">${message}</div>`;
            $('#chat').append(userMessage);
            var spinnerMessage = `<div class="message bot" id="spinner-message">
                                  <div class="typing-indicator">
                                      <span></span><span></span><span></span>
                                  </div>
                              </div>`;
            $('#chat').append(spinnerMessage); 
            scrollToBottom();
            $(this).val('');
            saveChatHistory();
        }
    });

    // Limpiar chat
    $('#clear-chat').on('click', function () {
        clearChat();
        scrollToBottom();
    });

    // Mostrar el chat en versión móvil y tablet
    $('.floating-chat-button').on('click', function () {
        $('.chat-column').addClass('open');
        $(this).hide();
        scrollToBottom();
    });

    // Cerrar el chat en versión móvil y tablet
    $('.close-chat').on('click', function () {
        $('.chat-column').removeClass('open');
        $('.floating-chat-button').show();
    });

    // Cerrar el chat al hacer clic fuera del contenedor en versión móvil y tablet
    $(document).on('touchstart click', function (event) {
        if ($('.chat-column').hasClass('open') && !$(event.target).closest('.chat-column, .floating-chat-button, #search').length) {
            $('.chat-column').removeClass('open');
            $('.floating-chat-button').show();
        }
    });

    // Mostrar el botón flotante solo en versión móvil y tablet
    if ($(window).width() <= 768) {
        $('.floating-chat-button').show();
    }

    // Ajustar la altura de full-screen-container
    adjustFullScreenContainerHeight();
    $(window).resize(adjustFullScreenContainerHeight);

    // Manejar el evento de agregar a favoritos
    $(document).on('click', '.add-to-wishlist', function (e) {
        e.preventDefault();
        var productId = $(this).data('id-product');
        addToWishlist(productId, $(this));
    });

    // Manejar el evento de agregar al comparador
    $(document).on('click', '.add-to-compare', function (e) {
        e.preventDefault();
        var productId = $(this).data('id-product');
        addToCompare(productId, $(this));
    });

    // Función para enviar mensajes por WebSocket
    function sendMessage(message) {
        // console.log('Enviando mensaje:', message);
        // console.log('threadId:', threadId);
        socket.emit('sendMessage', {
            event: 'sendMessage',
            data: message,
            threadId: threadId
        }, function (response) {
            // console.log('Respuesta del servidor al enviar mensaje:', response);
        });
    }

    // Manejar la respuesta del asistente
    socket.on('assistantResponse', function(response) {
        // console.log('Respuesta del asistente:', response);
        $('#spinner-message').remove(); // Eliminar el spinner
        var botMessage = `<div class="message bot">${response.message}</div>`;
        $('#chat').append(botMessage);
        scrollToBottom();
        setCookie('threadId', response.threadId, 6);
        threadId = response.threadId;
        saveChatHistory();
    });

    // Manejar los resultados de búsqueda
    socket.on('searchResults', function(response) {
        // console.log('Resultados de búsqueda:', response);
        var productIds = response.results.map(result => result.p_id);
        searchProductsByIds(productIds);
        if (Array.isArray(productIds) || productIds.length >= 0) {
            setCookie('productIds', JSON.stringify(productIds), 6);
        }
    });

    // Función para buscar productos por IDs
    function searchProductsByIds(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            // console.log('El array productIds está vacío o no es un array.');
            return;
        }
        // console.log('Buscando productos por IDs:', productIds);
        $.ajax({
            type: "POST",
            url: url_ajax,
            data: { 'productIds': productIds },
            dataType: "json",
            success: function(response) {
                // console.log('Respuesta de búsqueda de productos:', response);
                var res = '';
                if (response.length > 0) {
                    $.each(response, function (i, v) {
                        var productLink = '/index.php?id_product=' + v.id_product + '&controller=product';
                        res += `<div class="product-item">
                                    <a href="${productLink}" class="product-item-link">
                                        <img src="${v.image}" alt="${v.name}" onerror="this.onerror=null;this.src='${defaultImageUrl}';">
                                        <div class="product-name">${v.name}</div>`;
                        if (prestashop && prestashop.customer && prestashop.customer.is_logged) {
                            res += `<div class="product-price">$ ${parseFloat(v.price).toFixed(2)}</div>`;
                        }
                        res += `</a>
                                <div class="product-functional-buttons product-functional-buttons-bottom">
                                    <div class="product-functional-buttons-links">
                                        <a href="#" class="add-to-wishlist" data-id-product="${v.id_product}" title="Agregar a favoritos">
                                            <i class="fa ${v.is_wishlist ? 'fa-heart' : 'fa-heart-o'}" aria-hidden="true"></i>
                                        </a>
                                        <a href="#" class="add-to-compare" data-id-product="${v.id_product}" title="Agregar al comparador">
                                            <i class="fa fa-random" aria-hidden="true"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>`;
                    });
                    $('#result').html(res);
                    $('#no-results').hide();
                } else {
                    $('#result').html('');
                    $('#no-results').show();
                }
                scrollToBottom();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error al buscar productos:', textStatus, errorThrown);
                alert('Hubo un error al buscar productos. Revisa la consola para más detalles.');
            }
        });
    }

    // Función para ajustar la altura de full-screen-container
    function adjustFullScreenContainerHeight() {
        var mainPageContentHeight = $('#main-page-content').outerHeight();
        var newHeight = 'calc(100vh - ' + mainPageContentHeight + 'px)';
        $('.full-screen-container').css('height', newHeight);
    }

    // Función para agregar a favoritos
    function addToWishlist(productId, element) {
        fetch(baseUrl + 'module/iqitwishlist/actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: 'process=add&ajax=1&idProduct=' + productId + '&idProductAttribute=0&token=' + prestashop.static_token
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto agregado a favoritos.', 'success');
                    let corazon = element[0].querySelector('i')
                    corazon.classList.remove('fa-heart-o');
                    corazon.classList.add('fa-heart');
                    updateWishlistCount();
                } else {
                    showNotification('El producto ya estaba agregado a favoritos.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error al agregar a favoritos:', error);
                showNotification('Hubo un error al agregar a favoritos. Revisa la consola para más detalles.', 'danger');
            });
    }

    // Función para actualizar el contador de favoritos
    function updateWishlistCount() {
        var wishlistCountElement = document.getElementById('iqitwishlist-nb');
        var currentCount = parseInt(wishlistCountElement.textContent) || 0;
        wishlistCountElement.textContent = currentCount + 1;
    }

    // Función para agregar al comparador
    function addToCompare(productId, element) {
        fetch(baseUrl + 'module/iqitcompare/actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: 'process=add&ajax=1&idProduct=' + productId
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Producto agregado al comparador.', 'success');
                    element.closest('.product-item').find('.iqitcompare-floating-wrapper').addClass('active');
                    updateCompareSection();
                } else {
                    showNotification('Hubo un error al agregar al comparador.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error al agregar al comparador:', error);
                showNotification('El producto ya esta agregado al comparador.', 'danger');
            });
    }

    // Función para mostrar notificaciones en el formato de Prestashop
    function showNotification(message, type) {
        var notification = `
            <div class="alert alert-${type} alert-dismissible alert-chat" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        $('#notifications-chat').append(notification);
        setTimeout(function () {
            $('.alert').alert('close');
        }, 3000);
    }

    // Función para actualizar la sección de comparador
    function updateCompareSection() {
        $('#iqitcompare-floating a span').text(function (_, text) {
            return text.replace(/\((\d+)\)/, (_, num) => `(${parseInt(num) + 1})`);
        })
    }

    function saveChatHistory() {
        var chatHistory = $('#chat').html(); // Obtener HTML del chat
        try {
            setCookie('chatHistory', encodeURIComponent(chatHistory), 6); // Guardar en cookie
            // console.log('Historial del chat guardado correctamente.');
        } catch (error) {
            console.error('Error al guardar el historial del chat:', error);
        }
    }

    function loadChatHistory() {
        var chatHistory = getCookie('chatHistory'); // Obtener la cookie
        if (chatHistory) {
            try {
                chatHistory = decodeURIComponent(chatHistory); // Decodificar correctamente
                $('#chat').html(chatHistory);
                scrollToBottom();
                // console.log('Historial del chat cargado correctamente.');
            } catch (error) {
                console.error('Error al cargar el historial del chat:', error);
            }
        }
    }

    // Cargar el listado de productos
    function loadProductList() {
        var productIds = getCookie('productIds');
        // console.log('productIds:', productIds);
        if (productIds) {
            productIds = JSON.parse(productIds);
            // console.log('productIds json parse:', productIds);
            searchProductsByIds(productIds);
        }
    }

    // Limpiar el historial del chat
    function clearChat() {
        $('#chat').html('');
        setCookie('chatHistory', '', -1);
        setCookie('productIds', '', -1);
        setCookie('threadId', '', -1);
    }

    // Función para hacer scroll hasta el final del chat
    function scrollToBottom() {
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    }

    // Función para obtener el valor de una cookie
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    // Función para establecer una cookie
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
});
