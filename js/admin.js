(function( incom, $, undefined ) {

  $(document).ready(function() {
    init();
  });

  var init = function() {
    addColourPicker();
  };

  var addColourPicker = function() {
    $('.incom_picker_bgcolor').wpColorPicker();
  };

  /*
   * Make it possible to change a number input value per keystroke
   */
  $('input[type="number"]').keyup(function () {
      if (this.value !== this.value.replace(/[^0-9\.]/g, '')) {
         this.value = this.value.replace(/[^0-9\.]/g, '');
      }
  });

}( window.incom = window.incom || {}, jQuery ));
