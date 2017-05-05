app.controller('LoginCtrl', function($scope, $state, $firebaseAuth, $ionicLoading, $ionicPopup){

  $scope.usuario = {};

  $scope.authObj = $firebaseAuth();

  var firebaseUser = $scope.authObj.$getAuth();

  if (firebaseUser) {
    $state.go('cliente.localizar');
  }


  $scope.login = function(usuario){

    $ionicLoading.show({template: 'Loading...'});

    debugger;

    $scope.authObj.$signInWithEmailAndPassword(usuario.email, usuario.password)
          .then(function(firebaseUser){
              console.log("Signed in as:", firebaseUser);
              $ionicLoading.hide();
              $state.go('cliente.localizar');
          }).catch(function(error){
              $ionicLoading.hide();
              $ionicPopup.alert({
                  title: 'Falha no Login',
                  template: 'Email ou Senha invalidos'
              });
          });
  }

});

app.controller('ClienteCtrl', function($scope, $state, $cordovaGeolocation, $ionicAuth){
    
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

    $scope.logout = function(){
      $ionicAuth.logout();
      $state.go('login');
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

                addUsuario(firebaseUser, usuario);
                $state.go('login');

            }).catch(function(error) {
                debugger;
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

        debugger;
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




    
  //   $scope.salvar = function(usuario){
        
  //       if (usuario.tipo == undefined){
  //         $ionicPopup.alert({
  //                   title: 'Dados Insuficientes',
  //                   template: 'Preencha todos os dados'

  //         });

  //         return;
  //       }


  //   $ionicAuth.signup(usuario).then(
  //     function(){
        
  //       var ref = firebase.database().ref('users');
  //       delete usuario.password;

  //       $firebaseArray(ref).$add(usuario).then(function() {

  //         $state.go('login');

  //         usuario.name = "";
  //         usuario.email = "";

  //       });

  //     }, function(error){
          
  //       if (error.details[0] === "conflict_email") {
  //         $ionicPopup.alert({
  //                   title: 'Erro de Cadastro',
  //                   template: 'E-mail já cadastrado'
  //         });
  //       }  

  //     });
  // }

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

app.controller('PerfilCtrl', function($scope){

});