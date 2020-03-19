var Robot = {}
Robot.currentTab = 1;
Robot.pluginID = undefined;
Robot.compiledHex = "";
Robot.serialConnected = false;

Robot.init = function () {
    console.log('[Plugin] : Robot initialized');
    var instance = M.Tabs.init(document.getElementById('robot_tabs'), { swipeable: false });
    instance = M.Tabs.init(document.getElementById('steps_tabs'), { swipeable: false });

    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        direction: 'left'
    });

    Robot.bindelement('download_button', function () {
        if (isMacintosh()) {
            window.open("https://github.com/Botly-Studio/uploadAgent/releases/download/1.0.10/BotlyStudio-Agent_MacOS.app.zip");
        } else if (isWindows()) {
            window.open("https://github.com/Botly-Studio/uploadAgent/releases/download/1.0.10/BotlyStudio-Agent_Windows_x64_x86.exe");
        }
    });

    Robot.bindelement('reset_button', function () {
        Robot.reset();
    });

    Robot.bindelement('upload_again', function () {
        Robot.upload(Robot.compiledHex);
    });

    Robot.bindelement('upload_new', function () {
        Robot.reset();
    });

    Robot.bindelement('action_button', function () {
        Robot.actionButtonCallback();
    })


    Robot.bindelements('prev', function () {
        var instance = M.Tabs.getInstance(document.getElementById('steps_tabs'));
        if (instance.index > 0)
            instance.select('tab' + instance.index);
    })

    Robot.bindelements('next', function () {
        var instance = M.Tabs.getInstance(document.getElementById('steps_tabs'));
        if (instance.index < 3)
            instance.select('tab' + (instance.index + 2));
        else {
            instance = M.Tabs.getInstance(document.getElementById('robot_tabs'));
            Robot.next();
        }
    })


    BotlyAPI.onSerialConnected = function () {
        Robot.serialConnected = true;
    }



    Robot.pluginID = BotlyAPI.myID('robot');

    BotlyAPI.changeTabEvents[Robot.pluginID] = Robot.changeTabEvent;
}

Robot.changeTabEvent = function () {
    Robot.reset();
    BotlyAPI.resetPluginButtons();
}

Robot.reset = function () {
    //reset progressBar
    Robot.currentTab = 1;
    Robot.serialConnected = false;
    var array = document.getElementById('breadcrumb_wrapper').getElementsByTagName('a');

    l = array.length;
    for (var i = 0; i < l; i++) {
        array[i].className = 'breadcrumb next';
    }

    document.getElementsByClassName('breadcrumb next')[0].className = 'breadcrumb current';

    //select first tab
    var instance = M.Tabs.getInstance(document.getElementById('robot_tabs'));
    instance.select('step0');
    Robot.updateTab();
}

Robot.showLoader = function () {
    document.getElementById("loader_wrapper").className = "loader_wrapper";
}

Robot.hideLoader = function () {
    document.getElementById("loader_wrapper").className = "visibility";
}

Robot.setErrorText = function (msg) {
    document.getElementById('state_msg').className = "visibility";
    document.getElementById('error_msg').innerHTML = msg;
    document.getElementById('error_wrapper').className = "card blue-grey darken-1";
}

Robot.setInfoText = function (msg) {
    document.getElementById('error_wrapper').className = "visibility";
    document.getElementById('state_msg').innerHTML = msg;
    document.getElementById('state_msg').className = "loading_text center";
}

Robot.hideText = function (msg) {
    document.getElementById('error_wrapper').className = "visibility";
    document.getElementById('state_msg').className = "visibility";
}


Robot.setActionButton = function (msg, icon, cb) {
    msg = msg || "Chargement";
    icon = icon || "hourglass_empty"
    cb = cb || function () { };
    document.getElementById('action_button').className = "arduino_orange center waves-effect waves-light btn";
    document.getElementById('action_button').innerHTML = msg + " <i class='material-icons left'>" + icon + "</i>";
    Robot.actionButtonCallback = cb;
}

Robot.hideButton = function () {
    document.getElementById('action_button').className = "visibility";
    document.getElementById('download_button').className = 'visibility';
    document.getElementById('reset_button').className = 'visibility';
    Robot.actionButtonCallback = function () { };
}


Robot.actionButtonCallback = function () { };


Robot.next = function () {

    if (Robot.currentTab < 5) {
        document.getElementsByClassName('breadcrumb current')[0].className = 'breadcrumb previous';
        document.getElementsByClassName('breadcrumb next')[0].className = 'breadcrumb current';
        var instance = M.Tabs.getInstance(document.getElementById('robot_tabs'));
        Robot.currentTab++;
        instance.select('step' + Robot.currentTab);

    }
    console.log('Next : ' + Robot.currentTab)
    Robot.updateTab();
}

Robot.previous = function () {
    if (Robot.currentTab >= 1) {
        var array = document.getElementsByClassName('breadcrumb current')
        array[array.length - 1].className = 'breadcrumb next';

        array = document.getElementsByClassName('breadcrumb previous')
        array[array.length - 1].className = 'breadcrumb current';
        var instance = M.Tabs.getInstance(document.getElementById('robot_tabs'));
        Robot.currentTab--;
        instance.select('step' + Robot.currentTab);
    }
    Robot.updateTab();
}

Robot.updateTab = function () {
    switch (Robot.currentTab) {
        case 1:
            Robot.showLoader();
            Robot.hideButton();
            Robot.setInfoText("Connexion à l'agent")
            Robot.connect();
            break;
        case 2:
            Robot.hideLoader();
            Robot.hideButton();
            Robot.hideText();
            break;
        case 3:
            Robot.showLoader();
            Robot.hideButton();
            Robot.setInfoText("Initialisation de la communication série")
            Robot.checkSerial();
            break;
        case 4:
            Robot.showLoader();
            Robot.hideButton();
            Robot.setInfoText("Compilation")
            Robot.compile();
            break;
        case 5:
            Robot.showLoader();
            Robot.hideButton();
            Robot.setInfoText("Téléversement")
            Robot.upload();
            break;
        default:
            break;
    }
};

Robot.error = function () {
    switch (Robot.currentTab) {
        case 1:
            Robot.hideLoader();
            Robot.setErrorText("Botly-Studio n'a pas détécté l'agent local sur votre ordinateur");
            Robot.setActionButton("Reéssayer", "refresh", function () {
                Robot.updateTab();
            });
            document.getElementById('download_button').className = 'arduino_blue center waves-effect waves-light btn';
            break;
        case 2:

            break;
        case 3:
            Robot.hideLoader();
            Robot.setErrorText("Botly-Studio n'est pas parvenu à communiquer avec le robot");
            Robot.setActionButton("Reéssayer", "refresh", function () {
                Robot.updateTab();
            });
            document.getElementById('reset_button').className = 'arduino_blue center waves-effect waves-light btn';
            break;
        case 4:
            Robot.hideLoader();
            Robot.setErrorText("La compilation a échouée")
            Robot.setActionButton("Reéssayer", "refresh", function () {
                Robot.updateTab();
            });
            break;
        case 5:

            break;
        default:
            break;
    }
};


Robot.fail = function () {
    Robot.error();
}

Robot.success = function () {
    Robot.next();
}

Robot.connect = function () {
    BotlyAPI.connectAgent({ success: Robot.success, fail: Robot.fail });
}


Robot.compileFail = function (err, status) {
    console.log("Erreur : ")
    console.log(err)
    console.log("Status : ")
    console.log(status)
    Robot.error();
}

Robot.compileSuccess = function (hex) {
    Robot.compiledHex = hex;
    Robot.next();
}

Robot.offline = function (err, status) {
    console.log("Erreur : ")
    console.log(err)
    console.log("Status : ")
    console.log(status)
    Robot.hideLoader();
    Robot.setErrorText("Oups ! Le serveur de compilation semble indisponible")
    Robot.setActionButton("Reéssayer", "refresh", function () {
        Robot.updateTab();
    });
}

Robot.compile = function () {
    BotlyAPI.compile(BotlyAPI.getCode('Arduino'), { success: Robot.compileSuccess, fail: Robot.compileFail, offline: Robot.offline });
}


Robot.uploadFail = function () {

}

Robot.uploadSuccess = function () {
    Robot.hideLoader();
    Robot.hideText();
}

Robot.upload = function () {
    BotlyAPI.upload(Robot.compiledHex, { success: Robot.uploadSuccess, fail: Robot.uploadFail });
}


Robot.checkSerial = function () {
    BotlyAPI.checkSerial();
    setTimeout(() => {
        if (!Robot.serialConnected)
            Robot.error();
        else {
            Robot.next();
        }
    }, 2000);
}




Robot.bindelements = function (className, func) {
    elBtn = document.getElementsByClassName(className);
    // Need to ensure both, touch and click, events don't fire for the same thing
    var propagateOnce = function (e) {
        e.stopPropagation();
        e.preventDefault();
        func()
    };

    for (var i = 0; i < elBtn.length; i++) {
        elBtn[i].addEventListener('ontouchend', propagateOnce);
        elBtn[i].addEventListener('click', propagateOnce);
    }
}


Robot.bindelement = function (id, func) {
    elBtn = document.getElementById(id);
    // Need to ensure both, touch and click, events don't fire for the same thing
    var propagateOnce = function (e) {
        e.stopPropagation();
        e.preventDefault();
        func()
    };
    elBtn.addEventListener('ontouchend', propagateOnce);
    elBtn.addEventListener('click', propagateOnce);
}


function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1
}

function isWindows() {
    return navigator.platform.indexOf('Win') > -1
}