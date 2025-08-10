<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\ObjednavkyController;
use App\Http\Controllers\API\ZamestnanciController;
use App\Http\Controllers\API\ProduktyController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\HolidayController;
use App\Http\Controllers\API\ExternalApiController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\API\StatistikaController;
// Auth routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

// Moje šablony
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/mew_orders', [HomeController::class, 'menuOrd'])->name('menuorders');
    Route::get('/prehled', [HomeController::class, 'prehlOders'])->name('prehlobj');
    Route::get('/employee_list', [HomeController::class, 'employeeList']);
    Route::get('/users', [HomeController::class, 'users']);
    Route::get('/admin', [HomeController::class, 'admin']);
    Route::get('/user_aktivity', [HomeController::class, 'userAktivity']);
    Route::get('/cards', [HomeController::class, 'cardsEmploy'])->name('cards');
    Route::get('/email_contact', [HomeController::class, 'emailContact']);
    Route::get('/admin_employee', [HomeController::class, 'adminEmployee']);
    //Api php
    Route::get('/objednavkyMenu', [ObjednavkyController::class, 'getAktivni']);
    Route::get('/weather/current', [ExternalApiController::class, 'weather']);
    Route::get('/holidays', [HolidayController::class, 'index']);
    Route::get('/alloders', [ObjednavkyController::class, 'getAktivni']);
//objednavky přehled
    Route::post('/delete', [ObjednavkyController::class, 'delete']);
    Route::post('/vydat', [ObjednavkyController::class, 'vydat']);
    Route::post('/objednat', [ObjednavkyController::class, 'objednat']);
//objednavky nová
    Route::get('/zamestnanci', [ZamestnanciController::class, 'search']);
;   Route::get('/zamestnanci/{zamestnanec_id}/objednavky-vydane', [ZamestnanciController::class, 'getObjednavkyVydane']);
    Route::get('/druhy', [ProduktyController::class, 'getDruhy']);
    Route::get('/druhy/{id}/produkty', [ProduktyController::class, 'getProduktyByDruh']);
    Route::get('/produkty/{id}', [ProduktyController::class, 'show']);
    Route::get('/last-info', [ObjednavkyController::class, 'getLastInfo']);
    Route::post('/odeslat-objednavku', [ObjednavkyController::class, 'store']);
    // pro notification zvoneček
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    // Grafy a statistiky
    Route::get('/statistiky', [StatistikaController::class, 'data'])->name('statistiky.data');
    Route::get('/statistiky/vydaje', [StatistikaController::class, 'vydajeZaRok'])->name('statistiky.vydaje');
    Route::get('/statistiky/souhrn', [StatistikaController::class, 'souhrn'])->name('statistiky.souhrn');
    Route::get('/statistiky/strediska',[StatistikaController::class, 'podleStredisek'])->name('statistiky.strediska');
    Route::get('/statistiky/trend', [StatistikaController::class, 'trendObjednavek'])->name('statistiky.trend');
    //Editace uživatelů v administrator sekce
    Route::get('/adminUser', [UserController::class, 'index']);
    Route::post('/add_users', [UserController::class, 'store']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/send-login-email', [UserController::class, 'sendLoginEmail'])->name('send.login.email');
    Route::get('/userActivity', [UserController::class, 'getUserActivity']);
    // Zaměstnanci v administrator sekci
    Route::get('/employee', [ZamestnanciController::class, 'index']);
    Route::post('/employeeAdd', [ZamestnanciController::class, 'store']);
    Route::delete('/employee/{id}', [ZamestnanciController::class, 'destroy']);
