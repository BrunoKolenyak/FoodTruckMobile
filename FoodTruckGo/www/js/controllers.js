app.controller('LoginCtrl', function($scope, $state, $ionicAuth, $ionicUser){

  $scope.login = function(usuario){
      $ionicAuth.login('basic', usuario).then(function(usuario){

          $ionicUser.set('data', new Date().toISOString());
          $ionicUser.save();

          $state.go('cliente.localizar')

      });
  }

});

app.controller('ClienteCtrl', function($scope, $state){


});

app.controller('RegistroCtrl', function($scope, $ionicAuth, $ionicPopup, $state, $firebaseArray){


    
    $scope.salvar = function(usuario){


    debugger;


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