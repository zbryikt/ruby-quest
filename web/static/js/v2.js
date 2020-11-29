var stage, s;
stage = function(){
  this.data = {};
  this.dim = {};
  this.user = {
    item: []
  };
  this.lv = 0;
  this.ldcv = {};
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
  }
};
stage.prototype = import$(Object.create(Object.prototype), {
  restart: function(){
    return this.load({
      lv: this.lv
    });
  },
  reset: function(){
    this.user.score = 0;
    return this.load({
      lv: 1
    });
  },
  init: function(){
    var view, this$ = this;
    this.view = view = new ldView({
      root: document.body,
      init: {
        finish: function(arg$){
          var node;
          node = arg$.node;
          return this$.ldcv.finish = new ldCover({
            root: node
          });
        }
      },
      text: {
        lv: function(){
          return this$.lv || 1;
        },
        score: function(){
          return this$.user.score || 0;
        }
      },
      handler: {
        "sample-tile": function(){},
        field: function(){},
        user: function(){},
        scene: function(){},
        lv: function(){},
        score: function(){}
      },
      action: {
        click: {
          restart: function(){
            return this$.restart();
          },
          reset: function(){
            this$.ldcv.finish.toggle(false);
            return this$.reset();
          }
        }
      }
    });
    this.el = {
      sampleTile: view.get('sample-tile').cloneNode(true),
      scene: view.get('scene'),
      field: view.get('field'),
      user: view.get('user'),
      bgm: view.get('bgm')
    };
    this.el.sampleTile.classList.remove('d-none');
    requestAnimationFrame(function(t){
      return this$.firekey(t);
    });
    document.addEventListener('keyup', function(e){
      var u, dir;
      if (e.which < 37 || e.which > 40) {
        return;
      }
      u = this$.user;
      dir = e.which - 37;
      if (u.dir === dir) {
        return u.moving = false;
      }
    });
    document.addEventListener('keydown', function(e){
      var u, dir;
      if (this$.el.bgm.paused) {
        this$.el.bgm.play();
      }
      if (e.which < 37 || e.which > 40) {
        return;
      }
      u = this$.user;
      dir = e.which - 37;
      if (u.dir !== dir || !u.moving) {
        u.lastMoveTime = null;
      }
      u.dir = dir;
      u.moving = true;
      return this$.el.user.style.backgroundPositionY = -stage.dim.size * 1.4964 * [2, 1, 3, 0][dir] + "px";
    });
    return document.addEventListener('keypress', function(e){
      if (e.which === 114) {
        return this$.restart();
      }
    });
  },
  zIndex: function(arg$){
    var x, y, f, p;
    x = arg$.x, y = arg$.y, f = arg$.f, p = arg$.p;
    return (f * this.dim.w * this.dim.h + y) * 2 + (p ? 1 : 0);
  },
  renderUser: function(){
    var ref$, blockSize, blockVp;
    ref$ = [stage.dim.size, stage.dim.vp], blockSize = ref$[0], blockVp = ref$[1];
    return import$(this.el.user.style, {
      left: this.user.x * blockSize + "px",
      top: (this.user.y * blockSize - this.user.f * blockVp) + "px",
      zIndex: this.zIndex({
        f: this.user.f,
        y: this.user.y,
        x: this.user.x,
        p: 1
      })
    });
  },
  render: function(){
    var ref$, dim, tiles, tileinfo, blockSize, blockVp, sample, field, scene, res$, i$, to$, f, lresult$, j$, to1$, h, lresult1$, k$, to2$, w, n;
    ref$ = [this.dim, this.tiles, stage.tileinfo], dim = ref$[0], tiles = ref$[1], tileinfo = ref$[2];
    ref$ = [stage.dim.size, stage.dim.vp], blockSize = ref$[0], blockVp = ref$[1];
    ref$ = [this.el.sampleTile, this.el.field, this.el.scene], sample = ref$[0], field = ref$[1], scene = ref$[2];
    import$(scene.style, {
      width: dim.w * blockSize + "px",
      height: (dim.h * blockSize + blockVp * dim.f) + "px"
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
  load: function(arg$){
    var lv, this$ = this;
    lv = arg$.lv;
    return ld$.fetch("/js/map/" + lv + ".js", {}, {
      type: 'text'
    }).then(function(ret){
      this$.data = eval(ret);
      this$.tiles = this$.data.tiles;
      import$(this$.user, this$.data.user);
      this$.lv = lv;
      import$(this$.dim, {
        f: this$.data.tiles.length,
        h: this$.data.tiles[0].length,
        w: this$.data.tiles[0][0].length
      });
      return this$.render();
    })['catch'](function(){
      return this$.ldcv.finish.toggle(true);
    });
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
  if (!u.moving || (u.lastMoveTime && t - u.lastMoveTime < 100)) {
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
    this.user.score = (this.user.score || 0) + tileinfo[ts[1][1]].score;
    this.view.render();
  }
  if (ts[1][1] === 'e') {
    if (!((ref$ = ts[1][2]) === 'a' || ref$ === 'f')) {
      return;
    }
    ref$ = !tileinfo[ts[0][2]] || tileinfo[ts[0][2]].fill
      ? [f[0], 'c']
      : [f[1], 'e'], df = ref$[0], dk = ref$[1];
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
    applyDefault = false;
  }
  if (ts[1][1] === 'h') {
    this.transform({
      src: 'g',
      des: 'i'
    });
    this.user.item.push(7);
    this.tiles[f[1]][p1.y][p1.x] = 0;
    n = this.nodes[f[1]][p1.y][p1.x];
    if (n && n.parentNode) {
      n.parentNode.removeChild(n);
    }
  }
  if (ts[1][1] === 'i') {
    return this.load({
      lv: this.lv + 1
    });
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
s.load({
  lv: 1
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}