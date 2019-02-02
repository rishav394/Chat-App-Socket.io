// Make connection
var socket = io.connect('https://rishavchat.herokuapp.com/');
//var socket = io.connect('127.0.0.1:80');

// Random number function
function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Save cookies to remember username
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}


// Declaring audio elements
var audioElement;

$(document).ready(function () {
    // Query DOM
    var message = document.getElementById('message'),
        handle = document.getElementById('handle'),
        btn = document.getElementById('send'),
        output = document.getElementById('output'),
        feedback = document.getElementById('feedback');

    // Get user handle from the cookie
    var x = getCookie('handle');
    if (x) {
        handle.value = x;
    } else {
        handle.value = 'user' + String(randomIntFromInterval(1000, 9999))
    }

    socket.emit('user-joined', {
        handle: handle.value
    });

    // Set handle name in the cookie
    $('#handle').focusout(function () {
        var temp = getCookie('handle');
        if (temp === handle.value || handle.value === '') {
            handle.value = temp;
        } else {
            // Update in online variable
            socket.emit('name-change', {
                handle: handle.value
            });
            // Set the cookie for later use
            setCookie('handle', handle.value, 1);
        }
    });

    // Defining audio elements
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'https://soundbible.com/mp3/Pling-KevanGC-1485374730.mp3');

    // Emit events
    btn.addEventListener('click', function () {
        if (message.value !== '') {
            if (handle.value !== '') {
                socket.emit('chat', {
                    message: message.value,
                    handle: handle.value
                });
                message.value = "";
            }
        } else {
            // Warn the retarded user
        }
    });

    message.addEventListener('keypress', function () {
        socket.emit('typing', handle.value);
    });

    // Listen for events
    socket.on('chat', function (data) {
        audioElement.play();
        feedback.innerHTML = '';
        output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
        $("#chat-window").stop().animate({
            scrollTop: $("#output")[0].scrollHeight
        }, 800);
    });

    socket.on('typing', function (data) {
        feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
        $("#chat-window").stop().animate({
            scrollTop: $("#output")[0].scrollHeight
        }, 800);
    });

    socket.on('user-joined', function (data) {
        audioElement.play();
        $('#onliner').text('Secret Chat (' + data.online + ' online)');
        output.innerHTML += '<h3>' + data.handle + ' has joined the chat!</h3>';
        $("#chat-window").stop().animate({
            scrollTop: $("#output")[0].scrollHeight
        }, 1000);
    });

    socket.on('disconnect', function (data) {
        audioElement.play();
        $('#onliner').text('Secret Chat (' + data[1] + ' online)');
        output.innerHTML += '<h3>' + data[0] + ' has left the chat!</h3>';
        $("#chat-window").stop().animate({
            scrollTop: $("#output")[0].scrollHeight
        }, 1000);
    });

    socket.on('name-change', function (data) {
        output.innerHTML += '<h3>' + data[0] + ' changed their name to ' + data[1] + '</h3>';
        $("#chat-window").stop().animate({
            scrollTop: $("#output")[0].scrollHeight
        }, 1000);
    });

    // Enter handlers
    $('#message').on("keypress", function (e) {
        if (e.keyCode == 13) {
            btn.click();
            return false; // prevent the button click from happening
        }
    });

    $('#handle').on("keypress", function (e) {
        if (e.keyCode == 13) {
            message.focus();
            return false; // prevent the button click from happening
        }
    });
});