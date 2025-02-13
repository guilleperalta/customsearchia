<div class="search-container">
    <input type="text" id="header-search-desktop" class="form-control"
        placeholder="Busca productos, marcas, tiendas,..." onkeypress="redirectToSearchDesktop(event)" />
    <i class="fa fa-search search-icon"></i>
</div>
<script>
    function redirectToSearchDesktop(event) {
        if (event.key === 'Enter') {
            var searchQuery = document.getElementById('header-search-desktop').value;
            document.cookie = "initialMessage=" + encodeURIComponent(searchQuery) + "; path=/";
            window.location.href = '{$custom_search_url|escape:'html':'UTF-8'}';
        }
    }
</script>
<style>
    #header-search-desktop {
        background-color: #F5F5F5;
        border: none;
        color: #999999;
        padding: 10px 20px;

        &::placeholder {
            color: #999999;
        }
    }

    .search-container {
        position: relative;
        display: flex;
        align-items: center;
    }

    .search-icon {
        position: absolute;
        right: 20px;
        color: black;
    }
</style>