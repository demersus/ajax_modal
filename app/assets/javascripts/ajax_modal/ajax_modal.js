/**
 * AjaxModal
 *
 * Author: Nik Petersen (Demersus)
 *
 * A nifty ajax script to grab the content of a link url and open it in a modal.
 * The script will automatically setup forms within the modal to submit via ajax.
 * 
 * Call 'AjaxModal.init()' in order to have it auto-listen on anchor links 
 * with the data attribute: 'data-ajax-modal'
 *
 * REQUIRES jQuery and a modal driver to operate.
 *
 * Modal driver is expected to be an object assigned to AjaxModal.modal.
 *
 * It must have a method #newModal which returns a reference to a dom node
 * acting as the modal.
 *
 * It must also respond to #setContent(html-content) which will inject html
 * into the modal, (or replace existing content).
 * 
 * The modal driver must listen to the ajax_modal:open, and ajax_modal:close
 * events to open and close according to it's own implementation. Do your own
 * garbage collecting.
 *
 * This script triggers custom events for your (behavior hooking) delight.
 * 
 */
var AjaxModal = (function(self,$) {
 
  self.launch = function(url,params,context) {
    var modal = AjaxModal.modal.newModal(params);
    
    if (context === undefined) context = modal;
    
    var modalRequestSuccess = function(data) {
      modal.setContent(data);
      // hijack form submission to submit via ajax
      var $form = modal.find('form');
      $form.attr({'data-remote' : true, 'data-type' : 'json'});
      $form.bind('ajax:beforeSend.ajm_form', function(event,xhr,settings) {
        $form.trigger('ajax_modal:loading');
        if (modal !== context) {
          return $(context).trigger('ajax_modal:form:beforeSend',[xhr,settings,modal]);
        }
      });
      $form.bind('ajax:success.ajm_form', function(event,data,status,xhr) {
        $(modal).trigger('ajax_modal:modal:close');
        
        if (modal !== context) {
          $(context).trigger('ajax_modal:form:success', [data,status,xhr,modal]);
        }
      });
      $form.bind('ajax:error.ajm_form', function(event,xhr,status) {
        if (modal !== context) {
          $(context).trigger('ajax_modal:form:error', [xhr,status,modal]);
        }
      });
      $form.bind('ajax:complate.ajm_form', function(event,xhr,status) {
        $form.trigger('ajax_modal:loaded');
        if (modal !== context) {
          $(context).trigger('ajax_modal:form:complete', [xhr,status,modal]);
        }
      }); 

      $(modal).trigger('ajax_modal:modal:open');
    };    
    
    var modalAjaxAction = function() {
      if(modal !== context) {
        $(context).trigger('ajax_modal:loading');
      }
      $.ajax(url, {
        type: 'GET',
        success: modalRequestSuccess,
        complete: function(){
          if(modal !== context) {
            $(context).trigger('ajax_modal:loaded');
          }
        },
        statusCode: {
          401: function(){
            // We received an unauthorized status.
            // Trigger an event for the app to catch,
            // and callback our original action, after authorizing.
            $(context).trigger('ajax_modal:unauthorized',[modalAjaxAction]);
          }
        }
      });
    };

    modalAjaxAction();
  };
  
  
  self.modal ||= {
    newModal: function() { alert('Please include a modal driver for AjaxModal'); }
  };       
 
  self.init = function() {
    $(document).on('click', 'a[data-ajax-modal]', function(e) {
      e.preventDefault();
      var $link = $(e.target);
      AjaxModal.launch($link.attr('href'),$link.data(),$link); 
    });
  }

  return self;

})(AjaxModal || {}, jQuery);
