'use strict';
angular.module('main', [
    'ionic',
    'ngCordova',
    'ui.router',
    // TODO: load other modules selected during generation
    'firebase', 'firebase.auth', 'firebase.ref', 'uiGmapgoogle-maps', 'geolocation', 'ngAnimate'
])
    .config(function($stateProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $stateProvider.stateAuthenticated = function(name, route) {
        route.resolve = route.resolve || {};
        route.resolve.user = ['Auth', function(Auth) {
            return Auth.$requireAuth();
        }];
        $stateProvider.state(name, route);
        SECURED_ROUTES[name] = true;
        return $stateProvider;
    };
})

    .config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

    console.log('Allo! Allo from your module: ' + 'main');

    // ROUTING with ui.router
    $urlRouterProvider.otherwise('/app/login');

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDafVik8cZu3dX2OWQ4vIIrjK4OWPQ5ea0',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });

    $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
        .state('main.list', {
        url: '/list',
        views: {
            'pageContent': {
                templateUrl: 'main/templates/list.html',
                // controller: '<someCtrl> as ctrl'
            }
        }
    })
        .state('main.listDetail', {
        url: '/list/detail',
        views: {
            'pageContent': {
                templateUrl: 'main/templates/list-detail.html',
                // controller: '<someCtrl> as ctrl'
            }
        }
    })
        .state('main.debug', {
        url: '/debug',
        views: {
            'pageContent': {
                templateUrl: 'main/templates/debug.html',
                controller: 'DebugCtrl as ctrl'
            }
        }
    })
        .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'main/templates/menu.html',
        controller: 'MenuCtrl as vm'
    })

        .stateAuthenticated('app.newwish', {
        url: '/new-wish',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/new-wish.html',
                controller: 'NewWishCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.wish', {
        url: '/wishes/:id',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/wish.html',
                controller: 'WishCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.wishes', {
        url: '/wishes',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/wishes.html',
                controller: 'WishesCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.chats', {
        url: '/chats',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/chats.html',
                controller: 'ChatsCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.chat', {
        url: '/chats/:chat',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/chat.html',
                controller: 'ChatCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.profil', {
        url: '/profil/:id',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/profil.html',
                controller: 'ProfilCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.around', {
        url: '/around',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/around.html',
                controller: 'AroundCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/settings.html',
                controller: 'SettingsCtrl as vm'
            }
        }
    })
        .stateAuthenticated('app.account', {
        url: '/account',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/account.html',
                controller: 'AccountCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.friends', {
        url: '/friends',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/friends.html',
                controller: 'FriendsCtrl as vm'
            }
        }
    })
        .stateAuthenticated('app.infos', {
        url: '/infos',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/infos.html',
                controller: 'InfosCtrl as vm'
            }
        }
    })
        .stateAuthenticated('app.pref', {
        url: '/pref',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/pref.html',
                controller: 'PrefCtrl as vm'
            }
        }
    })
        .stateAuthenticated('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/about.html',
                controller: 'PrefCtrl as vm'
            }
        }
    })

        .stateAuthenticated('app.intro', {
        url: '/intro',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/intro.html',
                controller: 'IntroCtrl as vm'
            }
        }
    })
        .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'main/templates/login.html',
                controller: 'LoginCtrl as vm'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
})

    .run(function($rootScope, $state, $ionicPlatform, User, Auth, SECURED_ROUTES) {

    function check(user) {
        if( !user && authRequired($state.current.name) ) {
            $state.go('app.login');
        }
    }
    
    // watch for login status changes and redirect if appropriate
    Auth.$onAuth(check);

    // some of our routes may reject resolve promises with the special {authRequired: true} error
    // this redirects to the login page whenever that is encountered
    $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if( err === 'AUTH_REQUIRED' ) {
            $state.go('app.login');
        }
    });


    function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
    }

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.Bar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

    .constant('SECURED_ROUTES', {});
