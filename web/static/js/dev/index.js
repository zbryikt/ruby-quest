var zIndex, classMap, state, view, renderPlayer, firekey, player, field, sample, res$, i$, to$, f, lresult$, j$, to1$, h, lresult1$, k$, to2$, w, n, loadLevel;
zIndex = function(arg$){
  var x, y, f, p;
  x = arg$.x, y = arg$.y, f = arg$.f, p = arg$.p;
  return (f * state.dim.w * state.dim.h + y) * 2 + (p ? 1 : 0);
};
classMap = {
  0: 'void',
  1: 'bedrock',
  2: 'earth',
  3: 'wall',
  4: 'stool',
  5: 'grass',
  6: 'door',
  7: 'key',
  8: 'exit',
  9: 'stair',
  10: 'gravel',
  500: 'sapphire'
};
state = {
  player: {
    x: 1,
    y: 1,
    f: 2,
    item: []
  },
  dim: {
    size: 32,
    vp: 12
  },
  nodes: [],
  tiles: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[9, 2, 2, 2, 2, 2, 2, 2], [0, 2, 2, 2, 2, 2, 2, 2], [0, 2, 2, 2, 2, 2, 2, 0], [0, 2, 2, 2, 2, 2, 2, 2], [0, 2, 2, 2, 2, 2, 2, 2], [0, 2, 2, 2, 2, 2, 0, 2], [0, 2, 2, 2, 2, 2, 2, 2], [9, 2, 2, 2, 2, 2, 2, 2]], [[0, 0, 3, 3, 0, 0, 0, 0], [0, 0, 0, 5, 0, 0, 4, 0], [0, 4, 0, 3, 0, 0, 3, 0], [0, 10, 3, 3, 0, 3, 0, 0], [0, 0, 3, 0, 4, 0, 5, 0], [0, 7, 3, 0, 0, 3, 0, 3], [0, 3, 3, 0, 0, 3, 6, 3], [0, 0, 0, 0, 0, 3, 500, 3]]]
  /*
    [
      [2 2 2 2 2 2 2 2 2 2 2]
      [2 2 2 2 2 2 2 2 2 2 2]
      [2 2 2 2 0 0 0 2 2 2 2]
      [2 2 2 9 0 0 0 9 2 2 2]
      [2 2 2 0 0 0 0 0 2 2 2]
      [2 2 2 0 0 0 0 0 2 2 2]
      [2 2 2 0 0 0 0 0 2 2 2]
      [2 2 2 0 0 0 0 0 2 2 2]
      [2 2 2 2 2 2 2 2 2 2 2]
      [2 2 2 2 2 2 2 2 2 2 2]
      [2 2 2 2 2 2 2 2 2 2 2]
  
    ]
  
    [
      [3 3 3 3 3 3 3 3 3 3 3]
      [3 9 4 0 0 0 0 0 10 0 3]
      [3 0 0 0 0 0 0 0 0 0 3]
      [3 0 4 0 0 0 0 0 0 0 3]
      [3 0 5 0 0 0 0 0 4 0 3]
      [3 0 0 0 0 0 0 0 0 0 3]
      [3 0 500 0 0 0 0 0 0 0 3]
      [3 0 0 0 0 0 0 0 0 0 3]
      [3 0 0 0 0 0 0 0 7 0 3]
      [3 0 0 0 0 0 0 0 0 6 3]
      [3 3 3 3 3 3 3 3 3 3 3]
  
    ]
  
  ]
  */
};
state.dim.f = state.tiles.length;
state.dim.h = state.tiles[0].length;
state.dim.w = state.tiles[0][0].length;
view = new ldView({
  root: document.body,
  handler: {
    field: function(){},
    sample: function(){},
    player: function(){}
  }
});
renderPlayer = function(){
  return import$(player.style, {
    left: state.player.x * state.dim.size + "px",
    top: (state.player.y * state.dim.size - state.player.f * state.dim.vp) + "px",
    zIndex: zIndex({
      f: state.player.f,
      y: state.player.y,
      x: state.player.x,
      p: 1
    })
  });
};
firekey = function(t){
  var p, c, ref$, dx, dy, n, nx, ny, nf, mx, my, mf, cidx, tidx, bidx, fidx, i$, to$, f, j$, to1$, h, k$, to2$, w, df, ntv, that;
  p = state.player;
  if (p.moving) {
    if (!p.lastMoveTime || t - p.lastMoveTime > 100) {
      p.lastMoveTime = t;
      c = {
        x: p.x,
        y: p.y,
        f: p.f
      };
      switch (p.dir) {
      case 0:
        ref$ = [-1, 0], dx = ref$[0], dy = ref$[1];
        break;
      case 1:
        ref$ = [0, -1], dx = ref$[0], dy = ref$[1];
        break;
      case 2:
        ref$ = [1, 0], dx = ref$[0], dy = ref$[1];
        break;
      case 3:
        ref$ = [0, 1], dx = ref$[0], dy = ref$[1];
      }
      if (!isNaN(dx)) {
        n = {
          x: c.x + dx,
          y: c.y + dy,
          f: c.f
        };
        ref$ = [p.x + dx, p.y + dy, c.f], nx = ref$[0], ny = ref$[1], nf = ref$[2];
        ref$ = [nx + dx, ny + dy, nf], mx = ref$[0], my = ref$[1], mf = ref$[2];
        if (!(nx < 0 || nx >= state.dim.w || ny < 0 || ny >= state.dim.h || nf < 0)) {
          cidx = state.tiles[p.f] ? state.tiles[p.f][p.y][p.x] : 0;
          tidx = state.tiles[nf] ? state.tiles[nf][ny][nx] : 0;
          bidx = nf > 0 ? state.tiles[nf - 1][ny][nx] : 1;
          fidx = state.tiles[nf + 1] ? state.tiles[nf + 1][ny][nx] : 0;
          if (fidx === 0 && (tidx === 1 || tidx === 2 || tidx === 3) && cidx === 9) {
            n.f = n.f + 1;
            nf = n.f;
            mf = nf;
            cidx = state.tiles[p.f][p.y][p.x];
            tidx = state.tiles[nf] ? state.tiles[nf][ny][nx] : 0;
            bidx = nf > 0 ? state.tiles[nf - 1][ny][nx] : 1;
          }
          if (tidx === 1 || tidx === 2 || tidx === 3 || tidx === 5) {} else if (tidx === 0 && bidx === 9) {
            n.f = n.f - 1;
            import$(p, n);
          } else if (tidx === 7) {
            state.player.item.push(7);
            state.tiles[nf][ny][nx] = 0;
            state.nodes[nf][ny][nx].parentNode.removeChild(state.nodes[nf][ny][nx]);
            import$(p, n);
            for (i$ = 0, to$ = state.dim.f; i$ < to$; ++i$) {
              f = i$;
              for (j$ = 0, to1$ = state.dim.h; j$ < to1$; ++j$) {
                h = j$;
                for (k$ = 0, to2$ = state.dim.w; k$ < to2$; ++k$) {
                  w = k$;
                  if (state.tiles[f][h][w] === 6) {
                    state.tiles[f][h][w] = 8;
                    state.nodes[f][h][w].classList.remove(classMap[6]);
                    state.nodes[f][h][w].classList.add(classMap[8]);
                  }
                }
              }
            }
          } else if (tidx === 500) {
            state.tiles[nf][ny][nx] = 0;
            state.nodes[nf][ny][nx].parentNode.removeChild(state.nodes[nf][ny][nx]);
            import$(p, n);
          } else if (tidx === 4) {
            if (((ref$ = state.tiles[nf][my][mx]) === 0 || ref$ === 5) && (!state.tiles[nf - 1] || !(state.tiles[nf - 1][my][mx] === 9))) {
              df = nf > 0 && state.tiles[nf - 1][my][mx] === 0 ? -1 : 0;
              mf = nf + df;
              state.tiles[nf][ny][nx] = 0;
              state.tiles[mf][my][mx] = ntv = df === -1 ? 2 : 4;
              import$(state.nodes[nf][ny][nx].style, {
                left: mx * state.dim.size + "px",
                top: (my * state.dim.size - mf * state.dim.vp) + "px",
                zIndex: zIndex({
                  f: mf,
                  y: my,
                  x: mx,
                  p: 0
                })
              });
              state.nodes[nf][ny][nx].classList.remove(classMap[4]);
              state.nodes[nf][ny][nx].classList.add(classMap[ntv]);
              if (that = state.nodes[mf][my][mx]) {
                if (that.parentNode) {
                  state.nodes[mf][my][mx].parentNode.removeChild(state.nodes[mf][my][mx]);
                }
              }
              state.nodes[mf][my][mx] = state.nodes[nf][ny][nx];
              state.nodes[nf][ny][nx] = null;
              import$(p, n);
            }
          } else if (bidx === 0) {} else {
            import$(p, n);
          }
          renderPlayer();
        }
      }
    }
  }
  state.tick = t - p.t;
  return requestAnimationFrame(function(t){
    return firekey(t);
  });
};
requestAnimationFrame(function(t){
  return firekey(t);
});
document.addEventListener('keyup', function(e){
  var p, dir;
  if (e.key < 37 || e.key > 40) {
    return;
  }
  p = state.player;
  dir = e.which - 37;
  if (p.dir === dir) {
    return state.player.moving = false;
  }
});
document.addEventListener('keydown', function(e){
  var p, dir;
  if (e.key < 37 || e.key > 40) {
    return;
  }
  p = state.player;
  dir = e.which - 37;
  if (p.dir !== dir || !p.moving) {
    p.lastMoveTime = null;
  }
  return p.dir = dir, p.moving = true, p;
});
player = view.get('player');
field = view.get('field');
sample = view.get('sample');
sample = sample.cloneNode(true);
sample.classList.remove('d-none');
import$(field.style, {
  width: state.dim.w * state.dim.size + "px",
  height: (state.dim.h * state.dim.size + state.dim.vp * state.dim.f) + "px"
});
res$ = [];
for (i$ = 0, to$ = state.dim.f; i$ < to$; ++i$) {
  f = i$;
  lresult$ = [];
  for (j$ = 0, to1$ = state.dim.h; j$ < to1$; ++j$) {
    h = j$;
    lresult1$ = [];
    for (k$ = 0, to2$ = state.dim.w; k$ < to2$; ++k$) {
      w = k$;
      n = sample.cloneNode(true);
      field.appendChild(n);
      n.classList.add(classMap[state.tiles[f][h][w]]);
      import$(n.style, {
        left: w * state.dim.size + "px",
        top: (h * state.dim.size - f * state.dim.vp) + "px",
        zIndex: zIndex({
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
state.nodes = res$;
renderPlayer();
loadLevel = function(lv){
  return ld$.fetch("/js/map/" + lv + ".js", {}, {
    type: 'text'
  }).then(function(it){
    return console.log(eval(it));
  });
};
loadLevel();
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}