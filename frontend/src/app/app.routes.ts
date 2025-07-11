import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Parametrage } from './pages/parametrage/parametrage';
import { Corp } from './component/corp/corp';
import { Container } from './component/container/container';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGear, faUser, faHome } from '@fortawesome/free-solid-svg-icons';

export const routes: Routes = [
    {
        path: '',
        component: Container, // ton layout principal
        children: [
            { path: '', component: Acceuil }, // => /
            { path: 'parametrage', component: Parametrage } // => /parametrage
        ]
    },
];
