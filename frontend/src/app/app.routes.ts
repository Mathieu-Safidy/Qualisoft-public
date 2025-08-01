import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Parametrage } from './pages/parametrage/parametrage';
import { Corp } from './component/corp/corp';
import { Container } from './component/container/container';
import { ProjectList } from './component/project-list/project-list';
import { ProjectDetail } from './component/project-detail/project-detail';
import { ApiDataResolver } from './service/ApidataResolver';
import { ObjectifQualite } from './component/objectif-qualite/objectif-qualite';
import { Stepper } from './component/stepper/stepper';
import { Login } from './pages/login/login';
import { DetailProjectResolver } from './service/DetailProjectResolver';
import { Recap } from './pages/recap/recap';


export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: 'Acceuil',
        component: Corp, // ton layout principal
        children: [
            { path: '', component: Acceuil }, // => /
            { path: 'recap' , component: Recap }, // => /recap
            {
                path: 'parametrage',
                component: Parametrage,
                children: [
                    {
                        path: '', component: ProjectList,
                        resolve: {
                            projects: ApiDataResolver
                        }
                    },
                    { 
                        path: 'projet/:id', 
                        component: Stepper, 
                        resolve: {
                            data : DetailProjectResolver
                        }
                    },
                    { path: 'projet/:id/objectif', component: ObjectifQualite } // => /parametrage/projet/detail
                ]
            }, // => /parametrage
             // => /login
        ]
    },
];
