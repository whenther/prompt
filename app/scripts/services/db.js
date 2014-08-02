'use strict';

/**
 * @ngdoc service
 * @name promptApp.db
 * @description
 * # db
 * Factory in the promptApp.
 */
angular.module('promptApp')
  .factory('db', ['Prompts', function (Prompts) {
    
    // Hold ref to the db
    var db,
    // db ready flag
        ready = false,
        DB_NAME = 'prompt',
        PROMPTS_STORE_NAME = 'prompts';
    
    function onError() {
      alert('There was an error with the db');
    }
    
    /**
     * return a reference to an objectStore
     * @param {string} store_name
     * @param {string} mode either "readonly" or "readwrite"
     */
    function getObjectStore(store_name, mode) {
      return db.transaction(store_name, mode).objectStore(store_name);
    }
    
    /**
     * Update the scope with the prompts
     * @param {string} store_name
     * @param {string} mode either "readonly" or "readwrite"
     */
    function promptsToScope () {
      // an array of prompts to be populated from the DB
      var prompts = [],
      // Get the prompts objectStore
          store = getObjectStore(PROMPTS_STORE_NAME, 'readonly');
      
      // open a cursor to run through the prompts
      store.openCursor().onsuccess = function(evt) {
        // Set up the cursor
        var cursor = evt.target.result;
        
        // Check if there are is another prompt in the db
        if (cursor) {
           // If there are more entries, continue
          
          // Add the prompt to the local array
          // Set it to the cursor key to keep things in sync
          prompts[cursor.key] = cursor.value;
          
          // Move on to the next object in store
          cursor.continue();
        } else {
          // When done, push the prompts to the Prompts service
          
          // Update the Prompts
          Prompts.replaceList(prompts);
        }
      };
    }
    
    return {
      //========================================================================
      // READY =================================================================
      //========================================================================
      // Flag for db readiness
      // should be used with an ng-show or ng-enable
      ready: function () {
        return ready;
      },
      
      //========================================================================
      // OPEN ==================================================================
      //========================================================================
      open: function() {
        var dbName = "prompt",
            version = 1,
            reqOpen = indexedDB.open(dbName, version);
      
        // Create the prompts objectStore (only happens the first time)
        reqOpen.onupgradeneeded = function(e) {
          var db = e.target.result;
      
          // ERROR HANDLING
          e.target.transaction.onerror = function () {
            alert('There was an error creating the DB.');
          };
          
          // Clear old version of DB
          if(db.objectStoreNames.contains(PROMPTS_STORE_NAME)) {
            db.deleteObjectStore(PROMPTS_STORE_NAME);
          }
          
          // Create the prompts objectStore
          db.createObjectStore(PROMPTS_STORE_NAME, {autoIncrement: true});
        };
        
        // Fires after db is ready
        reqOpen.onsuccess = function(e) {
          // set readiness
          ready = true;
          // Push any prompts from the db to the Prompts service
          // which will go to any scope that needs them
          promptsToScope();
        };
      
        // Errors usually caused by old browsers or high security
        reqOpen.onerror = onError;
      },
      //========================================================================
      // OPEN ==================================================================
      //========================================================================
      add: function (prompt) {
        // Get the store
        var store = getObjectStore(DB_NAME, 'readwrite'),
        // Add the prompt
            reqAdd = store.add(prompt);
        // Update the scope
        reqAdd.onsuccess = function(e) {
          promptsToScope();
        };
        reqAdd.onerror = function (e) {
          console.log("Couldn't add " + prompt.name);
        };
      },
      //========================================================================
      // DELETE ================================================================
      //========================================================================
      delete: function (index) {
        // Get the store
        var store = getObjectStore(DB_NAME, 'readwrite'),
        // Delete the prompt
            reqDelete = store.delete(index);

        // Update the scope on delete
        reqDelete.onsuccess = function(e) {
          promptsToScope();
        };
        reqDelete.onerror = function (e) {
          console.log("Couldn't delete " + index);
        };
      },
      //========================================================================
      // UPDATE ================================================================
      //========================================================================
      update: function (index, prompt) {
        // Save a ref to the store for a later put
        var store = getObjectStore(DB_NAME, 'readwrite');
        
        // Find the prompt
        store.get(index)
        // Update the prompt
        .onsuccess = function(e) {
          // Get the old data
          var record = e.target.result;
          
          // Check that the entry exists
          if (typeof record == 'undefined') {
            console.log("No matching record found");
            return;
          }
          
          // Update the entry
          var reqUpdate = store.put(prompt);
          // Error
          reqUpdate.onerror = function(e) {
            console.log("Couldn't update " + index);
          };
          // Update the scope on update
          reqUpdate.onsuccess = function(e) {
            promptsToScope();
          };
        };
      },
      //========================================================================
      // CLEAR =================================================================
      //========================================================================
      clear: function () {
        var store = getObjectStore(DB_NAME, 'readwrite');
        var reqClear = store.clear();
        // Update to the new cleared scope on successful clear
        reqClear.onsuccess = promptsToScope;
        // error
        reqClear.onerror = onError;
      }
    };
  }]);
    
    
    
    
