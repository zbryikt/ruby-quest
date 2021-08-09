var cp, stage, s, args;
cp = function(it){
  return JSON.parse(JSON.stringify(it));
};
stage = function(){
  this.data = {};
  this.dim = {};
  this.mapsets = {
    list: []
  };
  this.user = {
    item: []
  };
  this.cursor = {
    key: 'c'
  };
  this.lv = 0;
  this.ldcv = {};
  this.snd = {};
  this.mode = 'intro';
  return this;
};
stage.dim = {
  size: 32,
  vp: 12
};
stage.tileinfo = {
  a: {
    name: 'void',
    through: true,
    over: false,
    fill: true,
    push: true
  },
  b: {
    name: 'bedrock',
    through: false,
    over: true,
    fill: false,
    push: false
  },
  c: {
    name: 'earth',
    through: false,
    over: true,
    fill: false,
    push: false
  },
  d: {
    name: 'wall',
    through: false,
    over: true,
    fill: false,
    push: false
  },
  e: {
    name: 'stool',
    through: false,
    over: true,
    fill: false,
    push: false
  },
  f: {
    name: 'grass',
    through: false,
    over: false,
    fill: true,
    push: false
  },
  g: {
    name: 'door',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  h: {
    name: 'key',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  i: {
    name: 'exit',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  j: {
    name: 'stair',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  k: {
    name: 'gravel',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  l: {
    name: 'sapphire',
    through: true,
    over: false,
    fill: false,
    push: false,
    score: 10
  },
  m: {
    name: 'button',
    through: true,
    over: false,
    fill: false,
    push: false
  },
  n: {
    name: 'button-pressed',
    through: true,
    over: false,
    fill: true,
    push: false
  },
  o: {
    name: 'trapwall',
    through: true,
    over: false,
    fill: true,
    push: false
  },
  p: {
    name: 'trapdoor',
    through: false,
    over: true,
    fill: false,
    push: false
  },
  q: {
    name: 'amethyst',
    through: true,
    over: false,
    fill: false,
    push: false,
    score: 250
  },
  r: {
    name: 'topaz',
    through: true,
    over: false,
    fill: false,
    push: false,
    score: 1250
  },
  s: {
    name: 'emerald',
    through: true,
    over: false,
    fill: false,
    push: false,
    score: 50
  },
  t: {
    name: 'spike',
    through: false,
    over: false,
    fill: false,
    push: false
  }
};
stage.prototype = import$(Object.create(Object.prototype), {
  restart: function(){
    this.user.score = this.user.startScore;
    return this.load({
      lv: this.lv
    });
  },
  reset: function(){
    this.user.score = 0;
    return this.load({
      lv: 0
    });
  },
  sndPause: function(n){
    return this.snd[n].pause();
  },
  sndPlay: function(n, opt){
    opt == null && (opt = {});
    if (opt.loop) {
      this.snd[n].loop = true;
    }
    this.snd[n].currentTime = 0;
    return this.snd[n].play();
  },
  setMode: function(mode){
    mode == null && (mode = 'edit');
    if (mode === 'edit') {
      if (this.editData) {
        this.data = cp(this.editData);
        this.tiles = this.data.tiles;
        this.users = this.data.users;
      }
      this.mode = 'edit';
      this.sndPause('bgm');
      return this.render();
    } else if (mode === 'intro') {
      this.mode = 'intro';
      this.sndPause('bgm');
      return this.render();
    } else {
      import$(this.user, this.data.user);
      this.mode = 'play';
      return this.render();
    }
  },
  init: function(){
    var touchMove, view, this$ = this;
    touchMove = function(arg$){
      var node, evt, box, ref$, x, y, dir, u;
      node = arg$.node, evt = arg$.evt;
      box = node.getBoundingClientRect();
      ref$ = [evt.touches[0].pageX, evt.touches[0].pageY], x = ref$[0], y = ref$[1];
      x = (x - box.x) / box.width;
      y = (y - box.y) / box.height;
      dir = Math.abs(x - 0.5) > Math.abs(y - 0.5)
        ? x > 0.5 ? 2 : 0
        : y > 0.5 ? 3 : 1;
      u = this$.user;
      if (u.dir !== dir || !u.moving) {
        u.lastMoveTime = null;
      }
      u.dir = dir;
      u.moving = true;
      this$.el.user.style.backgroundPositionY = -stage.dim.size * 1.4964 * [2, 1, 3, 0][dir] + "px";
      evt.preventDefault();
      return node.textContent = "";
    };
    this.ldld = new ldLoader({
      'class': 'ldld full'
    });
    this.ldld.on();
    this.view = view = new ldView({
      initRender: false,
      root: document.body,
      init: {
        finish: function(arg$){
          var node;
          node = arg$.node;
          return this$.ldcv.finish = new ldCover({
            root: node
          });
        },
        picked: function(arg$){
          var node;
          node = arg$.node;
          return node.appendChild(this$.el.sampleTile.cloneNode(true));
        }
      },
      text: {
        lv: function(){
          if (this$.lv != null) {
            return this$.lv + 1;
          } else {
            return '-';
          }
        },
        score: function(){
          return this$.user.score || 0;
        }
      },
      handler: {
        mapset: {
          list: function(){
            var ref$;
            return (ref$ = this$.mapsets).list || (ref$.list = []);
          },
          key: function(it){
            return it.name;
          },
          handler: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            node.innerText = data.name;
            return node.value = data.id;
          }
        },
        "on-mode": function(arg$){
          var node, mode;
          node = arg$.node;
          mode = node.getAttribute('data-mode');
          return node.classList.toggle('d-none', mode !== this$.mode);
        },
        "sample-tile": function(){},
        field: function(){},
        user: function(){},
        cursor: function(){},
        scene: function(){},
        lv: function(){},
        score: function(){},
        picked: function(arg$){
          var node;
          node = arg$.node;
          return node.childNodes[0].setAttribute('class', (['tile'].concat([stage.tileinfo[this$.cursor.key].name])).join(' '));
        },
        screen: function(arg$){
          var node, n;
          node = arg$.node;
          n = node.getAttribute('data-name').split(' ');
          return node.classList.toggle('d-none', !in$(this$.mode, n));
        }
      },
      action: {
        touchstart: {
          gamepad: function(arg$){
            var node, evt;
            node = arg$.node, evt = arg$.evt;
            if (this$.snd.bgm.paused && this$.mode === 'play') {
              this$.sndPlay('bgm', {
                loop: true
              });
            }
            return touchMove({
              node: node,
              evt: evt
            });
          }
        },
        touchmove: {
          gamepad: function(arg$){
            var node, evt;
            node = arg$.node, evt = arg$.evt;
            return touchMove({
              node: node,
              evt: evt
            });
          }
        },
        touchend: {
          gamepad: function(arg$){
            var node, evt;
            node = arg$.node, evt = arg$.evt;
            this$.user.moving = false;
            return evt.preventDefault();
          }
        },
        click: {
          start: function(){
            var mapsetName;
            this$.setMode('play');
            mapsetName = view.get('selected-mapset').value;
            return ld$.fetch("assets/map/" + mapsetName + "/index.json", {
              method: 'GET'
            }, {
              type: 'json'
            }).then(function(it){
              this$.mapset = it;
              return this$.load({
                lv: 0
              });
            });
          },
          "go-edit": function(){
            return this$.setMode('edit');
          },
          "test-run": function(){
            this$.editData = cp(this$.data);
            return this$.setMode('play');
          },
          "download": function(){
            var href, n;
            href = URL.createObjectURL(new Blob([JSON.stringify(this$.data)], {
              type: 'application/json'
            }));
            n = ld$.create({
              name: 'a',
              attr: {
                href: href,
                download: 'result.json'
              }
            });
            document.body.appendChild(n);
            n.click();
            return document.body.removeChild(n);
          },
          restart: function(){
            return this$.restart();
          },
          reset: function(){
            this$.ldcv.finish.toggle(false);
            return this$.reset();
          },
          ext: function(arg$){
            var node, type, ref$;
            node = arg$.node;
            type = +node.getAttribute('data-type');
            if (type === 0) {
              this$.tiles.map(function(it){
                return it.map(function(it){
                  return it.splice(0, 0, cp(it[0]));
                });
              });
            }
            if (type === 1) {
              this$.tiles.map(function(it){
                return it.splice(0, 0, cp(it[0]));
              });
            }
            if (type === 2) {
              this$.tiles.map(function(it){
                return it.map(function(it){
                  return it.splice(it.length, 0, cp(it[it.length - 1]));
                });
              });
            }
            if (type === 3) {
              this$.tiles.map(function(it){
                return it.splice(it.length, 0, cp(it[it.length - 1]));
              });
            }
            if (type === 4) {
              this$.tiles.map(function(it){
                return it.map(function(it){
                  return it.splice(0, 1);
                });
              });
            }
            if (type === 5) {
              this$.tiles.map(function(it){
                return it.splice(0, 1);
              });
            }
            if (type === 6) {
              this$.tiles.map(function(it){
                return it.map(function(it){
                  return it.splice(it.length - 1, 1);
                });
              });
            }
            if (type === 7) {
              this$.tiles.map(function(it){
                return it.splice(it.length - 1, 1);
              });
            }
            if (type === 8) {
              this$.tiles.splice(this$.tiles.length, 0, (ref$ = this$.tiles)[ref$.length - 1].map(function(it){
                return it.map(function(){
                  return 'a';
                });
              }));
            }
            if (type === 9) {
              this$.tiles.splice(0, 0, cp(this$.tiles[0]));
            }
            if (type === 10 && this$.tiles.length > 1) {
              this$.tiles.splice(this$.tiles.length - 1, 1);
            }
            if (type === 11 && this$.tiles.length > 1) {
              this$.tiles.splice(0, 1);
            }
            this$.prepare();
            return this$.render();
          }
        }
      }
    });
    this.el = {
      sampleTile: view.get('sample-tile').cloneNode(true),
      scene: view.get('scene'),
      field: view.get('field'),
      user: view.get('user'),
      cursor: view.get('cursor'),
      picked: view.get('picked')
    };
    this.el.sampleTile.classList.remove('d-none');
    this.view.render();
    this.snd.bgm = new Audio('assets/snd/adventure.mp3');
    this.snd.get = new Audio('assets/snd/get.ogg');
    this.snd.pass = new Audio('assets/snd/pass.ogg');
    this.snd.key = new Audio('assets/snd/key.ogg');
    this.snd.push = new Audio('assets/snd/push.ogg');
    this.snd.hit = new Audio('assets/snd/hit.ogg');
    this.snd.press = new Audio('assets/snd/press.ogg');
    requestAnimationFrame(function(t){
      return this$.firekey(t);
    });
    document.addEventListener('keyup', function(e){
      var keycode, u, dir;
      keycode = e.which;
      if (keycode === 32) {
        this$.cursor.entering = false;
      }
      if (keycode < 37 || keycode > 40) {
        return;
      }
      u = this$.user;
      dir = keycode - 37;
      if (u.dir === dir) {
        return u.moving = false;
      }
    });
    document.addEventListener('keydown', function(e){
      var ref$, u, keycode, ref1$, delta, i, j, ks, res$, k, dir;
      ref$ = [this$.user, e.which], u = ref$[0], keycode = ref$[1];
      if (this$.snd.bgm.paused && this$.mode === 'play') {
        this$.sndPlay('bgm', {
          loop: true
        });
      }
      if (keycode === 82 && this$.mode === 'play') {
        return this$.restart();
      }
      if (this$.mode === 'edit') {
        if (keycode === 80) {
          ref1$ = this$.data.user;
          ref1$.x = (ref$ = this$.user).x;
          ref1$.y = ref$.y;
          ref1$.f = ref$.f;
          this$.renderUser();
        }
        if (keycode === 83 || keycode === 87) {
          delta = keycode === 83 ? -1 : 1;
          u.f = (ref1$ = u.f + delta) > 0 ? ref1$ : 0;
          if (u.f >= this$.dim.f) {
            u.f = this$.dim.f - 1;
          }
          if (!this$.tiles[u.f]) {
            this$.tiles[u.f] = (function(){
              var i$, to$, lresult$, j$, to1$, results$ = [];
              for (i$ = 0, to$ = this.dim.h; i$ < to$; ++i$) {
                i = i$;
                lresult$ = [];
                for (j$ = 0, to1$ = this.dim.w; j$ < to1$; ++j$) {
                  j = j$;
                  lresult$.push('a');
                }
                results$.push(lresult$);
              }
              return results$;
            }.call(this$));
          }
          this$.render();
        }
        if (keycode === 65 || keycode === 68) {
          res$ = [];
          for (k in stage.tileinfo) {
            res$.push(k);
          }
          ks = res$;
          delta = keycode === 65 ? -1 : 1;
          this$.cursor.key = ks[(ks.indexOf(this$.cursor.key) + delta + ks.length) % ks.length];
          this$.renderUser();
        }
        if (keycode === 8) {
          this$.tiles[u.f][u.y][u.x] = 'a';
          this$.render();
        }
        if (keycode === 32) {
          this$.cursor.entering = true;
          this$.tiles[u.f][u.y][u.x] = this$.cursor.key;
          this$.render();
        }
        if (keycode === 70) {
          this$.tiles[u.f].map(function(it){
            var i$, to$, i, results$ = [];
            for (i$ = 0, to$ = it.length; i$ < to$; ++i$) {
              i = i$;
              results$.push(it[i] = this$.cursor.key);
            }
            return results$;
          });
          this$.render();
        }
      }
      if (keycode < 37 || keycode > 40) {
        return;
      }
      dir = keycode - 37;
      if (u.dir !== dir || !u.moving) {
        u.lastMoveTime = null;
      }
      u.dir = dir;
      u.moving = true;
      return this$.el.user.style.backgroundPositionY = -stage.dim.size * 1.4964 * [2, 1, 3, 0][dir] + "px";
    });
    return ld$.fetch("assets/map/index.json", {
      method: "GET"
    }, {
      type: "json"
    }).then(function(it){
      this$.mapsets = it;
      this$.view.render('mapset');
      return this$.ldld.off();
    });
  },
  zIndex: function(arg$){
    var x, y, f, p;
    x = arg$.x, y = arg$.y, f = arg$.f, p = arg$.p;
    return (f * this.dim.w * this.dim.h + y) * 2 + (p ? 1 : 0);
  },
  renderUser: function(){
    var ref$, blockSize, blockVp, x, y, f;
    ref$ = [stage.dim.size, stage.dim.vp], blockSize = ref$[0], blockVp = ref$[1];
    ref$ = this.mode === 'play'
      ? this.user
      : this.data.user, x = ref$.x, y = ref$.y, f = ref$.f;
    import$(this.el.user.style, {
      left: x * blockSize + "px",
      top: (y * blockSize - f * blockVp) + "px",
      zIndex: this.zIndex({
        f: f,
        y: y,
        x: x,
        p: 1
      })
    });
    import$(this.el.cursor.style, {
      left: this.user.x * blockSize + "px",
      top: (this.user.y * blockSize - this.user.f * blockVp) + "px",
      zIndex: this.zIndex({
        f: this.user.f,
        y: this.user.y,
        x: this.user.x,
        p: 1
      })
    });
    this.el.cursor.style.display = this.mode === 'edit' ? 'block' : 'none';
    return this.view.render('picked');
  },
  render: function(){
    var ref$, dim, tiles, tileinfo, blockSize, blockVp, sample, field, scene, res$, i$, to$, f, lresult$, j$, to1$, h, lresult1$, k$, to2$, w, n;
    ref$ = [this.dim, this.tiles, stage.tileinfo], dim = ref$[0], tiles = ref$[1], tileinfo = ref$[2];
    ref$ = [stage.dim.size, stage.dim.vp], blockSize = ref$[0], blockVp = ref$[1];
    ref$ = [this.el.sampleTile, this.el.field, this.el.scene], sample = ref$[0], field = ref$[1], scene = ref$[2];
    import$(scene.style, {
      width: dim.w * blockSize + "px",
      height: (dim.h * blockSize + blockVp) + "px"
    });
    field.innerHTML = "";
    this.nodes = [];
    res$ = [];
    for (i$ = 0, to$ = dim.f; i$ < to$; ++i$) {
      f = i$;
      lresult$ = [];
      for (j$ = 0, to1$ = dim.h; j$ < to1$; ++j$) {
        h = j$;
        lresult1$ = [];
        for (k$ = 0, to2$ = dim.w; k$ < to2$; ++k$) {
          w = k$;
          n = sample.cloneNode(true);
          field.appendChild(n);
          n.classList.add(tileinfo[tiles[f][h][w]].name);
          import$(n.style, {
            left: w * blockSize + "px",
            top: (h * blockSize - f * blockVp) + "px",
            zIndex: this.zIndex({
              f: f,
              x: w,
              y: h,
              p: 0
            })
          });
          lresult1$.push(n);
        }
        lresult$.push(lresult1$);
      }
      res$.push(lresult$);
    }
    this.nodes = res$;
    this.renderUser();
    return this.view.render();
  },
  prepare: function(){
    this.tiles = this.data.tiles;
    import$(this.user, this.data.user);
    return import$(this.dim, {
      f: this.data.tiles.length,
      h: this.data.tiles[0].length,
      w: this.data.tiles[0][0].length
    });
  },
  edit: function(){
    var i, j;
    this.mode = 'edit';
    this.data = {
      user: {
        x: 0,
        y: 0,
        f: 0
      },
      tiles: [(function(){
        var i$, lresult$, j$, results$ = [];
        for (i$ = 0; i$ < 10; ++i$) {
          i = i$;
          lresult$ = [];
          for (j$ = 0; j$ < 10; ++j$) {
            j = j$;
            lresult$.push('a');
          }
          results$.push(lresult$);
        }
        return results$;
      }())]
    };
    this.prepare();
    return this.render();
  },
  load: function(arg$){
    var lv, path, mode, mapset, p, this$ = this;
    lv = arg$.lv, path = arg$.path, mode = arg$.mode, mapset = arg$.mapset;
    p = mapset
      ? ld$.fetch("assets/map/" + mapset + "/index.json", {
        method: 'GET'
      }, {
        type: 'json'
      }).then(function(it){
        return this$.mapset = it;
      })
      : Promise.resolve();
    return p.then(function(){
      var map, path;
      if (!(map = this$.mapset.list[lv])) {
        return this$.ldcv.finish.toggle(true);
      }
      path = "assets/map/" + this$.mapset.id + "/" + map.fn + ".json";
      return ld$.fetch(path, {}, {
        type: 'text'
      });
    }).then(function(ret){
      var e;
      try {
        this$.data = JSON.parse(ret);
      } catch (e$) {
        e = e$;
        this$.data = eval(ret);
      }
      this$.lv = lv;
      this$.user.startScore = this$.user.score;
      this$.prepare();
      return this$.setMode(mode || 'play');
    })['catch'](function(){
      return this$.ldcv.finish.toggle(true);
    });
  },
  convert: function(arg$){
    var x, y, f, src, des;
    x = arg$.x, y = arg$.y, f = arg$.f, src = arg$.src, des = arg$.des;
    this.tiles[f][y][x] = des;
    this.nodes[f][y][x].classList.remove(stage.tileinfo[src].name);
    return this.nodes[f][y][x].classList.add(stage.tileinfo[des].name);
  },
  transform: function(arg$){
    var src, des, ref$, tiles, nodes, tileinfo, dim, i$, to$, f, lresult$, j$, to1$, h, lresult1$, k$, to2$, w, results$ = [];
    src = arg$.src, des = arg$.des;
    ref$ = [this.tiles, this.nodes, stage.tileinfo, this.dim], tiles = ref$[0], nodes = ref$[1], tileinfo = ref$[2], dim = ref$[3];
    for (i$ = 0, to$ = dim.f; i$ < to$; ++i$) {
      f = i$;
      lresult$ = [];
      for (j$ = 0, to1$ = dim.h; j$ < to1$; ++j$) {
        h = j$;
        lresult1$ = [];
        for (k$ = 0, to2$ = dim.w; k$ < to2$; ++k$) {
          w = k$;
          if (!(tiles[f][h][w] === src)) {
            continue;
          }
          tiles[f][h][w] = des;
          nodes[f][h][w].classList.remove(tileinfo[src].name);
          lresult1$.push(nodes[f][h][w].classList.add(tileinfo[des].name));
        }
        lresult$.push(lresult1$);
      }
      results$.push(lresult$);
    }
    return results$;
  }
});
stage.prototype.firekey = function(t){
  var ref$, tileinfo, u, applyDefault, blockSize, blockVp, dx, dy, prepare, p, f, ts, p0, p1, p2, pd, n, df, dk, that, this$ = this;
  ref$ = [stage.tileinfo, this.user, true], tileinfo = ref$[0], u = ref$[1], applyDefault = ref$[2];
  ref$ = [stage.dim.size, stage.dim.vp], blockSize = ref$[0], blockVp = ref$[1];
  requestAnimationFrame(function(t){
    return this$.firekey(t);
  });
  if (!u.moving || (u.lastMoveTime && t - u.lastMoveTime < 160)) {
    return;
  }
  u.lastMoveTime = t;
  ref$ = (function(){
    switch (u.dir) {
    case 0:
      return [-1, 0];
    case 1:
      return [0, -1];
    case 2:
      return [1, 0];
    case 3:
      return [0, 1];
    default:
      return [NaN, NaN];
    }
  }()), dx = ref$[0], dy = ref$[1];
  if (isNaN(dx)) {
    return;
  }
  prepare = function(){
    var p, p0, p1, pd, p2, f, ts, res$, i$, i, lresult$, j$, d, ref$, cx, cy, cf;
    p = [
      p0 = {
        x: u.x,
        y: u.y
      }, p1 = pd = {
        x: u.x + dx,
        y: u.y + dy,
        f: u.f
      }, p2 = {
        x: u.x + 2 * dx,
        y: u.y + 2 * dy
      }
    ];
    f = [u.f - 1, u.f, u.f + 1];
    if (p1.x < 0 || p1.x >= this$.dim.w || p1.y < 0 || p1.y >= this$.dim.h || f[1] < 0 || f[1] >= this$.dim.f) {
      return [];
    }
    res$ = [];
    for (i$ = 0; i$ < 3; ++i$) {
      i = i$;
      lresult$ = [];
      for (j$ = 0; j$ < 3; ++j$) {
        d = j$;
        ref$ = [p[d].x, p[d].y, f[i]], cx = ref$[0], cy = ref$[1], cf = ref$[2];
        if (cx < 0 || cx >= this$.dim.w || cy < 0 || cy >= this$.dim.h || cf < 0 || cf >= this$.dim.f) {
          lresult$.push(0);
        } else if (!this$.tiles[cf]) {
          lresult$.push(0);
        } else {
          lresult$.push(this$.tiles[cf][cy][cx]);
        }
      }
      res$.push(lresult$);
    }
    ts = res$;
    return [p, f, ts, p0, p1, p2, pd];
  };
  ref$ = prepare(), p = ref$[0], f = ref$[1], ts = ref$[2], p0 = ref$[3], p1 = ref$[4], p2 = ref$[5], pd = ref$[6];
  if (!p) {
    return;
  }
  if (this.mode === 'edit') {
    import$(u, pd);
    if (this.cursor.entering) {
      this.tiles[u.f][u.y][u.x] = this.cursor.key;
      this.render();
    } else {
      this.renderUser();
    }
    return;
  }
  if (ts[1][0] === 'j' && (tileinfo[ts[1][1]] && tileinfo[ts[1][1]].over) && (!tileinfo[ts[2][1]] || tileinfo[ts[2][1]].through)) {
    u.f = u.f + 1;
    ref$ = prepare(), p = ref$[0], f = ref$[1], ts = ref$[2], p0 = ref$[3], p1 = ref$[4], p2 = ref$[5], pd = ref$[6];
    if (!p) {
      return;
    }
  }
  if (tileinfo[ts[1][1]] && tileinfo[ts[1][1]].score) {
    this.tiles[f[1]][p1.y][p1.x] = 'a';
    n = this.nodes[f[1]][p1.y][p1.x];
    if (n && n.parentNode) {
      n.parentNode.removeChild(n);
    }
    this.nodes[f[1]][p1.y][p1.x] = null;
    this.user.score = (this.user.score || 0) + tileinfo[ts[1][1]].score;
    this.sndPlay('get');
    this.view.render();
  }
  if (ts[1][1] === 'm') {
    this.transform({
      src: 'o',
      des: 'd'
    });
    this.transform({
      src: 'p',
      des: 'a'
    });
    this.convert({
      f: f[1],
      x: p1.x,
      y: p1.y,
      src: 'm',
      des: 'n'
    });
    this.sndPlay('press');
    this.render();
  }
  if (ts[1][1] === 'e') {
    if (!((ref$ = ts[1][2]) === 'a' || ref$ === 'f' || ref$ === 'n' || ref$ === 'o')) {
      this.sndPlay('hit');
      return;
    }
    ref$ = f[0] >= 0 && (!tileinfo[ts[0][2]] || tileinfo[ts[0][2]].fill)
      ? [f[0], 'c']
      : [f[1], 'e'], df = ref$[0], dk = ref$[1];
    if (tileinfo[ts[0][2]] && !tileinfo[ts[0][2]].fill && tileinfo[ts[0][2]].through) {
      return;
    }
    this.tiles[f[1]][p1.y][p1.x] = 'a';
    this.tiles[df][p2.y][p2.x] = dk;
    this.nodes[f[1]][p1.y][p1.x].classList.remove(tileinfo.e.name);
    this.nodes[f[1]][p1.y][p1.x].classList.add(tileinfo[dk].name);
    import$(this.nodes[f[1]][p1.y][p1.x].style, {
      left: p2.x * blockSize + "px",
      top: (p2.y * blockSize - df * blockVp) + "px",
      zIndex: this.zIndex({
        f: df,
        y: p2.y,
        x: p2.x,
        p: 0
      })
    });
    if (that = this.nodes[df][p2.y][p2.x]) {
      that.parentNode.removeChild(that);
    }
    this.nodes[df][p2.y][p2.x] = this.nodes[f[1]][p1.y][p1.x];
    this.nodes[f[1]][p1.y][p1.x] = null;
    this.sndPlay('push');
    applyDefault = false;
  }
  if (ts[1][1] === 'h') {
    this.sndPlay('key');
    this.transform({
      src: 'g',
      des: 'i'
    });
    this.user.item.push(7);
    this.tiles[f[1]][p1.y][p1.x] = 'a';
    n = this.nodes[f[1]][p1.y][p1.x];
    if (n && n.parentNode) {
      n.parentNode.removeChild(n);
    }
    this.nodes[f[1]][p1.y][p1.x] = null;
  }
  if (ts[1][1] === 'i') {
    this.sndPlay('pass');
    if (this.editData) {
      this.setMode('edit');
    } else {
      return this.load({
        lv: this.lv + 1
      });
    }
  }
  if (ts[1][1] === 'a' && ts[0][1] === 'j') {
    pd.f = pd.f - 1;
    applyDefault = false;
  }
  if (applyDefault) {
    if (tileinfo[ts[1][1]] && !tileinfo[ts[1][1]].through) {
      return;
    }
    if (tileinfo[ts[0][1]] && !tileinfo[ts[0][1]].over) {
      return;
    }
  }
  import$(u, pd);
  return this.renderUser();
};
s = new stage();
s.init();
args = {};
(window.location.search || "").substring(1).split('&').map(function(it){
  var ref$, n, v;
  ref$ = it.split('=').map(function(it){
    return decodeURIComponent(it);
  }), n = ref$[0], v = ref$[1];
  return args[n] = v;
});
if (args.mapset) {
  s.load({
    mapset: args.mapset,
    lv: args.lv || 0
  });
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}