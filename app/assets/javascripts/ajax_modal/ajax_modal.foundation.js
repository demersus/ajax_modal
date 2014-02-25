/**
 * Foundation driver for modals
 *
 * Author: Nik Petersen
 *
 */

var AjaxModal = (function(base,$){

  base.modal = {
    newDialog: function(options) {
      var $modal = $('<div/>', {'class': 'reveal-modal ajax-modal', 'data-reveal' : true}).appendTo('body');
      $modal.append('<a class="close-reveal-modal">&#215;</a>');
      $modal.append('<div class="reveal-modal-inner"></div>');

      $modal.on('ajax_modal:open', function(e) {
        $modal.foundation('reveal','open');
      }).on('ajax_modal:close', function(e) {
        $modal.foundation('reveal','close');
      });

      $modal.setContent = function(content) {
        $modal.find('.reveal-modal-inner').html(content);
      };
      return $modal;      
    } 
  }

  return base;
})(AjaxModal || {},jQuery);
