app.controller('LoginCtrl', function($scope, $state, $ionicAuth, $ionicUser){

  $scope.login = function(usuario){
      $ionicAuth.login('basic', usuario).then(function(usuario){

          $ionicUser.set('data', new Date().toISOString());
          $ionicUser.save();

          $state.go('cliente.localizar')

      });
  }

});

app.controller('ClienteCtrl', function($scope, $state, $cordovaGeolocation){
    
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

app.controller('RegistroCtrl', function($scope, $ionicAuth, $ionicPopup, $state, $firebaseArray){


    
    $scope.salvar = function(usuario){


    $ionicAuth.signup(usuario).then(
      function(){
        
        var ref = firebase.database().ref('users');
        
        delete usuario.password;

        $firebaseArray(ref).$add(usuario).then(function() {

          $state.go('login');

        });

      }, function(error){
          
        if(error.details[0] === "required_email"){
          $ionicPopup.alert({
                    title: 'Erro de Cadastro',
                    template: 'O campo de e-mail é obrigatório'
          });
        } else if (error.details[0] === "conflict_email") {
          $ionicPopup.alert({
                    title: 'Erro de Cadastro',
                    template: 'E-mail já cadastrado'
          });
        }

        usuario.name = '';
        usuario.email = '';
        usuario.password = '';

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