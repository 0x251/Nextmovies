<?php
require_once __DIR__ . '/app/index/indexRoutes.php';

error_reporting(E_ALL & ~E_DEPRECATED);

// NextMovies Public Routes
IndexRoutes::index();


// NextMovies Admin Routes
// TODO: Add Admin Routes

