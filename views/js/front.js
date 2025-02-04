var url_ajax = document.querySelector('#url').textContent;
var defaultImageUrl = '/img/p/es-default-home_default.jpg'; // URL de la imagen por defecto
var baseUrl = window.location.protocol + "//" + window.location.host + "/";

$(document).ready(function () {
    loadChatHistory();

    // Buscar productos al cargar la página si hay un término inicial
    var initialSearch = $('#search').val();
    if (initialSearch.length > 0) {
        searchProduct(initialSearch);
    }

    // Buscar productos al presionar Enter
    $('#search').on('keypress', function (event) {
        if (event.key === 'Enter') {
            searchProduct($(this).val());
        }
    });

    // Limpiar chat
    $('#clear-chat').on('click', function () {
        clearChat();
    });

    // Mostrar el chat en versión móvil y tablet
    $('.floating-chat-button').on('click', function () {
        $('.chat-column').addClass('open');
        $(this).hide();
    });

    // Cerrar el chat en versión móvil y tablet
    $('.close-chat').on('click', function () {
        $('.chat-column').removeClass('open');
        $('.floating-chat-button').show();
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
});

// Función para buscar productos
function searchProduct(buscar) {
    var res = '';
    if (buscar.length > 0) {
        $.ajax({
            type: "POST",
            url: url_ajax,
            data: { 'search': buscar },
            dataType: "json",
            success: function (response) {
                var productIds = [];
                if (response.length > 0) {
                    $.each(response, function (i, v) {
                        productIds.push(v.id_product);
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
                updateChat(buscar, productIds);
                $('#search').val('').focus(); // Limpiar el input y hacer focus
                updateURL(buscar); // Actualizar la URL sin recargar la página

                // Ocultar el chat en versión móvil si está abierto
                if ($(window).width() <= 768 && $('.chat-column').hasClass('open')) {
                    $('.chat-column').removeClass('open');
                    $('.floating-chat-button').show();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // console.error('Error al buscar productos:', textStatus, errorThrown);
                alert('Hubo un error al buscar productos. Revisa la consola para más detalles.');
            }
        });
    } else {
        $('#result').html('');
        $('#no-results').hide();
        updateURL(''); // Limpiar la URL si no hay búsqueda
    }
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
            // console.error('Error al agregar a favoritos:', error);
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
            // console.error('Error al agregar al comparador:', error);
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

// Función para actualizar el chat con la búsqueda
function updateChat(searchQuery, productIds) {
    var userMessage = `<div class="message user">${searchQuery}</div>`;
    var botMessage = `<div class="message bot">Productos encontrados: ${productIds.join(', ')}</div>`;
    if (!isDuplicateMessage(userMessage, botMessage)) {
        $('#chat').append(userMessage).append(botMessage);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
        saveChatHistory();
    }
}

// Verificar si los mensajes son duplicados
function isDuplicateMessage(userMessage, botMessage) {
    var lastUserMessage = $('#chat .message.user').last().html();
    var lastBotMessage = $('#chat .message.bot').last().html();
    return lastUserMessage === $(userMessage).html() && lastBotMessage === $(botMessage).html();
}

// Guardar el historial del chat
function saveChatHistory() {
    var chatHistory = $('#chat').html();
    localStorage.setItem('chatHistory', chatHistory);
}

// Cargar el historial del chat
function loadChatHistory() {
    var chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
        $('#chat').html(chatHistory);
        $('#chat').scrollTop($('#chat')[0].scrollHeight);
    }
}

// Limpiar el historial del chat
function clearChat() {
    $('#chat').html('');
    localStorage.removeItem('chatHistory');
}

// Función para actualizar la URL sin recargar la página
function updateURL(searchQuery) {
    var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
    if (searchQuery.length > 0) {
        newURL += '?search=' + encodeURIComponent(searchQuery);
    }
    history.pushState({ path: newURL }, '', newURL);
}

// Cargar la búsqueda desde la URL al cargar la página
$(window).on('load', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var searchQuery = urlParams.get('search');
    if (searchQuery) {
        $('#search').val(searchQuery);
        searchProduct(searchQuery);
    }
});

// Función para ajustar la altura de full-screen-container
function adjustFullScreenContainerHeight() {
    var mainPageContentHeight = $('#main-page-content').outerHeight();
    var newHeight = 'calc(100vh - ' + mainPageContentHeight + 'px)';
    $('.full-screen-container').css('height', newHeight);
}
