window.executable = {
    /**
     * Check the user's settings on overwriting the exist file
     * @param  {string} file   'C:\Users\Bob\Desktop\cat.png'
     * @param  {string} name   'cat.png'
     * @param  {string} nameID 'cat__859196'
     */
    replaceOrRetain: function (file, name, nameID) {
        var fs = require('fs-extra');
        var path = require('path');
        var appData = require('nw.gui').App.dataPath;
        var tempFile = path.join(appData, 'temp', nameID + '.png');
        var original = path.join(appData, 'temp', name + '.png');
        ugui.helpers.getFileSize(tempFile, function (tempSize) {
            ugui.helpers.getFileSize(original, function (origSize) {
                var retentionSetting = ugui.args.overwrite.value;
                var sizeSetting = ugui.args.filesize.value;
                var temp = tempSize.bytes;
                var orig = origSize.bytes;
                $('.' + window.helpers.clean(nameID) + ' .after').text(temp.toLocaleString());
                $('.' + window.helpers.clean(nameID) + ' .profit').text((orig - temp).toLocaleString());
                window.helpers.updateFooter();
                if (
                  (sizeSetting == 'samesmall' && (temp <= orig)) ||
                  (sizeSetting == 'samelarge' && (temp >= orig)) ||
                  (sizeSetting == 'smaller' && (temp < orig)) ||
                  (sizeSetting == 'larger' && (temp > orig)) ||
                  (sizeSetting == 'always')
                ) {
                    if (retentionSetting == 'replace') {
                        fs.copy(tempFile, file, { 'clobber': true }, function () {
                            ugui.helpers.deleteAFile(tempFile);
                            ugui.helpers.deleteAFile(original);
                        });
                    } else if (retentionSetting == 'retain') {
                        var origFolder = path.dirname(file);
                        var outputFile = path.join(origFolder, nameID + '.png');
                        fs.copy(tempFile, outputFile, { 'clobber': false }, function () {
                            ugui.helpers.deleteAFile(tempFile);
                            ugui.helpers.deleteAFile(original);
                        });
                    }
                } else {
                    ugui.helpers.deleteAFile(copyOfOrig);
                    ugui.helpers.deleteAFile(tempFile);
                }
            });
        });
    },
    /**
     * Processes the PNG using zopfli.exe in the AppData folder
     * @param  {string} file   'C:\Users\Bob\Desktop\cat.png'
     * @param  {string} name   'cat'
     * @param  {string} nameID 'cat__859196'
     */
    run: function (file, name, nameID) {
        var fs = require('fs-extra');
        var path = require('path');
        var appData = require('nw.gui').App.dataPath;
        var appPath = process.cwd();
        var copyOfOrig = path.join(appData, 'temp', name + '.png');
        var iterations = ugui.args.iterations.value;
        fs.copy(file, copyOfOrig, function () {
            var exec = require('child_process').exec;
            var input = '"' + path.join(appData, 'temp', name) + '.png"';
            var output = '"' + path.join(appData, 'temp', nameID) + '.png"';
            var executableAndArgs = [
                path.join(appPath, 'zopflipng'),
                '--iterations=' + iterations,
                '--splitting=3',
                '--filters=01234mepb',
                '--lossy_transparent',
                input,
                output
            ].join(' ');

            var child = exec(executableAndArgs, function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('Executable Error:', error);
                } else {
                    this.replaceOrRetain(file, name, nameID);
                }
            }.bind(this));
        }.bind(this));
    }
};
