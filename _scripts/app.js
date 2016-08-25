



// GLOBALS

//Format time as 03:14:15
Date.prototype.timeNow = function(){
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) + ":" +
    ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + ":" + ((this.getSeconds() < 10)?"0":"") +
    this.getSeconds() + ((this.getHours()>12)?(' PM'):' AM');
};

//Turns 1234567 into 1,234,567
function numberCommas (num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Set up ability to use "startsWith" and "endsWith"
String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
};

String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
};

//Move stuff around in Arrays
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};






$(document).ready(function () {

    var fs = require('fs-extra');
    var path = require('path');
    var gui = require('nw.gui');
    var appData = gui.App.dataPath;
    var body = $('body')[0];
    var appLocation = ugui.app.pathToProject.slice(1).slice(0,-1);
    fs.copy(path.join(appLocation, 'defluff.exe'), path.join(appData, 'defluff.exe'));
    fs.emptyDir(path.join(appData, 'temp'));
    process.chdir(appData);

    // send files to the not already running app
    // ("Open With" or drag-n-drop)
    if (gui.App.argv.length) {
        var files = gui.App.argv.map(function (path) {
            return {
                name: path.substring(path.lastIndexOf('/') + 1),
                path: path
            };
        });

        onFilesDrop(files);
    }

    // send files to the already running app
    // ("Open With" or drag-n-drop)
    gui.App.on('open', function (path) {
        onFilesDrop([{
            name: path.substring(path.lastIndexOf('/') + 1),
            path: path
        }]);
    });

    body.ondragover = function () {
        return false;
    };

    body.ondragenter = function () {
        return false;
    };

    // drag-n-drop files to the app window's special holder
    body.ondrop = function (evt) {
        var files = [].slice.call(evt.dataTransfer.files);
        onFilesDrop(files);
        evt.preventDefault();
    };

    function updateBefores () {
        var befores = $('.before');
        var total = 0;
        for (var i = 0; i < befores.length; i++) {
            var before = befores[i];
            var value = $(before).text().split(',').join('');
            total = total + parseInt(value);
        }
        if (isNaN(total)) {
            total = 0;
        }
        total = numberCommas(total);
        $("#before").text(total);
    }

    function updateAfters () {
        var afters = $('.after');
        var total = 0;
        for (var i = 0; i < afters.length; i++) {
            var after = afters[i];
            var value = $(after).text().split(',').join('');
            total = total + parseInt(value);
        }
        if (isNaN(total)) {
            total = 0;
        }
        total = numberCommas(total);
        $("#after").text(total);
    }

    function updateProfits () {
        var before = parseInt($('#before').text().split(',').join(''));
        var after = parseInt($('#after').text().split(',').join(''));
        var subtract = before - after;
        if (isNaN(subtract)) {
            subtract = 0;
        }
        subtract = numberCommas(subtract);
        $("#profit").text(subtract);
    }

    function updateFooter () {
        updateBefores();
        updateAfters();
        updateProfits();
    }

    /**
     * Check the user's settings on overwriting the exist file
     * @param  {string} file   'C:\Users\Bob\Desktop\cat.png'
     * @param  {string} name   'cat.png'
     * @param  {string} nameID 'cat__859196'
     */
    function replaceOrRetain (file, name, nameID) {
        var tempFile = path.join('temp', nameID + '.png');
        var copyOfOrig = path.join('temp', name);
        ugui.helpers.getFileSize(tempFile, function (tempSize) {
            ugui.helpers.getFileSize(copyOfOrig, function (origSize) {
                var retentionSetting = ugui.args.overwrite.value;
                var sizeSetting = ugui.args.filesize.value;
                var temp = tempSize.bytes;
                var orig = origSize.bytes;
                $('.' + nameID + ' .after').text(numberCommas(temp));
                $('.' + nameID + ' .profit').text(numberCommas(orig - temp));
                updateFooter();
                if (
                  (sizeSetting == 'samesmall' && (temp <= orig)) ||
                  (sizeSetting == 'samelarge' && (temp >= orig)) ||
                  (sizeSetting == 'smaller' && (temp < orig)) ||
                  (sizeSetting == 'larger' && (temp > orig)) ||
                  (sizeSetting == 'always')
                ) {
                    var tempFileFullPath = path.join(appData, tempFile);
                    if (retentionSetting == "replace") {
                        fs.copy(tempFileFullPath, file, { 'clobber': true }, function () {
                            ugui.helpers.deleteAFile(path.join(appData, copyOfOrig));
                            ugui.helpers.deleteAFile(path.join(appData, tempFile));
                        });
                    } else if (retentionSetting == "retain") {
                        var origFolder = path.dirname(file);
                        var outputFile = path.join(origFolder, nameID + '.png');
                        fs.copy(tempFileFullPath, outputFile, { 'clobber': false }, function () {
                            ugui.helpers.deleteAFile(path.join(appData, copyOfOrig));
                            ugui.helpers.deleteAFile(path.join(appData, tempFile));
                        });
                    }
                }
            });
        });
    }

    /**
     * Processes the PNG using defluff.exe in the AppData folder
     * @param  {string} file   'C:\Users\Bob\Desktop\cat.png'
     * @param  {string} name   'cat.png'
     * @param  {string} nameID 'cat__859196'
     */
    function defluff (file, name, nameID) {
        var copyOfOrig = path.join(appData, 'temp', name);
        fs.copy(file, copyOfOrig, function () {
            process.chdir(appData);
            var exec = require("child_process").exec;
            var input = '<"' + path.join('temp', name) + '"';
            var output = '>"' + path.join('temp', nameID) + '.png"';
            var executableAndArgs = 'defluff ' + input + ' ' + output;

            var child = exec(executableAndArgs, function (error, stdout, stderr) {
                if (error !== null) {
                    console.log("Executable Error:", error);
                } else if (stderr.trim().endsWith('finished successfully')) {
                    replaceOrRetain(file, name, nameID);
                }
            });
        });
    }

    /**
     * Actions to perform when new files are imported
     * @param  {array} files A list of files
     */
    function onFilesDrop (files) {
        ugui.helpers.buildUGUIArgObject();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.name.endsWith('.png')) {
                // cat.png => cat
                var fileName = file.name.slice(0,-4);
                // 1472041859195 => "859195"
                var id = String(Date.now()).slice(7);
                // 859195 + 0 + 1 = 859196
                id = parseInt(id) + i + 1;
                // cat__859196
                var nameID = fileName + '__' + id;
                var row =
                '<tr class="file-row ' + nameID + '">' +
                  '<td class="name">' + fileName + '</td>' +
                  '<td class="before">' + numberCommas(file.size) + '</td>' +
                  '<td class="after"></td>' +
                  '<td class="profit"></td>' +
                '</tr>';
                $('.multi-file tbody').prepend(row);
                showFTUX(false);
                defluff(file.path, file.name, nameID);
            }
        };
    }




    $('a[href="#browse"]').click(function (evt) {
        evt.preventDefault();
        $("#browse").click();
    });

    $('#browse').change(function (evt) {
        var files = $('#browse')[0].files;
        onFilesDrop(files);
    });

    $('#clear').click(function (evt) {
        evt.preventDefault();
        $('.file-row').remove();
        showFTUX(true);
    });

    function showFTUX (show) {
        if (show) {
            $('.full-state').addClass('empty-state').removeClass('full-state');
            resizeFTUX();
        } else { //hide
            $('.empty-state').addClass('full-state').removeClass('empty-state');
            resizeFTUX();
        }
    }

    // resize table

    function resizeFTUX () {
        var newHeight = $('html').height();
        newHeight = newHeight - $('nav').height();
        newHeight = newHeight - $('nav').css('margin-top').split('px')[0];
        newHeight = newHeight - $('nav').css('margin-bottom').split('px')[0];
        newHeight = newHeight - $('.save-options').height();
        newHeight = newHeight - $('.save-options').css('margin-top').split('px')[0];
        newHeight = newHeight - $('.save-options').css('margin-bottom').split('px')[0];
        newHeight = newHeight - $('table').css('margin-top').split('px')[0];
        newHeight = newHeight - $('table').css('margin-bottom').split('px')[0];
        newHeight = newHeight - $('thead').height();
        newHeight = newHeight - $('tfoot').height();
        $('.drop-here').css('padding-top', Math.round(newHeight / 3) + 'px')
        newHeight = newHeight - $('.drop-here').css('padding-top').split('px')[0];
        $('.empty-state .drop-here').height(newHeight);
        $('.full-state .drop-here').css('height', 'auto');
        $('.full-state .drop-here').css('padding-top', '0px')
    }
    resizeFTUX();
    $(window).resize(resizeFTUX);

});
