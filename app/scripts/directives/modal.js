'use strict';

/**
 * @ngdoc directive
 * @name promptApp.directive:modal
 * @description
 * # modal
 */
angular.module('promptApp')
  .directive('modal', function () {
    return {
      templateUrl: 'views/templates/modal.html',
      restrict: 'E',
      controller: function ($scope, $element) {
        var scope = this;
        
        //======================================================================
        // FUNCTIONS ===========================================================
        //======================================================================
        // Clear the scope variables
        function clearScope() {
          scope.title = '';
          scope.body = '';
          scope.buttons.length = 0;
        }
        
        // Close the modal
        function closeModal () {
          // Hide the modal
          // This will trigger a clearscope when done
          $element.modal('hide');
        }
        
        // Open the model with new data
        function openModal(data) {
          // Clear old scope
          clearScope();
          
          // Set up scope
          scope.title = data.title;
          scope.body = data.body;
          
          for (var i; i<data.buttons.length; i++) {
            // Save ref to button
            var dataBtn   = data.buttons[i];
            // Build new button to add to scope
            var scopeBtn  = {};
            
            // Add text
            scopeBtn.text = dataBtn.text;
            
            // Add click handler
            if (dataBtn.click) {
              
              // If click handler included
              scopeBtn.click = function () {
                dataBtn.click();
                // Add close if requested
                if (dataBtn.close) {
                  closeModal();
                }
              };
            } else if (dataBtn.close) {
              
              // Only add close, only if requested
              scopeBtn.click = closeModal;
            }
            
            // Add the new button to the scope
            scope.buttons.push(scopeBtn);
          }
          
          // Open modal
          $element.modal();
        }
        
        // Open the modal with Are You Sure defaults
        function openAreYouSure(data) {
          var modalData = {};
          
          modalData = {
            title   : "Are you sure you want to " + data.action + "?",
            body    : data.body,
            buttons : [
              // Continue with action button
              {
                text  : 'Yes',
                click : function (e) {
                  data.deferred.resolve();
                },
                close : true
              },
              // Cancel action button
              {
                text: 'No',
                click: function (e) {
                  data.deferred.reject();
                },
                close : true
              }
            ]
          };
          
          // Open the modal
          openModal(modalData);
        }
        
        //======================================================================
        // EVENTS ==============================================================
        //======================================================================
        // Bring up a generic modal
        $scope.$on('modal', function (e, data) {
          openModal(data);
        });
        
        // Bring up an are-you-sure modal
        $scope.$on('areYouSure', function (e, data) {
          openAreYouSure(data);
        });
        
        // Clear the scope when the modal is finished closing
        $element.on('hidden.bs.modal', function (e) {
          clearScope();
        });
        
        //======================================================================
        // SCOPE ===============================================================
        //======================================================================
        // Title
        scope.title = '';
        // Body
        scope.body = '';
        // Buttons
        scope.buttons = [];
        
      }
    };
  });
