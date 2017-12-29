function app () {
    var fs = require('fs-extra');
    var path = require('path');
    var nw = require('nw.gui');
    var appData = nw.App.dataPath;
    var body = $('body')[0];

    fs.emptyDir(path.join(appData, 'temp'));

    // send files to the already running app
    // ("Open With" or drag-n-drop)
    nw.App.on('open', function (path) {
        window.helpers.onFilesDrop([{
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
        window.helpers.onFilesDrop(files);
        evt.preventDefault();
    };

    $('a[href="#browse"]').click(function (evt) {
        evt.preventDefault();
        $("#browse").click();
    });

    $('#browse').change(function (evt) {
        var files = $('#browse')[0].files;
        window.helpers.onFilesDrop(files);
    });

    $('#clear').click(function (evt) {
        evt.preventDefault();
        $('.file-row').remove();
        window.helpers.showFTUX(true);
    });

    window.helpers.resizeFTUX();
    $(window).resize(window.helpers.resizeFTUX);

    window.helpers.handleArgs();
}

app();
