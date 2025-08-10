<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (!empty(session('user'))) {
            return redirect('/');
        }

        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        $user = DB::table('users')
            ->where('username', $request->username)
            ->first();

        if ($user && Hash::check($request->password, $user->password)) {
            session(['user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role ?? 'user',
                'firstname' => $user->firstname ?? '',
                'lastname' => $user->lastname ?? '',
                'alias' => $user->alias ?? null
            ]]);

            return redirect('/');
        }

        return back()->withErrors(['login' => 'Neplatné údaje.']);
    }

    public function logout()
    {
        // POUZE tohle - nic víc!
        session()->forget('user');
        session()->flush(); // Vymaž celou session

        return redirect('/login')->with('success', 'Byli jste odhlášeni.');
    }
}
