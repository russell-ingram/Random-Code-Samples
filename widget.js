// A widget I created that makes suggestions based on user choices. Works with a remote API for machine learning and another to obtain the information for the choices. This file was injected into the site post-launch, so it was all in one file with the design
// Could only use JS(with jQuery)/HTML/CSS
// Was my first widget so it was a learning process


var widgetHtml = 'somehtml & inline css';

var modalHtml = 'somehtml'


$(document).ready(function(){

  var ItemsArr = [];
  var current;
  var num = 0;
  var liked = [];
  var currentToken;
  var started = false;
  var userID = generateGUID();
  var userIP;

  // Got the IP to have a makeshift way of determing if the user was new or old for ad targeting and machine learning
  getUserIP();

  $("#widget").append(widgetHtml);
  $("body").append(modalHtml);


  function getUserIP() {
    $.ajax({
      type:'GET',
      url: 'id'
    }).done(function(res){
      userIP = res.Result;
    });
  }




  // User clicks YES on a Item in the modal
  $(document).on('click',"#yesModalButton", function(e){
    e.preventDefault();
    liked.push(ItemsArr[num]);
    num++;

    remoteApiTracking(6, ItemsArr[num]);



    // On mobile, the buttons change on press then return to normal state after a short timeout.
    if (isMobile()) {
      $('#yesModalButton').css("background-color", "#9fc14b");
      $('#yesModalButton').css("color", "#ffffff");
      setTimeout(function(){
        $('#yesModalButton').css("background-color", "#ffffff");
        $('#yesModalButton').css("color", "#9fc14b");
      }, 100)
    }

    if (num < 5) {
      nextItemInfo(num);
    }
    else {
      getItemSuggestions();
    }

  });

  // User clicks NO on a Item in the modal
  $(document).on('click',"#noModalButton", function(e){
    e.preventDefault();
    num++;

    remoteApiTracking(7, ItemsArr[num]);

    if (isMobile()) {
      $('#noModalButton').css("background-color", "black");
      $('#noModalButton').css("color", "#ffffff");
      setTimeout(function(){
        $('#noModalButton').css("background-color", "#ffffff");
        $('#noModalButton').css("color", "black");
      }, 100)
    }
    if (num < 5) {
      nextItemInfo(num);
    }
    else {
      getItemSuggestions();
    }
  });

  // User clicks on the "START" button in the main widget which prompts the opening of the modal
  $("#startwidgetButton").on("click", function(e) {

    document.getElementById("openwidgetModal").className += " visible";

    if (isMobile()) {
      $('.startAgain').empty();
      $('.startAgain').append('<img src="imglink">');
    }


    // Reset the modal after closing and reopening.
    if (started === true) {

    }
    else {
      started = true;
      $.ajax({
        type:'GET',
        url: ''+userIP,
        crossDomain: true,
        headers: {
        }
      }).done(function(a){
        currentToken = a.AccessKey
        $.ajax({
          type:'GET',
          url: '',
          crossDomain: true,
          headers: {
            "Token": currentToken
          }

        }).done(function(data){
          ItemsArr = data.Result
          nextItemInfo(0);
        });
      });
    }





  });

  $(document).on('click',".startAgain", function(e){
    e.preventDefault();

    startAgain();

  })

  // Start a new experience. Is called on click of "startAgain" button or closing and reopening the modal
  function startAgain() {
    liked = [];
    num = 0;


    $(".widgetFinalTip306x124").hide();

    $(".desktopModalMain").empty();

      $.ajax({
        type:'GET',
        url: '',
        crossDomain: true,
        headers: {
          "Token": currentToken
        }

      }).done(function(data){
        ItemsArr = data.Result
        $(".desktopModalMain").append('text');
        num = 0;
        $(".widgetModalHeader").text("text");


        nextItemInfo(0);


      });

    $(".widgetModalButtons").show();
  }

  // Loads the Item information in the modal after starting or clicking yes/no
  function nextItemInfo (num) {
    // Sometimes the image can be a little slow to load and the user might click the button again too quickly. Having two removes of the image prevents two images appearing on screen after the AJAX call below completes.
    // Similarly, calling endSpinner at the beginning before calling loadSpinner ensures there won't be two spinners if the user clicks too quickly.
    endSpinner();
    $('#widgetModalImage').remove();
    $('#widgetModalImage').remove();

    // Circle active is the progress bar changing as the user continues through.
    $('.circle'+num).addClass('circle-active');

    if (num > 0) {
      $('.circle'+(num - 1)).removeClass('circle-active');
    }

    $(".widgetModalText").empty();

    loadSpinner('.widgetSelect', true);

    $.ajax({
      type: 'GET',
      url: '' + ItemsArr[num].toString(),
      crossDomain: true
    }).done(function(data){
      var imgs = data.Items[0].image
      var imageUrl = "" + imgs.imagePath

      imageUrl += imgs.fullSize;
        endSpinner();
      $('.widgetSelect').prepend('<img id="widgetModalImage" src="">');
      $("#widgetModalImage").attr("src", imageUrl);
      $(".widgetModalText").append(data.Items[0].title)

    });

  }

  // After clicking through the 5 suggestions, loads the suggestions from the API and changes the view in the modal
  function getItemSuggestions () {

    if (liked.length > 0) {
      $.ajax({
        type: 'POST',
        url: '',
        crossDomain: true,
        headers: {
          "Token": currentToken
        },
        data: {
          "ids": liked
        }
      }).done(function(data) {

        if (data.Result.length > 0) {
          $(".desktopModalMain").empty();
          $(".widgetModalButtons").hide();
          $(".desktopModalMain").append("<div class='finalResultsDiv'></div>");
          $(".widgetModalHeader").text("text");
          for (i=0; i<5; i++) {
            finalScreenItemInfo(data.Result[i], i.toString());
          };

          setTimeout(function () {
            $(".widgetFinalTip306x124").show();
          }, 100);

          if (isMobile()) {
            $("#closewidgetMobileButton").css("display", "block");
            $("#mobilePresentedModal").css("visibility", "hidden");
          }

        }
        else {
          $(".desktopModalMain").empty();
          $(".widgetModalHeader").text("sorry!");
          $(".desktopModalMain").append("html");
        }

      })
    }
    else {
      $(".desktopModalMain").empty();
      $(".widgetModalHeader").text("sorry!");
      $(".desktopModalMain").append("html");

    }

  }

  // Loads an individual Item's info for the final screen and adds it to the list

  function finalScreenItemInfo (ItemId, id) {

    $.ajax({
      type: 'GET',
      url: '' + ItemId.toString(),
      crossDomain: true
    }).done(function(data){
        var imgs = data.Items[0].image
        var thumbnailSizeUrl = "link" + imgs.imagePath + imgs.fullSize;
        var linkUrl = "link" + data.Items[0].url;
        $(".finalResultsDiv").append("<div id= 'resultDiv' class='resultDiv"+id+"'></div>");
        $(".resultDiv"+id).append("<a class='finalResultsImg' href="+ linkUrl +" target='_blank'><div class='finalResultsImgDiv'></div></a>");
        var imgDivParent = $(".resultDiv"+id + " > a");
        imgDivParent.children().css("background-image","url("+thumbnailSizeUrl+")");
        imgDivParent.children().css("background-position","center")
        $(".resultDiv"+id).append("<div class='resultDivText'><p>"+ data.Items[0].title +"</p><div class='sourceText'>"+ data.Items[0].source +"</div></div>");
    })
  }

  // Determines if it is a mobile device via touch events
  // Means some tablets counts as mobile but for our purposes that is fine
  function isMobile() {
    try{ document.createEvent("TouchEvent"); return true; }
    catch(e){ return false; }
  }

  // Loading spinner if image doesn't load immediately
  function loadSpinner(element, prepend) {

    var loaderHtml = '<div id="floatingCirclesG"><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div>';

    if (prepend) {
      $(element).prepend(loaderHtml);
    }
    else {
      $(element).append(loaderHtml);
    }
  };

  function endSpinner() {
    $('#floatingCirclesG').remove();
  }

  // not a true GUID but almost impossible for this not to be unique
  function generateGUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });

    return uuid;
  }


  // Sends tracking info to API to allow for improvement of suggestions algorithm
  function remoteApiTracking(actionNum, ItemID) {
    $.ajax({
      type: 'POST',
      url: '',
      crossDomain: true,
      headers: {
        "Token": currentToken
      },
      // Action types nums are as follows:
      data: {
        "action" : {
           "ActionType": actionNum,
           "ItemID":ItemID,
           "UserID": userID,
           "DevicePlatform":"Web"
          }
      }
    }).done(function(data){
    });
  }

  // Gives the close button a function for tracking purposes
  $(document).on('click',".close", function(e){
    $("#openwidgetModal").removeClass("visible");
    closeButton();
  });

  $(document).on('click',"#closewidgetMobileButton", function(e){
    $("#openwidgetModal").removeClass("visible");
    closeButton();
  });

  function closeButton() {


    startAgain();
  }



});



