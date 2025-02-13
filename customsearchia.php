<?php
// To blocked when the file it's execute without Prestashop's context
if (!defined('_PS_VERSION_')) {
    exit;
}

class Customsearchia extends Module
{
    public function __construct()
    {
        $this->name = 'customsearchia';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Guille P';
        $this->ps_versions_compliancy = [
            'min' => '1.7',
            'max' => _PS_VERSION_,
        ];
        $this->need_instance = 1;
        $this->bootstrap = true;
        parent::__construct();
        $this->displayName = $this->l('Buscador de productos en tiempo real');
        $this->description = $this->l('Con este modulo podemos hacer un listado de productos en el front');
        $this->confirmUninstall = $this->l('Esta seguro que quiere eliminar el modulo? :(');
        if (!Configuration::get('BUSCADOR_CUSTOMSEARCHIA')) {
            $this->warning = $this->l('No se encontro el dato');
        }
    }

    // Aca generamos el install del modulo
    public function install()
    {
        if (Shop::isFeatureActive()) {
            Shop::setContext(Shop::CONTEXT_ALL);
        }
        parent::install();
        $this->registerHook('displayHeader');
        $this->registerHook('displayHeaderCenter');
        $this->registerHook('displayCustomSearchButton');
        Configuration::updateValue('BUSCADOR_CUSTOMSEARCHIA', 'Buscador Customsearchia');
        Configuration::updateValue('BUSCADOR_CUSTOMSEARCHIA_PATH','/modules/'.$this->name);
        Configuration::updateValue('BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK','');
        return true;
    }
        
    // Aca generamos el uninstall del modulo
    public function uninstall()
    {
        parent::uninstall(); 
        $this->unregisterHook('displayHeader');
        $this->unregisterHook('displayHeaderCenter');
        $this->unregisterHook('displayCustomSearchButton');
        Configuration::deleteByName('BUSCADOR_CUSTOMSEARCHIA');
        Configuration::deleteByName('BUSCADOR_CUSTOMSEARCHIA_PATH');
        Configuration::deleteByName('BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK');
        return true;
    }
    
    // En este hook mostramos un botón que redirige a la vista personalizada
    public function hookDisplayHeaderCenter()
    {
        $custom_search_url = $this->context->link->getModuleLink('customsearchia', 'searchia');
        $this->context->smarty->assign(array(
            'custom_search_url' => $custom_search_url,
        ));
        return $this->display(__FILE__, 'views/templates/front/search-input.tpl');
    }

    // Hook personalizado para mostrar el botón de búsqueda
    public function hookDisplayCustomSearchButton()
    {
        $custom_search_url = $this->context->link->getModuleLink('customsearchia', 'searchia');
        $this->context->smarty->assign(array(
            'custom_search_url' => $custom_search_url,
        ));
        return $this->display(__FILE__, 'views/templates/front/search-input-mobile.tpl');
    }

    // // Función para buscar productos en la base de datos
    // public function searchProducts($search)
    // {
    //     $words = explode(' ', $search);
    //     $conditions = array_map(function($word) {
    //         return '(pl.name LIKE "%' . pSQL($word) . '%" OR tp.reference LIKE "%' . pSQL($word) . '%")';
    //     }, $words);
    //     $whereClause = implode(' OR ', $conditions);

    //     $products = Db::getInstance()->executeS('SELECT pl.id_product, pl.name, tp.price
    //     FROM '._DB_PREFIX_.'product_lang pl
    //     JOIN '._DB_PREFIX_.'product tp ON (pl.id_product = tp.id_product)
    //     WHERE pl.id_lang = '.(int)$this->context->language->id.' 
    //     AND pl.id_shop = '.(int)$this->context->shop->id.' 
    //     AND tp.active = 1 
    //     AND (' . $whereClause . ')');

    //     foreach ($products as &$product) {
    //         $product['image'] = $this->getProductImageUrl($product['id_product']);
    //         $product['is_wishlist'] = $this->isProductInWishlist($product['id_product']);
    //         $product['is_compare'] = $this->isProductInCompare($product['id_product']);
    //     }

    //     return $products;
    // }

    // Función para buscar productos por IDs
    public function searchProductsByIds($productIds)
    {
        $ids = implode(',', array_map('intval', $productIds));
        $products = Db::getInstance()->executeS('SELECT pl.id_product, pl.name, tp.price
        FROM '._DB_PREFIX_.'product_lang pl
        JOIN '._DB_PREFIX_.'product tp ON (pl.id_product = tp.id_product)
        WHERE pl.id_lang = '.(int)$this->context->language->id.' 
        AND pl.id_shop = '.(int)$this->context->shop->id.' 
        AND tp.active = 1 
        AND tp.id_product IN (' . $ids . ')');

        // Crear un array asociativo con los productos
        $productsById = [];
        foreach ($products as &$product) {
            $product['image'] = $this->getProductImageUrl($product['id_product']);
            $product['is_wishlist'] = $this->isProductInWishlist($product['id_product']);
            $product['is_compare'] = $this->isProductInCompare($product['id_product']);
            $productsById[$product['id_product']] = $product;
        }

        // Reordenar los productos según el orden de $productIds
        $orderedProducts = [];
        foreach ($productIds as $id) {
            if (isset($productsById[$id])) {
                $orderedProducts[] = $productsById[$id];
            }
        }

        return $orderedProducts;
    }

    // Función para verificar si un producto está en la lista de deseos
    private function isProductInWishlist($id_product)
    {
        $sql = 'SELECT COUNT(*) FROM '._DB_PREFIX_.'iqitwishlist_product wp
                WHERE wp.id_product = '.(int)$id_product.'
                AND wp.id_customer = '.(int)$this->context->customer->id;
        return Db::getInstance()->getValue($sql) > 0;
    }

    // Función para verificar si un producto está en el comparador
    private function isProductInCompare($id_product)
    {
        $sql = 'SELECT COUNT(*) FROM '._DB_PREFIX_.'compare_product cp
                JOIN '._DB_PREFIX_.'compare c ON cp.id_compare = c.id_compare
                WHERE cp.id_product = '.(int)$id_product.'
                AND c.id_customer = '.(int)$this->context->customer->id;
        return Db::getInstance()->getValue($sql) > 0;
    }

    // Hook para agregar rutas personalizadas
    public function hookModuleRoutes($params)
    {
        return [
            'module-customsearchia-searchia' => [
                'controller' => 'searchia',
                'rule' => 'customsearch/{search}',
                'keywords' => [
                    'search' => ['regexp' => '[_a-zA-Z0-9-]+', 'param' => 'search'],
                ],
                'params' => [
                    'fc' => 'module',
                    'module' => 'customsearchia',
                ],
            ],
        ];
    }

    // Función para obtener la URL de la imagen de un producto
    private function getProductImageUrl($id_product)
    {
        $image = Db::getInstance()->getRow('SELECT id_image FROM '._DB_PREFIX_.'image WHERE id_product = '.(int)$id_product.' AND cover = 1');
        if ($image) {
            $id_image = $image['id_image'];
            $image_path = _PS_IMG_DIR_.'p/'.Image::getImgFolderStatic($id_image).$id_image.'.jpg';
            if (file_exists($image_path)) {
                return $this->context->link->getImageLink('product', $id_product.'-'.$id_image, 'home_default');
            }
        }
        return $this->context->link->getImageLink('product', 'default', 'home_default');
    }

    // Aca linkeamos nuestros archivos css y js al FRONT de la tienda
    public function hookDisplayHeader()
    {
        // Verificar si estamos en la vista personalizada del módulo
        if ($this->context->controller->php_self === 'module-customsearchia-searchia') {
            $this->context->controller->addJquery();
            $this->context->controller->addJS('modules/'.$this->name.'/views/js/front.js');
            $this->context->controller->addCSS('modules/'.$this->name.'/views/css/front.css', 'all');
        }
    }

    // Necesito agregar un formulario en el backoffice para poder agregar a la base la url del webhook

    public function getContent()
    {
        $output = null;
        if (Tools::isSubmit('submit'.$this->name)) {
            $url_webhook = strval(Tools::getValue('BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK'));
            if (!$url_webhook || empty($url_webhook) || !Validate::isGenericName($url_webhook)) {
                $output .= $this->displayError($this->l('Invalid Configuration value'));
            } else {
                Configuration::updateValue('BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK', $url_webhook);
                $output .= $this->displayConfirmation($this->l('Settings updated'));
            }
        }
        return $output.$this->displayForm();
    }

    public function displayForm()
    {
        // Get default language
        $default_lang = (int)Configuration::get('PS_LANG_DEFAULT');
        
        // Init Fields form array
        $fields_form[0]['form'] = [
            'legend' => [
                'title' => $this->l('Settings'),
            ],
            'input' => [
                [
                    'type' => 'text',
                    'label' => $this->l('URL Webhook'),
                    'name' => 'BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK',
                    'size' => 20,
                    'required' => true
                ]
            ],
            'submit' => [
                'title' => $this->l('Save'),
                'class' => 'btn btn-default pull-right'
            ]
        ];
        
        $helper = new HelperForm();
        
        // Module, t    oken and currentIndex
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex.'&configure='.$this->name;
        
        // Language
        $helper->default_form_language = $default_lang;
        $helper->allow_employee_form_lang = $default_lang;
        
        // Title and toolbar
        $helper->title = $this->displayName;
        $helper->show_toolbar = true;        // false -> remove toolbar
        $helper->toolbar_scroll = true;      // yes - > Toolbar is always visible on the top of the screen.
        $helper->submit_action = 'submit'.$this->name;
        $helper->toolbar_btn = [
            'save' => [
                'desc' => $this->l('Save'),
                'href' => AdminController::$currentIndex.'&configure='.$this->name.'&save'.$this->name.
                '&token='.Tools::getAdminTokenLite('AdminModules'),
            ],
            'back' => [
                'href' => AdminController::$currentIndex.'&token='.Tools::getAdminTokenLite('AdminModules'),
                'desc' => $this->l('Back to list')
            ]
        ];
        
        // Load current value
        $helper->fields_value['BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK'] = Configuration::get('BUSCADOR_CUSTOMSEARCHIA_URL_WEBHOOK');
        
        return $helper->generateForm($fields_form);
    }
}