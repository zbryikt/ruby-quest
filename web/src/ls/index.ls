
z-index = ({x,y,f,p}) -> (f * state.dim.w * state.dim.h + y) * 2 + (if p => 1 else 0)

class-map = do
  0: \void
  1: \bedrock
  2: \earth
  3: \wall
  4: \stool
  5: \grass
  6: \door
  7: \key
  8: \exit
  9: \stair
  10: \gravel
  500: \sapphire

state = do
  player: {x: 1, y: 1, f: 2, item: []}
  dim: {size: 32, vp: 12}
  nodes: []
  tiles: [

    [
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
      [1 1 1 1 1 1 1 1]
    ]
    [
      [9 2 2 2 2 2 2 2]
      [0 2 2 2 2 2 2 2]
      [0 2 2 2 2 2 2 0]
      [0 2 2 2 2 2 2 2]
      [0 2 2 2 2 2 2 2]
      [0 2 2 2 2 2 0 2]
      [0 2 2 2 2 2 2 2]
      [9 2 2 2 2 2 2 2]
    ]
    [
      [0 0 3 3 0 0 0 0]
      [0 0 0 5 0 0 4 0]
      [0 4 0 3 0 0 3 0]
      [0 10 3 3 0 3 0 0]
      [0 0 3 0 4 0 5 0]
      [0 7 3 0 0 3 0 3]
      [0 3 3 0 0 3 6 3]
      [0 0 0 0 0 3 500 3]
    ]

  ]
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

state.dim.f = state.tiles.length
state.dim.h = state.tiles.0.length
state.dim.w = state.tiles.0.0.length

view = new ldView do
  root: document.body
  handler: do
    field: ->
    sample: ->
    player: ->

render-player = ->
  player.style <<< do
    left: "#{state.player.x * state.dim.size}px"
    top: "#{state.player.y * state.dim.size - state.player.f * state.dim.vp}px"
    z-index: z-index({f: state.player.f, y: state.player.y, x: state.player.x, p: 1})

firekey = (t) ->
  p = state.player
  if p.moving =>
    if !p.last-move-time or t - p.last-move-time > 100 =>
      p.last-move-time = t
      c = p{x,y,f}
      switch p.dir
      | 0
        [dx,dy] = [-1,0]
      | 1
        [dx,dy] = [0,-1]
      | 2
        [dx,dy] = [1,0]
      | 3
        [dx,dy] = [0,1]
      if !isNaN(dx) =>

        n = {x: c.x + dx, y: c.y + dy, f: c.f }

        [nx, ny, nf] = [p.x + dx, p.y + dy, c.f]
        [mx, my, mf] = [nx  + dx, ny  + dy, nf ]
        if !(nx < 0 or nx >= state.dim.w or ny < 0 or ny >= state.dim.h or nf < 0) =>

          cidx = if state.tiles[p.f] => state.tiles[p.f][p.y][p.x] else 0
          tidx = if state.tiles[nf] => state.tiles[nf][ny][nx] else 0
          bidx = if nf > 0 => state.tiles[nf - 1][ny][nx] else 1
          fidx = if state.tiles[nf + 1] => state.tiles[nf + 1][ny][nx] else 0
          if fidx in [0] and tidx in [1 2 3] and cidx in [9] =>
            n.f = n.f + 1
            nf = n.f
            mf = nf
            cidx = state.tiles[p.f][p.y][p.x]
            tidx = if state.tiles[nf] => state.tiles[nf][ny][nx] else 0
            bidx = if nf > 0 => state.tiles[nf - 1][ny][nx] else 1

          if tidx in [1 2 3 5] => 

          else if tidx in [0] and bidx in [9] =>
            n.f = n.f - 1
            p <<< n
          else if tidx in [7] =>
            state.player.item.push 7
            state.tiles[nf][ny][nx] = 0
            state.nodes[nf][ny][nx].parentNode.removeChild(state.nodes[nf][ny][nx])
            p <<< n
            for f from 0 til state.dim.f
              for h from 0 til state.dim.h
                for w from 0 til state.dim.w
                  if state.tiles[f][h][w] == 6
                    state.tiles[f][h][w] = 8
                    state.nodes[f][h][w].classList.remove class-map[6]
                    state.nodes[f][h][w].classList.add class-map[8]

          else if tidx in [500] =>
            state.tiles[nf][ny][nx] = 0
            state.nodes[nf][ny][nx].parentNode.removeChild(state.nodes[nf][ny][nx])
            p <<< n
          else if tidx in [4] =>
            if state.tiles[nf][my][mx] in [0 5] and (!(state.tiles[nf - 1]) or !(state.tiles[nf - 1][my][mx] in [9])) => 
              df = if nf > 0 and state.tiles[nf - 1][my][mx] in [0] => -1 else 0
              mf = nf + df

              state.tiles[nf][ny][nx] = 0
              state.tiles[mf][my][mx] = ntv = if df == -1 => 2 else 4

              state.nodes[nf][ny][nx].style <<< do
                left: "#{(mx) * state.dim.size}px"
                top: "#{(my) * state.dim.size - mf * state.dim.vp}px"
                z-index: z-index({f: mf, y: my, x: mx, p: 0})
              state.nodes[nf][ny][nx].classList.remove class-map[4]
              state.nodes[nf][ny][nx].classList.add class-map[ntv]
              if state.nodes[mf][my][mx] => if that.parentNode =>
                state.nodes[mf][my][mx].parentNode.removeChild state.nodes[mf][my][mx]
              state.nodes[mf][my][mx] = state.nodes[nf][ny][nx]
              state.nodes[nf][ny][nx] = null
              p <<< n
          else if bidx in [0] => 
          else p <<< n
          render-player!

  state.tick = t - p.t
  requestAnimationFrame (t) -> firekey t

requestAnimationFrame (t) -> firekey t
document.addEventListener \keyup, (e) ->
  if e.key < 37 or e.key > 40 => return
  p = state.player
  dir = e.which - 37
  if p.dir == dir => state.player.moving = false
document.addEventListener \keydown, (e) ->
  if e.key < 37 or e.key > 40 => return
  p = state.player
  dir = e.which - 37
  if p.dir != dir or !p.moving => p.last-move-time = null
  p <<< dir: dir, moving: true

player = view.get('player')
field = view.get('field')
sample = view.get('sample')
sample = sample.cloneNode(true)
sample.classList.remove(\d-none)

field.style <<< do
  width: "#{state.dim.w * state.dim.size}px"
  height: "#{state.dim.h * state.dim.size + state.dim.vp * state.dim.f}px"
state.nodes = for f from 0 til state.dim.f =>
  for h from 0 til state.dim.h =>
    for w from 0 til state.dim.w =>
       n = sample.cloneNode(true)
       field.appendChild(n)
       n.classList.add class-map[state.tiles[f][h][w]]
       n.style <<< do
         left: "#{w * state.dim.size}px"
         top: "#{h * state.dim.size - f * state.dim.vp}px"
         z-index: z-index {f, x: w, y: h, p: 0}
       n
render-player!
