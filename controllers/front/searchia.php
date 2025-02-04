<?php

class CustomsearchiaSearchiaModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        parent::initContent();
        
        try {
            $base_url = (Configuration::get('PS_SSL_ENABLED') ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . __PS_BASE_URI__;
            $ajax_url = $base_url.'modules/customsearchia/ajax.php?token='.Tools::encrypt('customsearchia/ajax.php');
            
            if (!file_exists(_PS_MODULE_DIR_ . 'customsearchia/ajax.php')) {
                throw new Exception('El archivo ajax.php no existe.');
            }
            
            $search_query = Tools::getValue('search', '');
            
            $this->context->smarty->assign(array(
                'url_ajax' => $ajax_url,
                'search_query' => $search_query,
                'base_dir' => $base_url,
            ));
            
            $this->setTemplate('module:customsearchia/views/templates/front/search.tpl');
        } catch (Exception $e) {
            die('Error: ' . $e->getMessage());
        }
    }
}
