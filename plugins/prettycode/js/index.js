prettyCode = {};
prettyCode.pluginID = undefined;

prettyCode.init = function() {
    console.log('[Plugin] : prettyCode initialized');
    prettyCode.pluginID = BotlyAPI.myID('prettycode');
    BotlyAPI.renderContents[prettyCode.pluginID] = prettyCode.renderCode;
    BotlyAPI.changeTabEvents[prettyCode.pluginID] = prettyCode.changeTabEvent;
}

prettyCode.changeTabEvent = function() {
    BotlyAPI.resetPluginButtons();
    BotlyAPI.addFloatingButtons("open_in_browser", BotlyAPI.downloadCode);
    BotlyAPI.setPluginButtons();
}

prettyCode.renderCode = function() {
    var outputCode = BotlyAPI.getCode(BotlyAPI.getLanguage());

    if (outputCode !== BotlyAPI.getPreviousCode()) {
        var diff = JsDiff.diffWords(BotlyAPI.getPreviousCode(), outputCode);
        var resultStringArray = [];
        for (var i = 0; i < diff.length; i++) {
            if (!diff[i].removed) {
                var escapedCode = diff[i].value.replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                if (diff[i].added) {
                    resultStringArray.push(
                        '<span class="code_highlight_new">' + escapedCode + '</span>');
                } else {
                    resultStringArray.push(escapedCode);
                }
            }
        }

        var lang = BotlyAPI.getLanguage();
        if (lang == 'Arduino') {
            document.getElementById('content_code').innerHTML =
                prettyPrintOne(resultStringArray.join(''), 'cpp', false);
        } else if (lang == 'Python') {
            document.getElementById('content_code').innerHTML =
                prettyPrintOne(resultStringArray.join(''), 'py', false);
        } else if (lang == 'Javascript') {
            document.getElementById('content_code').innerHTML =
                prettyPrintOne(resultStringArray.join(''), 'js', false);
        }
        BotlyAPI.setPreviousCode(outputCode);
    }
}