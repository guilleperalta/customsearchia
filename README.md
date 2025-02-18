# Customsearchia

## Descripción

Customsearchia es un módulo para PrestaShop que habilita un chat con inteligencia artificial (IA) para buscar productos en la tienda. Este módulo permite a los usuarios interactuar con un asistente virtual para encontrar productos de manera rápida y eficiente.

## Funcionalidades

- **Búsqueda de productos**: Permite a los usuarios buscar productos, marcas y tiendas a través de un chat con IA.
- **Notificaciones en el chat**: Muestra notificaciones en el chat para mejorar la experiencia del usuario.
- **Integración con listas de deseos y comparador**: Verifica si un producto está en la lista de deseos o en el comparador.
- **Formulario de configuración**: Permite configurar la URL del webhook desde el backoffice.

## Características

- **Compatibilidad**: Compatible con PrestaShop 1.7 y versiones superiores.
- **Interfaz amigable**: Diseño intuitivo y fácil de usar tanto en dispositivos móviles como en escritorio.
- **Personalización**: Permite personalizar la URL del webhook y otros parámetros desde el backoffice.
- **Integración con AJAX**: Utiliza AJAX para cargar productos y manejar las interacciones del chat sin recargar la página.

## Instalación

1. **Descargar el módulo**: Descarga el módulo desde el repositorio o desde la página oficial.
2. **Subir el módulo**: Sube el archivo del módulo a la carpeta `modules` de tu instalación de PrestaShop.
3. **Instalar el módulo**: Ve al backoffice de PrestaShop, navega a `Módulos y Servicios`, busca `Customsearchia` y haz clic en `Instalar`.
4. **Configurar el módulo**: Después de instalar el módulo, ve a la configuración del módulo y agrega la URL del webhook.

## Uso

### Búsqueda de productos

1. **Buscar en escritorio**: Utiliza el campo de búsqueda en la parte superior de la página para buscar productos, marcas o tiendas. Presiona `Enter` para iniciar la búsqueda.
2. **Buscar en móvil**: Utiliza el campo de búsqueda en la versión móvil para buscar productos, marcas o tiendas. Presiona `Enter` para iniciar la búsqueda.

### Chat con IA

1. **Abrir el chat**: Haz clic en el botón flotante de chat para abrir el chat con el asistente virtual.
2. **Enviar mensajes**: Escribe tu mensaje en el campo de entrada del chat y presiona `Enter` o haz clic en el icono de enviar.
3. **Limpiar el chat**: Haz clic en el icono de la papelera para limpiar el historial del chat.

## Hooks Utilizados

- `displayHeader`: Para agregar archivos CSS y JS al front de la tienda.
- `displayHeaderCenter`: Para mostrar el campo de búsqueda en la cabecera.
- `displayCustomSearchButton`: Para mostrar el botón de búsqueda en la versión móvil.

## Desarrollo

### Estructura de Archivos

- **views/templates/front/search.tpl**: Plantilla principal para la búsqueda de productos.
- **views/templates/front/search-input.tpl**: Plantilla para el campo de búsqueda en escritorio.
- **views/templates/front/search-input-mobile.tpl**: Plantilla para el campo de búsqueda en móvil.
- **controllers/front/searchia.php**: Controlador para manejar la lógica de búsqueda.
- **customsearchia.php**: Archivo principal del módulo.

### Funciones Principales

- **searchProductsByIds**: Busca productos por sus IDs.
- **isProductInWishlist**: Verifica si un producto está en la lista de deseos.
- **isProductInCompare**: Verifica si un producto está en el comparador.
- **getProductImageUrl**: Obtiene la URL de la imagen de un producto.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para mejorar el módulo.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
