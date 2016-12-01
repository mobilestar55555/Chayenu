angular.module('app.controllers', ['ionic', 'data.sync', 'db_starter', 'ngSanitize', 'ionic-datepicker'])
.controller('parshaWeeklyOverviewCtrl', function($scope, $ionicScrollDelegate, $location, TextService, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService, $ionicHistory)
{

    var parsha_id = +window.localStorage['parsha_id'];
    var section_id = window.localStorage['last_section_id'];
    $scope.sttButton=false;
    $scope.date = window.localStorage["section_"+section_id];
    $scope.disable_days = [];
    $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_"+section_id]) || 0;
    $scope.selected_date = new Date($scope.date);
    $scope.parsha_title = $rootScope["section_"+section_id+"_selected_parsha_title"];
    $scope.section = window.localStorage['last_section_title'];
    $scope.sectionColor = window.localStorage['last_section_color'];
            
    $scope.$on('syncing-complete', function(event, args) {
       bindTextData();
    });
    $scope.scrollToTop = function() { //ng-click for back to top button
        $ionicScrollDelegate.scrollTop(true);
        $scope.sttButton=false;  //hide the button when reached top
    };
    $scope.scrollEvent = function() {
        $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
        if ($scope.scrollamount > 80) {
            $scope.$apply(function() {
                $scope.hideNavigation = true;
            });
        } else {
            $scope.$apply(function() {
                $scope.hideNavigation = false;
            });
        }
        var moveData = $scope.scrollamount;

        $scope.$apply(function(){
            if(moveData>300){
                $scope.sttButton=true;
            }else{
                $scope.sttButton=false;
            }
        }); //apply
    };
    $scope.showPrevData = function(){
        if($scope.weekly_index == 0){
            return false;
        }
        //        $scope.selected_date.setDate($scope.selected_date.getDate()-1);
        $scope.weekly_index = $scope.weekly_index - 1
        $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
        $scope.selected_date.setDate($scope.selected_date.getDate()+1)
        var date = $scope.selected_date.toDateString().slice(4,15);
        date = date.replace(date.substr(4,2), $scope.selected_date.getDate()+",");
        window.localStorage["section_"+section_id] = date;
        $scope.date = date;
        $rootScope["section_"+section_id+"_selected_date"] = date;
        bindTextData();
        window.localStorage["section_weekly_index_"+section_id] = $scope.weekly_index;
    }
            
    $scope.showNextData = function(){
        if($scope.weekly_index == $scope.parsha_days.length - 1){
            return false;
        }
        $scope.weekly_index = $scope.weekly_index + 1
        $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
        $scope.selected_date.setDate($scope.selected_date.getDate()+1)
        var date = $scope.selected_date.toDateString().slice(4,15);
        date = date.replace(date.substr(4,2), $scope.selected_date.getDate()+",");
        window.localStorage["section_"+section_id] = date;
        $scope.date = date;
        $rootScope["section_"+section_id+"_selected_date"] = date;
        bindTextData();
        window.localStorage["section_weekly_index_"+section_id] = $scope.weekly_index;
    }
    $scope.showDatePicker = function() {
        var selected_date = angular.copy($scope.selected_date);

        var ipObj1 = {
            callback: function (val) {  //Mandatory
                console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                var selected_dt = new Date(val)
                $scope.selected_date = angular.copy(selected_dt);
                var date = selected_dt.format("dddd, mmm, d, yyyy");
                window.localStorage["section_"+$stateParams['section_id']] = date;
                $scope.date = date;
                $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");

                bindTextData();
            },
            isDaily: false,
            dateFormat: 'MMMM dd, yyyy',
            from: $rootScope.st_date, //Optional
            to: $rootScope.ed_date, //Optional
            disabledDates: $scope.disable_days,
            inputDate: selected_date,      //Optional
            mondayFirst: false,          //Optional
            disableWeekdays: [0],       //Optional
            closeOnSelect: false,       //Optional
            disableWeekdays: [7],
            templateType: 'popup'       //Optional
        };
        ionicDatePicker.openDatePicker(ipObj1);
    };
            
            
    bindTextData();
    
    function bindTextData(){
       $ionicLoading.show({
           template: '<ion-spinner icon="ios"></ion-spinner>'
       });
        var parsha_id = 0;
        var selected_dt = $scope.selected_date
        $scope.parsha_days = [];
        
    
        ParshaService.getData(selected_dt)
        .then(function(result){
          stdt = new Date(result[0].start_date);
          eddt = new Date(result[0].end_date);
          $rootScope.st_date = stdt;
          $rootScope.ed_date = eddt;
          for (var i = 0; i < result.length; i++) {
              parsha = result[i];
              stdt = new Date(parsha.start_date);
              eddt = new Date(parsha.end_date);
              $rootScope.st_date = $rootScope.st_date > stdt ? stdt : $rootScope.st_date;
              $rootScope.ed_date = $rootScope.ed_date < eddt ? eddt : $rootScope.ed_date;
              $scope.parsha_days.push([stdt, eddt]);
              
              var temp_eddt = angular.copy(eddt);
              temp_eddt.setDate(temp_eddt.getDate()+1);
              
              if(temp_eddt >= selected_dt && selected_dt >= stdt){
                  parsha_id = parsha.ID;
                  $scope.parsha_title = parsha.text_eng;
                  $rootScope["section_"+section_id+"_selected_parsha_title"] = parsha.text_eng;
                  window.localStorage["section_"+section_id+"_selected_parsha_title"] = parsha.text_eng;
                  $rootScope.default_parsha_title = parsha.text_eng;
              }
          
          }
          if(parsha_id==0){
              parsha_id = result[0].ID;
              $scope.parsha_title = result[0].text_eng;
              $scope.selected_date = new Date(result[0].start_date);
              $scope.selected_date.setDate($scope.selected_date.getDate()+1)
              var date = $scope.selected_date.toDateString().slice(4,15);
              date = date.replace(date.substr(4,2), $scope.selected_date.getDate()+",");
              $scope.date = date;
              $rootScope["section_"+section_id+"_selected_parsha_title"] = result[0].text_eng;
              window.localStorage["section_"+section_id+"_selected_parsha_title"] = result[0].text_eng;
              $rootScope.default_parsha_title = result[0].text_eng;
          }
          var tmp_root_st_dt = angular.copy($rootScope.st_date);
          $rootScope.st_date.setDate(tmp_root_st_dt.getDate()+1);
          
          var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
          $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate()+1);
          
          var available_date = angular.copy($rootScope.st_date)
          var available = false;
          var disable_days = [];
          
          while (available_date < $rootScope.ed_date) {
              for(i=0; i<$scope.parsha_days.length; i++){
                  day_item = angular.copy($scope.parsha_days[i]);
                  day_item[1].setDate(day_item[1].getDate()+1);
                  day_item[0].setDate(day_item[0].getDate()+1);
                  if(day_item[1] >= available_date && available_date >= day_item[0]){
                  available = true;
                  break;
                  }
              }
              
              if(available == false){
                  disable_days.push(angular.copy(available_date));
              }
              available = false;
              available_date.setDate(available_date.getDate()+1);
          }
          $scope.disable_days = disable_days;
          TextService.getData(parsha_id, section_id, $scope.date).then(function(result){
               $scope.textData = result;
               $ionicLoading.hide();
               });
          });
    
    }
})
.controller('parshaOverviewMaaseiCtrl', function($scope, $ionicScrollDelegate, $ionicModal, $rootScope, SectionService, $state, TextService, ParshaService, $ionicLoading, ionicDatePicker, $ionicHistory) {
    $scope.selectedItem = window.localStorage['selected_font_size'] || "small";
    $rootScope.font_size = "font-size-"+$scope.selectedItem;
    $scope.disable_days = [];
    $scope.sectionColor = window.localStorage['last_section_color'] || "#da2b40";
    $scope.parsha_title = "";
    $scope.sttButton=false;
    $rootScope.hashtag = function() {
        if($rootScope.modal==undefined){
            $ionicModal.fromTemplateUrl('sidemenu.html', {
                scope: $rootScope,
                animation: 'slide-in-up',
                focusFirstInput: true
            }).then(function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            });
        }
    };
    
    $rootScope.openModal = function() {
        $rootScope.modal.show();
    };

    $rootScope.closeModal = function() {
        $rootScope.modal.hide();
    };

    $rootScope.$on('$destroy', function() {
        $rootScope.modal.remove();
    });

    $rootScope.$on('modal.hidden', function() {
//                $rootScope.modal.remove();
    });

    $scope.$on('modal.removed', function() {});
            
    $scope.scrollToTop = function() { //ng-click for back to top button
        $ionicScrollDelegate.scrollTop(true);
        $scope.sttButton=false;  //hide the button when reached top
    };
    $scope.scrollEvent = function() {
        $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
        if ($scope.scrollamount > 80) {
            $scope.$apply(function() {
                $scope.hideNavigation = true;
            });
        } else {
            $scope.$apply(function() {
                $scope.hideNavigation = false;
            });
        }
        var moveData = $scope.scrollamount;

        $scope.$apply(function(){
            if(moveData>300){
                $scope.sttButton=true;
            }else{
                $scope.sttButton=false;
            }
        }); //apply
    };

    $scope.$on('syncing-complete', function(event, args) {
        SectionService.getData().then(function(result){
            $scope.sectionData = result;
                                      
            if(!!window.localStorage['last_section_id']==true){
              if(window.localStorage['last_section_weekly'] == 1){
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });
                  $state.go('menu.parshaWeeklyOverview');
              }
            }else{
                if($scope.sectionData[0].weekly == 1){
                                      
//                    $ionicHistory.nextViewOptions({
//                        disableBack: true;
//                    });

                  window.localStorage['last_section_id'] = $scope.sectionData[0].ID;
                  window.localStorage['last_section_title'] = $scope.sectionData[0].title;
                  window.localStorage["section_"+result[0].ID] = new Date().toDateString().slice(4,15);
                  $ionicHistory.currentView($ionicHistory.backView());
                  $state.go('menu.parshaWeeklyOverview', {}, {location: 'replace'});
                  return false;
                }
            }
            bindTextData();
                                      
                                      
        });
    });
    
        $scope.showDatePicker = function() {
            var selected_date = angular.copy($scope.selected_date);
            var ipObj1 = {
                callback: function (val) {  //Mandatory
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    var selected_dt = new Date(val)
                    $scope.selected_date = angular.copy(selected_dt);
                    var date = selected_dt.format("dddd, mmm, d'th', yyyy");
                    window.localStorage["section_"+$scope.section_id] = date
                    $scope.date = date;
                    $rootScope["section_"+$scope.section_id+"_selected_date"] = date;
            
                    bindTextData();
                },
                selectedDateCallback: function(val){
                    console.log('select date : ' + val, new Date(val));
                },
                from: $rootScope.st_date, //Optional
                to: $rootScope.ed_date, //Optional
            
                disabledDates: $scope.disable_days,
                isDaily: true,
                dateFormat: 'MMMM dd, yyyy',
                inputDate: selected_date,      //Optional
                mondayFirst: false,          //Optional
                disableWeekdays: [0],       //Optional
                closeOnSelect: false,       //Optional
                disableWeekdays: [7],
                templateType: 'popup'       //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        
        
        $scope.showPrevData = function(){
            var dd = angular.copy($rootScope.st_date);
            if($scope.selected_date <= dd){
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate()-1);
            var date = $scope.selected_date.format("dddd, mmm, d'th', yyyy");
            window.localStorage["section_"+$scope.section_id] = date
            $scope.date = date;
            $rootScope["section_"+$scope.section_id+"_selected_date"] = date;
            
            bindTextData();
        }
        $scope.showNextData = function(){
            var dd = angular.copy($rootScope.ed_date);
            dd.setDate(dd.getDate()-1);
            if($scope.selected_date >= dd){
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate()+1);

            var date = $scope.selected_date.format("dddd, mmm, d'th', yyyy");
            window.localStorage["section_"+$scope.section_id] = date;
            $scope.date = date;
            $rootScope["section_"+$scope.section_id+"_selected_date"] = date;
            
            bindTextData();
        }

    
        function bindTextData(){
            $ionicLoading.show({
               template: '<ion-spinner icon="ios"></ion-spinner>'
            });
            var parsha_id = 0;
//            var section_id = $scope.sectionData[0].ID;
            
            $scope.section = window.localStorage["last_section_title"] || $scope.sectionData[0].title;
            var section_id = window.localStorage["last_section_id"] || $scope.sectionData[0].ID;
            $scope.parsha_title = window.localStorage["section_"+section_id+"_selected_parsha_title"];
            console.log('xxxxxxx'+window.localStorage["section_"+section_id+"_selected_parsha_title"])
            
            var dd = new Date().format("dddd, mmm, d'th', yyyy");
            var date = window.localStorage["section_"+section_id] || dd
            var parsha_days = [];
            
            var mini_date = new Date(MIN_DATE);
            var stored_date = new Date(date.replace('th,', ','));
            if(stored_date < mini_date){
                date = mini_date.format("dddd, mmm, d'th', yyyy");
            }
            
            $scope.date = date;
            $scope.section_id = section_id;
            $scope.selected_date = new Date(stored_date);
            
            var selected_dt = new Date($scope.date.replace('th,', ','));
            
            ParshaService.getData(selected_dt)
            .then(function(result){
              stdt = new Date(result[0].start_date);
              eddt = new Date(result[0].end_date);
            
              $rootScope.st_date = stdt;
              $rootScope.ed_date = eddt;
              for (var i = 0; i < result.length; i++) {
                  parsha = result[i];
                  stdt = new Date(parsha.start_date);
                  eddt = new Date(parsha.end_date);
                  
                  $rootScope.st_date = $rootScope.st_date > stdt ? stdt : $rootScope.st_date;
                  $rootScope.ed_date = $rootScope.ed_date < eddt ? eddt : $rootScope.ed_date;
                  
                  parsha_days.push([stdt, eddt]);
                  
                  var temp_eddt = angular.copy(eddt);
                  temp_eddt.setDate(temp_eddt.getDate()+1);
                  
                  if(temp_eddt >= selected_dt && selected_dt >= stdt){
                      $scope.parsha_title = parsha.text_eng;
                      parsha_id = parsha.ID;
                      window.localStorage["section_"+section_id+"_selected_parsha_title"] = parsha.text_eng;
                      $scope.parsha_title = parsha.text_eng;
                      $rootScope.daily_parsha_title = $scope.parsha_title;

                  }
              
              }
                  
              var tmp_root_st_dt = angular.copy($rootScope.st_date);
              $rootScope.st_date.setDate(tmp_root_st_dt.getDate()+1);

              var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
              $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate()+1);
                  
              var available_date = angular.copy($rootScope.st_date)
              var available = false;
              var disable_days = [];

              while (available_date < $rootScope.ed_date) {
                  for(i=0; i<parsha_days.length; i++){
                      day_item = angular.copy(parsha_days[i]);
                      day_item[1].setDate(day_item[1].getDate()+1);
                      day_item[0].setDate(day_item[0].getDate()+1);
                  
                      if(day_item[1] >= available_date && available_date >= day_item[0]){
                          available = true;
                          break;
                      }
                  }
              
                  if(available == false){
                        disable_days.push(angular.copy(available_date));
                  }
                  available = false;
                  available_date.setDate(available_date.getDate()+1);
              }
              $scope.disable_days = disable_days;
                  
              TextService.getData(parsha_id, section_id, $scope.selected_date).then(function(result){
                    $scope.textData = result;
                    $ionicLoading.hide();
                });
            });
        
        }
            

})

.controller('chumashJune102016Ctrl', function($scope) {
   
            
})
   
.controller('tanyaJune102016Ctrl', function($scope) {

})
   
.controller('hayomYomJune102016Ctrl', function($scope) {

})

.controller('MenuCtrl', function($scope, $rootScope, SectionService, ApiService, $ionicLoading, $filter, ParshaService) {
    var mini_date = new Date(MIN_DATE);
    var cur_date = new Date();
    var show_cur_date = null;
    var dd = cur_date.toDateString().slice(4,15);

    $scope.todays_date = dd.replace(dd.substr(4,2), cur_date.getDate()+",");
    if(cur_date < mini_date){
        dd = mini_date.toDateString().slice(4,15);
        $scope.todays_date = dd.replace(dd.substr(4,2), mini_date.getDate()+",");
    }

//    $scope.todays_date = window.localStorage["section_2"];
            
    $scope.$on('syncing-complete', function(event, args) {
		bindSectionData();
		debugger;
	});

	bindSectionData();
            
	$scope.$on('date-update', function(event, args){
		var section = $filter('filter')($scope.sectionData, {ID: args['section_id']})[0];
		section.date = args['new_date'];

	})
	
            function bindSectionData(){
                $scope.sectionData = [];
                $scope.parsha_title = "";
                
                SectionService.getData().then(function(sresult){
                    ParshaService.getData($scope.todays_date).then(function(result){
                         stdt = new Date(result[0].start_date);
                         eddt = new Date(result[0].end_date);
                         var parsha_id = 0;
                         for (var i = 0; i < result.length; i++) {
                             parsha = result[i];
                             stdt = new Date(parsha.start_date);
                             eddt = new Date(parsha.end_date);
                             
                             var temp_eddt = angular.copy(eddt);
                             temp_eddt.setDate(temp_eddt.getDate()+1);
                             
                             if(temp_eddt >= cur_date && cur_date >= stdt){
                                 parsha_id = parsha.ID;
                                 $scope.parsha_title = parsha.text_eng;
                             }
                         
                         }
                         
                         if(parsha_id==0){
                             parsha_id = result[0].ID;
                             $scope.parsha_title = result[0].text_eng;
                         }
                         
                         for (var i = 0; i < sresult.length; i++) {
                             menu = sresult[i];
                             var dd = window.localStorage["section_"+menu.ID] || new Date().format("dddd, mmm, d'th', yyyy");
                             menu.date = dd.replace('th,', ',');
                             
                             var mini_date = new Date(MIN_DATE);
                             var stored_date = new Date(menu.date);
                            
                            var show_mm_date = null;
                            if(menu.date){
                                show_mm_date = stored_date.format("dddd, mmm, d'th', yyyy");
                            }
                                                                   
                                                                
                             if(stored_date < mini_date){
                                 date = mini_date.toDateString().slice(4,15);
                                 menu.date = date.replace(date.substr(4,2), mini_date.getDate()+",");
                                 show_mm_date = mini_date.format("dddd, mmm, d'th', yyyy");
                             }
                             menu.parsha_title = window.localStorage["section_"+menu.ID+"_selected_parsha_title"];
                             
                             $rootScope["section_"+menu.ID+"_selected_parsha_title"] = menu.parsha_title || $scope.parsha_title;
           
                            var show_cur_date = cur_date.format("dddd, mmm, d'th', yyyy");
                            if(cur_date < mini_date){
                               show_cur_date = mini_date.format("dddd, mmm, d'th', yyyy");
                            }
                             $rootScope["section_"+menu.ID+"_selected_date"] = show_mm_date || show_cur_date;
                             
                             $scope.sectionData.push(menu);
                         
                         }
                         
                     });
                                              //			$scope.sectionData = result;
                      debugger;
                });
            }
            
})

.controller('DailyStudyController', function($scope, $ionicScrollDelegate, $location, TextService, $stateParams, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService) {
        $scope.date = window.localStorage["section_"+$stateParams['section_id']];
        $scope.disable_days = [];
        $scope.sttButton=false;
        if($stateParams['day'] && $scope.date === undefined){
            $scope.date = $stateParams['day']
        }
        var mini_date = new Date(MIN_DATE);
        $scope.selected_date = new Date($scope.date.replace('th,', ','));
        if($scope.selected_date < mini_date){
            $scope.selected_date = mini_date;
            date = mini_date.toDateString().slice(4,15);
            $scope.date = date.replace(date.substr(4,2), $scope.selected_date.getDate()+",");
            
        }
        window.localStorage['parsha_id'] = 1;
    
        window.localStorage['last_section_id'] = $stateParams['section_id'];
        window.localStorage['last_section_title'] = $stateParams['section_name'];
        window.localStorage['last_section_weekly'] = 0;
        window.localStorage['last_section_color'] = $stateParams['section_color'];
            
        $scope.section = $stateParams['section_name'];
        $scope.sectionColor = $stateParams['section_color'];
        var parsha_id = +window.localStorage['parsha_id'];
        var section_id = +$stateParams['section_id'];
            
        $scope.scrollToTop = function() { //ng-click for back to top button
            $ionicScrollDelegate.scrollTop(true);
            $scope.sttButton=false;  //hide the button when reached top
        };

        
        $scope.showDatePicker = function() {
            var selected_date = angular.copy($scope.selected_date);
            
            var ipObj1 = {
                callback: function (val) {  //Mandatory
                    console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    var selected_dt = new Date(val)
                    $scope.selected_date = angular.copy(selected_dt);
                    var date = selected_dt.format("dddd, mmm, d'th', yyyy");
                    window.localStorage["section_"+$stateParams['section_id']] = date;
                    $scope.date = date;
                    $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");
            
                    bindTextData();
                },
                selectedDateCallback: function(val){
                    console.log('select date : ' + val, new Date(val));
                },
                isDaily: true,
                dateFormat: 'MMMM dd, yyyy',
            
                from: $rootScope.st_date, //Optional
                to: $rootScope.ed_date, //Optional
                disabledDates: $scope.disable_days,
                inputDate: selected_date,      //Optional
                mondayFirst: false,          //Optional
                disableWeekdays: [0],       //Optional
                closeOnSelect: false,       //Optional
                disableWeekdays: [7],
                templateType: 'popup'       //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
		
		$scope.$on('syncing-complete', function(event, args) {
			bindTextData();
		});
        $scope.scrollEvent = function() {
            $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
            
            if ($scope.scrollamount > 80) {
                $scope.$apply(function() {
                    $scope.hideNavigation = true;
                });
            } else {
                $scope.$apply(function() {
                    $scope.hideNavigation = false;
                });
            }
            var moveData = $scope.scrollamount;
            
            $scope.$apply(function(){
                if(moveData>300){
                    $scope.sttButton=true;
                }else{
                    $scope.sttButton=false;
                }
            }); //apply
        };

        $scope.showPrevData = function(){
            var dd = angular.copy($rootScope.st_date);
            if($scope.selected_date <= dd){
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate()-1);
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_"+$stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = $scope.selected_date.format("dddd, mmm, d, yyyy");
            
            bindTextData();
        }
        $scope.showNextData = function(){
            var dd = angular.copy($rootScope.ed_date);
            dd.setDate(dd.getDate()-1);
            console.log(dd);
            if($scope.selected_date >= dd){
                return false;
            }
            $scope.selected_date.setDate($scope.selected_date.getDate()+1);
            var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
            window.localStorage["section_"+$stateParams['section_id']] = date;
            $scope.date = date;
            $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = $scope.selected_date.format("dddd, mmm, d, yyyy");
            
            bindTextData();
        }

		bindTextData();


		function bindTextData(){
            $ionicLoading.show({
               template: '<ion-spinner icon="ios"></ion-spinner>'
            });
            var parsha_id = 0;
            var selected_dt = $scope.selected_date
            var parsha_days = [];
            
            
            ParshaService.getData(selected_dt)
                .then(function(result){
                      stdt = new Date(result[0].start_date);
                      eddt = new Date(result[0].end_date);
                      $rootScope.st_date = stdt;
                      $rootScope.ed_date = eddt;
                    for (var i = 0; i < result.length; i++) {
                        parsha = result[i];
                        stdt = new Date(parsha.start_date);
                        eddt = new Date(parsha.end_date);
                        $rootScope.st_date = $rootScope.st_date > stdt ? stdt : $rootScope.st_date;
                        $rootScope.ed_date = $rootScope.ed_date < eddt ? eddt : $rootScope.ed_date;
                        parsha_days.push([stdt, eddt]);
                      
                        var temp_eddt = angular.copy(eddt);
                        temp_eddt.setDate(temp_eddt.getDate()+1);
                      
                        if(temp_eddt >= selected_dt && selected_dt >= stdt){
                            parsha_id = parsha.ID;
                            $rootScope["section_"+$stateParams['section_id']+"_selected_parsha_title"] = parsha.text_eng;
                            $scope.parsha_title = parsha.text_eng;
                            window.localStorage["section_"+$stateParams['section_id']+"_selected_parsha_title"] = parsha.text_eng;
                              $rootScope.daily_parsha_title = $scope.parsha_title;
                        }
                      
                    }
                      
                  var tmp_root_st_dt = angular.copy($rootScope.st_date);
                  $rootScope.st_date.setDate(tmp_root_st_dt.getDate()+1);
                  
                  var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
                  $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate()+1);
                      
                  var available_date = angular.copy($rootScope.st_date)
                  var available = false;
                  var disable_days = [];
                  
                  while (available_date < $rootScope.ed_date) {
                      for(i=0; i<parsha_days.length; i++){
                          day_item = angular.copy(parsha_days[i]);
                          day_item[1].setDate(day_item[1].getDate()+1);
                          day_item[0].setDate(day_item[0].getDate()+1);
                          if(day_item[1] >= available_date && available_date >= day_item[0]){
                              available = true;
                              break;
                          }
                      }
                      
                      if(available == false){
                          disable_days.push(angular.copy(available_date));
                      }
                      available = false;
                      available_date.setDate(available_date.getDate()+1);
                  }
                      
                  $scope.disable_days = disable_days;
                    TextService.getData(parsha_id, section_id, selected_dt).then(function(result){
                        $scope.textData = result;
                        $ionicLoading.hide();
                    });
                });
			
		}
})
.controller('WeeklyStudyController', function($scope, $ionicScrollDelegate, $location, TextService, $stateParams, $rootScope, ApiService, $ionicLoading, $filter, ionicDatePicker, ParshaService)
{
    $scope.date = window.localStorage["section_"+$stateParams['section_id']];
    $scope.disable_days = [];
    $scope.set_date = true;
    $scope.section = $stateParams['section_name'];
    var parsha_id = +window.localStorage['parsha_id'];
    var section_id = +$stateParams['section_id'];

    $scope.weekly_index = parseInt(window.localStorage["section_weekly_index_"+section_id]) || 0;
    if($stateParams['day'] && $scope.date === undefined){
            $scope.date = $stateParams['day'];
            $scope.set_date = false;
    }
    $scope.selected_date = new Date($scope.date);
    window.localStorage['parsha_id'] = 1;
    window.localStorage['last_section_id'] = $stateParams['section_id'];
    window.localStorage['last_section_title'] = $stateParams['section_name'];
    window.localStorage['last_section_weekly'] = 1;
            

    $scope.parsha_title = $rootScope["section_"+section_id+"_selected_parsha_title"];
    $scope.sectionColor = $stateParams['section_color'];
    window.localStorage['last_section_color'] = $stateParams['section_color'];
            
    $scope.$on('syncing-complete', function(event, args) {
        bindTextData();
    });
    $scope.showDatePicker = function() {
        var selected_date = angular.copy($scope.selected_date);

        var ipObj1 = {
            callback: function (val) {  //Mandatory
                console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                var selected_dt = new Date(val)
                $scope.selected_date = angular.copy(selected_dt);
                var date = selected_dt.format("dddd, mmm, d, yyyy");
                window.localStorage["section_"+$stateParams['section_id']] = date;
                $scope.date = date;
                $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = selected_dt.format("dddd, mmm, d, yyyy");

                bindTextData();
            },
            isDaily: false,
            dateFormat: 'MMMM dd, yyyy',
            from: $rootScope.st_date, //Optional
            to: $rootScope.ed_date, //Optional
            disabledDates: $scope.disable_days,
            inputDate: selected_date,      //Optional
            mondayFirst: false,          //Optional
            disableWeekdays: [0],       //Optional
            closeOnSelect: false,       //Optional
            disableWeekdays: [7],
            templateType: 'popup'       //Optional
        };
        ionicDatePicker.openDatePicker(ipObj1);
    };
            
    $scope.scrollToTop = function() { //ng-click for back to top button
        $ionicScrollDelegate.scrollTop(true);
        $scope.sttButton=false;  //hide the button when reached top
    };
            
    $scope.scrollEvent = function() {
        $scope.scrollamount = $ionicScrollDelegate.$getByHandle('scrollHandle').getScrollPosition().top;
        if ($scope.scrollamount > 80) {
            $scope.$apply(function() {
                $scope.hideNavigation = true;
            });
        } else {
            $scope.$apply(function() {
                $scope.hideNavigation = false;
            });
        }
        var moveData = $scope.scrollamount;

        $scope.$apply(function(){
            if(moveData>300){
                $scope.sttButton=true;
            }else{
                $scope.sttButton=false;
            }
        }); //apply
    };

    $scope.showPrevData = function(){
        if($scope.weekly_index == 0){
            return false;
        }
//        $scope.selected_date.setDate($scope.selected_date.getDate()-1);
        $scope.weekly_index = $scope.weekly_index - 1
        $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
        $scope.selected_date.setDate($scope.selected_date.getDate()+1)
        var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
        window.localStorage["section_"+$stateParams['section_id']] = date;
        $scope.date = date;
        $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = date;
        bindTextData();
        window.localStorage["section_weekly_index_"+section_id] = $scope.weekly_index;
    }
    $scope.showNextData = function(){
        if($scope.weekly_index == $scope.parsha_days.length - 1){
            return false;
        }
        $scope.weekly_index = $scope.weekly_index + 1
        $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
        $scope.selected_date.setDate($scope.selected_date.getDate()+1)
        var date = $scope.selected_date.format("dddd, mmm, d, yyyy");
        window.localStorage["section_"+$stateParams['section_id']] = date;
        $scope.date = date;
        $rootScope["section_"+$stateParams['section_id']+"_selected_date"] = date;
        bindTextData();
        window.localStorage["section_weekly_index_"+section_id] = $scope.weekly_index;
    }
    
    bindTextData();
    
    
    function bindTextData(){
        $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner>'
        });
        var parsha_id = 0;
        var selected_dt = $scope.selected_date
        $scope.parsha_days = [];
            
        ParshaService.getData(selected_dt)
        .then(function(result){
              stdt = new Date(result[0].start_date);
              eddt = new Date(result[0].end_date);
              $rootScope.st_date = stdt;
              $rootScope.ed_date = eddt;
              for (var i = 0; i < result.length; i++) {
                  parsha = result[i];
                  stdt = new Date(parsha.start_date);
                  eddt = new Date(parsha.end_date);
                  $rootScope.st_date = $rootScope.st_date > stdt ? stdt : $rootScope.st_date;
                  $rootScope.ed_date = $rootScope.ed_date < eddt ? eddt : $rootScope.ed_date;
                  $scope.parsha_days.push([stdt, eddt]);
                  
                  var temp_eddt = angular.copy(eddt);
                  temp_eddt.setDate(temp_eddt.getDate()+1);
              
                  if(temp_eddt >= selected_dt && selected_dt >= stdt){
                      parsha_id = parsha.ID;
                      $scope.parsha_title = parsha.text_eng;
                      $rootScope["section_"+$stateParams['section_id']+"_selected_parsha_title"] = parsha.text_eng;
                      window.localStorage["section_"+$stateParams['section_id']+"_selected_parsha_title"] = parsha.text_eng;
                      $scope.weekly_index = i;    /* added 2016-11-16*/
                      $rootScope.daily_parsha_title = $scope.parsha_title;
              console.log('weekly_index ->'+$scope.weekly_index);
                  }
              
              }
              if(parsha_id==0){
                  parsha_id = result[0].ID;
                  $scope.parsha_title = result[0].text_eng;
                  $rootScope["section_"+section_id+"_selected_parsha_title"] = result[0].text_eng;
                  window.localStorage["section_"+section_id+"_selected_parsha_title"] = result[0].text_eng;
              }
              
              var tmp_root_st_dt = angular.copy($rootScope.st_date);
              $rootScope.st_date.setDate(tmp_root_st_dt.getDate()+1);
              
              var tmp_root_ed_dt = angular.copy($rootScope.ed_date);
              $rootScope.ed_date.setDate(tmp_root_ed_dt.getDate()+1);
              
              var available_date = angular.copy($rootScope.st_date)
              var available = false;
              var disable_days = [];
              
              while (available_date < $rootScope.ed_date) {
                  for(i=0; i<$scope.parsha_days.length; i++){
                      day_item = angular.copy($scope.parsha_days[i]);
                      day_item[1].setDate(day_item[1].getDate()+1);
                      day_item[0].setDate(day_item[0].getDate()+1);
                      if(day_item[1] >= available_date && available_date >= day_item[0]){
                          available = true;
                          break;
                      }
                  }
              
                  if(available == false){
                      disable_days.push(angular.copy(available_date));
                  }
                  available = false;
                  available_date.setDate(available_date.getDate()+1);
              }
              $scope.disable_days = disable_days;
              
              /* added 2016-11-16 */
              if($scope.set_date == false){
                  $scope.set_date = true;
              
                  console.log('$scope.weekly_index->'+$scope.weekly_index);
              
                  $scope.selected_date = $scope.parsha_days[$scope.weekly_index][0]
                  $scope.selected_date.setDate($scope.selected_date.getDate()+1)
                  var date = $scope.selected_date.toDateString().slice(4,15);
                  date = date.replace(date.substr(4,2), $scope.selected_date.getDate()+",");
                  window.localStorage["section_"+section_id] = date;
                  $scope.date = date;
                  selected_dt = new Date($scope.date);
              console.log('scope.date->'+$scope.date);
              }
              console.log('parsha_id->'+parsha_id);
              console.log('section_id->'+section_id);
              
              /* end 2016-11-16 */
              
              TextService.getData(parsha_id, section_id, $scope.date).then(function(result){
                   $scope.textData = result;
                   $ionicLoading.hide();
                   });
              });
        
        }
    })
    .controller('settingCtrl', function($scope, $rootScope, $state) {
        $scope.selectedItem = window.localStorage['selected_font_size'] || "small";
        $rootScope.font_size = "font-size-"+$scope.selectedItem;
        $scope.font_sizes = [{value:"small",label:"Small"}, {value:"medium",label:"Medium"}, {value:"large",label:"Large"}];

        $scope.update = function(font_size) {
            $rootScope.font_size = "font-size-"+font_size;
            window.localStorage['selected_font_size'] = font_size;
        }
        $scope.goBack = function() {
            $state.go('menu.setting');
        };

    })
    .controller('aboutCtrl', function($scope, $rootScope, $ionicHistory, $state) {
        $scope.goBack = function() {
            $state.go('menu.setting');
        };
    })