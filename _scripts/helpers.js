// HELPERS

var helpers = {
    // Switch to correct app
    // send files to the not already running app
    // ("Open With" or drag-n-drop)
    handleArgs: function () {
        var path = require('path');
        var nw = require('nw.gui');
        if (nw.App.argv.length) {
            var appName = nw.App.argv[0]; // 'zopfli'
            var currentPage = path.basename(location.href).split('.')[0]; // 'zopfli.html' => 'zopfli'
            if (appName === 'zopfli' && currentPage !== 'zopfli') {
                location.href = 'zopfli.htm';
            } else if (appName === 'truepng' && currentPage !== 'truepng') {
                location.href = 'truepng.htm';
            } else if (appName === 'defluff' && currentPage !== 'index') {
                location.href = 'index.htm';
            } else {
                var files = nw.App.argv.map(function (path) {
                    if (path.substring(path.lastIndexOf('/') + 1)) {
                        return {
                            name: path.substring(path.lastIndexOf('/') + 1),
                            path: path
                        };
                    }
                    return {};
                });

                this.onFilesDrop(files);
            }
        }
    },
    clean: function (str) {
        str = str.replace(/\ /g, '_');
        str = str.replace(/\!/g, '_');
        str = str.replace(/\)/g, '_');
        str = str.replace(/\(/g, '_');
        str = str.replace(/\$/g, '_');
        str = str.replace(/\#/g, '_');
        str = str.replace(/\%/g, '_');
        str = str.replace(/\^/g, '_');
        str = str.replace(/\&/g, '_');
        str = str.replace(/\=/g, '_');
        str = str.replace(/\+/g, '_');
        str = str.replace(/\./g, '_');
        str = str.replace(/\,/g, '_');
        str = str.replace(/\</g, '_');
        str = str.replace(/\>/g, '_');
        str = str.replace(/\?/g, '_');
        str = str.replace(/\"/g, '_');
        str = str.replace(/\'/g, '_');
        str = str.replace(/\:/g, '_');
        str = str.replace(/\;/g, '_');
        str = str.replace(/\{/g, '_');
        str = str.replace(/\}/g, '_');
        str = str.replace(/\[/g, '_');
        str = str.replace(/\]/g, '_');
        str = str.replace(/\|/g, '_');
        str = str.replace(/\@/g, '_');
        str = str.replace(/\~/g, '_');
        str = str.replace(/\`/g, '_');
        return str;
    },
    getColumnTotal: function (column) {
        var columnTotal = 0;
        var cells = $('.' + column);

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var cellValue = $(cell).text();
            cellValue = cellValue.replace(/,/g, '');
            cellValue = parseInt(cellValue);
            if (!isNaN(cellValue)) {
                columnTotal = columnTotal + cellValue;
            }
        }

        return columnTotal;
    },
    getPercent: function (a, b) {
        var percent = a / b;            // 0.9215683
        percent = percent * 1000;       // 921.5683
        percent = Math.round(percent);  // 922
        percent = percent / 10;         // 92.2
        percent = '(' + percent + '%)'; // (92.2%)
        return percent;
    },
    updateBefores: function () {
        var beforeTotal = this.getColumnTotal('before');
        beforeTotal = beforeTotal.toLocaleString();
        $("#before").text(beforeTotal);
    },
    updateAfters: function () {
        var afterTotal = this.getColumnTotal('after');
        var beforeTotal = this.getColumnTotal('before');
        var html = [
            afterTotal.toLocaleString(),
            this.getPercent(afterTotal, beforeTotal)
        ].join(' ');
        $('#after').html(html);
    },
    updateProfits: function () {
        var afterTotal = this.getColumnTotal('after');
        var beforeTotal = this.getColumnTotal('before');
        var subtract = beforeTotal - afterTotal;
        subtract = subtract.toLocaleString();
        $("#profit").text(subtract);
    },
    updateFooter: function () {
        this.updateBefores();
        this.updateAfters();
        this.updateProfits();
    },
    /**
     * Actions to perform when new files are imported
     * @param  {array} files A list of files
     */
    onFilesDrop: function (files) {
        var path = require('path');
        ugui.helpers.buildUGUIArgObject();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.path && file.name && file.name.endsWith('.png')) {
                // cat.png => cat
                var fileName = path.parse(file.name).name;
                // 1472041859195 => "859195"
                var id = String(Date.now()).slice(7);
                // 859195 + 0 + 1 = 859196
                id = parseInt(id) + i + 1;
                // cat__859196
                var nameID = fileName + '__' + id;

                var fileSize = file.size;
                if (!fileSize) {
                    fileSize = ugui.helpers.getFileSize(file.path).bytes;
                }
                fileSize = fileSize.toLocaleString();

                var row =
                '<tr class="file-row ' + this.clean(nameID) + '">' +
                  '<td class="name">' + fileName + '</td>' +
                  '<td class="before">' + fileSize + '</td>' +
                  '<td class="after"></td>' +
                  '<td class="profit"></td>' +
                '</tr>';
                $('.multi-file tbody').prepend(row);

                this.showFTUX(false);
                window.executable.run(file.path, fileName, nameID);
            }
        };
    },
    showFTUX: function (show) {
        if (show) {
            $('.full-state').addClass('empty-state').removeClass('full-state');
            this.resizeFTUX();
        } else { //hide
            $('.empty-state').addClass('full-state').removeClass('empty-state');
            this.resizeFTUX();
        }
    },
    // resize table
    resizeFTUX: function () {
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
};
