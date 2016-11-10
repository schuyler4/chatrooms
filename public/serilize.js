/* this file is for serilizeing the fields joining and
creating so users can't have no name or joinCodes */

$(document).ready(function() {
  var createForm = $("#createForm");
  var createJoinCode = $("#joinCode");
  var createName = $('#createName');

  var joinForm = $('#joinForm');
  var joinJoinCode = $('#joinJoinCode');
  var joinName = $('#joinNameInput');

  var messageDiv = $('#messageDiv');
  var warning = '<h1 id="warning"> ONE OF YOUR FIELDS IS NOT FILLED OUT </h1>';
  var alreadyWarned = false;

  /* check if the forms are submited without input values */
  createForm.submit(function(event) {

    createJoinCode.val() == "";
    createName.val() == "";

    if(createJoinCode.val() == "" || createName.val() == "") {
      event.preventDefault();
      if(!alreadyWarned) {
        messageDiv.append(warning);
        alreadyWarned = true;
      }
    }

  });

  joinForm.submit(function(event) {

    joinJoinCode.val() == "";
    joinName.val() == "";

    if(joinJoinCode.val() == "" || joinName.val() == "") {
      console.log("not all the join fields are filled out");
      
      event.preventDefault();
      if(!alreadyWarned) {
        messageDiv.append(warning);
        alreadyWarned = true;
      }
    }

  });

});
