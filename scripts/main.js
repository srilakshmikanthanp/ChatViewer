// Copyright (c) 2021 Sri Lakshmi Kanthan P
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @brief Random Color
 */
function randColor() {
  return (
    "rgb(" +
    Math.random() * 255 +
    "," +
    Math.random() * 255 +
    "," +
    Math.random() * 255 +
    ")"
  );
}

/**
 * @brief Slide menu Down
 */
function meduDown() {
  $("nav ul li button i").removeClass("fa-bars").addClass("fa-times");
  $("header nav").css("box-shadow", "0px 0px 0px var(--color-shadow)");
  $("footer").css("box-shadow", "0px 0px 0px var(--color-shadow)");
  $("#menu").slideDown();
}

/**
 * @brief Slide menu Up
 */
function menuUp() {
  $("#menu").slideUp();
  $("nav ul li button i").removeClass("fa-times").addClass("fa-bars");
  $("header nav").css("box-shadow", "0px 0px 10px var(--color-shadow)");
  $("footer").css("box-shadow", "0px 0px 10px var(--color-shadow)");
}

/**
 * @brief Toggle Menu
 */
function openCloseMenu(evt) {
  if ($("nav ul li button i").hasClass("fa-bars")) {
    meduDown();
  } else {
    menuUp();
  }
}

function htmlEncode(str) {
  return $("<div></div>")
    .text(str)
    .html()
    .replace(/\r?\n/g, "<br>")
    .replace(/ /g, "&nbsp;")
    .replace(
      /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g,
      '<a href="$1" target="_blank">$1</a>'
    )
    .replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g,
      '<a href="mailto:$1">$1</a>'
    );
}

/**
 * @brief Read File Promise
 */
function readFile(file) {
  return new Promise((resolve, reject) => {
    var fileReader = new FileReader();

    fileReader.onload = function (evt) {
      resolve(evt.target.result);
    };

    fileReader.onerror = reject;

    fileReader.readAsText(file);
  });
}

/**
 * @brief Add Chats to DOM
 */
function addChat(name, msg, time, col) {
  $("#chat > div").append(
    `<div>
          <div id="msg-container">
              <div class="msg-person" style="color:${col}">
                  ${name}
              </div>
              <div class="msg-content">
                  ${msg}
              </div>
              <div class="msg-time">
                  ${time}
              </div>
          </div>
      </div>
    `
  );
}

/**
 * @brief loads chat from txt
 */
async function loadTxtFile(data) {
  let messages = await whatsappChatParser.parseString(data);
  let authors = [];

  for (let msg of messages) {
    msg.author = msg.author.trim();
    msg.message = msg.message.trim();
    msg.date = msg.date.toLocaleString();

    if (msg.author != "System") {
      authors.push({
        name : msg.author
      });
    }
  }

  authors = authors.filter((author, index) => {
    return authors.findIndex(function (a) {
      return a.name === author.name;
    }) === index;
  }).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  for(let author of authors) {
    author.color = randColor();
  }

  for (let author of authors) {
    $("#authors").append(`<option value="${author.name}">${author.name}</option>`);
  }

  for (let i = 0; i < messages.length; i++) {
    if (authors.find( (author) => {
      return author.name == messages[i].author;
    })) {
      addChat(
        messages[i].author,
        htmlEncode(messages[i].message),
        messages[i].date,
        authors.find(author => author.name == messages[i].author).color
      );
    }
  }

  $("#chat").hide();
}

/**
 * @brief loads chat from zip
 */
function loadZipFile(data) {}

/**
 * @brief form file inpit
 */
async function formfileInput(evt) {
  $("#authors").prop("disabled", true);
  $("#formsubmit").prop("disabled", true);
  $("#authors > option").not(":first").remove();
  $("#chat > div").empty();
  $("#formstatus").text("Processing...");
  evt.preventDefault();

  try {
    let file = $("#file-input").get(0).files[0];

    if (!(file instanceof File)) {
      alert("Please select a file");
      return false;
    }

    let data = await readFile(file);

    if (file.name.endsWith(".txt")) {
      loadTxtFile(data);
    } else if (file.name.endsWith(".zip")) {
      loadZipFile(data);
    } else {
      alert("File Type Not Supported");
    }
  } catch (error) {
    alert(error);
  }

  $("#authors").prop("disabled", false);
  $("#formsubmit").prop("disabled", false);
  $("#formstatus").text("Done");

  return;
}

/**
 * @brief Action for form submit
 */
function formSubmit(evt) {
  evt.preventDefault();
  $("#formstatus").text("Processing...");
  let primaryauthor = $("#authors").val().trim();

  if (primaryauthor == "select") {
    alert("Select a valid Author");
    return false;
  }

  let chats = $("#chat > div > div");

  for (let chat of chats) {
    let author = $(chat).find(".msg-person").text().trim();

    if (author != primaryauthor) {
      $(chat).removeClass().addClass("d-flex my-2 justify-content-start");
      $(chat).find("#msg-container").removeClass().addClass("from");
    } else {
      $(chat).removeClass().addClass("d-flex my-2 justify-content-end");
      $(chat).find("#msg-container").removeClass().addClass("to");
    }
  }

  twemoji.parse($("#chat").get(0));

  $("#formstatus").text("Done");

  menuUp();

  $("#chat").show(1000);
}

/**
 * @brief goto top
 */
function gotoTop(evt) {
  $("html, body").animate({ scrollTop: 0 }, "fast");
}

/**
 * @brief goto down
 */
function gotoDown(evt) {
  $("html, body").animate({ scrollTop: $(document).height() }, "fast");
}

/**
 * @brief Scroll Event
 */
function scrollEvt(evt) {
  var docheight = $(document).height();
  var winheight = $(window).height();
  var scroll = $(window).scrollTop();
  var delta = 500;

  if (scroll < delta) {
    $("#upbtn").hide();
    $("#dnbtn").show();
  } else if (scroll + winheight + delta > docheight) {
    $("#upbtn").show();
    $("#dnbtn").hide();
  } else {
    $("#upbtn").show();
    $("#dnbtn").show();
  }
}

/**
 * @brief main
 */
function main() {
  // Add Event Listeners
  $("nav ul li button").on("click", openCloseMenu);
  $("#file-input").on("change", formfileInput);
  $("#formsubmit").on("click", formSubmit);
  $("#upbtn").on("click", gotoTop);
  $("#dnbtn").on("click", gotoDown);
  $(window).on("scroll", scrollEvt);

  // Initilize the page
  $("#upbtn").hide();
  $("#dnbtn").hide();
  $("#authors").prop("disabled", true);
  $("#formsubmit").prop("disabled", true);
}

/**
 * @brief Initialize
 */
$(function () {
  main();
  twemoji.parse($("body").get(0), {
    folder: "svg",
    ext: ".svg",
    size: 16,
  });
});