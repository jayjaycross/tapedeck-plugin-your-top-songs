'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (access_token, store) {
  var populate = function populate(playlistId, profileId, options) {
    return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', options).then(function (res) {
      return res.json();
    }).then(function (trackList) {
      var uris = trackList.items.map(function (track) {
        return track.uri;
      });

      var addOpts = Object.assign({}, options, {
        method: 'PUT',
        body: JSON.stringify({
          uris: uris
        })
      });

      return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/users/' + profileId + '/playlists/' + playlistId + '/tracks', addOpts).then(function () {
        return { playlistId: playlistId };
      });
    });
  };

  var options = {
    headers: { Authorization: 'Bearer ' + access_token }
  };

  var profilePending = (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/me', options);
  var playlistsPending = (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/me/playlists', options);

  return Promise.all([profilePending, playlistsPending]).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        profileReq = _ref2[0],
        playlistsReq = _ref2[1];

    return Promise.all([profileReq.json(), playlistsReq.json()]).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          profile = _ref4[0],
          playlists = _ref4[1];

      var playlist = store && playlists.items.filter(function (item) {
        return item.id === store.playlistId;
      })[0];
      if (playlist) {
        return populate(store.playlistId, profile.id, options);
      } else {
        var createOpts = Object.assign({}, options, {
          method: 'POST',
          body: JSON.stringify({
            name: 'Your Top Songs (TPDK 🤖)'
          })
        });
        return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/users/' + profile.id + '/playlists', createOpts).then(function (response) {
          return response.json();
        }).then(function (playlist) {
          return populate(playlist.id, profile.id, options);
        });
      }
    });
  });
};

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }