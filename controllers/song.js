'use strict'

var path = require('path');
var fs = require('fs');
var moongosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getSong(req, res) {
    var songId = req.params.id;

    Song.findById(songId).populate({ path: 'album' }).exec((err, song) => {
        if (err) {
            res.status(500).send({ message: "Error en la peticion canción" });
        } else {
            if (!song) {
                res.status(404).send({ message: "La canción no existe" });
            } else {
                res.status(200).send({ song });
            }
        }
    });

}

function saveSong(req, res) {
    var song = new Song();

    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al guardar cancion' });
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'No se ha guardado la canción' });
            } else {
                res.status(200).send({ song: songStored });
            }
        }
    });

}

function getSongs(req, res) {
    var albumId = req.params.album;
    var find = "";
    if (!albumId) {
        find = Song.find({}).sort('number');
    } else {
        find = Song.find({ album: albumId }).sort('number');
    }

    find.populate({
        path: 'album',
        populate: ({
            path: 'artist',
            model: 'Artist'
        })
    }).exec(function (err, songs) {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!songs) {
                res.status(404).send({ message: 'No hay canciones' });
            } else {
                res.status(200).send({ songs });
            }
        }
    });
}

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al actualizar la canción' });
        } else {
            if (!songUpdated) {
                res.status(404).send({ message: 'No se ha actualizado la canción' });
            } else {
                res.status(200).send({ song: songUpdated });
            }
        }
    });

}

function deleteSong(req, res) {
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor al eliminar cancion' });
        } else {
            if (!songRemoved) {
                res.status(404).send({ message: 'No se ha eliminado la canción' });
            } else {
                res.status(200).send({ song: songRemoved });
            }
        }
    });

}

function uploadFile(req, res) {
    var songId = req.params.id;
    var file_name = "No ha subido...";

    if (req.files) {
        var file_path = req.files.file.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];


        if (file_ext.toLowerCase() == 'mp3' || file_ext.toLowerCase() == 'ogg') {
            Song.findByIdAndUpdate(songId, { file: file_name }, (err, songUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar canción' });
                } else {
                    if (!songUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el canción' });
                    } else {
                        res.status(200).send({ song: songUpdated });
                    }
                }
            });
        } else {
            res.status(200).send({ message: 'Extensión del archivo no valida' });
        }

    } else {
        res.status(200).send({ message: 'No has subido ningun archivo...' });
    }
}

function getSongFile(req, res) {
    var songFile = req.params.songFile;
    var path_file = './uploads/songs/' + songFile;
    fs.exists(path_file, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe el archivo...' });
        }
    });
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};