<?php

require_once __DIR__ . '/../../vendor/autoload.php';

class IndexRoutes {
    private static $route;

    public static function initializeRoute() {
        self::$route = new \Klein\Klein();
    }

    public static function index() {
        self::initializeRoute();

        self::$route->respond('GET', '/', function() {
            require __DIR__ . '/../../pages/home.php';
        });

        self::$route->respond('GET', '/movie/[i:id]', function($request) {
            $id = self::santize_input($request->param('id'));
            // TODO: implment render page
        });

        self::dispatch();
    }


    private static function santize_input($input) {
        return htmlspecialchars($input);
    }

    private static function cache_storage() {
        // TODO: implment cache storage, for Home, Search, TV show's
    }

    public static function dispatch() {
        self::$route->dispatch();
    }
}
