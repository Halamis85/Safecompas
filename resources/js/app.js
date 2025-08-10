import $ from 'jquery';
window.$ = window.jQuery = $;
import '@fortawesome/fontawesome-free/js/all.min.js';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import 'datatables.net-responsive-dt';
import 'bootstrap';
import './layout.js';
import './notifications.js';





if (document.body.classList.contains('dashboard-home')) {
    Promise.all([
    import('./menuoopp.js'),
    import('./statistika_grafy.js')
    ])
    .then(([menuModul,statistikaModul]) => {
        menuModul.menuoopp();
        statistikaModul.statik();
    })
        .catch(error => {
            console.error("Chyba při dynamickém importu:", error);
        });
}


if (document.getElementById('clock')){
    import('./clock.js') .then(module => {
        module.init();
    });
}

if (document.body.classList.contains('prehled')) {
    import('./prehledObjednavek.js').then(module => {
        module.prehled();
    });
}

if (document.body.classList.contains('')) {
    import('./newobjednavka.js').then(module => {
        module.objednavka();
    });
}

if (document.body.classList.contains('karta-zamestnance')) {
    Promise.all([
        import('./cardEmploee.js'),
    ])
        .then(([menuModul]) => {
            menuModul.cardEmploee();
        })
        .catch(error => {
            console.error("Chyba při dynamickém importu:", error);
        });
    }

if (document.body.classList.contains('administrace')) {
    Promise.all([
        import('./administraceAll.js'),
    ])
        .then(([Modul,]) => {
            Modul.administraceAll();
        })
        .catch(error => {
            console.error("Chyba při dynamickém importu:", error);
        });
}

if (document.body.classList.contains('employee-list')) {
    Promise.all([
        import('./employeeList.js'),
    ])
        .then(([Modul,]) => {
            Modul.employeeList();
        })
        .catch(error => {
            console.error("Chyba při dynamickém importu:", error);
        });
}
