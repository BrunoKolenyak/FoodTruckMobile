app.controller('LoginCtrl', function($scope, $state, $firebaseAuth, $ionicLoading, $ionicPopup, $firebaseObject){

  $scope.usuario = {};

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  if (firebaseUser) {
    validarUsuario(firebaseUser);
  }

  function validarUsuario(firebaseUser){
    //Fazer busca no banco para verificar se eh usuario
    var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/tipo');
        //Recuperar
        $firebaseObject(ref).$loaded(function(obj) {
            if (obj.$value == "cliente"){
              $state.go('cliente.localizar');
            } else {
              //Verificar se eh do tipo Truck
              ref = firebase.database().ref('trucks/' + firebaseUser.uid + '/tipo'); 
              $firebaseObject(ref).$loaded(function(obj) {
                if (obj.$value == "truck"){
                  $state.go('truck.home');
                }
              });

            }
       });
    
      console.log(firebaseUser.providerData[0].email);
  }
  

  $scope.login = function(usuario){

    $ionicLoading.show({template: 'Loading...'});

    $scope.authObj.$signInWithEmailAndPassword(usuario.email, usuario.password)
          .then(function(firebaseUser){
              $ionicLoading.hide();
              validarUsuario(firebaseUser);
          }).catch(function(error){
              $ionicLoading.hide();
              $ionicPopup.alert({
                  title: 'Falha no Login',
                  template: 'Email ou Senha invalidos'
              });
          });
  }
});

app.controller('ClienteCtrl', function($scope, $firebaseAuth, $state, $cordovaGeolocation){

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  $scope.logout = function(){
    $scope.authObj.$signOut();
    $state.go('login');
  }
    
    $scope.verificarLocalizacao = function(){

      var posOptions = {timeout: 10000, enableHighAccuracy: false};

      var latitude = null;
      var longitude = null;

      $cordovaGeolocation.getCurrentPosition(posOptions)
          .then(function (position) {
            latitude  = position.coords.latitude
            longitude = position.coords.longitude
            console.log(latitude + ' ' + longitude)
      }, function(err) {
          console.log(err)
      });


      var watchOptions = {timeout : 3000, enableHighAccuracy: false};
      var watch = $cordovaGeolocation.watchPosition(watchOptions);

      watch.then(
        null,
    
        function(err) {
          console.log(err)
        },
    
        function(position) {
          latitude  = position.coords.latitude
          longitude = position.coords.longitude          
          console.log(latitude + ' ' + longitude)

          if(latitude != null && longitude != null){
            $state.go('mapa', {lat: latitude, long: longitude});
          }
        }
      );
    }

});

app.controller('RegistroCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $firebaseAuth, $firebaseObject){

  $scope.usuario = {};

  $scope.authObj = $firebaseAuth();

  $scope.salvar = function(usuario) {

    $ionicLoading.show({template: 'Salvando...'});

    if (usuario.tipo == undefined){
      $ionicLoading.hide();

      $ionicPopup.alert({
          title: 'Dados Insuficientes',
          template: 'Preencha todos os dados'

      });

      return;
    }

      $scope.authObj.$createUserWithEmailAndPassword(usuario.email, usuario.password)
            .then(function(firebaseUser) {

                $ionicLoading.hide();

                console.log("User " + firebaseUser.uid + " created successfully!");

                if(usuario.tipo == "cliente"){
                  addUsuario(firebaseUser, usuario);
                } else if (usuario.tipo == "truck"){
                  addTruck(firebaseUser, usuario);
                }
                $state.go('login');

            }).catch(function(error) {
                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Falha no Registro',
                    template: error
                });
            });
  }

  function addUsuario(firebaseUser, usuario) {

        var ref = firebase.database().ref('usuarios/' + firebaseUser.uid);

        var obj = $firebaseObject(ref);

        obj.displayName = usuario.name;
        obj.email = firebaseUser.email;
        obj.tipo = usuario.tipo;
        obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            console.log('Usuário criado na base de dados');
        }, function(error) {
            console.log("Error:", error);
        });
  }

  function addTruck(firebaseUser, usuario) { 

    var ref = firebase.database().ref('trucks/' + firebaseUser.uid);

    var obj = $firebaseObject(ref);

    obj.displayName = usuario.name;
    obj.email = firebaseUser.email;
    obj.tipo = usuario.tipo;

    obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            console.log('Truck criado na base de dados');
        }, function(error) {
            console.log("Error:", error);
        });

  }

});

app.controller('MapaCtrl', function($scope, $state, $stateParams){

      
    //Captura os Param
    var latitude = $stateParams.lat;
    var longitude = $stateParams.long;

   var uluru = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
      var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: uluru
        });
        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
        
});

app.controller('PerfilCtrl', function($scope, $firebaseAuth, $firebaseObject, $ionicLoading, $ionicPopup, $state){

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  $scope.usuario = angular.copy(firebaseUser);

  var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/displayName');

  $firebaseObject(ref).$loaded(function(obj){
      $scope.usuario.displayName = obj.$value;
  });

  $scope.atualizar = function(usuario){
    $ionicLoading.show({template: 'Salvando...'});

    firebaseUser.updateProfile({
      displayName: usuario.displayName
    }).then(function(response){
        $ionicLoading.hide();
        
        atualizarUsuario(usuario.displayName);
    }, function(error){
        $ionicLoading.hide();
        
        return;

    });
  } // fim do $scope.atualizar

  function atualizarUsuario(displayName) {
    var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/displayName');

    var obj = $firebaseObject(ref);

    obj.$value = displayName;

    obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
            //deslogar apos concluir a atualizacao
            $scope.authObj.$signOut();
            $ionicLoading.show({
              template: 'Atualizado com sucesso, você terá que logar novamente!',
              duration: 1000
            }).then(function(){
                $state.go('login');
            });
        }, function(error) {
            var alertPopup = $ionicPopup.alert({
                    title: 'Erro',
                    template: error
            });
    });
  } //Fim do atualizarUsuario()

  $scope.atualizarSenha = function(password) {
        $scope.authObj.$updatePassword(password)
            .then(function() {
                //deslogar apos concluir a atualizacao
            $scope.authObj.$signOut();
            $ionicLoading.show({
              template: 'Senha alterada com sucesso, você terá que logar novamente!',
              duration: 1000
            }).then(function(){
                $state.go('login');
            });
            }).catch(function(error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erro',
                    template: error
                });
            });
  }

});

app.controller('LocalizarCtrl', function($scope, $firebaseAuth, $firebaseObject){

  $scope.usuario = {};
  //Buscar o nome do Usuario que esta logado
  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  $scope.usuario = angular.copy(firebaseUser);

  var ref = firebase.database().ref('usuarios/' + firebaseUser.uid + '/displayName');

  $firebaseObject(ref).$loaded(function(obj){
      $scope.usuario.displayName = obj.$value;
  });

});

app.controller('TruckCtrl', function($scope, $firebaseAuth, $firebaseObject, $state){
  $scope.truck = {};

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  $scope.truck = angular.copy(firebaseUser);

  var ref = firebase.database().ref('trucks/' + firebaseUser.uid + '/displayName');

  $firebaseObject(ref).$loaded(function(obj){
      $scope.truck.displayName = obj.$value;
  });

  $scope.logout = function(){
    $scope.authObj.$signOut();
    $state.go('login');
  }
  
});

app.controller('PerfilTruckCtrl', function($scope, $firebaseAuth, $firebaseObject, $ionicLoading, $ionicPopup, $state){

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  $scope.truck = angular.copy(firebaseUser);

  var ref = firebase.database().ref('trucks/' + firebaseUser.uid + '/displayName');

  $firebaseObject(ref).$loaded(function(obj){
      $scope.truck.displayName = obj.$value;
  });

  $scope.atualizar = function(truck){
    $ionicLoading.show({template: 'Salvando...'});

    firebaseUser.updateProfile({
      displayName: truck.displayName
    }).then(function(response){
        $ionicLoading.hide();
        
        atualizarTruck(truck.displayName);
    }, function(error){
        $ionicLoading.hide();
        
        return;

    });
  } // fim do $scope.atualizar

  function atualizarTruck(displayName) {
    var ref = firebase.database().ref('trucks/' + firebaseUser.uid + '/displayName');

    var obj = $firebaseObject(ref);

    obj.$value = displayName;

    obj.$save().then(function(ref) {
            ref.key === obj.$id; // true

            //deslogar apos concluir a atualizacao
            $scope.authObj.$signOut();
            $ionicLoading.show({
              template: 'Atualizado com sucesso, você terá que logar novamente!',
              duration: 1000
            }).then(function(){
                $state.go('login');
            });
            
              
            
        }, function(error) {
            var alertPopup = $ionicPopup.alert({
                    title: 'Erro',
                    template: error
            });
    });
  } //Fim do atualizarTruck()

  $scope.atualizarSenha = function(password) {
        $scope.authObj.$updatePassword(password)
            .then(function() {
                //deslogar apos concluir a atualizacao
                $scope.authObj.$signOut();
                $ionicLoading.show({
                  template: 'Atualizado com sucesso, você terá que logar novamente!',
                  duration: 1000
                }).then(function(){
                    $state.go('login');
                });
            }).catch(function(error) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Erro',
                    template: error
                });
            });
  }

});