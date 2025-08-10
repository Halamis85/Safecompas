<?php


namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    // ✅ Důležité!

    protected $fillable = [
        'name', 'email', 'password', 'username',
        'firstname', 'lastname', 'alias', 'role'
    ];

    // Email pro notifikace
    public function routeNotificationForMail($notification)
    {
        return $this->email;
    }
}
